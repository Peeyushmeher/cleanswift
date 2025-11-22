import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/AuthStack';
import { COLORS } from '../../theme/colors';

type SplashScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Splash'>;

export default function SplashScreen() {
  const navigation = useNavigation<SplashScreenNavigationProp>();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg.primary, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        {/* Icon */}
        <View style={{ position: 'relative' }}>
          <Ionicons
            name="water"
            size={64}
            color={COLORS.accent.blue}
          />
        </View>

        {/* Brand Name */}
        <View
          style={{ flexDirection: 'column', alignItems: 'center', gap: 12, opacity: 0 }}
        >
          <Text style={{ color: COLORS.text.primary, fontWeight: '600', fontSize: 32, letterSpacing: 1.5 }}>
            CleanSwift
          </Text>

          {/* Tagline */}
          <Text
            style={{ color: COLORS.text.secondary, fontSize: 14, letterSpacing: 0.5, opacity: 0 }}
          >
            Premium Mobile Detailing
          </Text>
        </View>
      </View>
    </View>
  );
}
