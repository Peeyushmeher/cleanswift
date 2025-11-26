import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBookings, type BookingHistoryItem } from '../../hooks/useBookings';
import type { OrdersStackParamList } from '../../navigation/OrdersStack';

type Props = NativeStackScreenProps<OrdersStackParamList, 'OrdersHistory'>;

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

export default function OrdersHistoryScreen({ navigation }: Props) {
  const { data: bookings, loading, error, refetch } = useBookings();

  // Refetch bookings when screen comes into focus (e.g., after payment completes)
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const sortedBookings = useMemo(() => {
    const isCancelled = (status: string) => status === 'cancelled' || status === 'canceled';
    
    return bookings.slice().sort((a, b) => {
      const aCancelled = isCancelled(a.status);
      const bCancelled = isCancelled(b.status);
      
      // If one is cancelled and the other isn't, non-cancelled comes first
      if (aCancelled && !bCancelled) return 1;
      if (!aCancelled && bCancelled) return -1;
      
      // If both have the same cancellation status, sort by creation date (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [bookings]);

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
                  <Text style={styles.serviceName} numberOfLines={1} ellipsizeMode="tail">
                    {booking.service?.name || 'Detailing Service'}
                  </Text>
                  <Text style={styles.price}>${booking.total_amount.toFixed(2)}</Text>
                </View>

                <Text style={styles.date}>{formatDateLabel(booking.scheduled_date, booking.scheduled_time_start)}</Text>
                {renderStatusDot(booking.status)}
              </View>

              <Ionicons name='chevron-forward' size={20} color='#C6CFD9' style={styles.chevron} />
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
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  orderContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
    minWidth: 0,
    gap: 6,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  serviceName: {
    color: '#F5F7FA',
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    flexShrink: 1,
  },
  price: {
    color: '#F5F7FA',
    fontSize: 16,
    fontWeight: '600',
  },
  date: {
    color: '#C6CFD9',
    fontSize: 14,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  chevron: {
    marginLeft: 8,
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
