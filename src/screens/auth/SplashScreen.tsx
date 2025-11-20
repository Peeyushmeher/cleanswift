import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/AuthStack';

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
    <View style={{ flex: 1, backgroundColor: '#050B12', alignItems: 'center', justifyContent: 'center' }}>
      <View className="flex flex-col items-center gap-6 animate-fade-in">
        {/* Icon */}
        <View className="relative">
          <Ionicons
            name="water"
            size={64}
            color="#1DA4F3"
            className="animate-fade-in-up"
          />
          <View className="absolute inset-0 blur-xl opacity-20 bg-[#1DA4F3] rounded-full" />
        </View>

        {/* Brand Name */}
        <View
          className="flex flex-col items-center gap-3 animate-fade-in-up"
          style={{ animationDelay: '200ms', opacity: 0 }}
        >
          <Text className="text-[#F5F7FA] tracking-wider" style={{ fontWeight: '600', fontSize: 32 }}>
            CleanSwift
          </Text>

          {/* Tagline */}
          <Text
            className="text-[#C6CFD9] tracking-wide"
            style={{ fontSize: 14, animationDelay: '400ms', opacity: 0 }}
          >
            Premium Mobile Detailing
          </Text>
        </View>
      </View>
    </View>
  );
}
