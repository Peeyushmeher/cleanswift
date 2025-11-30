import { Ionicons } from '@expo/vector-icons';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useBookings, type BookingHistoryItem } from '../../hooks/useBookings';
import { supabase } from '../../lib/supabase';
import type { MainTabsParamList } from '../../navigation/MainTabs';
import type { ProfileStackParamList } from '../../navigation/ProfileStack';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabsParamList, 'Home'>,
  NativeStackNavigationProp<ProfileStackParamList>
>;

const quickActions = [
  { icon: 'water' as const, label: 'Quick Wash', color: '#1DA4F3' },
  { icon: 'sparkles' as const, label: 'Full Detail', color: '#6FF0C4' },
  { icon: 'leaf' as const, label: 'Interior', color: '#1DA4F3' },
  { icon: 'star' as const, label: 'Exterior', color: '#6FF0C4' },
  { icon: 'cube' as const, label: 'Luxury Package', color: '#1DA4F3' },
];

// Helper function to parse time string (handles "11:00 AM" format)
const parseTimeString = (timeStr: string): { hours: number; minutes: number } | null => {
  try {
    // Handle formats like "11:00 AM" or "1:00 PM"
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const period = match[3].toUpperCase();
      
      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }
      
      return { hours, minutes };
    }
    
    // Try ISO format (HH:mm or HH:mm:ss)
    const isoMatch = timeStr.match(/(\d+):(\d+)/);
    if (isoMatch) {
      return {
        hours: parseInt(isoMatch[1], 10),
        minutes: parseInt(isoMatch[2], 10),
      };
    }
    
    return null;
  } catch {
    return null;
  }
};

// Helper function to create a Date from date and time strings
const createBookingDate = (dateStr: string, timeStr: string): Date | null => {
  try {
    const timeParts = parseTimeString(timeStr);
    if (!timeParts) {
      // Fallback: try direct Date parsing
      const date = new Date(`${dateStr}T${timeStr}`);
      return Number.isNaN(date.getTime()) ? null : date;
    }
    
    const date = new Date(dateStr);
    date.setHours(timeParts.hours, timeParts.minutes, 0, 0);
    return date;
  } catch {
    return null;
  }
};

// Helper function to format date for upcoming bookings
const formatUpcomingDate = (booking: BookingHistoryItem): string => {
  if (!booking.scheduled_date || !booking.scheduled_time_start) {
    return 'Date TBD';
  }

  const bookingDate = createBookingDate(booking.scheduled_date, booking.scheduled_time_start);
  if (!bookingDate) {
    return booking.scheduled_date;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const bookingDay = new Date(
    bookingDate.getFullYear(),
    bookingDate.getMonth(),
    bookingDate.getDate()
  );

  // Format time
  const timeText = bookingDate.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

  // Check if it's today
  if (bookingDay.getTime() === today.getTime()) {
    return `Today, ${timeText}`;
  }

  // Check if it's tomorrow
  if (bookingDay.getTime() === tomorrow.getTime()) {
    return `Tomorrow, ${timeText}`;
  }

  // Otherwise format as weekday, month day
  return bookingDate.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

// Get the next upcoming booking
const getNextUpcomingBooking = (bookings: BookingHistoryItem[]): BookingHistoryItem | null => {
  const now = new Date();
  
  // Filter for upcoming bookings (status indicates they're scheduled and not completed/cancelled)
  const upcomingStatuses: Array<BookingHistoryItem['status']> = [
    'requires_payment',
    'paid',
    'offered',
    'accepted',
    'in_progress',
  ];

  const upcomingBookings = bookings
    .filter((booking) => {
      // Explicitly exclude cancelled, completed, and no_show bookings
      const status = booking.status.toLowerCase();
      if (status === 'cancelled' || status === 'canceled' || status === 'completed' || status === 'no_show') {
        return false;
      }

      // Must have a valid scheduled date/time
      if (!booking.scheduled_date || !booking.scheduled_time_start) {
        return false;
      }

      // Must be in an upcoming status
      if (!upcomingStatuses.includes(booking.status)) {
        return false;
      }

      // Parse the booking date
      const bookingDate = createBookingDate(booking.scheduled_date, booking.scheduled_time_start);
      if (!bookingDate) {
        return false;
      }

      // For bookings that require payment, show them even if date is in the past
      // (user still needs to complete payment)
      if (booking.status === 'requires_payment') {
        return true;
      }

      // For other statuses, must be in the future
      return bookingDate >= now;
    })
    .sort((a, b) => {
      // Sort by scheduled date/time, earliest first
      const dateA = createBookingDate(a.scheduled_date, a.scheduled_time_start);
      const dateB = createBookingDate(b.scheduled_date, b.scheduled_time_start);
      
      if (!dateA || !dateB) return 0;
      return dateA.getTime() - dateB.getTime();
    });

  return upcomingBookings.length > 0 ? upcomingBookings[0] : null;
};

interface PrimaryCar {
  id: string;
  make: string;
  model: string;
  year: string;
  trim?: string | null;
}

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { data: bookings, loading: bookingsLoading } = useBookings();
  const [primaryCar, setPrimaryCar] = useState<PrimaryCar | null>(null);
  const [isLoadingCar, setIsLoadingCar] = useState(true);

  // Function to fetch primary car
  const fetchPrimaryCar = useCallback(async () => {
    if (!user) {
      setIsLoadingCar(false);
      setPrimaryCar(null);
      return;
    }

    try {
      setIsLoadingCar(true);
      // First try to get primary car
      const { data: primaryCarData, error: primaryError } = await supabase
        .from('cars')
        .select('id, make, model, year, trim')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .maybeSingle();

      if (primaryError) {
        console.error('Error fetching primary car:', primaryError);
      }

      // If we have a primary car, use it; otherwise try to get any car
      if (primaryCarData) {
        setPrimaryCar(primaryCarData);
      } else {
        // Try to get any car if no primary is set
        const { data: anyCar, error: anyCarError } = await supabase
          .from('cars')
          .select('id, make, model, year, trim')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (anyCarError) {
          console.error('Error fetching any car:', anyCarError);
        }
        
        setPrimaryCar(anyCar || null);
      }
    } catch (error) {
      console.error('Failed to fetch primary car:', error);
      setPrimaryCar(null);
    } finally {
      setIsLoadingCar(false);
    }
  }, [user]);

  // Fetch primary car on mount and when user changes
  useEffect(() => {
    fetchPrimaryCar();
  }, [fetchPrimaryCar]);

  // Refetch car when screen is focused (e.g., after returning from SelectCar)
  useFocusEffect(
    useCallback(() => {
      fetchPrimaryCar();
    }, [fetchPrimaryCar])
  );

  // Get the next upcoming booking
  const nextBooking = getNextUpcomingBooking(bookings);

  const handleBookService = () => {
    // Navigate to the Book tab, which shows the BookingStack (ServiceSelection screen)
    navigation.navigate('Book');
  };

  const handleSelectCar = () => {
    // Navigate to Profile tab, then to SelectCar screen
    (navigation as any).navigate('Profile', { screen: 'SelectCar' });
  };

  const handleProfile = () => {
    navigation.navigate('Profile');
  };

  const handleOrders = () => {
    navigation.navigate('Orders');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Good Morning</Text>
              <Text style={styles.title}>CleanSwift</Text>
            </View>
            <TouchableOpacity
              onPress={handleProfile}
              activeOpacity={0.8}
              style={styles.profileButton}
            >
              <Ionicons name="person" size={24} color="#6FF0C4" />
            </TouchableOpacity>
          </View>

          {/* Hero Car Card */}
          <View style={styles.carCardContainer}>
            <TouchableOpacity
              onPress={handleBookService}
              activeOpacity={0.95}
              style={styles.carCard}
            >
              {/* Car Icon */}
              <View style={styles.carIconContainer}>
                <Ionicons name="car-sport" size={64} color="#6FF0C4" />
                <View style={styles.carIconGlow} />
              </View>

              {/* Car Info */}
              <View style={styles.carInfo}>
                {isLoadingCar ? (
                  <Text style={styles.carName}>Loading...</Text>
                ) : primaryCar ? (
                  <>
                    <Text style={styles.carName}>
                      {primaryCar.year} {primaryCar.make} {primaryCar.model}
                      {primaryCar.trim ? ` ${primaryCar.trim}` : ''}
                    </Text>
                    <Text style={styles.carLabel}>Primary Vehicle</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.carName}>No Vehicle Added</Text>
                    <Text style={styles.carLabel}>Add a vehicle to get started</Text>
                  </>
                )}
              </View>

              {/* CTA Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  onPress={handleBookService}
                  activeOpacity={0.8}
                  style={styles.primaryButton}
                >
                  <Text style={styles.primaryButtonText}>Book a Wash</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSelectCar}
                  activeOpacity={0.8}
                  style={styles.secondaryButton}
                >
                  <Text style={styles.secondaryButtonText}>Change</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickActionsScroll}
            >
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={handleBookService}
                  activeOpacity={0.8}
                  style={styles.quickActionCard}
                >
                  <Ionicons
                    name={action.icon}
                    size={32}
                    color={action.color}
                    style={styles.quickActionIcon}
                  />
                  <Text style={styles.quickActionLabel}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Upcoming Bookings */}
          <View style={styles.upcomingContainer}>
            <Text style={styles.sectionTitle}>Upcoming</Text>
            {bookingsLoading ? (
              <View style={styles.upcomingCard}>
                <View style={styles.upcomingIconContainer}>
                  <Ionicons name="time" size={24} color="#1DA4F3" />
                </View>
                <View style={styles.upcomingContent}>
                  <Text style={styles.upcomingTitle}>Loading...</Text>
                </View>
              </View>
            ) : nextBooking ? (
              <TouchableOpacity
                onPress={handleOrders}
                activeOpacity={0.8}
                style={styles.upcomingCard}
              >
                <View style={styles.upcomingIconContainer}>
                  <Ionicons name="time" size={24} color="#1DA4F3" />
                </View>
                <View style={styles.upcomingContent}>
                  <Text style={styles.upcomingTitle}>
                    {nextBooking.service?.name || 'Service'}
                  </Text>
                  <Text style={styles.upcomingSubtitle}>
                    {formatUpcomingDate(nextBooking)}
                  </Text>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleBookService}
                activeOpacity={0.8}
                style={[styles.upcomingCard, styles.upcomingCardEmpty]}
              >
                <View style={[styles.upcomingIconContainer, styles.upcomingIconContainerEmpty]}>
                  <Ionicons name="calendar-outline" size={24} color="#6FF0C4" />
                </View>
                <View style={styles.upcomingContent}>
                  <Text style={styles.upcomingTitle}>No upcoming bookings</Text>
                  <Text style={styles.upcomingSubtitle}>
                    Tap to book your next service
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  greeting: {
    color: '#C6CFD9',
    fontSize: 14,
    marginBottom: 10,
  },
  title: {
    color: '#F5F7FA',
    fontSize: 28,
    fontWeight: '600',
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(111, 240, 196, 0.3)',
    backgroundColor: 'rgba(111, 240, 196, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6FF0C4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  carCardContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  carCard: {
    width: '100%',
    backgroundColor: '#0A1A2F',
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 40,
    elevation: 10,
  },
  carIconContainer: {
    marginBottom: 24,
    position: 'relative',
    alignItems: 'center',
  },
  carIconGlow: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6FF0C4',
    opacity: 0.2,
  },
  carInfo: {
    marginBottom: 24,
  },
  carName: {
    color: '#F5F7FA',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 6,
  },
  carLabel: {
    color: '#C6CFD9',
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#1DA4F3',
    paddingVertical: 16,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 48,
    marginRight: 6,
    shadowColor: '#1DA4F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingHorizontal: 28,
    backgroundColor: '#0A1A2F',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 16,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 48,
    marginLeft: 6,
  },
  secondaryButtonText: {
    color: '#F5F7FA',
    fontSize: 15,
    fontWeight: '600',
  },
  quickActionsContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#F5F7FA',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  quickActionsScroll: {
    paddingRight: 24,
  },
  quickActionCard: {
    width: 128,
    backgroundColor: '#0A1A2F',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    marginRight: 12,
  },
  quickActionIcon: {
    marginBottom: 14,
  },
  quickActionLabel: {
    color: '#C6CFD9',
    fontSize: 13,
    textAlign: 'center',
  },
  upcomingContainer: {
    paddingHorizontal: 24,
    marginBottom: 96,
  },
  upcomingCard: {
    backgroundColor: '#0A1A2F',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(29, 164, 243, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#1DA4F3',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  },
  upcomingIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(29, 164, 243, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  upcomingIconContainerEmpty: {
    backgroundColor: 'rgba(111, 240, 196, 0.1)',
  },
  upcomingContent: {
    flex: 1,
  },
  upcomingTitle: {
    color: '#F5F7FA',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6,
  },
  upcomingSubtitle: {
    color: '#C6CFD9',
    fontSize: 14,
  },
  upcomingCardEmpty: {
    borderColor: 'rgba(111, 240, 196, 0.2)',
  },
});
