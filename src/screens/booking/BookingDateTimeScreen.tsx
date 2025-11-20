import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BookingStackParamList } from '../../navigation/BookingStack';
import { useBooking } from '../../contexts/BookingContext';

type Props = NativeStackScreenProps<BookingStackParamList, 'BookingDateTime'>;

const dates = [
  { day: 'Mon', date: 13, available: false },
  { day: 'Tue', date: 14, available: false },
  { day: 'Wed', date: 15, available: false },
  { day: 'Thu', date: 16, available: true },
  { day: 'Fri', date: 17, available: true },
  { day: 'Sat', date: 18, available: true },
  { day: 'Sun', date: 19, available: true },
];

const timeSlots = [
  { time: '8:00 AM', available: true },
  { time: '9:30 AM', available: true },
  { time: '11:00 AM', available: true },
  { time: '1:00 PM', available: true },
  { time: '3:30 PM', available: true },
  { time: '5:00 PM', available: false },
  { time: '6:30 PM', available: false },
  { time: '8:00 PM', available: false },
];

export default function BookingDateTimeScreen({ navigation, route }: Props) {
  const { setDateTime } = useBooking();
  const [selectedDate, setSelectedDate] = useState<number | null>(16);
  const [selectedTime, setSelectedTime] = useState<string>('');

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) return;

    // Create a Date object from the selected date
    // Using current year and month, with the selected day
    const today = new Date();
    const bookingDate = new Date(today.getFullYear(), today.getMonth(), selectedDate);

    // Update BookingContext
    setDateTime(bookingDate, selectedTime);

    // Navigate to next screen
    navigation.navigate('ChooseDetailer', {
      selectedService: route.params.selectedService,
      selectedAddons: route.params.selectedAddons,
      date: selectedDate.toString(),
      time: selectedTime,
    });
  };

  const isReady = !!selectedDate && !!selectedTime;

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
          <Text style={styles.headerTitle}>Choose Date & Time</Text>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Date Picker */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar" size={20} color="#6FF0C4" />
              <Text style={styles.sectionTitle}>Select Date</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dateScrollContent}
            >
              {dates.map((date) => {
                const isSelected = selectedDate === date.date;
                const isAvailable = date.available;

                return (
                  <TouchableOpacity
                    key={date.date}
                    onPress={() => isAvailable && setSelectedDate(date.date)}
                    disabled={!isAvailable}
                    activeOpacity={isAvailable ? 0.8 : 1}
                    style={[
                      styles.dateCard,
                      isSelected && styles.dateCardSelected,
                      !isAvailable && styles.dateCardDisabled,
                    ]}
                  >
                    <Text style={[
                      styles.dateDayLabel,
                      isSelected && styles.dateDayLabelSelected
                    ]}>
                      {date.day}
                    </Text>
                    <Text style={styles.dateNumber}>
                      {date.date}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Time Slot Grid */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time" size={20} color="#1DA4F3" />
              <Text style={styles.sectionTitle}>Select Time</Text>
            </View>
            <View style={styles.timeGrid}>
              {timeSlots.map((slot) => {
                const isSelected = selectedTime === slot.time;
                const isAvailable = slot.available;

                return (
                  <TouchableOpacity
                    key={slot.time}
                    onPress={() => isAvailable && setSelectedTime(slot.time)}
                    disabled={!isAvailable}
                    activeOpacity={isAvailable ? 0.8 : 1}
                    style={[
                      styles.timeCard,
                      isSelected && styles.timeCardSelected,
                      !isAvailable && styles.timeCardDisabled,
                    ]}
                  >
                    <Text style={[
                      styles.timeText,
                      isSelected && styles.timeTextSelected,
                      !isAvailable && styles.timeTextDisabled,
                    ]}>
                      {slot.time}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* Bottom CTA */}
        <View style={styles.bottomCTA}>
          <TouchableOpacity
            onPress={handleContinue}
            disabled={!isReady}
            activeOpacity={isReady ? 0.8 : 1}
            style={[
              styles.continueButton,
              !isReady && styles.continueButtonDisabled,
            ]}
          >
            <Text style={[
              styles.continueButtonText,
              !isReady && styles.continueButtonTextDisabled,
            ]}>
              Continue
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
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#F5F7FA',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  dateScrollContent: {
    paddingRight: 24,
  },
  dateCard: {
    width: 80,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#0A1A2F',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    marginRight: 12,
  },
  dateCardSelected: {
    borderWidth: 2,
    borderColor: '#6FF0C4',
    backgroundColor: '#071C33',
    shadowColor: '#6FF0C4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  dateCardDisabled: {
    backgroundColor: 'rgba(10,26,47,0.3)',
    opacity: 0.4,
  },
  dateDayLabel: {
    fontSize: 12,
    color: '#C6CFD9',
    marginBottom: 4,
    textAlign: 'center',
  },
  dateDayLabelSelected: {
    color: '#6FF0C4',
  },
  dateNumber: {
    fontSize: 24,
    fontWeight: '600',
    color: '#F5F7FA',
    textAlign: 'center',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  timeCard: {
    width: '48%',
    minHeight: 56,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#0A1A2F',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
    marginBottom: 12,
  },
  timeCardSelected: {
    borderWidth: 2,
    borderColor: '#6FF0C4',
    backgroundColor: '#071C33',
    shadowColor: '#6FF0C4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  timeCardDisabled: {
    backgroundColor: 'rgba(10,26,47,0.3)',
    opacity: 0.4,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F5F7FA',
  },
  timeTextSelected: {
    color: '#6FF0C4',
  },
  timeTextDisabled: {
    color: '#C6CFD9',
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
  continueButtonDisabled: {
    backgroundColor: '#071326',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  continueButtonTextDisabled: {
    color: '#5F7290',
  },
});
