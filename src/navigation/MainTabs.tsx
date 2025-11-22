import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigatorScreenParams } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { useEffect } from 'react';
import HomeScreen from '../screens/home/HomeScreen';
import BookingStack, { BookingStackParamList } from './BookingStack';
import OrdersStack from './OrdersStack';
import ProfileStack, { ProfileStackParamList } from './ProfileStack';

export type MainTabsParamList = {
  Home: undefined;
  Book: NavigatorScreenParams<BookingStackParamList> | undefined;
  Orders: undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList> | undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();

// Brand accent color
const BRAND_ACCENT = '#32CE7A';
const INACTIVE_ICON_COLOR = '#9CA3AF';
const ACTIVE_ICON_SIZE = 24;
const INACTIVE_ICON_SIZE = 24;
const BUBBLE_SIZE = 44;
const BUBBLE_RADIUS = 22;

// Animated bubble component
function AnimatedBubble({ focused, children }: { focused: boolean; children: React.ReactNode }) {
  const scale = useSharedValue(0.8);

  useEffect(() => {
    if (focused) {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    }
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.activeBubble, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

export default function MainTabs() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 8);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: bottomPadding,
          left: 16,
          right: 16,
          height: 65,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 35,
          borderTopWidth: 0,
          borderWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          paddingHorizontal: 8,
          paddingVertical: 8,
        },
        tabBarIcon: ({ focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = 'home-outline';
          } else if (route.name === 'Book') {
            iconName = 'calendar-outline';
          } else if (route.name === 'Orders') {
            iconName = 'cube-outline';
          } else if (route.name === 'Profile') {
            iconName = 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          if (focused) {
            return (
              <AnimatedBubble focused={focused}>
                <Ionicons
                  name={iconName}
                  size={ACTIVE_ICON_SIZE}
                  color="#FFFFFF"
                />
              </AnimatedBubble>
            );
          }

          return (
            <View style={styles.inactiveIconContainer}>
              <Ionicons
                name={iconName}
                size={INACTIVE_ICON_SIZE}
                color={INACTIVE_ICON_COLOR}
              />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Book" component={BookingStack} />
      <Tab.Screen name="Orders" component={OrdersStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  activeBubble: {
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_RADIUS,
    backgroundColor: BRAND_ACCENT,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: BRAND_ACCENT,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  inactiveIconContainer: {
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
