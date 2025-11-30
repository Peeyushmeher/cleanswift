import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { useProfileCompleteness } from '../hooks/useProfileCompleteness';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import OnboardingWizard from '../screens/onboarding/OnboardingWizard';
import type { User } from '@supabase/supabase-js';

export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const { isComplete, loading: completenessLoading } = useProfileCompleteness();
  const previousIsCompleteRef = useRef<boolean | null>(null);
  const navigatorKeyRef = useRef(0);

  // Debug logging
  console.log('RootNavigator state:', {
    hasUser: !!user,
    hasProfile: !!profile,
    isComplete,
    authLoading,
    profileLoading,
    completenessLoading,
    previousIsComplete: previousIsCompleteRef.current,
  });

  const previousUserRef = useRef<User | null>(null);

  // Force re-render when user logs out (user becomes null)
  useEffect(() => {
    if (!authLoading && previousUserRef.current !== null && user === null) {
      console.log('User logged out! Forcing navigation to Auth...');
      // Increment key to force navigator to remount with Auth as initial route
      navigatorKeyRef.current += 1;
    }
    previousUserRef.current = user;
  }, [user, authLoading]);

  // Force re-render when completeness changes from false to true
  useEffect(() => {
    if (
      !authLoading &&
      !profileLoading &&
      !completenessLoading &&
      user &&
      previousIsCompleteRef.current === false &&
      isComplete === true
    ) {
      console.log('✅ Profile complete! Forcing navigation to Main...');
      // Increment key to force navigator to remount with new initial route
      navigatorKeyRef.current += 1;
    }
    
    // Update previous value
    if (!completenessLoading) {
      previousIsCompleteRef.current = isComplete;
    }
  }, [isComplete, authLoading, profileLoading, completenessLoading, user]);

  // Show loading screen while checking auth state and profile completeness
  if (authLoading || profileLoading || completenessLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#050B12', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6FF0C4" />
      </View>
    );
  }

  // Determine initial route
  const getInitialRouteName = (): keyof RootStackParamList => {
    if (!user) return 'Auth';
    if (!isComplete) return 'Onboarding';
    return 'Main';
  };

  const initialRoute = getInitialRouteName();
  console.log('RootNavigator rendering with initialRoute:', initialRoute, 'key:', navigatorKeyRef.current);

  return (
    <Stack.Navigator
      key={navigatorKeyRef.current} // Force remount when key changes
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen name="Auth" component={AuthStack} />
      <Stack.Screen name="Onboarding" component={OnboardingWizard} />
      <Stack.Screen name="Main" component={MainTabs} />
    </Stack.Navigator>
  );
}
