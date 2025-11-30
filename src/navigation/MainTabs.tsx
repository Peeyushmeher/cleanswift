import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigatorScreenParams } from '@react-navigation/native';
import { useEffect } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
const INACTIVE_ICON_COLOR = '#C6CFD9';
const ACTIVE_ICON_SIZE = 24;
const INACTIVE_ICON_SIZE = 24;
const BUBBLE_SIZE = 44;
const BUBBLE_RADIUS = 22;

// Animated bubble component
function AnimatedBubble({ focused, children }: { focused: boolean; children: React.ReactNode }) {
  const scale = useSharedValue(focused ? 1 : 0.8);

  useEffect(() => {
    if (focused) {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    } else {
      scale.value = withSpring(0.8, { damping: 15, stiffness: 150 });
    }
  }, [focused, scale]);

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Animated.View style={[styles.activeBubble, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

// Custom transparent tab bar
function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 8);

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          bottom: bottomPadding,
        },
      ]}
      pointerEvents="box-none"
      collapsable={false}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

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

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabBarItem}
          >
            {isFocused ? (
              <AnimatedBubble focused={isFocused}>
                <Ionicons name={iconName} size={ACTIVE_ICON_SIZE} color="#FFFFFF" />
              </AnimatedBubble>
            ) : (
              <View style={styles.inactiveIconContainer}>
                <Ionicons name={iconName} size={INACTIVE_ICON_SIZE} color={INACTIVE_ICON_COLOR} />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          borderWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 0,
          opacity: 0,
          zIndex: -1,
          ...Platform.select({
            android: {
              backgroundColor: 'transparent',
              elevation: 0,
            },
            ios: {
              backgroundColor: 'transparent',
            },
          }),
        },
        tabBarBackground: () => null,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Book" component={BookingStack} />
      <Tab.Screen name="Orders" component={OrdersStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    left: 24,
    right: 24,
    height: 60,
    flexDirection: 'row',
    backgroundColor: 'rgba(10, 26, 47, 0.75)',
    borderRadius: 30,
    paddingHorizontal: 8,
    paddingVertical: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 0,
    overflow: 'visible',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabBarItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
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
