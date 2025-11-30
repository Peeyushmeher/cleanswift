import { StatusBar } from 'expo-status-bar';
import { View, Linking, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StripeProvider } from '@stripe/stripe-react-native';
import { useEffect } from 'react';
import 'react-native-reanimated';
import './global.css';

import { AuthProvider } from './src/contexts/AuthContext';
import { BookingProvider } from './src/contexts/BookingContext';
import RootNavigator from './src/navigation/RootNavigator';
import { useBookingNotifications } from './src/hooks/useBookingNotifications';
import { supabase } from './src/lib/supabase';

// Component to initialize notifications
function NotificationListener() {
  useBookingNotifications();
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
            <NotificationListener />
            <OAuthDeepLinkHandler />
            <View style={{ flex: 1 }}>
              <RootNavigator />
              <StatusBar style="light" />
            </View>
          </BookingProvider>
        </AuthProvider>
      </NavigationContainer>
    </StripeProvider>
  );
}
