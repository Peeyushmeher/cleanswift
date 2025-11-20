import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/AuthStack';

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
    <View style={{ flex: 1, backgroundColor: '#050B12' }} className="flex flex-col">
      {/* Main Content */}
      <View className="flex-1 flex flex-col items-center justify-center px-8 pb-32">
        {/* Icon */}
        <View className="mb-12 relative animate-fade-in-up">
          <Ionicons
            name={screen.icon}
            size={96}
            color="#6FF0C4"
          />
          <View className="absolute inset-0 blur-2xl opacity-20 bg-[#6FF0C4]" />
        </View>

        {/* Title */}
        <Text
          className="text-[#F5F7FA] text-center mb-5 px-4 animate-fade-in-up max-w-md tracking-wide"
          style={{ fontSize: 28, fontWeight: '600', animationDelay: '100ms', opacity: 0 }}
        >
          {screen.title}
        </Text>

        {/* Subtitle */}
        <Text
          className="text-[#C6CFD9] text-center max-w-sm animate-fade-in-up"
          style={{ fontSize: 16, animationDelay: '200ms', opacity: 0 }}
        >
          {screen.subtitle}
        </Text>
      </View>

      {/* Progress Dots */}
      <View className="flex justify-center gap-2.5 mb-10" style={{ flexDirection: 'row' }}>
        {screens.map((_, index) => (
          <View
            key={index}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentScreen
                ? 'w-8 bg-[#6FF0C4]'
                : 'w-2 bg-[#C6CFD9] opacity-30'
            }`}
          />
        ))}
      </View>

      {/* CTA Button */}
      <View className="px-6 pb-12">
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.8}
          className="w-full bg-[#1DA4F3] text-white py-4 rounded-full transition-all duration-200 active:scale-[0.98] shadow-lg shadow-[#1DA4F3]/20 flex items-center justify-center gap-2"
          style={{ minHeight: 56, flexDirection: 'row' }}
        >
          <Text className="text-white" style={{ fontSize: 17, fontWeight: '600' }}>
            {currentScreen < screens.length - 1 ? 'Next' : 'Get Started'}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
