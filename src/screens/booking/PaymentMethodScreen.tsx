import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useStripe } from '@stripe/stripe-react-native';
import { BookingStackParamList } from '../../navigation/BookingStack';
import { useBooking } from '../../contexts/BookingContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  createPaymentIntent,
  updateBookingPaymentStatus,
  createBooking,
  createBookingAddons,
} from '../../services/paymentService';
import { getPrimaryCar } from '../../services/carsService';
import { DEMO_SAVED_CARDS } from '../../config/demoData';
import { COLORS } from '../../theme/colors';

type Props = NativeStackScreenProps<BookingStackParamList, 'PaymentMethod'>;

export default function PaymentMethodScreen({ navigation, route }: Props) {
  const {
    priceBreakdown,
    selectedService,
    selectedAddons,
    selectedCar,
    selectedDate,
    selectedTimeSlot,
    selectedDetailer,
    location,
  } = useBooking();
  const { user } = useAuth();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [selectedCard, setSelectedCard] = useState<string>('apple-pay');
  const [isProcessing, setIsProcessing] = useState(false);
  const showPriceSummary = route.params?.showPrice ?? true;

  const handleCompletePayment = async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);

      // Validate required booking data
      if (!user || !selectedService || !selectedDate || !selectedTimeSlot) {
        Alert.alert('Error', 'Missing required booking information. Please go back and complete all fields.');
        return;
      }

      // Validate location is set
      if (!location) {
        Alert.alert(
          'Location Required',
          'Please provide your service location before proceeding.',
          [
            {
              text: 'Add Location',
              onPress: () => navigation.goBack(),
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
        return;
      }

      // Format scheduled date and time
      const scheduledDate = selectedDate.toISOString().split('T')[0];
      const scheduledTime = selectedTimeSlot;

      // Determine car_id: use selectedCar OR fetch user's primary car
      let finalCarId = selectedCar?.id || null;

      if (!finalCarId) {
        console.log('No car selected, fetching user primary car...');
        const primaryCar = await getPrimaryCar(user.id);

        if (primaryCar) {
          finalCarId = primaryCar.id;
          console.log('Using primary car for booking:', finalCarId);
        }
      } else {
        console.log('Using selected car for booking:', finalCarId);
      }

      // If still no car, show error and don't proceed
      if (!finalCarId) {
        Alert.alert(
          'Vehicle Required',
          'Please add a vehicle to your profile before booking a service.',
          [
            {
              text: 'Add Vehicle',
              onPress: () => {
                // Navigate to Profile tab where user can add cars
                // Assuming MainTabs has a Profile tab
                navigation.getParent()?.navigate('Profile');
              },
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
        return;
      }

      // Step 1: Create booking record in Supabase
      const bookingId = await createBooking({
        user_id: user.id,
        service_id: selectedService.id,
        car_id: finalCarId, // Now guaranteed to be a valid UUID
        detailer_id: selectedDetailer?.id || null,
        scheduled_date: scheduledDate,
        scheduled_time_start: scheduledTime, // Fixed: was 'scheduled_time'
        total_amount: priceBreakdown.totalAmount,
        service_price: priceBreakdown.servicePrice,
        addons_total: priceBreakdown.addonsTotal,
        tax_amount: priceBreakdown.taxAmount,
        // Use location from BookingContext
        address_line1: location.address_line1,
        address_line2: location.address_line2 || null,
        city: location.city,
        province: location.province,
        postal_code: location.postal_code,
        latitude: location.lat || null,
        longitude: location.lng || null,
        location_notes: null,
      });

      // Step 2: Create booking addons if any
      if (selectedAddons.length > 0) {
        // Map to { id, price } format expected by createBookingAddons
        const addonData = selectedAddons.map((addon) => ({
          id: addon.id,
          price: addon.price,
        }));
        await createBookingAddons(bookingId, addonData);
      }

      // Step 3: Create PaymentIntent via Edge Function
      const { client_secret, payment_intent_id } = await createPaymentIntent(
        bookingId,
        priceBreakdown.totalAmount
      );

      // Step 4: Initialize PaymentSheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'CleanSwift',
        paymentIntentClientSecret: client_secret,
        defaultBillingDetails: {
          email: user.email,
        },
        returnURL: 'cleanswift://payment-complete',
      });

      if (initError) {
        console.error('PaymentSheet init error:', initError);
        Alert.alert('Error', 'Failed to initialize payment. Please try again.');
        return;
      }

      // Step 5: Present PaymentSheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        // User cancelled or payment failed
        if (presentError.code === 'Canceled') {
          console.log('Payment cancelled by user');
        } else {
          console.error('Payment error:', presentError);
          Alert.alert('Payment Failed', presentError.message || 'Payment could not be processed.');

          // Update booking status to failed
          await updateBookingPaymentStatus({
            booking_id: bookingId,
            payment_intent_id: payment_intent_id,
            payment_status: 'failed',
          });
        }
        return;
      }

      // Step 6: Payment successful - update booking status
      await updateBookingPaymentStatus({
        booking_id: bookingId,
        payment_intent_id: payment_intent_id,
        payment_status: 'paid',
      });

      // Step 7: Navigate to success screen
      navigation.navigate('ServiceProgress');
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddCard = () => {
    navigation.navigate('AddPaymentCard');
  };

  const handleTestBooking = async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);

      // Validate required booking data
      if (!user || !selectedService || !selectedDate || !selectedTimeSlot) {
        Alert.alert('Error', 'Missing required booking information. Please go back and complete all fields.');
        return;
      }

      // Validate location is set
      if (!location) {
        Alert.alert(
          'Location Required',
          'Please provide your service location before proceeding.',
          [
            {
              text: 'Add Location',
              onPress: () => navigation.goBack(),
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
        return;
      }

      // Format scheduled date and time
      const scheduledDate = selectedDate.toISOString().split('T')[0];
      const scheduledTime = selectedTimeSlot;

      // Determine car_id: use selectedCar OR fetch user's primary car
      let finalCarId = selectedCar?.id || null;

      if (!finalCarId) {
        console.log('No car selected, fetching user primary car...');
        const primaryCar = await getPrimaryCar(user.id);

        if (primaryCar) {
          finalCarId = primaryCar.id;
          console.log('Using primary car for booking:', finalCarId);
        }
      } else {
        console.log('Using selected car for booking:', finalCarId);
      }

      // If still no car, show error and don't proceed
      if (!finalCarId) {
        Alert.alert(
          'Vehicle Required',
          'Please add a vehicle to your profile before booking a service.',
          [
            {
              text: 'Add Vehicle',
              onPress: () => {
                navigation.getParent()?.navigate('Profile');
              },
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
        return;
      }

      // Create booking record WITHOUT payment processing
      const bookingId = await createBooking({
        user_id: user.id,
        service_id: selectedService.id,
        car_id: finalCarId,
        detailer_id: selectedDetailer?.id || null,
        scheduled_date: scheduledDate,
        scheduled_time_start: scheduledTime,
        total_amount: priceBreakdown.totalAmount,
        service_price: priceBreakdown.servicePrice,
        addons_total: priceBreakdown.addonsTotal,
        tax_amount: priceBreakdown.taxAmount,
        // Use location from BookingContext
        address_line1: location.address_line1,
        address_line2: location.address_line2 || null,
        city: location.city,
        province: location.province,
        postal_code: location.postal_code,
        latitude: location.lat || null,
        longitude: location.lng || null,
        location_notes: 'Test booking - payment skipped',
      });

      // Create booking addons if any
      if (selectedAddons.length > 0) {
        const addonData = selectedAddons.map((addon) => ({
          id: addon.id,
          price: addon.price,
        }));
        await createBookingAddons(bookingId, addonData);
      }

      console.log('Test booking created successfully:', bookingId);
      Alert.alert('Success', 'Test booking created! Payment skipped for testing.', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('ServiceProgress'),
        },
      ]);
    } catch (error) {
      console.error('Test booking error:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.text.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment Method</Text>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Security Statement */}
          <Text style={styles.securityText}>
            Your payment information is encrypted and securely stored.
          </Text>

          {/* Apple Pay */}
          <TouchableOpacity
            onPress={() => setSelectedCard('apple-pay')}
            activeOpacity={0.8}
            style={[
              styles.applePayButton,
              selectedCard === 'apple-pay' && styles.applePayButtonSelected,
            ]}
          >
            <Ionicons name="logo-apple" size={24} color="white" />
            <Text style={styles.applePayText}>Apple Pay</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Saved Cards */}
          <View style={styles.cardsList}>
            {DEMO_SAVED_CARDS.map((card) => {
              const isSelected = selectedCard === card.id;

              return (
                <TouchableOpacity
                  key={card.id}
                  onPress={() => setSelectedCard(card.id)}
                  activeOpacity={0.8}
                  style={[
                    styles.cardOption,
                    isSelected && styles.cardOptionSelected,
                  ]}
                >
                  {isSelected && (
                    <View style={styles.cardCheckmark}>
                      <Ionicons name="checkmark" size={12} color={COLORS.bg.primary} />
                    </View>
                  )}

                  <View style={styles.cardContent}>
                    <Ionicons name="card" size={48} color="white" style={{ opacity: 0.9 }} />
                    <View style={styles.cardDetails}>
                      <Text style={styles.cardNumber}>
                        {card.type === 'visa' ? 'Visa' : 'Mastercard'} •••• {card.last4}
                      </Text>
                      <Text style={styles.cardExpiry}>Exp {card.expiry}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Add New Card */}
          <TouchableOpacity
            onPress={handleAddCard}
            activeOpacity={0.8}
            style={styles.addCardButton}
          >
            <View style={styles.addCardContent}>
              <View style={styles.addCardIcon}>
                <Ionicons name="add" size={20} color={COLORS.accent.mint} />
              </View>
              <Text style={styles.addCardText}>Add New Card</Text>
            </View>
          </TouchableOpacity>

          {/* Price Summary */}
          {showPriceSummary && (
            <View style={styles.priceSummary}>
              <View style={styles.priceRows}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Service</Text>
                  <Text style={styles.priceValue}>
                    {formatCurrency(priceBreakdown.servicePrice)}
                  </Text>
                </View>
                {priceBreakdown.addonsTotal > 0 && (
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Add-ons</Text>
                    <Text style={styles.priceValue}>
                      {formatCurrency(priceBreakdown.addonsTotal)}
                    </Text>
                  </View>
                )}
                {priceBreakdown.taxAmount > 0 && (
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>HST</Text>
                    <Text style={styles.priceValue}>
                      {formatCurrency(priceBreakdown.taxAmount)}
                    </Text>
                  </View>
                )}
                <View style={styles.priceDivider} />
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>
                    {formatCurrency(priceBreakdown.totalAmount)}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Bottom CTA */}
        <View style={styles.bottomCTA}>
          <TouchableOpacity
            onPress={handleCompletePayment}
            activeOpacity={0.8}
            disabled={isProcessing}
            style={[styles.completeButton, isProcessing && styles.completeButtonDisabled]}
          >
            <Text style={styles.completeButtonText}>
              {isProcessing
                ? 'Processing...'
                : showPriceSummary
                ? 'Complete Payment'
                : 'Save'}
            </Text>
          </TouchableOpacity>

          {/* Test Booking Button - Skip Payment */}
          <TouchableOpacity
            onPress={handleTestBooking}
            activeOpacity={0.8}
            disabled={isProcessing}
            style={styles.testButton}
          >
            <Ionicons name="flask" size={16} color={COLORS.text.secondary} />
            <Text style={styles.testButtonText}>Test Booking (Skip Payment)</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  backButton: {
    padding: 4,
    marginRight: 16,
  },
  headerTitle: {
    color: COLORS.text.primary,
    fontSize: 28,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  securityText: {
    color: COLORS.text.secondary,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
  },
  applePayButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#000000',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  applePayButtonSelected: {
    borderWidth: 2,
    borderColor: COLORS.accent.mint,
    shadowColor: COLORS.shadow.mint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  applePayText: {
    color: COLORS.text.inverse,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border.emphasis,
  },
  dividerText: {
    color: COLORS.text.secondary,
    fontSize: 14,
    marginHorizontal: 16,
  },
  cardsList: {
    marginBottom: 16,
  },
  cardOption: {
    width: '100%',
    backgroundColor: COLORS.bg.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    position: 'relative',
    marginBottom: 12,
  },
  cardOptionSelected: {
    borderWidth: 2,
    borderColor: COLORS.accent.mint,
    shadowColor: COLORS.shadow.mint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cardCheckmark: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.accent.mint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardDetails: {
    flex: 1,
    marginLeft: 16,
  },
  cardNumber: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  cardExpiry: {
    color: COLORS.text.secondary,
    fontSize: 14,
  },
  addCardButton: {
    width: '100%',
    backgroundColor: COLORS.bg.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.accentBg.mint30,
    borderStyle: 'dashed',
    marginBottom: 32,
  },
  addCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accentBg.mint10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addCardText: {
    color: COLORS.accent.mint,
    fontSize: 16,
    fontWeight: '500',
  },
  priceSummary: {
    backgroundColor: COLORS.bg.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  priceRows: {
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    color: COLORS.text.secondary,
    fontSize: 15,
  },
  priceValue: {
    color: COLORS.text.primary,
    fontSize: 15,
  },
  priceDivider: {
    height: 1,
    backgroundColor: COLORS.border.emphasis,
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: COLORS.text.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  totalValue: {
    color: COLORS.accent.mint,
    fontSize: 24,
    fontWeight: '700',
  },
  bottomCTA: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    backgroundColor: COLORS.bg.primary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.subtle,
  },
  completeButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 56,
    backgroundColor: COLORS.accent.blue,
    shadowColor: COLORS.shadow.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  completeButtonDisabled: {
    backgroundColor: COLORS.bg.surface,
    opacity: 0.6,
  },
  completeButtonText: {
    color: COLORS.text.inverse,
    fontSize: 17,
    fontWeight: '600',
  },
  testButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 12,
    backgroundColor: 'rgba(10,26,47,0.5)',
    borderWidth: 1,
    borderColor: COLORS.border.strong,
  },
  testButtonText: {
    color: COLORS.text.secondary,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
});
