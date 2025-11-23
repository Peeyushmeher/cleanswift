import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useMemo } from 'react';
import type { OrdersStackParamList } from '../../navigation/OrdersStack';
import type { MainTabsParamList } from '../../navigation/MainTabs';
import { useBookings, type BookingHistoryItem } from '../../hooks/useBookings';
import { useBooking } from '../../contexts/BookingContext';

type Props = NativeStackScreenProps<OrdersStackParamList, 'OrdersHistory'>;
type TabsNav = BottomTabNavigationProp<MainTabsParamList>;

const STATUS_COLORS: Record<string, string> = {
  pending: '#FFA500',
  requires_payment: '#FFA500',
  paid: '#1DA4F3',
  offered: '#1DA4F3',
  accepted: '#1DA4F3',
  in_progress: '#1DA4F3',
  completed: '#6FF0C4',
  cancelled: '#C6CFD9',
  canceled: '#C6CFD9', // Legacy support
  no_show: '#C6CFD9',
};

const formatDateLabel = (date: string, time?: string | null) => {
  if (!date) return 'Date TBD';
  const dateObj = new Date(`${date}T${time || '00:00:00'}`);
  if (Number.isNaN(dateObj.getTime())) return date;
  return dateObj.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const formatCarLabel = (booking: BookingHistoryItem) => {
  if (!booking.car) return 'Vehicle TBD';
  const { year, make, model, license_plate } = booking.car;
  return `${year} ${make} ${model} • ${license_plate}`;
};

export default function OrdersHistoryScreen({ navigation }: Props) {
  const { data: bookings, loading, error, refetch } = useBookings();
  const tabsNavigation = useNavigation<TabsNav>();
  const { clearBooking, setService, setDetailer, setCar, setLocation } = useBooking();

  const sortedBookings = useMemo(
    () => bookings.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [bookings],
  );

  const handleRebook = (booking: BookingHistoryItem) => {
    if (!booking.detailer) return;

    clearBooking();
    if (booking.service) {
      setService(booking.service);
    }
    if (booking.car) {
      setCar(booking.car);
    }
    setDetailer(booking.detailer);
    setLocation({
      address_line1: booking.address_line1,
      address_line2: booking.address_line2,
      city: booking.city,
      province: booking.province,
      postal_code: booking.postal_code,
      latitude: null,
      longitude: null,
      location_notes: booking.location_notes,
    });

    tabsNavigation.navigate('Book', {
      screen: 'ServiceSelection',
      params: {
        rebookFromBookingId: booking.id,
      },
    });
  };

  const renderStatusDot = (status: string) => {
    const color = STATUS_COLORS[status] || '#C6CFD9';
    return (
      <View style={styles.statusContainer}>
        <View style={[styles.statusDot, { backgroundColor: color }]} />
        <Text style={[styles.statusText, { color }]}>{status.replace('_', ' ')}</Text>
      </View>
    );
  };

  const handleOpenDetails = (booking: BookingHistoryItem) => {
    navigation.navigate('OrderDetails', { orderId: booking.id, booking });
  };

  const renderRebookButton = (booking: BookingHistoryItem) => {
    if (booking.status !== 'completed' || !booking.detailer) {
      return null;
    }

    return (
      <TouchableOpacity
        onPress={() => handleRebook(booking)}
        activeOpacity={0.85}
        style={styles.rebookButton}
      >
        <Ionicons name='refresh' size={16} color='#6FF0C4' />
        <Text style={styles.rebookButtonText}>Book again with this detailer</Text>
      </TouchableOpacity>
    );
  };

  const renderDetailerMeta = (booking: BookingHistoryItem) => {
    if (!booking.detailer) return null;
    return (
      <View style={styles.detailerRow}>
        <View style={styles.detailerAvatar}>
          <Text style={styles.detailerInitials}>{getInitials(booking.detailer.full_name)}</Text>
        </View>
        <View>
          <Text style={styles.detailerName}>{booking.detailer.full_name}</Text>
          <Text style={styles.detailerMeta}>
            {booking.detailer.rating.toFixed(1)} • {booking.detailer.review_count} reviews
          </Text>
        </View>
      </View>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerState}>
          <ActivityIndicator size='large' color='#6FF0C4' />
          <Text style={styles.loadingText}>Loading your bookings...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={[styles.centerState, styles.errorState]}>
          <Ionicons name='alert-circle' size={48} color='#FF6B6B' />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{error.message}</Text>
          <TouchableOpacity onPress={refetch} activeOpacity={0.85} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (sortedBookings.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name='car-sport' size={64} color='#C6CFD9' style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>No Bookings Yet</Text>
          <Text style={styles.emptySubtitle}>Your past detailing sessions will appear here.</Text>
        </View>
      );
    }

    return (
      <View style={styles.ordersContainer}>
        {sortedBookings.map((booking) => (
          <TouchableOpacity
            key={booking.id}
            onPress={() => handleOpenDetails(booking)}
            activeOpacity={0.85}
            style={styles.orderCard}
          >
            <View style={styles.orderContent}>
              <View style={styles.carIconContainer}>
                <Ionicons name='car-sport' size={24} color='#1DA4F3' />
              </View>

              <View style={styles.orderInfo}>
                <View style={styles.orderHeader}>
                  <Text style={styles.serviceName}>{booking.service?.name || 'Detailing Service'}</Text>
                  <Text style={styles.price}>${booking.total_amount.toFixed(2)}</Text>
                </View>

                <Text style={styles.carDetails}>{formatCarLabel(booking)}</Text>
                <Text style={styles.date}>{formatDateLabel(booking.scheduled_date, booking.scheduled_time_start)}</Text>

                {renderDetailerMeta(booking)}
                {renderRebookButton(booking)}
              </View>

              <View style={styles.cardMeta}>
                {renderStatusDot(booking.status)}
                <Ionicons name='chevron-forward' size={20} color='#C6CFD9' style={styles.chevron} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={styles.backButton}>
            <Ionicons name='chevron-back' size={24} color='#C6CFD9' />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Bookings</Text>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {renderContent()}
        </ScrollView>
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
    gap: 16,
  },
  backButton: {
    padding: 4,
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
    paddingBottom: 32,
  },
  ordersContainer: {
    gap: 16,
  },
  orderCard: {
    backgroundColor: '#0A1A2F',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  orderContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  carIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(29,164,243,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderInfo: {
    flex: 1,
    gap: 8,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  serviceName: {
    color: '#F5F7FA',
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
  },
  price: {
    color: '#F5F7FA',
    fontSize: 16,
    fontWeight: '600',
  },
  carDetails: {
    color: '#C6CFD9',
    fontSize: 14,
  },
  date: {
    color: '#C6CFD9',
    fontSize: 13,
  },
  cardMeta: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  chevron: {
    marginTop: 4,
  },
  detailerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  detailerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(111,240,196,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(111,240,196,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailerInitials: {
    color: '#6FF0C4',
    fontSize: 14,
    fontWeight: '600',
  },
  detailerName: {
    color: '#F5F7FA',
    fontSize: 15,
    fontWeight: '600',
  },
  detailerMeta: {
    color: '#C6CFD9',
    fontSize: 12,
  },
  rebookButton: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(111,240,196,0.4)',
    backgroundColor: 'rgba(111,240,196,0.08)',
  },
  rebookButtonText: {
    color: '#6FF0C4',
    fontSize: 14,
    fontWeight: '600',
  },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  loadingText: {
    color: '#C6CFD9',
    fontSize: 15,
  },
  errorState: {
    paddingHorizontal: 16,
  },
  errorTitle: {
    color: '#F5F7FA',
    fontSize: 18,
    fontWeight: '600',
  },
  errorMessage: {
    color: '#C6CFD9',
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1DA4F3',
  },
  retryButtonText: {
    color: '#1DA4F3',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#F5F7FA',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#C6CFD9',
    fontSize: 15,
    textAlign: 'center',
  },
});
