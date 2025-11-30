import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AddPaymentCardScreen from '../screens/booking/AddPaymentCardScreen';
import BookingDateTimeScreen from '../screens/booking/BookingDateTimeScreen';
import ChooseDetailerScreen from '../screens/booking/ChooseDetailerScreen';
import CombinedSelectionScreen from '../screens/booking/CombinedSelectionScreen';
import LiveTrackingScreen from '../screens/booking/LiveTrackingScreen';
import OrderSummaryScreen from '../screens/booking/OrderSummaryScreen';
import PaymentMethodScreen from '../screens/booking/PaymentMethodScreen';
import ReceiptRatingScreen from '../screens/booking/ReceiptRatingScreen';
import ServiceProgressScreen from '../screens/booking/ServiceProgressScreen';
import ServiceSelectionScreen from '../screens/booking/ServiceSelectionScreen';

export type BookingStackParamList = {
  ServiceSelection:
    | {
        rebookFromBookingId?: string;
        preselectedDetailerId?: string;
      }
    | undefined;
  BookingDateTime: {
    selectedService: string;
    selectedAddons: string[];
  };
  CombinedSelection: {
    selectedService: string;
    selectedAddons: string[];
    preselectedDetailerId?: string;
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
    detailerId?: string; // Optional - only used when detailer is pre-selected (e.g., rebooking)
  };
  PaymentMethod: {
    showPrice?: boolean;
    bookingId?: string;
    totalPriceCents?: number;
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
      {/* CombinedSelectionScreen: Alternative flow that combines Detailer, Time, and Location selection */}
      <Stack.Screen name="CombinedSelection" component={CombinedSelectionScreen} />
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
