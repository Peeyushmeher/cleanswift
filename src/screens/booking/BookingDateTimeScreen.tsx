import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BookingStackParamList } from '../../navigation/BookingStack';
import { useBooking } from '../../contexts/BookingContext';
import { DEMO_DATES, DEMO_TIME_SLOTS } from '../../config/demoData';
import { COLORS } from '../../theme/colors';

type Props = NativeStackScreenProps<BookingStackParamList, 'BookingDateTime'>;

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

    // Navigate to next screen (LocationSelection)
    navigation.navigate('LocationSelection', {
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
            <Ionicons name="chevron-back" size={24} color={COLORS.text.secondary} />
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
              <Ionicons name="calendar" size={20} color={COLORS.accent.mint} />
              <Text style={styles.sectionTitle}>Select Date</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dateScrollContent}
            >
              {DEMO_DATES.map((date) => {
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
              <Ionicons name="time" size={20} color={COLORS.accent.blue} />
              <Text style={styles.sectionTitle}>Select Time</Text>
            </View>
            <View style={styles.timeGrid}>
              {DEMO_TIME_SLOTS.map((slot) => {
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
    backgroundColor: COLORS.bg.primary,
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
    color: COLORS.text.primary,
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
    color: COLORS.text.primary,
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
    backgroundColor: COLORS.bg.surface,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    alignItems: 'center',
    marginRight: 12,
  },
  dateCardSelected: {
    borderWidth: 2,
    borderColor: COLORS.accent.mint,
    backgroundColor: COLORS.bg.surfaceSelected,
    shadowColor: COLORS.shadow.mint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  dateCardDisabled: {
    backgroundColor: COLORS.special.surfaceFaded,
    opacity: 0.4,
  },
  dateDayLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  dateDayLabelSelected: {
    color: COLORS.accent.mint,
  },
  dateNumber: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text.primary,
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
    backgroundColor: COLORS.bg.surface,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
    marginBottom: 12,
  },
  timeCardSelected: {
    borderWidth: 2,
    borderColor: COLORS.accent.mint,
    backgroundColor: COLORS.bg.surfaceSelected,
    shadowColor: COLORS.shadow.mint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  timeCardDisabled: {
    backgroundColor: COLORS.special.surfaceFaded,
    opacity: 0.4,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  timeTextSelected: {
    color: COLORS.accent.mint,
  },
  timeTextDisabled: {
    color: COLORS.text.secondary,
  },
  bottomCTA: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    backgroundColor: COLORS.bg.primary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.subtle,
  },
  continueButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 56,
    backgroundColor: COLORS.accent.blue,
    shadowColor: COLORS.shadow.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonDisabled: {
    backgroundColor: COLORS.bg.surfaceDisabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    color: COLORS.text.inverse,
    fontSize: 17,
    fontWeight: '600',
  },
  continueButtonTextDisabled: {
    color: COLORS.text.disabledAlt,
  },
});
