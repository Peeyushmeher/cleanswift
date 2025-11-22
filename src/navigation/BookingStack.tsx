import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AddPaymentCardScreen from '../screens/booking/AddPaymentCardScreen';
import BookingDateTimeScreen from '../screens/booking/BookingDateTimeScreen';
import ChooseDetailerScreen from '../screens/booking/ChooseDetailerScreen';
import LiveTrackingScreen from '../screens/booking/LiveTrackingScreen';
import OrderSummaryScreen from '../screens/booking/OrderSummaryScreen';
import PaymentMethodScreen from '../screens/booking/PaymentMethodScreen';
import ReceiptRatingScreen from '../screens/booking/ReceiptRatingScreen';
import ServiceProgressScreen from '../screens/booking/ServiceProgressScreen';
import ServiceSelectionScreen from '../screens/booking/ServiceSelectionScreen';

export type BookingStackParamList = {
  ServiceSelection: undefined;
  BookingDateTime: {
    selectedService: string;
    selectedAddons: string[];
  };
  ChooseDetailer: {
    selectedService: string;
    selectedAddons: string[];
    date: string;
    time: string;
  };
  OrderSummary: {
    selectedService: string;
    selectedAddons: string[];
    date: string;
    time: string;
    detailerId: string;
  };
  PaymentMethod: {
    showPrice?: boolean;
  };
  AddPaymentCard: undefined;
  LiveTracking: undefined;
  ServiceProgress: undefined;
  ReceiptRating: undefined;
};

const Stack = createNativeStackNavigator<BookingStackParamList>();

export default function BookingStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="ServiceSelection" component={ServiceSelectionScreen} />
      <Stack.Screen name="BookingDateTime" component={BookingDateTimeScreen} />
      <Stack.Screen name="ChooseDetailer" component={ChooseDetailerScreen} />
      <Stack.Screen name="OrderSummary" component={OrderSummaryScreen} />
      <Stack.Screen name="PaymentMethod" component={PaymentMethodScreen} />
      <Stack.Screen name="AddPaymentCard" component={AddPaymentCardScreen} />
      <Stack.Screen name="LiveTracking" component={LiveTrackingScreen} />
      <Stack.Screen name="ServiceProgress" component={ServiceProgressScreen} />
      <Stack.Screen name="ReceiptRating" component={ReceiptRatingScreen} />
    </Stack.Navigator>
  );
}
