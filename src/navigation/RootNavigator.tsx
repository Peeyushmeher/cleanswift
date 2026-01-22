import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { useProfileCompleteness } from '../contexts/ProfileCompletenessContext';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import OnboardingWizard from '../screens/onboarding/OnboardingWizard';

export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  Main: undefined;
};

// Separate stacks for each auth state - this ensures clean unmount/mount on auth changes
const AuthNavigatorStack = createNativeStackNavigator();
const MainNavigatorStack = createNativeStackNavigator();
const OnboardingNavigatorStack = createNativeStackNavigator();

function AuthNavigator() {
  return (
    <AuthNavigatorStack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      <AuthNavigatorStack.Screen name="AuthStack" component={AuthStack} />
    </AuthNavigatorStack.Navigator>
  );
}

function MainNavigator() {
  return (
    <MainNavigatorStack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      <MainNavigatorStack.Screen name="MainTabs" component={MainTabs} />
    </MainNavigatorStack.Navigator>
  );
}

function OnboardingNavigator() {
  return (
    <OnboardingNavigatorStack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      <OnboardingNavigatorStack.Screen name="OnboardingWizard" component={OnboardingWizard} />
    </OnboardingNavigatorStack.Navigator>
  );
}

export default function RootNavigator() {
  const { user, loading: authLoading } = useAuth();
  const { isComplete, loading: completenessLoading } = useProfileCompleteness();

  // Debug logging
  console.log('RootNavigator state:', {
    hasUser: !!user,
    isComplete,
    authLoading,
    completenessLoading,
  });

  // Show loading screen while checking auth state and profile completeness
  if (authLoading || completenessLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#050B12', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6FF0C4" />
      </View>
    );
  }

  // CONDITIONAL RENDERING based on auth state
  // This ensures complete unmount/mount when auth state changes
  
  // Not logged in -> Show Auth screens
  if (!user) {
    console.log('RootNavigator: Rendering AuthNavigator (no user)');
    return <AuthNavigator />;
  }

  // Logged in but profile not complete -> Show Onboarding
  if (!isComplete) {
    console.log('RootNavigator: Rendering OnboardingNavigator (profile incomplete)');
    return <OnboardingNavigator />;
  }

  // Logged in and profile complete -> Show Main app
  console.log('RootNavigator: Rendering MainNavigator (authenticated)');
  return <MainNavigator />;
}
