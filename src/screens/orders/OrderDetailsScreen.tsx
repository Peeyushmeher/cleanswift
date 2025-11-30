import { Ionicons } from '@expo/vector-icons';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBooking } from '../../contexts/BookingContext';
import { useBookings, type BookingHistoryItem } from '../../hooks/useBookings';
import { updateBookingStatus } from '../../lib/bookings';
import type { MainTabsParamList } from '../../navigation/MainTabs';
import type { OrdersStackParamList } from '../../navigation/OrdersStack';

type Props = NativeStackScreenProps<OrdersStackParamList, 'OrderDetails'>;
type TabsNav = BottomTabNavigationProp<MainTabsParamList>;

const STATUS_META: Record<string, { label: string; dot: string }> = {
  pending: { label: 'Pending', dot: '#FFA500' },
  requires_payment: { label: 'Payment Required', dot: '#FFA500' },
  paid: { label: 'Paid', dot: '#1DA4F3' },
  offered: { label: 'Offered', dot: '#1DA4F3' },
  accepted: { label: 'Accepted', dot: '#1DA4F3' },
  in_progress: { label: 'In progress', dot: '#1DA4F3' },
  completed: { label: 'Completed', dot: '#6FF0C4' },
  cancelled: { label: 'Cancelled', dot: '#C6CFD9' },
  canceled: { label: 'Cancelled', dot: '#C6CFD9' }, // Legacy support
  no_show: { label: 'No Show', dot: '#C6CFD9' },
};

const formatDate = (booking: BookingHistoryItem | null | undefined) => {
  if (!booking) return 'Date pending';
  const dateObj = new Date(`${booking.scheduled_date}T${booking.scheduled_time_start}`);
  if (Number.isNaN(dateObj.getTime())) return booking.scheduled_date;
  return dateObj.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
};

const formatTimeRange = (booking: BookingHistoryItem | null | undefined) => {
  if (!booking) return 'Select a time';
  const start = new Date(`${booking.scheduled_date}T${booking.scheduled_time_start}`);
  const end = booking.scheduled_time_end
    ? new Date(`${booking.scheduled_date}T${booking.scheduled_time_end}`)
    : null;
  if (Number.isNaN(start.getTime())) return booking.scheduled_time_start;
  const startText = start.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  const endText = end
    ? end.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    : 'TBD';
  return `${startText} - ${endText}`;
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export default function OrderDetailsScreen({ navigation, route }: Props) {
  const { orderId, booking: bookingParam } = route.params;
  const { data: bookings, loading, error, refetch } = useBookings();
  const booking = useMemo(
    () => bookingParam ?? bookings.find((entry) => entry.id === orderId),
    [bookingParam, bookings, orderId],
  );
  const tabsNavigation = useNavigation<TabsNav>();
  const { clearBooking, setService, setDetailer, setCar, setLocation } = useBooking();
  const [isCancelling, setIsCancelling] = useState(false);

  const rebookAvailable = booking?.status === 'completed' && Boolean(booking?.detailer);
  
  // Check if booking can be cancelled by user
  // Users can cancel bookings up to in_progress status
  // Cannot cancel: completed, cancelled, no_show (final states)
  const canCancel = booking && ['pending', 'requires_payment', 'paid', 'offered', 'accepted', 'in_progress'].includes(booking.status);

  const handleCancel = () => {
    if (!booking) return;

    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? This action cannot be undone.',
      [
        {
          text: 'No, Keep Booking',
          style: 'cancel',
          onPress: () => {
            // User chose to keep the booking - do nothing
          },
        },
        {
          text: 'Yes, Cancel Booking',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsCancelling(true);
              await updateBookingStatus(booking.id, 'cancelled');
              await refetch();
              
              // Show success message and navigate back
              Alert.alert(
                'Booking Cancelled',
                'Your booking has been successfully cancelled.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      navigation.goBack();
                    },
                  },
                ],
                { cancelable: false }
              );
            } catch (err) {
              let errorMessage = 'Failed to cancel booking';
              
              if (err instanceof Error) {
                const errorText = err.message.toLowerCase();
                
                // Provide more descriptive error messages based on the error
                if (errorText.includes('not allowed') || errorText.includes('transition')) {
                  if (booking.status === 'completed') {
                    errorMessage = 'Cannot cancel: This booking is already completed.';
                  } else if (booking.status === 'cancelled') {
                    errorMessage = 'This booking is already cancelled.';
                  } else if (booking.status === 'no_show') {
                    errorMessage = 'Cannot cancel: This booking has been marked as no show.';
                  } else {
                    errorMessage = `Cannot cancel: ${err.message}`;
                  }
                } else if (errorText.includes('not found')) {
                  errorMessage = 'Booking not found. Please refresh and try again.';
                } else {
                  errorMessage = err.message;
                }
              }
              
              Alert.alert('Error', errorMessage);
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleRebook = () => {
    if (!booking || !booking.detailer) return;
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

  const handleViewDetailerProfile = () => {
    if (!booking?.detailer) return;
    tabsNavigation.navigate('Detailers', {
      screen: 'DetailerProfile',
      params: { detailerId: booking.detailer.id },
    });
  };

  const renderDetailerCard = () => {
    if (!booking?.detailer) {
      return (
        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Assigned Detailer</Text>
          <Text style={styles.emptyCopy}>We'll assign a pro once you reschedule.</Text>
        </View>
      );
    }
    return (
      <TouchableOpacity 
        onPress={handleViewDetailerProfile} 
        activeOpacity={0.8} 
        style={styles.card}
      >
        <View style={styles.detailerCardHeader}>
          <Text style={styles.sectionHeading}>Your Detailer</Text>
          <View style={styles.viewProfileHint}>
            <Text style={styles.viewProfileText}>View Profile</Text>
            <Ionicons name="chevron-forward" size={16} color="#1DA4F3" />
          </View>
        </View>
        <View style={styles.rowStart}>
          <View style={styles.detailerAvatar}>
            <Text style={styles.detailerInitials}>{getInitials(booking.detailer.full_name)}</Text>
          </View>
          <View style={styles.flex1}>
            <Text style={styles.detailerName}>{booking.detailer.full_name}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color="#6FF0C4" />
              <Text style={styles.ratingScore}>{booking.detailer.rating.toFixed(1)}</Text>
              <Text style={styles.ratingCount}>({booking.detailer.review_count} reviews)</Text>
            </View>
            <Text style={styles.detailerSince}>{booking.detailer.years_experience}+ years experience</Text>
          </View>
        </View>
        {rebookAvailable && (
          <TouchableOpacity onPress={handleRebook} activeOpacity={0.85} style={styles.rebookButton}>
            <Ionicons name="refresh" size={18} color="#6FF0C4" />
            <Text style={styles.rebookButtonText}>Book again with this detailer</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const renderCarCard = () => {
    if (!booking?.car) {
      return null;
    }
    const { year, make, model, license_plate, color } = booking.car;
    return (
      <View style={styles.card}>
        <View style={styles.rowStart}>
          <Ionicons name="car-sport" size={40} color="#6FF0C4" />
          <View>
            <Text style={styles.carName}>
              {year} {make} {model}
            </Text>
            <Text style={styles.carDetail}>License: {license_plate}</Text>
            {color && <Text style={styles.carDetail}>{color}</Text>}
          </View>
        </View>
      </View>
    );
  };

  const renderPaymentCard = () => {
    if (!booking) return null;
    return (
      <View style={styles.card}>
        <Text style={styles.paymentTitle}>Payment Summary</Text>
        <View style={styles.lineItemsContainer}>
          <View style={styles.lineItem}>
            <Text style={styles.lineItemLabel}>{booking.service?.name || 'Detailing Service'}</Text>
            <Text style={styles.lineItemValue}>${booking.service_price.toFixed(2)}</Text>
          </View>
          {booking.addons_total > 0 && (
            <View style={styles.lineItem}>
              <Text style={styles.lineItemLabel}>Add-ons</Text>
              <Text style={styles.lineItemValue}>${booking.addons_total.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.lineItem}>
            <Text style={styles.lineItemLabel}>HST</Text>
            <Text style={styles.lineItemValue}>${booking.tax_amount.toFixed(2)}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${booking.total_amount.toFixed(2)}</Text>
        </View>
        <View style={styles.metaSection}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Receipt ID</Text>
            <Text style={styles.metaValue}>{booking.receipt_id}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Status</Text>
            <Text style={styles.metaValue}>{STATUS_META[booking.status]?.label ?? booking.status}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderBody = () => {
    if (!booking && loading) {
      return (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#6FF0C4" />
          <Text style={styles.loadingText}>Loading booking...</Text>
        </View>
      );
    }

    if (!booking && error) {
      return (
        <View style={styles.centerState}>
          <Ionicons name="alert-circle" size={48} color="#FF6B6B" />
          <Text style={styles.loadingText}>{error.message}</Text>
          <TouchableOpacity onPress={refetch} style={styles.retryButton} activeOpacity={0.85}>
            <Text style={styles.retryButtonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!booking) {
      return (
        <View style={styles.centerState}>
          <Text style={styles.loadingText}>We couldn’t find that booking.</Text>
        </View>
      );
    }

    const status = STATUS_META[booking.status] ?? STATUS_META.scheduled;

    return (
      <>
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: status.dot }]} />
            <Text style={styles.statusText}>{status.label}</Text>
          </View>
          <Text style={styles.serviceTitle}>{booking.service?.name || 'Detailing Service'}</Text>
          <Text style={styles.completedDate}>
            {formatDate(booking)} · {formatTimeRange(booking)}
          </Text>
          {rebookAvailable && (
            <TouchableOpacity onPress={handleRebook} style={styles.primaryButton} activeOpacity={0.9}>
              <Text style={styles.primaryButtonText}>Book again with this detailer</Text>
            </TouchableOpacity>
          )}
          {canCancel && (
            <TouchableOpacity 
              onPress={handleCancel} 
              style={styles.cancelButton} 
              activeOpacity={0.9}
              disabled={isCancelling}
            >
              <Text style={styles.cancelButtonText}>
                {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {renderCarCard()}
        {renderDetailerCard()}

        <View style={styles.card}>
          <View style={styles.dateTimeContainer}>
            <View style={styles.dateTimeRow}>
              <Ionicons name="calendar" size={20} color="#C6CFD9" />
              <Text style={styles.dateTimeText}>{formatDate(booking)}</Text>
            </View>
            <View style={styles.dateTimeRow}>
              <Ionicons name="time" size={20} color="#C6CFD9" />
              <Text style={styles.dateTimeText}>{formatTimeRange(booking)}</Text>
            </View>
            <View style={styles.dateTimeRow}>
              <Ionicons name="location" size={20} color="#C6CFD9" />
              <Text style={styles.dateTimeText}>
                {booking.address_line1}, {booking.city}
              </Text>
            </View>
          </View>
        </View>

        {renderPaymentCard()}

        <View style={styles.actionsRow}>
          <TouchableOpacity activeOpacity={0.8} style={styles.actionButton}>
            <Ionicons name="download" size={20} color="#C6CFD9" />
            <Text style={styles.actionButtonText}>Download</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} style={styles.actionButton}>
            <Ionicons name="share-social" size={20} color="#C6CFD9" />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#C6CFD9" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Service Details</Text>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {renderBody()}
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
    paddingBottom: 120,
  },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 64,
  },
  loadingText: {
    color: '#C6CFD9',
    fontSize: 15,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1DA4F3',
  },
  retryButtonText: {
    color: '#1DA4F3',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#0A1A2F',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  // Service Summary
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6FF0C4',
  },
  statusText: {
    color: '#6FF0C4',
    fontSize: 14,
    fontWeight: '500',
  },
  serviceTitle: {
    color: '#F5F7FA',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  completedDate: {
    color: '#C6CFD9',
    fontSize: 15,
  },
  primaryButton: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: '#1DA4F3',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(255,107,107,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.3)',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FF6B6B',
    fontWeight: '600',
    fontSize: 15,
  },
  // Car Details
  rowStart: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  carName: {
    color: '#F5F7FA',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  carDetail: {
    color: '#C6CFD9',
    fontSize: 14,
  },
  // Detailer Information
  detailerCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewProfileHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewProfileText: {
    color: '#1DA4F3',
    fontSize: 14,
    fontWeight: '500',
  },
  detailerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(29,164,243,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(111,240,196,0.3)',
  },
  detailerInitials: {
    color: '#F5F7FA',
    fontSize: 20,
    fontWeight: '600',
  },
  flex1: {
    flex: 1,
  },
  detailerName: {
    color: '#F5F7FA',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  ratingScore: {
    color: '#F5F7FA',
    fontSize: 14,
  },
  ratingCount: {
    color: '#C6CFD9',
    fontSize: 12,
  },
  detailerSince: {
    color: '#C6CFD9',
    fontSize: 14,
  },
  rebookButton: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(111,240,196,0.4)',
    backgroundColor: 'rgba(111,240,196,0.1)',
  },
  rebookButtonText: {
    color: '#6FF0C4',
    fontWeight: '600',
  },
  sectionHeading: {
    color: '#F5F7FA',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyCopy: {
    color: '#C6CFD9',
    fontSize: 14,
  },
  // Date & Time
  dateTimeContainer: {
    gap: 12,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateTimeText: {
    color: '#F5F7FA',
    fontSize: 15,
    fontWeight: '500',
  },
  // Payment Summary
  paymentTitle: {
    color: '#F5F7FA',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  lineItemsContainer: {
    gap: 8,
    marginBottom: 12,
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lineItemLabel: {
    color: '#C6CFD9',
    fontSize: 15,
  },
  lineItemValue: {
    color: '#F5F7FA',
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(198,207,217,0.2)',
    marginBottom: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  metaSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(198,207,217,0.1)',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  metaLabel: {
    color: '#C6CFD9',
    fontSize: 14,
  },
  metaValue: {
    color: '#F5F7FA',
    fontSize: 14,
  },
  // Actions Row
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#0A1A2F',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: '#F5F7FA',
    fontSize: 15,
    fontWeight: '500',
  },
});
