import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useStripe, isPlatformPaySupported } from '@stripe/stripe-react-native';
import { BookingStackParamList } from '../../navigation/BookingStack';
import { useBooking } from '../../contexts/BookingContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  createPaymentIntent,
  updateBookingPaymentStatus,
  createBooking,
  createBookingAddons,
} from '../../services/paymentService';

type Props = NativeStackScreenProps<BookingStackParamList, 'PaymentMethod'>;

const savedCards = [
  { id: '1', type: 'visa', last4: '2741', expiry: '10/27' },
  { id: '2', type: 'mastercard', last4: '8392', expiry: '03/26' },
];

export default function PaymentMethodScreen({ navigation, route }: Props) {
  const {
    priceBreakdown,
    selectedService,
    selectedAddons,
    selectedCar,
    selectedDate,
    selectedTimeSlot,
    selectedDetailer,
    selectedLocation,
  } = useBooking();
  const { user } = useAuth();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const insets = useSafeAreaInsets();
  const [selectedCard, setSelectedCard] = useState<string>('apple-pay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApplePayAvailable, setIsApplePayAvailable] = useState(false);
  const showPriceSummary = route.params?.showPrice ?? true;

  // Check if Apple Pay is available on the device
  useEffect(() => {
    const checkApplePayAvailability = async () => {
      if (Platform.OS === 'ios') {
        try {
          const supported = await isPlatformPaySupported();
          setIsApplePayAvailable(supported);
          console.log('🍎 Apple Pay available:', supported);
        } catch (error) {
          console.error('Error checking Apple Pay availability:', error);
          setIsApplePayAvailable(false);
        }
      } else {
        setIsApplePayAvailable(false);
      }
    };

    checkApplePayAvailability();
  }, []);

  const handleCompletePayment = async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);

      // Check if booking was already created (from OrderSummaryScreen via RPC)
      let bookingId: string;

      if (route.params?.bookingId) {
        // Booking already created via RPC, use the provided ID
        bookingId = route.params.bookingId;
        console.log('Using existing booking ID from RPC:', bookingId);
      } else {
        // Fallback: Create booking using old method (for backward compatibility)
        // This should not happen in normal flow, but kept for safety
        console.warn('No booking ID in route params, falling back to old createBooking method');

        // Validate required booking data
        if (!user || !selectedService || !selectedDate || !selectedTimeSlot || !selectedLocation) {
          Alert.alert('Error', 'Missing required booking information. Please go back and complete all fields.');
          return;
        }

        // Format scheduled date and time
        const scheduledDate = selectedDate.toISOString().split('T')[0];
        const scheduledTime = selectedTimeSlot;

        // Determine car_id: use selectedCar OR fetch user's primary car
        let finalCarId = selectedCar?.id || null;

        if (!finalCarId) {
          console.log('No car selected, fetching user primary car...');
          const { data: primaryCar, error: carError } = await supabase
            .from('cars')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_primary', true)
            .maybeSingle();

          if (carError) {
            console.error('Error fetching primary car:', carError);
          }

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

        // Step 1: Create booking record in Supabase (old method)
        bookingId = await createBooking({
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
          address_line1: selectedLocation.address_line1,
          address_line2: selectedLocation.address_line2 || null,
          city: selectedLocation.city,
          province: selectedLocation.province,
          postal_code: selectedLocation.postal_code,
          latitude: selectedLocation.latitude || null,
          longitude: selectedLocation.longitude || null,
          location_notes: selectedLocation.location_notes || null,
        });
      }

      // Step 2: Create booking addons if any (still needed even if booking created via RPC)
      if (selectedAddons.length > 0) {
        const addonData = selectedAddons.map((addon) => ({
          id: addon.id,
          price: addon.price,
        }));
        await createBookingAddons(bookingId, addonData);
      }

      // Step 3: Create PaymentIntent via Edge Function
      // Amount is computed server-side from booking's total_amount for security
      console.log('📞 Calling createPaymentIntent with bookingId:', bookingId);
      const paymentIntentResponse = await createPaymentIntent(bookingId);

      // Step 4: Initialize PaymentSheet
      const paymentSheetConfig: any = {
        merchantDisplayName: 'CleanSwift',
        paymentIntentClientSecret: paymentIntentResponse.paymentIntentClientSecret,
        defaultBillingDetails: {
          email: user.email,
        },
        returnURL: 'cleanswift://payment-complete',
      };

      // Enable Apple Pay if available and selected
      if (Platform.OS === 'ios' && isApplePayAvailable && selectedCard === 'apple-pay') {
        paymentSheetConfig.applePay = {
          merchantCountryCode: 'US',
        };
        console.log('🍎 Apple Pay enabled in PaymentSheet');
      }

      const { error: initError } = await initPaymentSheet(paymentSheetConfig);

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
          // Note: The Edge Function already stores stripe_payment_intent_id in the booking
          await updateBookingPaymentStatus({
            booking_id: bookingId,
            payment_status: 'failed',
          });
        }
        return;
      }

      // Step 6: Payment successful - update booking status
      // Note: The Edge Function already stores stripe_payment_intent_id in the booking
      await updateBookingPaymentStatus({
        booking_id: bookingId,
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

  const handleTestSkipPayment = async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);

      // Validate required booking data
      if (!user || !selectedService || !selectedDate || !selectedTimeSlot || !selectedLocation) {
        Alert.alert('Error', 'Missing required booking information. Please go back and complete all fields.');
        return;
      }

      // Format scheduled date and time
      const scheduledDate = selectedDate.toISOString().split('T')[0];
      const scheduledTime = selectedTimeSlot;

      // Determine car_id: use selectedCar OR fetch user's primary car
      let finalCarId = selectedCar?.id || null;

      if (!finalCarId) {
        const { data: primaryCar } = await supabase
          .from('cars')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_primary', true)
          .maybeSingle();

        if (primaryCar) {
          finalCarId = primaryCar.id;
        }
      }

      if (!finalCarId) {
        Alert.alert('Vehicle Required', 'Please add a vehicle to your profile before booking a service.');
        return;
      }

      // Create booking record (skip payment)
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
        address_line1: selectedLocation.address_line1,
        address_line2: selectedLocation.address_line2 || null,
        city: selectedLocation.city,
        province: selectedLocation.province,
        postal_code: selectedLocation.postal_code,
        latitude: selectedLocation.latitude || null,
        longitude: selectedLocation.longitude || null,
        location_notes: selectedLocation.location_notes || null,
      });

      // Create booking addons if any
      if (selectedAddons.length > 0) {
        const addonData = selectedAddons.map((addon) => ({
          id: addon.id,
          price: addon.price,
        }));
        await createBookingAddons(bookingId, addonData);
      }

      // Skip payment and navigate directly to success screen
      console.log('🧪 TEST: Skipping payment flow');
      navigation.navigate('ServiceProgress');
    } catch (error) {
      console.error('Test skip payment error:', error);
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
            <Ionicons name="chevron-back" size={24} color="#C6CFD9" />
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
          {Platform.OS === 'ios' && isApplePayAvailable && (
            <TouchableOpacity
              onPress={async () => {
                setSelectedCard('apple-pay');
                console.log('🍎 Apple Pay selected - triggering payment flow');
                // Directly trigger payment when Apple Pay button is tapped
                await handleCompletePayment();
              }}
              activeOpacity={0.8}
              disabled={isProcessing}
              style={[
                styles.applePayButton,
                selectedCard === 'apple-pay' && styles.applePayButtonSelected,
                isProcessing && styles.applePayButtonDisabled,
              ]}
            >
              <Ionicons name="logo-apple" size={24} color="white" />
              <Text style={styles.applePayText}>
                {isProcessing ? 'Processing...' : 'Pay with Apple Pay'}
              </Text>
            </TouchableOpacity>
          )}
          
          {/* Show message if Apple Pay not available */}
          {Platform.OS === 'ios' && !isApplePayAvailable && (
            <View style={styles.applePayUnavailableContainer}>
              <Text style={styles.applePayUnavailableText}>
                Apple Pay is not available on this device
              </Text>
            </View>
          )}

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Saved Cards */}
          <View style={styles.cardsList}>
            {savedCards.map((card) => {
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
                      <Ionicons name="checkmark" size={12} color="#050B12" />
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
                <Ionicons name="add" size={20} color="#6FF0C4" />
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
        <View style={[styles.bottomCTA, { bottom: 68 + Math.max(insets.bottom, 0) }]}>
          {/* Test Skip Payment Button */}
          <TouchableOpacity
            onPress={handleTestSkipPayment}
            activeOpacity={0.8}
            disabled={isProcessing}
            style={[styles.testSkipButton, isProcessing && styles.testSkipButtonDisabled]}
          >
            <Text style={styles.testSkipButtonText}>
              {isProcessing ? 'Processing...' : 'Test Skip Payment'}
            </Text>
          </TouchableOpacity>
          
          {/* Complete Payment Button */}
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
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050B12',
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
    color: '#F5F7FA',
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
    color: '#C6CFD9',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
  },
  applePayButton: {
    width: '100%',
    height: 56,
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
    borderColor: '#6FF0C4',
    shadowColor: '#6FF0C4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  applePayButtonDisabled: {
    opacity: 0.6,
  },
  applePayText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  applePayUnavailableContainer: {
    width: '100%',
    padding: 16,
    backgroundColor: '#0A1A2F',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 24,
  },
  applePayUnavailableText: {
    color: '#C6CFD9',
    fontSize: 14,
    textAlign: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(198,207,217,0.2)',
  },
  dividerText: {
    color: '#C6CFD9',
    fontSize: 14,
    marginHorizontal: 16,
  },
  cardsList: {
    marginBottom: 16,
  },
  cardOption: {
    width: '100%',
    backgroundColor: '#0A1A2F',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    position: 'relative',
    marginBottom: 12,
  },
  cardOptionSelected: {
    borderWidth: 2,
    borderColor: '#6FF0C4',
    shadowColor: '#6FF0C4',
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
    backgroundColor: '#6FF0C4',
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
    color: '#F5F7FA',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  cardExpiry: {
    color: '#C6CFD9',
    fontSize: 14,
  },
  addCardButton: {
    width: '100%',
    backgroundColor: '#0A1A2F',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(111,240,196,0.3)',
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
    backgroundColor: 'rgba(111,240,196,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addCardText: {
    color: '#6FF0C4',
    fontSize: 16,
    fontWeight: '500',
  },
  priceSummary: {
    backgroundColor: '#0A1A2F',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  priceRows: {
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    color: '#C6CFD9',
    fontSize: 15,
  },
  priceValue: {
    color: '#F5F7FA',
    fontSize: 15,
  },
  priceDivider: {
    height: 1,
    backgroundColor: 'rgba(198,207,217,0.2)',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: '#F5F7FA',
    fontSize: 18,
    fontWeight: '600',
  },
  totalValue: {
    color: '#6FF0C4',
    fontSize: 24,
    fontWeight: '700',
  },
  bottomCTA: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: 'transparent',
    elevation: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    borderTopWidth: 0,
    borderTopColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
    gap: 12,
  },
  testSkipButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 48,
    backgroundColor: '#6FF0C4',
    borderWidth: 1,
    borderColor: '#6FF0C4',
  },
  testSkipButtonDisabled: {
    backgroundColor: '#0A1A2F',
    opacity: 0.6,
    borderColor: 'rgba(111,240,196,0.3)',
  },
  testSkipButtonText: {
    color: '#050B12',
    fontSize: 15,
    fontWeight: '600',
  },
  completeButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 56,
    backgroundColor: '#1DA4F3',
    shadowColor: '#1DA4F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  completeButtonDisabled: {
    backgroundColor: '#0A1A2F',
    opacity: 0.6,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
