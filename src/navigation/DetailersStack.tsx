import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DetailersListScreen from '../screens/detailers/DetailersListScreen';
import DetailerProfileScreen from '../screens/detailers/DetailerProfileScreen';

export type DetailersStackParamList = {
  DetailersList: undefined;
  DetailerProfile: { detailerId: string };
};

const Stack = createNativeStackNavigator<DetailersStackParamList>();

export default function DetailersStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="DetailersList" component={DetailersListScreen} />
      <Stack.Screen name="DetailerProfile" component={DetailerProfileScreen} />
    </Stack.Navigator>
  );
}

