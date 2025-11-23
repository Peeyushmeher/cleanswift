import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StripeProvider } from '@stripe/stripe-react-native';
import 'react-native-reanimated';
import './global.css';

import { AuthProvider } from './src/contexts/AuthContext';
import { BookingProvider } from './src/contexts/BookingContext';
import RootNavigator from './src/navigation/RootNavigator';
import { useBookingNotifications } from './src/hooks/useBookingNotifications';

// Component to initialize notifications
function NotificationListener() {
  useBookingNotifications();
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
