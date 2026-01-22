import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useBooking } from '../../contexts/BookingContext';
import { createBooking } from '../../lib/bookings';
import { supabase } from '../../lib/supabase';
import { BookingStackParamList } from '../../navigation/BookingStack';
import CustomerPaymentBreakdown from '../../components/customer/PaymentBreakdown';

type Props = NativeStackScreenProps<BookingStackParamList, 'OrderSummary'>;

export default function OrderSummaryScreen({ navigation, route }: Props) {
  const parentNavigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const {
    selectedService,
    selectedAddons,
    selectedCar,
    selectedDetailer,
    selectedDate,
    selectedTimeSlot,
    selectedLocation,
    priceBreakdown,
    setCar,
  } = useBooking();
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [isLoadingCar, setIsLoadingCar] = useState(false);

  // Phone prompt modal state (Apple guideline 5.1.1 - phone is optional)
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [tempPhone, setTempPhone] = useState('');
  const [pendingBookingData, setPendingBookingData] = useState<{
    carId: string;
    scheduledStart: string;
    locationAddress: string;
    city: string;
    province: string;
    postalCode: string;
    locationLat: number | null;
    locationLng: number | null;
    serviceIds: string[];
    locationNotes?: string;
    detailerId: string | null;
    taxAmount: number;
  } | null>(null);

  // Auto-fetch primary car if no car is selected
  useEffect(() => {
    const fetchPrimaryCar = async () => {
      if (selectedCar || !user) return;

      try {
        setIsLoadingCar(true);
        const { data: primaryCar, error } = await supabase
          .from('cars')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_primary', true)
          .maybeSingle();

        if (error) {
          console.error('Error fetching primary car:', error);
          return;
        }

        if (primaryCar) {
          // Map Supabase car to BookingContext Car type
          setCar({
            id: primaryCar.id,
            user_id: primaryCar.user_id,
            make: primaryCar.make,
            model: primaryCar.model,
            year: primaryCar.year,
            trim: primaryCar.trim || null,
            license_plate: primaryCar.license_plate,
            color: primaryCar.color || null,
            photo_url: primaryCar.photo_url || null,
            is_primary: primaryCar.is_primary,
          });
        }
      } catch (error) {
        console.error('Failed to fetch primary car:', error);
      } finally {
        setIsLoadingCar(false);
      }
    };

    fetchPrimaryCar();
  }, [user, selectedCar, setCar]);

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

  // Function to proceed with creating the booking
  const proceedToPayment = async (bookingData: {
    carId: string;
    scheduledStart: string;
    locationAddress: string;
    city: string;
    province: string;
    postalCode: string;
    locationLat: number | null;
    locationLng: number | null;
    serviceIds: string[];
    locationNotes?: string;
    detailerId: string | null;
    taxAmount: number;
  }) => {
    try {
      setIsCreatingBooking(true);

      console.log('📝 OrderSummary: Creating booking with detailer:', {
        detailerId: bookingData.detailerId,
        detailerName: selectedDetailer?.full_name || 'None selected',
        fromContext: !!selectedDetailer,
        fromParams: !!route.params?.detailerId,
      });

      const result = await createBooking(bookingData);

      // Navigate to payment with booking ID and total price
      navigation.navigate('PaymentMethod', {
        showPrice: true,
        bookingId: result.booking.id,
        totalPriceCents: result.total_price_cents,
        detailerId: selectedDetailer?.id || route.params?.detailerId || null,
      });
    } catch (error) {
      console.error('Failed to create booking:', error);
      Alert.alert(
        'Booking Failed',
        error instanceof Error ? error.message : 'Failed to create booking. Please try again.'
      );
    } finally {
      setIsCreatingBooking(false);
    }
  };

  // Handle skip phone button in modal
  const handleSkipPhone = () => {
    setShowPhoneModal(false);
    if (pendingBookingData) {
      proceedToPayment(pendingBookingData);
      setPendingBookingData(null);
    }
  };

  // Handle save phone button in modal
  const handleSavePhone = async () => {
    if (tempPhone.trim() && user) {
      try {
        await supabase
          .from('profiles')
          .update({ phone: tempPhone.trim() })
          .eq('id', user.id);
      } catch (error) {
        console.warn('Failed to save phone:', error);
      }
    }
    setShowPhoneModal(false);
    setTempPhone('');
    if (pendingBookingData) {
      proceedToPayment(pendingBookingData);
      setPendingBookingData(null);
    }
  };

  const handleContinue = async () => {
    // Validate required data
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a booking');
      return;
    }

    // If still no car after auto-fetch, try one more time or show error
    let finalCar = selectedCar;
    if (!finalCar) {
      // Try fetching primary car one more time
      const { data: primaryCar, error } = await supabase
        .from('cars')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .maybeSingle();

      if (error || !primaryCar) {
        Alert.alert(
          'Vehicle Required',
          'Please add a vehicle to your profile before booking a service.',
          [
            {
              text: 'Add Vehicle',
              onPress: () => {
                const parent = parentNavigation.getParent();
                if (parent) {
                  (parent as any).navigate('Profile', { screen: 'SelectCar' });
                }
              },
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
        return;
      }

      // Set the car in context for next time
      finalCar = {
        id: primaryCar.id,
        user_id: primaryCar.user_id,
        make: primaryCar.make,
        model: primaryCar.model,
        year: primaryCar.year,
        trim: primaryCar.trim || null,
        license_plate: primaryCar.license_plate,
        color: primaryCar.color || null,
        photo_url: primaryCar.photo_url || null,
        is_primary: primaryCar.is_primary,
      };
      setCar(finalCar);
    }

    if (!selectedService) {
      Alert.alert('Error', 'Please select a service');
      return;
    }

    if (!selectedDate || !selectedTimeSlot) {
      Alert.alert('Error', 'Please select a date and time');
      return;
    }

    if (!selectedLocation) {
      Alert.alert('Error', 'Please provide a service location');
      return;
    }

    // Parse time slot (format: "8:00 AM" or "1:00 PM")
    const [timeStr, period] = selectedTimeSlot.split(' ');
    const [hours, minutes] = timeStr.split(':');
    let hour = parseInt(hours, 10);
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;

    // Create scheduled_start timestamp
    const scheduledDate = new Date(selectedDate);
    scheduledDate.setHours(hour, parseInt(minutes, 10), 0, 0);
    const scheduledStart = scheduledDate.toISOString();

    // Build location address string
    const locationAddress = [
      selectedLocation.address_line1,
      selectedLocation.address_line2,
      selectedLocation.city,
      selectedLocation.province,
      selectedLocation.postal_code,
    ]
      .filter(Boolean)
      .join(', ');

    // Prepare booking data
    const detailerId = selectedDetailer?.id || route.params?.detailerId || null;
    const bookingData = {
      carId: finalCar.id,
      scheduledStart,
      locationAddress,
      city: selectedLocation.city,
      province: selectedLocation.province,
      postalCode: selectedLocation.postal_code,
      locationLat: selectedLocation.latitude,
      locationLng: selectedLocation.longitude,
      serviceIds: [selectedService.id],
      locationNotes: selectedLocation.location_notes,
      detailerId,
      taxAmount: priceBreakdown.taxAmount, // Pass tax amount for correct total calculation
    };

    // Check if user has phone number - if not, show optional phone prompt modal
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('phone')
        .eq('id', user.id)
        .single();

      if (!profile?.phone) {
        // Show phone prompt modal - user can skip or add phone
        setPendingBookingData(bookingData);
        setShowPhoneModal(true);
        return;
      }
    } catch (error) {
      console.warn('Failed to check profile phone:', error);
      // Continue with booking even if check fails
    }

    // User has phone, proceed directly
    proceedToPayment(bookingData);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Not selected';
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  };

  const formatTime = (timeSlot: string | null) => {
    if (!timeSlot) return 'Not selected';
    // Parse time and create a 2-hour window
    const [time, period] = timeSlot.split(' ');
    const [hours, minutes] = time.split(':');
    let hour = parseInt(hours);
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    
    const startHour = hour;
    const endHour = (hour + 2) % 24;
    const startPeriod = startHour >= 12 ? 'PM' : 'AM';
    const endPeriod = endHour >= 12 ? 'PM' : 'AM';
    const displayStartHour = startHour > 12 ? startHour - 12 : startHour === 0 ? 12 : startHour;
    const displayEndHour = endHour > 12 ? endHour - 12 : endHour === 0 ? 12 : endHour;
    
    return `${displayStartHour}:00 ${startPeriod} - ${displayEndHour}:00 ${endPeriod} Arrival Window`;
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? All your selections will be lost.',
      [
        {
          text: 'No, Keep Booking',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            navigation.goBack();
          },
        },
      ]
    );
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
          <Text style={styles.headerTitle}>Order Summary</Text>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Service Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderContent}>
                <Text style={styles.cardTitle}>
                  {selectedService?.name || 'No service selected'}
                </Text>
                <Text style={styles.cardSubtitle}>
                  {selectedService?.description || ''}
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate('ServiceSelection')}
              >
                <Text style={styles.changeLink}>Change</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.servicePrice}>
              {formatCurrency(selectedService?.price || 0)}
            </Text>
          </View>

          {/* Car Card */}
          {isLoadingCar ? (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardRow}>
                  <Ionicons name="car-sport" size={40} color="#6FF0C4" />
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>Loading vehicle...</Text>
                  </View>
                </View>
                <ActivityIndicator size="small" color="#6FF0C4" />
              </View>
            </View>
          ) : selectedCar ? (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardRow}>
                  <Ionicons name="car-sport" size={40} color="#6FF0C4" />
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>
                      {selectedCar.year} {selectedCar.make} {selectedCar.model}
                    </Text>
                    <Text style={styles.cardSubtitle}>
                      License: {selectedCar.license_plate}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    const parent = parentNavigation.getParent();
                    if (parent) {
                      (parent as any).navigate('Profile', { screen: 'SelectCar' });
                    }
                  }}
                >
                  <Text style={styles.changeLink}>Change</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardRow}>
                  <Ionicons name="car-sport" size={40} color="#C6CFD9" />
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>No vehicle selected</Text>
                    <Text style={styles.cardSubtitle}>
                      Please add a vehicle to continue
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    const parent = parentNavigation.getParent();
                    if (parent) {
                      (parent as any).navigate('Profile', { screen: 'SelectCar' });
                    }
                  }}
                >
                  <Text style={styles.changeLink}>Add Vehicle</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Detailer Card */}
          {selectedDetailer ? (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardRow}>
                  <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                      {selectedDetailer.full_name.split(' ').map(n => n[0]).join('')}
                    </Text>
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{selectedDetailer.full_name}</Text>
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={16} color="#6FF0C4" />
                      <Text style={styles.ratingText}>{selectedDetailer.rating}</Text>
                      <Text style={styles.reviewsText}>
                        ({selectedDetailer.review_count} reviews)
                      </Text>
                    </View>
                    <Text style={styles.cardSubtitle}>2.1 km away</Text>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardRow}>
                  <Ionicons name="person-circle" size={40} color="#C6CFD9" />
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>Detailer Assignment</Text>
                    <Text style={styles.cardSubtitle}>
                      A detailer will be assigned after payment
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Date & Time Card */}
          {(selectedDate || selectedTimeSlot) && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardRow}>
                  <Ionicons name="calendar" size={40} color="#1DA4F3" />
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{formatDate(selectedDate)}</Text>
                    <Text style={styles.cardSubtitle}>{formatTime(selectedTimeSlot)}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('CombinedSelection', {
                    selectedService: route.params.selectedService,
                    selectedAddons: route.params.selectedAddons,
                  })}
                >
                  <Text style={styles.changeLink}>Change</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Location Card */}
          {selectedLocation && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardRow}>
                  <Ionicons name="location" size={40} color="#6FF0C4" />
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{selectedLocation.address_line1}</Text>
                    <Text style={styles.cardSubtitle}>
                      {selectedLocation.city}, {selectedLocation.province} {selectedLocation.postal_code}
                    </Text>
                    {selectedLocation.location_notes && (
                      <Text style={styles.cardSubtitle}>Notes: {selectedLocation.location_notes}</Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('CombinedSelection', {
                    selectedService: route.params.selectedService,
                    selectedAddons: route.params.selectedAddons,
                  })}
                >
                  <Text style={styles.changeLink}>Change</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Price Breakdown */}
          <View style={styles.card}>
            <CustomerPaymentBreakdown
              servicePrice={priceBreakdown.servicePrice}
              addons={selectedAddons}
              addonsTotal={priceBreakdown.addonsTotal}
              taxAmount={priceBreakdown.taxAmount}
              stripeProcessingFee={priceBreakdown.stripeProcessingFee}
              stripeConnectFee={priceBreakdown.stripeConnectFee}
              totalAmount={priceBreakdown.totalAmount}
              showTitle={true}
              title="Price Breakdown"
            />
          </View>
        </ScrollView>

        {/* Bottom CTA */}
        <View style={[styles.bottomCTA, { bottom: 68 + Math.max(insets.bottom, 0) }]}>
          <View style={styles.buttonSafeArea}>
            <TouchableOpacity
              onPress={handleCancel}
              disabled={isCreatingBooking}
              activeOpacity={0.8}
              style={[styles.cancelButton, isCreatingBooking && styles.cancelButtonDisabled]}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleContinue}
              disabled={isCreatingBooking}
              activeOpacity={0.8}
              style={[styles.continueButton, isCreatingBooking && styles.continueButtonDisabled]}
            >
              {isCreatingBooking ? (
                <View style={styles.buttonLoadingContainer}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.continueButtonText}>Creating Booking...</Text>
                </View>
              ) : (
                <Text style={styles.continueButtonText}>Continue to Payment</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Phone Prompt Modal - Optional phone collection (Apple guideline 5.1.1) */}
        <Modal
          visible={showPhoneModal}
          transparent
          animationType="fade"
          onRequestClose={handleSkipPhone}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Ionicons name="call-outline" size={32} color="#1DA4F3" />
                <Text style={styles.modalTitle}>Add Your Phone Number</Text>
              </View>
              <Text style={styles.modalDescription}>
                Adding your phone helps your detailer contact you about your booking
              </Text>

              <TextInput
                value={tempPhone}
                onChangeText={setTempPhone}
                keyboardType="phone-pad"
                placeholder="Enter your phone number"
                placeholderTextColor="rgba(198,207,217,0.5)"
                style={styles.phoneInput}
                autoFocus
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  onPress={handleSkipPhone}
                  activeOpacity={0.8}
                  style={styles.skipButton}
                >
                  <Text style={styles.skipButtonText}>Skip</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSavePhone}
                  activeOpacity={0.8}
                  style={[styles.savePhoneButton, !tempPhone.trim() && styles.savePhoneButtonDisabled]}
                  disabled={!tempPhone.trim()}
                >
                  <Text style={styles.savePhoneButtonText}>Save & Continue</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  card: {
    backgroundColor: '#0A1A2F',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardHeaderContent: {
    flex: 1,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  cardContent: {
    flex: 1,
    marginLeft: 16,
  },
  cardTitle: {
    color: '#F5F7FA',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSubtitle: {
    color: '#C6CFD9',
    fontSize: 14,
  },
  servicePrice: {
    color: '#1DA4F3',
    fontSize: 18,
    fontWeight: '600',
  },
  changeLink: {
    color: '#6FF0C4',
    fontSize: 14,
    fontWeight: '500',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(29,164,243,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(111,240,196,0.3)',
  },
  avatarText: {
    color: '#F5F7FA',
    fontSize: 18,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    color: '#F5F7FA',
    fontSize: 14,
    marginLeft: 4,
  },
  reviewsText: {
    color: '#C6CFD9',
    fontSize: 12,
    marginLeft: 4,
  },
  sectionTitle: {
    color: '#F5F7FA',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  priceRows: {
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceLabel: {
    color: '#C6CFD9',
    fontSize: 15,
  },
  priceValue: {
    color: '#F5F7FA',
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(198,207,217,0.2)',
    marginVertical: 16,
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
    gap: 12,
  },
  cancelButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 56,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(198,207,217,0.3)',
  },
  cancelButtonText: {
    color: '#C6CFD9',
    fontSize: 17,
    fontWeight: '600',
  },
  cancelButtonDisabled: {
    opacity: 0.5,
  },
  continueButton: {
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
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  continueButtonDisabled: {
    opacity: 0.7,
  },
  buttonLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  // Phone prompt modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#0A1A2F',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#F5F7FA',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  modalDescription: {
    color: '#C6CFD9',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  phoneInput: {
    backgroundColor: '#050B12',
    borderWidth: 1,
    borderColor: 'rgba(198,207,217,0.2)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    color: '#F5F7FA',
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(198,207,217,0.3)',
  },
  skipButtonText: {
    color: '#C6CFD9',
    fontSize: 16,
    fontWeight: '600',
  },
  savePhoneButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1DA4F3',
  },
  savePhoneButtonDisabled: {
    backgroundColor: 'rgba(29,164,243,0.3)',
  },
  savePhoneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
