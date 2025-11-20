import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BookingStackParamList } from '../../navigation/BookingStack';
import { useBooking } from '../../contexts/BookingContext';

type Props = NativeStackScreenProps<BookingStackParamList, 'OrderSummary'>;

export default function OrderSummaryScreen({ navigation, route }: Props) {
  const {
    selectedService,
    selectedAddons,
    selectedCar,
    selectedDetailer,
    selectedDate,
    selectedTimeSlot,
    priceBreakdown,
  } = useBooking();

  const handleContinue = () => {
    navigation.navigate('PaymentMethod', { showPrice: true });
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
          {selectedCar && (
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
                  onPress={() => navigation.navigate('Profile', { screen: 'SelectCar' })}
                >
                  <Text style={styles.changeLink}>Change</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Detailer Card */}
          {selectedDetailer && (
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
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('ChooseDetailer', {
                    selectedService: route.params.selectedService,
                    selectedAddons: route.params.selectedAddons,
                    date: route.params.date,
                    time: route.params.time,
                  })}
                >
                  <Text style={styles.changeLink}>Change</Text>
                </TouchableOpacity>
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
                  onPress={() => navigation.navigate('BookingDateTime', {
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
            <Text style={styles.sectionTitle}>Price Breakdown</Text>

            <View style={styles.priceRows}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Service</Text>
                <Text style={styles.priceValue}>
                  {formatCurrency(priceBreakdown.servicePrice)}
                </Text>
              </View>

              {selectedAddons.map((addon) => (
                <View key={addon.id} style={styles.priceRow}>
                  <Text style={styles.priceLabel}>{addon.name}</Text>
                  <Text style={styles.priceValue}>
                    {formatCurrency(addon.price)}
                  </Text>
                </View>
              ))}

              {priceBreakdown.taxAmount > 0 && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>HST</Text>
                  <Text style={styles.priceValue}>
                    {formatCurrency(priceBreakdown.taxAmount)}
                  </Text>
                </View>
              )}

              <View style={styles.divider} />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(priceBreakdown.totalAmount)}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom CTA */}
        <View style={styles.bottomCTA}>
          <TouchableOpacity
            onPress={handleContinue}
            activeOpacity={0.8}
            style={styles.continueButton}
          >
            <Text style={styles.continueButtonText}>Continue to Payment</Text>
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
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    backgroundColor: '#050B12',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
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
});
