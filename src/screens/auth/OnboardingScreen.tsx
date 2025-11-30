import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/AuthStack';
import { COLORS } from '../../theme/colors';

type OnboardingScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Onboarding'>;

const screens = [
  {
    icon: 'flash' as const,
    title: 'Book Premium Detailing in Seconds',
    subtitle: 'Deep-clean car care brought to your driveway.',
  },
  {
    icon: 'shield-checkmark' as const,
    title: 'Professional Detailers You Can Trust',
    subtitle: 'Certified professionals, premium results.',
  },
  {
    icon: 'sparkles' as const,
    title: 'Luxury Finish, Every Time',
    subtitle: 'Showroom shine delivered to your location.',
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation<OnboardingScreenNavigationProp>();
  const [currentScreen, setCurrentScreen] = useState(0);

  const handleNext = () => {
    if (currentScreen < screens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      navigation.replace('SignIn');
    }
  };

  const screen = screens[currentScreen];

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg.primary, flexDirection: 'column' }}>
      {/* Main Content */}
      <View style={{ flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingBottom: 128 }}>
        {/* Icon */}
        <View style={{ marginBottom: 48, position: 'relative' }}>
          <Ionicons
            name={screen.icon}
            size={96}
            color={COLORS.accent.mint}
          />
        </View>

        {/* Title */}
        <Text
          style={{
            color: COLORS.text.primary,
            textAlign: 'center',
            marginBottom: 20,
            paddingHorizontal: 16,
            maxWidth: 448,
            fontSize: 28,
            fontWeight: '600',
            opacity: 0
          }}
        >
          {screen.title}
        </Text>

        {/* Subtitle */}
        <Text
          style={{
            color: COLORS.text.secondary,
            textAlign: 'center',
            maxWidth: 384,
            fontSize: 16,
            opacity: 0
          }}
        >
          {screen.subtitle}
        </Text>
      </View>

      {/* Progress Dots */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 40 }}>
        {screens.map((_, index) => (
          <View
            key={index}
            style={{
              height: 8,
              borderRadius: 9999,
              width: index === currentScreen ? 32 : 8,
              backgroundColor: index === currentScreen ? COLORS.accent.mint : COLORS.text.secondary,
              opacity: index === currentScreen ? 1 : 0.3,
            }}
          />
        ))}
      </View>

      {/* CTA Button */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 48 }}>
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.8}
          style={{
            width: '100%',
            backgroundColor: COLORS.accent.blue,
            paddingVertical: 16,
            borderRadius: 9999,
            shadowColor: COLORS.shadow.blue,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            minHeight: 56
          }}
        >
          <Text style={{ color: COLORS.text.inverse, fontSize: 17, fontWeight: '600' }}>
            {currentScreen < screens.length - 1 ? 'Next' : 'Get Started'}
          </Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.text.inverse} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
