import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { isPlatformPaySupported, useStripe } from '@stripe/stripe-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useBooking } from '../../contexts/BookingContext';
import { supabase } from '../../lib/supabase';
import { BookingStackParamList } from '../../navigation/BookingStack';
import { createTipPaymentIntent } from '../../services/paymentService';

type Props = NativeStackScreenProps<BookingStackParamList, 'ReceiptRating'> & {
  bookingId?: string;
  onClose?: () => void;
  isModal?: boolean;
};

const tipAmounts = ['$5', '$10', '$20', 'Custom'];

interface BookingData {
  bookingId: string;
  detailerId: string | null;
  serviceName: string;
  completedAt: string;
  price: string;
  carModel: string;
  licensePlate: string;
  detailerName: string;
  detailerRating: number;
  servicePrice: number;
  addons: Array<{ name: string; price: number }>;
  taxAmount: number;
  totalAmount: number;
}

export default function ReceiptRatingScreen({ navigation, bookingId, onClose, isModal = false }: Props) {
  const { clearBooking } = useBooking();
  const { user } = useAuth();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const insets = useSafeAreaInsets();
  const [rating, setRating] = useState(0);
  const [selectedTip, setSelectedTip] = useState('');
  const [customTipAmount, setCustomTipAmount] = useState('');
  const [review, setReview] = useState('');
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(!!bookingId);
  const [submitting, setSubmitting] = useState(false);
  const [isProcessingTip, setIsProcessingTip] = useState(false);
  const [isApplePayAvailable, setIsApplePayAvailable] = useState(false);
  const [showTipPayment, setShowTipPayment] = useState(false);

  // Check if Apple Pay is available
  useEffect(() => {
    const checkApplePayAvailability = async () => {
      if (Platform.OS === 'ios') {
        try {
          const supported = await isPlatformPaySupported();
          setIsApplePayAvailable(supported);
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

  // Show tip payment UI when tip is selected or custom amount is entered
  useEffect(() => {
    if (selectedTip === 'Custom') {
      // Show payment buttons if custom amount is valid (greater than 0)
      const customAmount = parseFloat(customTipAmount.replace('$', '').replace(',', '')) || 0;
      setShowTipPayment(customAmount > 0);
    } else {
      // Show payment buttons for preset tip amounts
      setShowTipPayment(selectedTip !== '');
    }
  }, [selectedTip, customTipAmount]);

  // Log when component receives bookingId
  React.useEffect(() => {
    if (bookingId) {
      console.log('ReceiptRatingScreen: Received bookingId:', bookingId, 'isModal:', isModal);
    }
  }, [bookingId, isModal]);

  // Fetch booking data when bookingId is provided
  useEffect(() => {
    if (!bookingId) {
      // Use demo data if no bookingId (for navigation-based flow)
      setBookingData({
        bookingId: 'demo',
        detailerId: 'demo-detailer',
        serviceName: 'Full Exterior Detail',
        completedAt: '2:42 PM',
        price: '$213.57',
        carModel: '2022 BMW M4',
        licensePlate: 'ABC-123',
        detailerName: 'Marcus Thompson',
        detailerRating: 4.9,
        servicePrice: 149.00,
        addons: [
          { name: 'Wax Finish', price: 25.00 },
          { name: 'Interior Refresh', price: 15.00 },
        ],
        taxAmount: 24.57,
        totalAmount: 213.57,
      });
      setLoading(false);
      return;
    }

    const fetchBookingData = async () => {
      try {
        setLoading(true);
        
        // Fetch booking with related data
        const { data: booking, error: bookingError } = await supabase
          .from('bookings')
          .select(`
            id,
            receipt_id,
            detailer_id,
            completed_at,
            service_price,
            addons_total,
            tax_amount,
            total_amount,
            service:service_id (
              id,
              name,
              price
            ),
            detailer:detailer_id (
              id,
              full_name,
              rating
            ),
            car:car_id (
              id,
              make,
              model,
              year,
              license_plate
            )
          `)
          .eq('id', bookingId)
          .single();

        if (bookingError || !booking) {
          console.error('Error fetching booking:', bookingError);
          Alert.alert(
            'Error',
            'Failed to load booking details. Please try again.',
            [{ text: 'OK', onPress: () => onClose?.() }]
          );
          setLoading(false);
          return;
        }

        // Fetch booking addons
        const { data: addons, error: addonsError } = await supabase
          .from('booking_addons')
          .select(`
            id,
            price,
            addon:service_addons (
              id,
              name
            )
          `)
          .eq('booking_id', bookingId);

        if (addonsError) {
          console.error('Error fetching addons:', addonsError);
        }

        // Format completed_at time
        let completedAt = 'N/A';
        if (booking.completed_at) {
          const date = new Date(booking.completed_at);
          const hours = date.getHours();
          const minutes = date.getMinutes();
          const ampm = hours >= 12 ? 'PM' : 'AM';
          const displayHours = hours % 12 || 12;
          completedAt = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
        }

        // Format car model
        const car = booking.car as any;
        const carModel = car
          ? `${car.year || ''} ${car.make || ''} ${car.model || ''}`.trim()
          : 'Unknown Vehicle';

        // Format detailer info
        const detailer = booking.detailer as any;
        const detailerName = detailer?.full_name || 'Unknown Detailer';
        const detailerRating = detailer?.rating || 0;

        // Format addons
        const formattedAddons = (addons || []).map((addon: any) => ({
          name: addon.addon?.name || 'Add-on',
          price: Number(addon.price) || 0,
        }));

        setBookingData({
          bookingId: booking.id,
          detailerId: booking.detailer_id,
          serviceName: (booking.service as any)?.name || 'Service',
          completedAt,
          price: `$${Number(booking.total_amount).toFixed(2)}`,
          carModel,
          licensePlate: car?.license_plate || 'N/A',
          detailerName,
          detailerRating: Number(detailerRating),
          servicePrice: Number(booking.service_price) || 0,
          addons: formattedAddons,
          taxAmount: Number(booking.tax_amount) || 0,
          totalAmount: Number(booking.total_amount) || 0,
        });
      } catch (error) {
        console.error('Error in fetchBookingData:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, [bookingId]);

  // Process tip payment
  const handleTipPayment = async (paymentMethod: 'apple-pay' | 'stripe') => {
    if (!bookingData || !user || !bookingData.detailerId || isProcessingTip) {
      return;
    }

    // Parse tip amount
    let tipAmount: number = 0;
    if (selectedTip === 'Custom') {
      tipAmount = parseFloat(customTipAmount.replace('$', '').replace(',', '')) || 0;
      if (tipAmount <= 0) {
        Alert.alert('Invalid Amount', 'Please enter a valid tip amount.');
        return;
      }
    } else if (selectedTip) {
      tipAmount = parseFloat(selectedTip.replace('$', ''));
    }

    if (tipAmount <= 0) {
      Alert.alert('Error', 'Please select a tip amount.');
      return;
    }

    try {
      setIsProcessingTip(true);

      // Create tip payment intent
      const paymentIntentResponse = await createTipPaymentIntent(
        bookingData.bookingId,
        tipAmount,
        bookingData.detailerId
      );

      // Initialize PaymentSheet
      const paymentSheetConfig: any = {
        merchantDisplayName: 'CleanSwift',
        paymentIntentClientSecret: paymentIntentResponse.paymentIntentClientSecret,
        returnURL: 'cleanswift://tip-payment-complete',
      };

      if (Platform.OS === 'ios' && isApplePayAvailable && paymentMethod === 'apple-pay') {
        paymentSheetConfig.applePay = {
          merchantCountryCode: 'CA',
        };
      }

      const { error: initError } = await initPaymentSheet(paymentSheetConfig);

      if (initError) {
        console.error('PaymentSheet init error:', initError);
        Alert.alert('Error', 'Failed to initialize payment. Please try again.');
        setIsProcessingTip(false);
        return;
      }

      // Present PaymentSheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code === 'Canceled') {
          console.log('Tip payment cancelled by user');
        } else {
          console.error('Tip payment error:', presentError);
          Alert.alert('Payment Failed', presentError.message || 'Tip payment could not be processed.');
        }
        setIsProcessingTip(false);
        return;
      }

      // Payment successful - tip will be saved when review is submitted
      Alert.alert('Success', `Tip of $${tipAmount.toFixed(2)} processed successfully!`);
      setShowTipPayment(false);
    } catch (error) {
      console.error('Tip payment error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessingTip(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!bookingData || !user || !bookingData.detailerId || rating === 0) {
      Alert.alert('Error', 'Please provide a rating before submitting.');
      return;
    }

    // Don't submit demo data
    if (bookingData.bookingId === 'demo') {
      if (isModal && onClose) {
        onClose();
      } else {
        clearBooking();
        navigation.reset({
          index: 0,
          routes: [{ name: 'ServiceSelection' }],
        });
        const parent = navigation.getParent();
        if (parent) {
          parent.navigate('Home');
        }
      }
      return;
    }

    try {
      setSubmitting(true);

      // Parse tip amount
      let tipAmount: number | null = null;
      if (selectedTip === 'Custom') {
        tipAmount = parseFloat(customTipAmount.replace('$', '').replace(',', '')) || null;
      } else if (selectedTip && selectedTip !== 'Custom') {
        tipAmount = parseFloat(selectedTip.replace('$', ''));
      }

      // Submit review to database
      const { error: reviewError } = await supabase
        .from('reviews')
        .insert({
          booking_id: bookingData.bookingId,
          user_id: user.id,
          detailer_id: bookingData.detailerId,
          rating: rating,
          review_text: review.trim() || null,
          tip_amount: tipAmount,
        });

      if (reviewError) {
        console.error('Error submitting review:', reviewError);
        Alert.alert('Error', 'Failed to submit review. Please try again.');
        setSubmitting(false);
        return;
      }

      // Success - close modal or navigate
      if (isModal && onClose) {
        onClose();
      } else {
        clearBooking();
        navigation.reset({
          index: 0,
          routes: [{ name: 'ServiceSelection' }],
        });
        const parent = navigation.getParent();
        if (parent) {
          parent.navigate('Home');
        }
      }
    } catch (error) {
      console.error('Error in handleSubmitRating:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', minHeight: 400 }]}>
        <ActivityIndicator size="large" color="#6FF0C4" />
        <Text style={{ color: '#C6CFD9', marginTop: 16 }}>Loading booking details...</Text>
      </View>
    );
  }

  if (!bookingData) {
    console.warn('ReceiptRatingScreen: No bookingData available');
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', minHeight: 400 }]}>
        <Text style={{ color: '#C6CFD9' }}>Unable to load booking details</Text>
        {onClose && (
          <TouchableOpacity
            onPress={onClose}
            style={{ marginTop: 16, padding: 12, backgroundColor: '#1DA4F3', borderRadius: 8 }}
          >
            <Text style={{ color: '#FFFFFF' }}>Close</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={40} color="#6FF0C4" />
            </View>
            <Text style={styles.headerTitle}>
              Your Detail Is Complete
            </Text>
            <Text style={styles.headerSubtitle}>
              We hope you love the results.
            </Text>
          </View>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Receipt Card */}
          <View style={styles.receiptCard}>
            {/* Service Info */}
            <View style={styles.serviceRow}>
              <View>
                <Text style={styles.serviceTitle}>{bookingData.serviceName}</Text>
                <Text style={styles.serviceTime}>Completed at {bookingData.completedAt}</Text>
              </View>
              <Text style={styles.servicePrice}>{bookingData.price}</Text>
            </View>

            {/* Car Info */}
            <View style={styles.infoRow}>
              <Ionicons name="car-sport" size={20} color="#C6CFD9" />
              <View>
                <Text style={styles.infoTitle}>{bookingData.carModel}</Text>
                <Text style={styles.infoSubtitle}>License: {bookingData.licensePlate}</Text>
              </View>
            </View>

            {/* Detailer Info */}
            <View style={styles.infoRow}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {bookingData.detailerName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </Text>
              </View>
              <View style={styles.detailerInfo}>
                <Text style={styles.detailerName}>{bookingData.detailerName}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={12} color="#6FF0C4" />
                  <Text style={styles.ratingText}>{bookingData.detailerRating.toFixed(1)}</Text>
                </View>
              </View>
            </View>

            {/* Price Breakdown */}
            <View style={styles.breakdownSection}>
              <View style={styles.breakdownRows}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Service</Text>
                  <Text style={styles.priceValue}>${bookingData.servicePrice.toFixed(2)}</Text>
                </View>
                {bookingData.addons.map((addon, index) => (
                  <View key={index} style={styles.priceRow}>
                    <Text style={styles.priceLabel}>{addon.name}</Text>
                    <Text style={styles.priceValue}>${addon.price.toFixed(2)}</Text>
                  </View>
                ))}
                {bookingData.taxAmount > 0 && (
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>HST</Text>
                    <Text style={styles.priceValue}>${bookingData.taxAmount.toFixed(2)}</Text>
                  </View>
                )}
              </View>
              <View style={styles.divider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>${bookingData.totalAmount.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {/* Rating Section */}
          <View style={styles.ratingSection}>
            <Text style={styles.sectionTitle}>Rate Your Detailer</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={40}
                    color={star <= rating ? '#6FF0C4' : 'rgba(255,255,255,0.15)'}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tip Section */}
          <View style={styles.tipSection}>
            <Text style={styles.sectionTitleLeft}>Add a Tip?</Text>
            <View style={styles.tipGrid}>
              {tipAmounts.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  onPress={() => {
                    setSelectedTip(amount);
                    if (amount === 'Custom') {
                      setCustomTipAmount('');
                    }
                  }}
                  activeOpacity={0.8}
                  style={[
                    styles.tipButton,
                    selectedTip === amount && styles.tipButtonSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.tipButtonText,
                      selectedTip === amount && styles.tipButtonTextSelected,
                    ]}
                  >
                    {amount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Custom Tip Input */}
            {selectedTip === 'Custom' && (
              <View style={styles.customTipContainer}>
                <View style={styles.customTipInputWrapper}>
                  <Text style={styles.customTipDollarSign}>$</Text>
                  <TextInput
                    value={customTipAmount}
                    onChangeText={(text) => {
                      // Allow only numbers and decimal point
                      const cleaned = text.replace(/[^0-9.]/g, '');
                      setCustomTipAmount(cleaned);
                    }}
                    placeholder="0.00"
                    placeholderTextColor="#666666"
                    keyboardType="decimal-pad"
                    style={styles.customTipInput}
                  />
                </View>
              </View>
            )}

            {/* Payment Buttons - Show when tip is selected */}
            {showTipPayment && (
              <View style={styles.paymentButtonsContainer}>
                {Platform.OS === 'ios' && isApplePayAvailable && (
                  <TouchableOpacity
                    onPress={() => handleTipPayment('apple-pay')}
                    disabled={isProcessingTip}
                    activeOpacity={0.8}
                    style={[
                      styles.applePayButton,
                      isProcessingTip && styles.paymentButtonDisabled,
                    ]}
                  >
                    <Ionicons name="logo-apple" size={20} color="#000" />
                    <Text style={styles.applePayButtonText}>
                      {isProcessingTip ? 'Processing...' : 'Pay Tip with Apple Pay'}
                    </Text>
                  </TouchableOpacity>
                )}
                
                {(Platform.OS === 'android' || !isApplePayAvailable) && (
                  <TouchableOpacity
                    onPress={() => handleTipPayment('stripe')}
                    disabled={isProcessingTip}
                    activeOpacity={0.8}
                    style={[
                      styles.stripeButton,
                      isProcessingTip && styles.paymentButtonDisabled,
                    ]}
                  >
                    <Ionicons name="card" size={20} color="#FFFFFF" />
                    <Text style={styles.stripeButtonText}>
                      {isProcessingTip ? 'Processing...' : 'Pay Tip with Card'}
                    </Text>
                  </TouchableOpacity>
                )}

                {Platform.OS === 'ios' && isApplePayAvailable && (
                  <>
                    <View style={styles.dividerContainer}>
                      <View style={styles.dividerLine} />
                      <Text style={styles.dividerText}>OR</Text>
                      <View style={styles.dividerLine} />
                    </View>
                    <TouchableOpacity
                      onPress={() => handleTipPayment('stripe')}
                      disabled={isProcessingTip}
                      activeOpacity={0.8}
                      style={[
                        styles.stripeButton,
                        isProcessingTip && styles.paymentButtonDisabled,
                      ]}
                    >
                      <Ionicons name="card" size={20} color="#FFFFFF" />
                      <Text style={styles.stripeButtonText}>
                        {isProcessingTip ? 'Processing...' : 'Pay Tip with Card'}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
          </View>

          {/* Review Text Field */}
          <View style={styles.reviewSection}>
            <Text style={styles.sectionTitleLeft}>Share Your Experience</Text>
            <TextInput
              value={review}
              onChangeText={setReview}
              placeholder={`Tell us how ${bookingData.detailerName.split(' ')[0]} did...`}
              placeholderTextColor="#666666"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={styles.reviewInput}
            />
          </View>

          {/* Spacer for bottom button */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Bottom CTA */}
        <View style={[styles.bottomCTA, { bottom: 68 + Math.max(insets.bottom, 0) }]}>
          <TouchableOpacity
            onPress={handleSubmitRating}
            disabled={rating === 0 || submitting}
            activeOpacity={rating > 0 && !submitting ? 0.8 : 1}
            style={[
              styles.submitButton,
              (rating === 0 || submitting) && styles.submitButtonDisabled,
            ]}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text
                style={[
                  styles.submitButtonText,
                  (rating === 0 || submitting) && styles.submitButtonTextDisabled,
                ]}
              >
                Submit Rating
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030B18',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(111, 240, 196, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    color: '#F5F7FA',
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: '#C6CFD9',
    fontSize: 15,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  receiptCard: {
    backgroundColor: '#0A1A2F',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 24,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  serviceTitle: {
    color: '#F5F7FA',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  serviceTime: {
    color: '#C6CFD9',
    fontSize: 14,
  },
  servicePrice: {
    color: '#1DA4F3',
    fontSize: 18,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    gap: 12,
  },
  infoTitle: {
    color: '#F5F7FA',
    fontSize: 15,
    fontWeight: '500',
  },
  infoSubtitle: {
    color: '#C6CFD9',
    fontSize: 13,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(29, 164, 243, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#F5F7FA',
    fontSize: 15,
    fontWeight: '600',
  },
  detailerInfo: {
    flex: 1,
  },
  detailerName: {
    color: '#F5F7FA',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: '#C6CFD9',
    fontSize: 12,
  },
  breakdownSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  breakdownRows: {
    gap: 8,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceLabel: {
    color: '#C6CFD9',
    fontSize: 14,
  },
  priceValue: {
    color: '#F5F7FA',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginBottom: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: '#F5F7FA',
    fontSize: 17,
    fontWeight: '600',
  },
  totalValue: {
    color: '#6FF0C4',
    fontSize: 24,
    fontWeight: '700',
  },
  ratingSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#F5F7FA',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  sectionTitleLeft: {
    color: '#F5F7FA',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  tipSection: {
    marginBottom: 24,
  },
  tipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tipButton: {
    width: '23%',
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: '#0A1A2F',
    marginBottom: 12,
  },
  tipButtonSelected: {
    borderWidth: 2,
    borderColor: '#6FF0C4',
  },
  tipButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#F5F7FA',
  },
  tipButtonTextSelected: {
    color: '#6FF0C4',
  },
  reviewSection: {
    marginBottom: 24,
  },
  reviewInput: {
    width: '100%',
    backgroundColor: '#0A1A2F',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    color: '#F5F7FA',
    fontSize: 16,
    minHeight: 100,
  },
  customTipContainer: {
    marginTop: 12,
    marginBottom: 16,
  },
  customTipInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A1A2F',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  customTipDollarSign: {
    color: '#F5F7FA',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  customTipInput: {
    flex: 1,
    color: '#F5F7FA',
    fontSize: 18,
    fontWeight: '600',
    padding: 0,
  },
  paymentButtonsContainer: {
    marginTop: 16,
    gap: 12,
  },
  applePayButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 24,
    backgroundColor: '#000000',
    gap: 8,
    minHeight: 56,
  },
  stripeButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 24,
    backgroundColor: '#1DA4F3',
    gap: 8,
    minHeight: 56,
  },
  paymentButtonDisabled: {
    opacity: 0.6,
  },
  applePayButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  stripeButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  dividerText: {
    color: '#C6CFD9',
    fontSize: 14,
    marginHorizontal: 12,
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
  },
  submitButton: {
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
  submitButtonDisabled: {
    backgroundColor: '#0A1A2F',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  submitButtonTextDisabled: {
    color: '#666666',
  },
});
