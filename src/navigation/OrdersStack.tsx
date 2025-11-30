import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OrdersHistoryScreen from '../screens/orders/OrdersHistoryScreen';
import OrderDetailsScreen from '../screens/orders/OrderDetailsScreen';
import type { BookingHistoryItem } from '../hooks/useBookings';

export type OrdersStackParamList = {
  OrdersHistory: undefined;
  OrderDetails: {
    orderId: string;
    booking?: BookingHistoryItem;
  };
};

const Stack = createNativeStackNavigator<OrdersStackParamList>();

export default function OrdersStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="OrdersHistory" component={OrdersHistoryScreen} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
    </Stack.Navigator>
  );
}
