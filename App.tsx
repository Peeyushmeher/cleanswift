import { NavigationContainer } from '@react-navigation/native';
import { StripeProvider } from '@stripe/stripe-react-native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Alert, Linking, Platform, View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './global.css';

import * as Notifications from 'expo-notifications';
import ReceiptModal from './src/components/ReceiptModal';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { BookingProvider } from './src/contexts/BookingContext';
import { ReceiptProvider, useReceipt } from './src/contexts/ReceiptContext';
import { useBookingNotifications } from './src/hooks/useBookingNotifications';
import { isSupabaseConfigured, supabase } from './src/lib/supabase';
import RootNavigator from './src/navigation/RootNavigator';

// Simple Error Boundary to prevent render-time crashes from blocking startup
import React from 'react';
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error?: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    console.error('Unhandled render error:', error, info);
    // Try to ensure splash is hidden even if an error occurs
    SplashScreen.hideAsync().catch(() => {});
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
          <StatusBar style="light" />
        </View>
      );
    }
    return this.props.children as any;
  }
}

// Prevent the splash screen from auto-hiding before app is ready (guarded)
try {
  SplashScreen.preventAutoHideAsync();
} catch (e) {
  console.warn('preventAutoHideAsync failed (continuing):', e);
}

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

// Component to handle email confirmation deep links globally
function EmailConfirmationHandler() {
  useEffect(() => {
    const handleDeepLink = async (url: string | null) => {
      if (!url || !url.startsWith('cleanswift://auth/confirm-email')) {
        return;
      }

      console.log('Email confirmation callback received:', url);

      try {
        // Extract token_hash from URL
        // Format: cleanswift://auth/confirm-email?token_hash=...&type=email
        let tokenHash: string | null = null;
        let type: string | null = null;
        
        try {
          const urlObj = new URL(url);
          tokenHash = urlObj.searchParams.get('token_hash');
          type = urlObj.searchParams.get('type');
        } catch (e) {
          // Fallback parsing if URL constructor fails
          const tokenMatch = url.match(/[?&]token_hash=([^&]+)/);
          const typeMatch = url.match(/[?&]type=([^&]+)/);
          tokenHash = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;
          type = typeMatch ? decodeURIComponent(typeMatch[1]) : null;
        }

        if (tokenHash && type === 'email') {
          console.log('Verifying email with token...');
          // Verify the email using the token
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'email',
          });

          if (error) {
            console.error('Email verification error:', error);
            Alert.alert('Verification Failed', error.message || 'Failed to verify email. Please try again.');
          } else {
            console.log('Email verification successful');
            Alert.alert('Email Verified', 'Your email has been verified successfully! You can now sign in.');
            // Auth state change listener will handle navigation
          }
        } else {
          // Try alternative format: Supabase might use #access_token format similar to OAuth
          const hashMatch = url.match(/#(.+)/);
          if (hashMatch) {
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
                console.log('Setting session with tokens from email verification...');
                const { data, error: sessionError } = await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken,
                });

                if (sessionError) {
                  console.error('Email verification session error:', sessionError);
                  Alert.alert('Verification Error', sessionError.message);
                } else {
                  console.log('Email verification and authentication successful');
                  Alert.alert('Email Verified', 'Your email has been verified and you are now signed in!');
                  // Auth state change listener will handle navigation
                }
              } catch (error) {
                console.error('Email verification error:', error);
                Alert.alert('Error', 'Failed to complete email verification');
              }
            } else {
              console.warn('No token_hash or access_token found in email confirmation URL');
              Alert.alert('Verification Error', 'Invalid verification link. Please request a new verification email.');
            }
          } else {
            console.warn('No token_hash or hash fragment found in email confirmation URL');
            Alert.alert('Verification Error', 'Invalid verification link. Please request a new verification email.');
          }
        }
      } catch (error) {
        console.error('Email confirmation error:', error);
        Alert.alert('Error', 'Failed to process email verification link');
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

  // Check critical environment variables
  const stripePublishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const supabaseConfigured = isSupabaseConfigured();

  if (!supabaseConfigured) {
    console.error('❌ CRITICAL: Supabase is not configured!');
    console.error('❌ App will not function properly without Supabase credentials');
    console.error('❌ For EAS builds, set secrets with:');
    console.error('   eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value <url>');
    console.error('   eas secret:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value <key>');
  } else {
    console.log('✅ Supabase configured');
  }

  if (!stripePublishableKey) {
    console.error('⚠️ EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set in environment variables');
    console.error('⚠️ Payment functionality will not work without this key');
    console.error('⚠️ Set it in your .env file or EAS secrets');
  } else {
    console.log('✅ Stripe publishable key loaded');
  }

  // Hide splash screen after app initializes - use multiple strategies
  // CRITICAL: Always hide splash screen, even if there are errors
  useEffect(() => {
    let isHidden = false;
    let hideAttempts = 0;
    
    const hideSplash = () => {
      if (isHidden) return;
      hideAttempts += 1;
      const attempt = hideAttempts;
      console.log(`Hiding splash screen (attempt ${attempt})`);
      SplashScreen.hideAsync()
        .then(() => {
          isHidden = true;
          console.log('Splash screen hidden');
        })
        .catch((error) => {
          console.error('Error hiding splash screen:', error);
        });
    };

    // Strategy 1: Hide after NavigationContainer is ready (handled in onReady callback)
    
    // Strategy 2: Fallback - hide after app has time to initialize
    // This ensures splash hides even if NavigationContainer has issues or errors occur
    const fallbackTimer = setTimeout(() => {
      console.log('Fallback: Hiding splash screen after timeout');
      hideSplash();
    }, 2000); // Reduced to 2 seconds for faster feedback

    // Strategy 2b: Absolute safety timeout for production/TestFlight
    const absoluteTimer = setTimeout(() => {
      if (!__DEV__) {
        console.log('Absolute fallback: Forcing splash hide for production');
        hideSplash();
      }
    }, 4000);

    // Strategy 3: Hide immediately if Supabase is not configured (show error screen instead)
    if (!supabaseConfigured) {
      console.log('Supabase not configured - hiding splash to show error');
      setTimeout(hideSplash, 500);
    }

    return () => {
      clearTimeout(fallbackTimer);
      clearTimeout(absoluteTimer);
    };
  }, [supabaseConfigured]);

  // Only show the blocking configuration error in development; in production, warn but allow app to render
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const isUsingPlaceholder = supabaseUrl === 'https://placeholder.supabase.co';
  const showConfigError = __DEV__ && !supabaseConfigured && isUsingPlaceholder;

  // Ultra-safe: ensure splash hides shortly after mount regardless of state
  useEffect(() => {
    const t = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 5000);
    return () => clearTimeout(t);
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StripeProvider
          publishableKey={stripePublishableKey || ''}
          merchantIdentifier={Platform.OS === 'ios' ? 'merchant.com.cleanswift' : undefined}
          urlScheme="cleanswift"
        >
          <NavigationContainer
            onReady={() => {
              console.log('NavigationContainer ready');
              SplashScreen.hideAsync().catch((error) => {
                console.error('Error hiding splash screen (onReady):', error);
              });
            }}
            onStateChange={() => console.log('Navigation state changed')}
          >
            <AuthProvider>
              <BookingProvider>
                <ReceiptProvider>
                  <NotificationListener />
                  <PendingReceiptChecker />
                  <OAuthDeepLinkHandler />
                  <EmailConfirmationHandler />
                  <View style={{ flex: 1 }}>
                    {showConfigError && (
                      <View style={{ backgroundColor: '#7f1d1d', padding: 10 }}>
                        <StatusBar style="light" />
                      </View>
                    )}
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
    </ErrorBoundary>
  );
}
