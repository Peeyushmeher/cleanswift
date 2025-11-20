import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import 'react-native-reanimated';
import '../global.css';

import { AuthProvider } from '../src/contexts/AuthContext';
import { BookingProvider } from '../src/contexts/BookingContext';
import RootNavigator from '../src/navigation/RootNavigator';

export default function RootLayout() {
  return (
    <NavigationIndependentTree>
      <NavigationContainer>
        <AuthProvider>
          <BookingProvider>
            <View style={{ flex: 1 }}>
              <RootNavigator />
              <StatusBar style="light" />
            </View>
          </BookingProvider>
        </AuthProvider>
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}
