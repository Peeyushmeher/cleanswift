import { NavigationContainer } from '@react-navigation/native';
import { StripeProvider } from '@stripe/stripe-react-native';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Alert, Linking, View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './global.css';

import * as Notifications from 'expo-notifications';
import ReceiptModal from './src/components/ReceiptModal';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { BookingProvider } from './src/contexts/BookingContext';
import { ReceiptProvider, useReceipt } from './src/contexts/ReceiptContext';
import { useBookingNotifications } from './src/hooks/useBookingNotifications';
import { supabase } from './src/lib/supabase';
import RootNavigator from './src/navigation/RootNavigator';

// Component to initialize notifications and handle notification taps
function NotificationListener() {
  useBookingNotifications();
  const { showReceipt } = useReceipt();

  useEffect(() => {
    // Handle notification taps
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      const body = response.notification.request.content.body || '';
      
      // Show receipt modal when user taps any booking-related notification
      if (data?.bookingId) {
        // Check if it's a completion notification or if status is completed
        if (data.status === 'completed' || 
            body.toLowerCase().includes('complete') || 
            body.toLowerCase().includes('rate')) {
          // Small delay to ensure app is ready
          setTimeout(() => {
            showReceipt(data.bookingId);
          }, 500);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [showReceipt]);

  return null;
}

// Component to check for pending receipts on app open
function PendingReceiptChecker() {
  const { user } = useAuth();
  const { showReceipt } = useReceipt();

  useEffect(() => {
    if (!user) return;

    const checkPendingReceipts = async () => {
      try {
        // Check for completed bookings that haven't been reviewed
        // We'll check if a review exists for each completed booking
        const { data: completedBookings, error } = await supabase
          .from('bookings')
          .select('id, completed_at')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .not('completed_at', 'is', null)
          .order('completed_at', { ascending: false })
          .limit(5); // Check last 5 completed bookings

        if (error) {
          console.error('Error checking pending receipts:', error);
          return;
        }

        if (!completedBookings || completedBookings.length === 0) {
          return;
        }

        // Check which bookings don't have reviews
        const bookingIds = completedBookings.map(b => b.id);
        const { data: existingReviews, error: reviewsError } = await supabase
          .from('reviews')
          .select('booking_id')
          .in('booking_id', bookingIds);

        if (reviewsError) {
          console.error('Error checking existing reviews:', reviewsError);
          return;
        }

        const reviewedBookingIds = new Set(
          (existingReviews || []).map(r => r.booking_id)
        );

        // Find the most recent completed booking without a review
        const unreviewedBooking = completedBookings.find(
          b => !reviewedBookingIds.has(b.id)
        );

        if (unreviewedBooking) {
          const completedAt = new Date(unreviewedBooking.completed_at);
          const now = new Date();
          const hoursSinceCompletion = (now.getTime() - completedAt.getTime()) / (1000 * 60 * 60);
          
          // Show receipt if completed within the last 7 days (extended from 24 hours)
          if (hoursSinceCompletion < 168) { // 7 days = 168 hours
            console.log('Showing receipt for completed booking:', unreviewedBooking.id);
            // Small delay to ensure app is fully loaded
            setTimeout(() => {
              showReceipt(unreviewedBooking.id);
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Error in checkPendingReceipts:', error);
      }
    };

    // Check after a short delay to ensure app is fully loaded
    const timeout = setTimeout(checkPendingReceipts, 1000);
    
    return () => {
      clearTimeout(timeout);
    };
  }, [user, showReceipt]);

  return null;
}

// Component to handle OAuth deep links globally
function OAuthDeepLinkHandler() {
  useEffect(() => {
    const handleDeepLink = async (url: string | null) => {
      if (!url || !url.startsWith('cleanswift://auth/callback')) {
        return;
      }

      console.log('OAuth callback received:', url);

      // Supabase returns tokens in hash fragment for OAuth
      // Format: cleanswift://auth/callback#access_token=...&refresh_token=...
      const hashMatch = url.match(/#(.+)/);
      if (hashMatch) {
        // Parse hash fragment manually (URLSearchParams might not work with hash in RN)
        const hashString = hashMatch[1];
        const params: Record<string, string> = {};
        hashString.split('&').forEach((param) => {
          const [key, value] = param.split('=');
          if (key && value) {
            params[decodeURIComponent(key)] = decodeURIComponent(value);
          }
        });
        
        const accessToken = params['access_token'];
        const refreshToken = params['refresh_token'];
        
        if (accessToken && refreshToken) {
          try {
            console.log('Setting session with tokens...');
            const { data, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (sessionError) {
              console.error('OAuth session error:', sessionError);
              Alert.alert('Authentication Error', sessionError.message);
            } else {
              console.log('OAuth authentication successful');
              
              // Ensure profile exists for OAuth users
              if (data?.user) {
                try {
                  const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert({
                      id: data.user.id,
                      email: data.user.email || '',
                      full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || '',
                      phone: data.user.phone || '',
                      role: 'user',
                    }, {
                      onConflict: 'id',
                    });
                  
                  if (profileError) {
                    console.warn('Profile creation/update warning:', profileError);
                  }
                } catch (error) {
                  console.warn('Profile creation error:', error);
                }
              }
              
              // Auth state change listener will handle navigation
            }
          } catch (error) {
            console.error('OAuth error:', error);
            Alert.alert('Error', 'Failed to complete authentication');
          }
        } else {
          // Fallback: try to extract code if present (for code exchange flow)
          let code: string | null = null;
          try {
            const urlObj = new URL(url);
            code = urlObj.searchParams.get('code');
          } catch (e) {
            const match = url.match(/[?&]code=([^&]+)/);
            code = match ? decodeURIComponent(match[1]) : null;
          }
          
          if (code) {
            try {
              console.log('Exchanging code for session...');
              const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
              if (exchangeError) {
                console.error('OAuth exchange error:', exchangeError);
                Alert.alert('Authentication Error', exchangeError.message);
              } else {
                console.log('OAuth authentication successful');
              }
            } catch (error) {
              console.error('OAuth error:', error);
              Alert.alert('Error', 'Failed to complete authentication');
            }
          } else {
            console.warn('No access_token or code found in callback URL');
          }
        }
      } else {
        console.warn('No hash fragment found in callback URL');
      }
    };

    // Check if app was opened with a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Listen for deep links while app is running
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return null;
}

export default function App() {
  console.log('=== App.tsx rendering ===');

  const stripePublishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (!stripePublishableKey) {
    console.error('⚠️ EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set in environment variables');
    console.error('⚠️ Payment functionality will not work without this key');
    console.error('⚠️ Set it in your .env file or app.json config');
  } else {
    console.log('✅ Stripe publishable key loaded');
  }

  return (
    <SafeAreaProvider>
      <StripeProvider
        publishableKey={stripePublishableKey || ''}
        merchantIdentifier="merchant.com.cleanswift"
        urlScheme="cleanswift"
      >
        <NavigationContainer
          onReady={() => console.log('NavigationContainer ready')}
          onStateChange={() => console.log('Navigation state changed')}
        >
          <AuthProvider>
            <BookingProvider>
              <ReceiptProvider>
                <NotificationListener />
                <PendingReceiptChecker />
                <OAuthDeepLinkHandler />
                <View style={{ flex: 1 }}>
                  <RootNavigator />
                  <ReceiptModal />
                  <StatusBar style="light" />
                </View>
              </ReceiptProvider>
            </BookingProvider>
          </AuthProvider>
        </NavigationContainer>
      </StripeProvider>
    </SafeAreaProvider>
  );
}
