import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useStripe, isPlatformPaySupported } from '@stripe/stripe-react-native';
import { useEffect, useLayoutEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useBooking } from '../../contexts/BookingContext';
import { supabase } from '../../lib/supabase';
import { BookingStackParamList } from '../../navigation/BookingStack';
import {
  createBooking,
  createBookingAddons,
  createPaymentIntent,
  updateBookingPaymentStatus,
} from '../../services/paymentService';

type Props = NativeStackScreenProps<BookingStackParamList, 'PaymentMethod'>;

const savedCards = [
  { id: '1', type: 'visa', last4: '2741', expiry: '10/27' },
  { id: '2', type: 'mastercard', last4: '8392', expiry: '03/26' },
];

export default function PaymentMethodScreen({ navigation, route }: Props) {
  const parentNavigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {
    priceBreakdown,
    selectedService,
    selectedAddons,
    selectedCar,
    selectedDate,
    selectedTimeSlot,
    selectedDetailer,
  } = useBooking();

  useLayoutEffect(() => {
    const parent = parentNavigation.getParent();
    if (parent) {
      parent.setOptions({
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
      });
    }
  }, [parentNavigation]);
  const { user } = useAuth();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
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

      // Validate required booking data
      if (!user || !selectedService || !selectedDate || !selectedTimeSlot) {
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
          .maybeSingle(); // Use maybeSingle() to handle 0 or 1 results

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
        // TODO: Wire address from user profile or location selection flow
        address_line1: 'Customer address TBD', // TODO: get from user profile
        address_line2: null,
        city: 'Toronto', // TODO: get from user profile
        province: 'ON', // TODO: get from user profile
        postal_code: 'M1M 1M1', // TODO: get from user profile
        latitude: null,
        longitude: null,
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
      console.log('🔄 Step 3: Creating PaymentIntent...');
      console.log(`  Booking ID: ${bookingId}`);
      console.log(`  Amount: $${priceBreakdown.totalAmount.toFixed(2)} CAD`);

      const paymentIntentResponse = await createPaymentIntent(
        bookingId,
        priceBreakdown.totalAmount
      );

      const { client_secret, payment_intent_id } = paymentIntentResponse;

      if (!client_secret) {
        console.error('❌ Missing client_secret from PaymentIntent response');
        Alert.alert('Error', 'Failed to initialize payment. Please try again.');
        return;
      }

      // Handle missing payment_intent_id gracefully (shouldn't happen, but be safe)
      const safePaymentIntentId = payment_intent_id || 'unknown';

      console.log('✅ PaymentIntent created');
      console.log(`  Payment Intent ID: ${safePaymentIntentId}`);

      // Step 4: Initialize PaymentSheet
      console.log('🔄 Step 4: Initializing PaymentSheet...');
      const paymentSheetConfig: any = {
        merchantDisplayName: 'CleanSwift',
        paymentIntentClientSecret: client_secret,
        defaultBillingDetails: {
          email: user.email,
        },
        returnURL: 'cleanswift://payment-complete',
      };

      // PaymentSheet will automatically show Apple Pay if available on iOS
      // No explicit configuration needed - Stripe handles it automatically
      if (Platform.OS === 'ios' && isApplePayAvailable && selectedCard === 'apple-pay') {
        console.log('🍎 Apple Pay will appear as first option in PaymentSheet');
      }

      const { error: initError } = await initPaymentSheet(paymentSheetConfig);

      if (initError) {
        console.error('❌ PaymentSheet init error:', initError);
        Alert.alert(
          'Payment Error',
          'Failed to initialize payment. Please check your internet connection and try again.'
        );
        return;
      }

      console.log('✅ PaymentSheet initialized successfully');

      // Step 5: Present PaymentSheet
      console.log('🔄 Step 5: Presenting PaymentSheet to user...');
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        // User cancelled or payment failed
        if (presentError.code === 'Canceled') {
          console.log('ℹ️ Payment cancelled by user');
          // Don't show alert for user cancellation - it's expected behavior
        } else {
          console.error('❌ Payment error:', presentError);
          console.error('  Error code:', presentError.code);
          console.error('  Error message:', presentError.message);

          // Show user-friendly error message
          let errorMessage = 'Payment could not be processed.';
          if (presentError.message) {
            errorMessage = presentError.message;
          } else if (presentError.code) {
            errorMessage = `Payment error: ${presentError.code}`;
          }

          Alert.alert('Payment Failed', errorMessage);

          // Log payment failure
          try {
            await updateBookingPaymentStatus({
              booking_id: bookingId,
              payment_intent_id: safePaymentIntentId,
              payment_status: 'failed',
            });
          } catch (updateError) {
            console.error('Failed to log payment failure:', updateError);
            // Don't block user - payment already failed
          }
        }
        return;
      }

      // Step 6: Payment successful
      console.log('✅ Payment successful!');
      console.log(`  Booking ID: ${bookingId}`);
      console.log(`  Payment Intent ID: ${safePaymentIntentId}`);

      // Update booking payment status (logs payment info)
      try {
        await updateBookingPaymentStatus({
          booking_id: bookingId,
          payment_intent_id: safePaymentIntentId,
          payment_status: 'paid',
        });
      } catch (updateError) {
        console.error('Failed to log payment success:', updateError);
        // Don't block navigation - payment succeeded in Stripe
        console.warn('Payment succeeded in Stripe but failed to log. Payment Intent:', safePaymentIntentId);
      }

      // Step 7: Navigate to success screen
      console.log('🔄 Step 7: Navigating to ServiceProgress screen...');
      navigation.navigate('ServiceProgress');
    } catch (error) {
      console.error('❌ Payment flow error:', error);
      
      // Provide user-friendly error messages
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error instanceof Error) {
        console.error('  Error message:', error.message);
        console.error('  Error stack:', error.stack);
        
        // Handle specific error types
        if (error.message.includes('session') || error.message.includes('sign in')) {
          errorMessage = 'Please sign in to continue with payment.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else if (error.message.includes('booking')) {
          errorMessage = 'Failed to create booking. Please try again.';
        } else if (error.message.includes('payment')) {
          errorMessage = 'Payment service error. Please try again.';
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setIsProcessing(false);
      console.log('🔄 Payment flow completed (success or error)');
    }
  };

  const handleAddCard = () => {
    navigation.navigate('AddPaymentCard');
  };

  const handleSkipPayment = () => {
    // Skip payment for testing purposes
    navigation.navigate('ServiceProgress');
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
        <View style={[styles.bottomCTA, { bottom: Math.max(insets.bottom, 8) + 68 }]}>
          <View style={styles.buttonSafeArea}>
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

          {/* Skip Payment for Testing */}
          <TouchableOpacity
            onPress={handleSkipPayment}
            activeOpacity={0.8}
            style={styles.skipButton}
          >
            <Text style={styles.skipButtonText}>Skip Payment (Testing)</Text>
          </TouchableOpacity>
          </View>
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
    borderColor: 'rgba(198,207,217,0.2)',
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
  },
  buttonSafeArea: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: 'transparent',
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
  skipButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 48,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(198,207,217,0.3)',
    marginTop: 12,
  },
  skipButtonText: {
    color: '#C6CFD9',
    fontSize: 15,
    fontWeight: '500',
  },
});
