import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';
import HelpSupportScreen from '../screens/profile/HelpSupportScreen';
import SelectCarScreen from '../screens/profile/SelectCarScreen';
import AddCarScreen from '../screens/profile/AddCarScreen';

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  Notifications: undefined;
  HelpSupport: undefined;
  SelectCar: {
    returnTo?: 'OrderSummary' | 'Profile';
    originalParams?: any;
  } | undefined;
  AddCar: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="SelectCar" component={SelectCarScreen} />
      <Stack.Screen name="AddCar" component={AddCarScreen} />
    </Stack.Navigator>
  );
}
