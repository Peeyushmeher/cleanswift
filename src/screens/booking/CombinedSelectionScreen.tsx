import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useLayoutEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import DetailerProfileCard from '../../components/DetailerProfileCard';
import { useBooking, type BookingLocation, type Detailer } from '../../contexts/BookingContext';
import { useAddressAutocomplete } from '../../hooks/useAddressAutocomplete';
import { useDetailers } from '../../hooks/useDetailers';
import { BookingStackParamList } from '../../navigation/BookingStack';
import { geocodeAddress, isGoogleMapsConfigured } from '../../services/googleGeocoding';
import {
  normalizePostalCode,
  normalizeProvince,
  validateCity,
  validatePostalCode,
  validateProvince,
  validateStreetAddress,
} from '../../utils/addressValidation';

type Props = NativeStackScreenProps<BookingStackParamList, 'CombinedSelection'>;

// Reusable date and time slots
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

export default function CombinedSelectionScreen({ navigation, route }: Props) {
  const {
    setDetailer,
    setDateTime,
    setLocation,
    selectedDetailer,
    selectedDate,
    selectedTimeSlot,
    selectedLocation,
    selectedService,
  } = useBooking();
  const parentNavigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { data: detailers, loading: detailersLoading, error: detailersError } = useDetailers();

  const [selectedDetailerId, setSelectedDetailerId] = useState<string>(selectedDetailer?.id || '');
  const [selectedDateValue, setSelectedDateValue] = useState<Date | null>(
    selectedDate || null
  );
  const [selectedTime, setSelectedTime] = useState<string>(selectedTimeSlot || '');
  const [calendarExpanded, setCalendarExpanded] = useState(true);
  const [timeDropdownOpen, setTimeDropdownOpen] = useState(false);
  const [locationExpanded, setLocationExpanded] = useState(false);
  const today = new Date();
  const initialDate = selectedDate || today;
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const geocodingEnabled = isGoogleMapsConfigured;
  const [profileDetailer, setProfileDetailer] = useState<Detailer | null>(null);
  const [profileVisible, setProfileVisible] = useState(false);
  const [locationData, setLocationData] = useState<Partial<BookingLocation>>({
    address_line1: selectedLocation?.address_line1 || '',
    address_line2: selectedLocation?.address_line2 || '',
    city: selectedLocation?.city || '',
    province: selectedLocation?.province || '',
    postal_code: selectedLocation?.postal_code || '',
    location_notes: selectedLocation?.location_notes || '',
  });

  // Validation errors
  const [validationErrors, setValidationErrors] = useState<{
    address_line1?: string;
    city?: string;
    province?: string;
    postal_code?: string;
  }>({});

  // Geocoding state
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);

  // Autocomplete hook
  const {
    suggestions,
    isLoading: isAutocompleteLoading,
    searchAddress,
    selectPlace,
    clearSuggestions,
  } = useAddressAutocomplete({ debounceMs: 300, minInputLength: 3, enabled: geocodingEnabled });

  // Refs for managing autocomplete dropdown visibility
  const addressInputRef = useRef<TextInput>(null);
  const [showAutocomplete, setShowAutocomplete] = useState(false);

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

  const handleShowProfile = (detailer: Detailer) => {
    setProfileDetailer(detailer);
    setProfileVisible(true);
  };

  const handleSelectFromProfile = (detailer: Detailer) => {
    setSelectedDetailerId(detailer.id);
    setProfileVisible(false);
  };

  const closeProfile = () => setProfileVisible(false);

  const finalizeSelection = (
    normalizedProvince: string,
    normalizedPostalCode: string,
    coordinates: { latitude: number | null; longitude: number | null }
  ) => {
    const selectedDetailerData = detailers.find((d) => d.id === selectedDetailerId);
    if (!selectedDetailerData || !selectedDateValue) {
      return;
    }

    setDetailer(selectedDetailerData);
    setDateTime(selectedDateValue, selectedTime);
    setLocation({
      address_line1: locationData.address_line1!,
      address_line2: locationData.address_line2 || null,
      city: locationData.city!,
      province: normalizedProvince,
      postal_code: normalizedPostalCode,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      location_notes: locationData.location_notes || null,
    });

    navigation.navigate('OrderSummary', {
      selectedService: route.params.selectedService,
      selectedAddons: route.params.selectedAddons,
      date: selectedDateValue.getDate().toString(),
      time: selectedTime,
      detailerId: selectedDetailerId,
    });
  };

  const handleContinue = async ({ skipGeocode = false }: { skipGeocode?: boolean } = {}) => {
    // Validate all selections
    if (!selectedDetailerId || !selectedDateValue || !selectedTime) {
      return;
    }

    // Validate address fields
    const addressValidation = validateStreetAddress(locationData.address_line1 || '');
    const cityValidation = validateCity(locationData.city || '');
    const provinceValidation = validateProvince(locationData.province || '');
    const postalCodeValidation = validatePostalCode(locationData.postal_code || '');

    const errors: typeof validationErrors = {};
    if (!addressValidation.isValid) errors.address_line1 = addressValidation.error;
    if (!cityValidation.isValid) errors.city = cityValidation.error;
    if (!provinceValidation.isValid) errors.province = provinceValidation.error;
    if (!postalCodeValidation.isValid) errors.postal_code = postalCodeValidation.error;

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    const normalizedProvince = normalizeProvince(locationData.province || '');
    const normalizedPostalCode = normalizePostalCode(locationData.postal_code || '');

    setValidationErrors({});
    setGeocodeError(null);

    const shouldAttemptGeocode = geocodingEnabled && !skipGeocode;

    if (shouldAttemptGeocode) {
      setIsGeocoding(true);
      try {
        // Build full address string for geocoding
        const fullAddress = `${locationData.address_line1}, ${locationData.city}, ${normalizedProvince} ${normalizedPostalCode}, Canada`;

        // Geocode the address
        const geocodeResult = await geocodeAddress(fullAddress);

        finalizeSelection(normalizedProvince, normalizedPostalCode, {
          latitude: geocodeResult.latitude,
          longitude: geocodeResult.longitude,
        });
        setIsGeocoding(false);
      } catch (error) {
        setIsGeocoding(false);
        const errorMessage = error instanceof Error ? error.message : 'Failed to verify address. Please check and try again.';
        setGeocodeError(errorMessage);
        Alert.alert('Address Verification Failed', errorMessage);
      }
    } else {
      finalizeSelection(normalizedProvince, normalizedPostalCode, {
        latitude: null,
        longitude: null,
      });
    }
  };

  const handleBypassVerification = () => {
    handleContinue({ skipGeocode: true });
  };

  const isReady =
    !!selectedDetailerId &&
    !!selectedDateValue &&
    !!selectedTime &&
    !!locationData.address_line1 &&
    !!locationData.city &&
    !!locationData.province &&
    !!locationData.postal_code;

  // Progress calculation
  const stepsCompleted = [
    !!selectedDetailerId,
    !!selectedDateValue && !!selectedTime,
    !!(locationData.address_line1 && locationData.city && locationData.province && locationData.postal_code),
  ].filter(Boolean).length;

  // Calendar helper functions
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const formatSelectedDate = () => {
    if (!selectedDateValue) return 'Select a day';
    const day = selectedDateValue.getDate();
    const month = selectedDateValue.getMonth();
    const year = selectedDateValue.getFullYear();
    const monthAbbr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month];
    return `${monthAbbr} ${day}, ${year}`;
  };

  const formatTimeDisplay = (time: string) => {
    if (!time) return 'Select time';
    return time;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days: Array<{ day: number; available: boolean; isCurrentMonth: boolean }> = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: 0, available: false, isCurrentMonth: false });
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const checkDate = new Date(currentYear, currentMonth, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      checkDate.setHours(0, 0, 0, 0);
      
      // Date is available if it's today or in the future
      const available = checkDate >= today;
      days.push({ day, available, isCurrentMonth: true });
    }

    // Fill remaining cells to complete 6 weeks (42 cells total)
    const totalCells = 42;
    const remainingCells = totalCells - days.length;
    for (let i = 0; i < remainingCells; i++) {
      days.push({ day: 0, available: false, isCurrentMonth: false });
    }

    return days;
  };

  const handleDateSelect = (day: number) => {
    if (day > 0) {
      const selectedDate = new Date(currentYear, currentMonth, day);
      setSelectedDateValue(selectedDate);
      setCalendarExpanded(false);
    }
  };

  const isDateSelected = (day: number) => {
    if (!selectedDateValue || day === 0) return false;
    return (
      selectedDateValue.getDate() === day &&
      selectedDateValue.getMonth() === currentMonth &&
      selectedDateValue.getFullYear() === currentYear
    );
  };

  const availableTimes = timeSlots.filter(slot => slot.available);
  const selectedDetailerData = detailers.find(d => d.id === selectedDetailerId);

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

          {!geocodingEnabled && (
            <TouchableOpacity
              style={styles.skipVerificationButton}
              activeOpacity={0.8}
              onPress={handleBypassVerification}
            >
              <Ionicons name="warning" size={18} color="#FFA500" />
              <Text style={styles.skipVerificationButtonText}>Skip address verification (testing)</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>Plan Your Wash</Text>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          {/* Numbered Steps */}
          <View style={styles.progressSteps}>
            {[
              { id: 1, label: 'Detailer', completed: !!selectedDetailerId },
              { id: 2, label: 'Time', completed: !!(selectedDateValue && selectedTime) },
              { id: 3, label: 'Location', completed: !!(locationData.address_line1 && locationData.city && locationData.province && locationData.postal_code) },
            ].map((step, index) => (
              <View key={step.id} style={styles.progressStep}>
                <View
                  style={[
                    styles.progressCircle,
                    step.completed && styles.progressCircleCompleted,
                  ]}
                >
                  {step.completed ? (
                    <Ionicons name="checkmark" size={18} color="#6FF0C4" />
                  ) : (
                    <Text style={styles.progressStepNumber}>{step.id}</Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.progressLabel,
                    step.completed && styles.progressLabelCompleted,
                  ]}
                >
                  {step.label}
                </Text>
              </View>
            ))}
          </View>
          
          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[styles.progressBarFill, { width: `${(stepsCompleted / 3) * 100}%` }]}
              />
            </View>
            <Text style={styles.progressBarText}>
              {stepsCompleted} of 3 completed
            </Text>
          </View>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Detailer Selection Card */}
          <View style={styles.mainCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                {selectedDetailerId && (
                  <View style={styles.cardCheckmark}>
                    <Ionicons name="checkmark-circle" size={24} color="#1DA4F3" />
                  </View>
                )}
                <Text style={styles.cardTitle}>Choose Your Detailer</Text>
              </View>
            </View>
            
            {selectedDetailerId && selectedDetailerData ? (
              <View style={styles.selectedDetailerContent}>
                <View style={styles.detailerAvatarLarge}>
                  <Text style={styles.detailerInitialsLarge}>
                    {selectedDetailerData.full_name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </Text>
                </View>
                <View style={styles.detailerInfo}>
                  <Text style={styles.detailerNameMain}>{selectedDetailerData.full_name}</Text>
                  <View style={styles.ratingInfo}>
                    <Text style={styles.ratingValueMain}>{selectedDetailerData.rating}</Text>
                    <Text style={styles.reviewsCountMain}>{selectedDetailerData.review_count} reviews</Text>
                  </View>
                </View>
                <View style={styles.selectedDetailerActions}>
                  <TouchableOpacity
                    onPress={() => handleShowProfile(selectedDetailerData)}
                    activeOpacity={0.8}
                    style={styles.infoPill}
                  >
                    <Ionicons name="information-circle-outline" size={16} color="#6FF0C4" />
                    <Text style={styles.infoPillText}>Profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setSelectedDetailerId('')}
                    activeOpacity={0.8}
                    style={styles.changeButton}
                  >
                    <Text style={styles.changeButtonText}>Change</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.detailerSelectionContent}>
                {detailersLoading && (
                  <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#6FF0C4" />
                  </View>
                )}

                {detailersError && !detailersLoading && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={32} color="#FF6B6B" />
                    <Text style={styles.errorTextCenter}>{detailersError.message}</Text>
                  </View>
                )}

                {!detailersLoading && !detailersError && (
                  <View style={styles.detailersListCompact}>
                    {detailers.map((detailer) => {
                      const isSelected = selectedDetailerId === detailer.id;
                      return (
                        <TouchableOpacity
                          key={detailer.id}
                          onPress={() => setSelectedDetailerId(detailer.id)}
                          activeOpacity={0.8}
                          style={[
                            styles.detailerItem,
                            isSelected && styles.detailerItemSelected,
                          ]}
                        >
                          <View style={styles.detailerItemAvatar}>
                            <Text style={styles.detailerItemInitials}>
                              {detailer.full_name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </Text>
                          </View>
                          <View style={styles.detailerItemInfo}>
                            <View style={styles.detailerItemHeader}>
                              <Text style={styles.detailerItemName}>{detailer.full_name}</Text>
                              <TouchableOpacity
                                onPress={() => handleShowProfile(detailer)}
                                activeOpacity={0.7}
                                style={styles.detailerInfoButton}
                              >
                                <Ionicons name="information-circle-outline" size={18} color="#C6CFD9" />
                              </TouchableOpacity>
                            </View>
                            <View style={styles.detailerItemRating}>
                              <Ionicons name="star" size={14} color="#6FF0C4" />
                              <Text style={styles.detailerItemRatingText}>{detailer.rating}</Text>
                              <Text style={styles.detailerItemReviews}>({detailer.review_count} reviews)</Text>
                            </View>
                          </View>
                          {isSelected && (
                            <Ionicons name="checkmark-circle" size={24} color="#1DA4F3" />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Date & Time Selection Card */}
          <View style={styles.mainCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                {selectedDateValue && selectedTime && (
                  <View style={styles.cardCheckmark}>
                    <Ionicons name="checkmark-circle" size={24} color="#1DA4F3" />
                  </View>
                )}
                <Ionicons name="calendar" size={24} color="#1DA4F3" style={styles.cardIcon} />
                <Text style={styles.cardTitle}>Select Date & Time</Text>
              </View>
            </View>

            {/* Pill-shaped Date and Time Selectors */}
            <View style={styles.dateTimePills}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setCalendarExpanded(!calendarExpanded)}
                style={styles.dateTimePill}
              >
                <Ionicons name="calendar-outline" size={18} color="#6FF0C4" />
                <Text style={styles.dateTimePillText}>
                  {selectedDateValue ? formatSelectedDate() : 'Select date'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setTimeDropdownOpen(!timeDropdownOpen)}
                style={styles.dateTimePill}
              >
                <Ionicons name="time-outline" size={18} color="#1DA4F3" />
                <Text style={styles.dateTimePillText}>
                  {selectedTime || 'Select time'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Calendar Picker */}
            {calendarExpanded && (
              <View style={styles.expandedContent}>
                <View style={styles.calendarCard}>
                  {/* Calendar View */}
                  <View style={styles.calendarView}>
                    {/* Month Header */}
                    <View style={styles.calendarHeader}>
                      <TouchableOpacity
                        onPress={() => navigateMonth('prev')}
                        activeOpacity={0.7}
                        style={styles.calendarNavButton}
                      >
                        <Ionicons name="chevron-back" size={20} color="#F5F7FA" />
                      </TouchableOpacity>
                      <Text style={styles.calendarMonthYear}>
                        {monthNames[currentMonth]} {currentYear}
                      </Text>
                      <TouchableOpacity
                        onPress={() => navigateMonth('next')}
                        activeOpacity={0.7}
                        style={styles.calendarNavButton}
                      >
                        <Ionicons name="chevron-forward" size={20} color="#F5F7FA" />
                      </TouchableOpacity>
                    </View>

                    {/* Days of Week */}
                    <View style={styles.calendarDaysHeader}>
                      {dayNames.map((day, index) => (
                        <View key={index} style={styles.calendarDayHeader}>
                          <Text style={styles.calendarDayHeaderText}>{day}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Calendar Grid */}
                    <View style={styles.calendarGrid}>
                      {generateCalendarDays().map((dateInfo, index) => {
                        if (!dateInfo.isCurrentMonth) {
                          return <View key={index} style={styles.calendarDayEmpty} />;
                        }
                        const isSelected = isDateSelected(dateInfo.day);
                        const isAvailable = dateInfo.available;
                        return (
                          <TouchableOpacity
                            key={index}
                            onPress={() => isAvailable && handleDateSelect(dateInfo.day)}
                            disabled={!isAvailable}
                            activeOpacity={isAvailable ? 0.8 : 1}
                            style={[
                              styles.calendarDay,
                              isSelected && styles.calendarDaySelected,
                              !isAvailable && styles.calendarDayDisabled,
                            ]}
                          >
                            <Text
                              style={[
                                styles.calendarDayText,
                                isSelected && styles.calendarDayTextSelected,
                                !isAvailable && styles.calendarDayTextDisabled,
                              ]}
                            >
                              {dateInfo.day}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Time Dropdown */}
            {timeDropdownOpen && (
              <View style={styles.timeDropdownContainer}>
                <View style={styles.timeDropdown}>
                  {availableTimes.map((slot) => {
                    const isSelected = selectedTime === slot.time;
                    return (
                      <TouchableOpacity
                        key={slot.time}
                        onPress={() => {
                          setSelectedTime(slot.time);
                          setTimeDropdownOpen(false);
                        }}
                        activeOpacity={0.8}
                        style={[
                          styles.timeDropdownItem,
                          isSelected && styles.timeDropdownItemSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.timeDropdownText,
                            isSelected && styles.timeDropdownTextSelected,
                          ]}
                        >
                          {slot.time}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </View>

          {/* Location Selection Card */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setLocationExpanded(!locationExpanded)}
            style={styles.mainCard}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                {locationData.address_line1 && locationData.city && locationData.province && locationData.postal_code && (
                  <View style={styles.cardCheckmark}>
                    <Ionicons name="checkmark-circle" size={24} color="#1DA4F3" />
                  </View>
                )}
                <Ionicons name="location" size={24} color="#1DA4F3" style={styles.cardIcon} />
                <View style={styles.cardHeaderContent}>
                  <Text style={styles.cardTitle}>Service Location</Text>
                  {locationData.address_line1 && (
                    <Text style={styles.cardSubtitle}>
                      {locationData.address_line1}
                      {locationData.city && `, ${locationData.city}`}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Location Input (Expanded) */}
            {locationExpanded && (
              <View style={styles.expandedContent}>
                <View style={styles.locationCard}>
                  {/* Street Address with Autocomplete */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Street Address</Text>
                    <View style={styles.inputContainer}>
                      <TextInput
                        ref={addressInputRef}
                        style={[
                          styles.input,
                          validationErrors.address_line1 && styles.inputError,
                        ]}
                        placeholder="123 Main Street"
                        placeholderTextColor="#5F7290"
                        value={locationData.address_line1}
                        onChangeText={(text) => {
                          setLocationData({ ...locationData, address_line1: text });
                          if (validationErrors.address_line1) {
                            setValidationErrors({ ...validationErrors, address_line1: undefined });
                          }
                          if (geocodingEnabled && text.length >= 3) {
                            setShowAutocomplete(true);
                            searchAddress(text);
                          } else {
                            setShowAutocomplete(false);
                            clearSuggestions();
                          }
                        }}
                        onFocus={() => {
                          if (
                            geocodingEnabled &&
                            locationData.address_line1 &&
                            locationData.address_line1.length >= 3
                          ) {
                            setShowAutocomplete(true);
                            searchAddress(locationData.address_line1);
                          }
                        }}
                        onBlur={() => {
                          // Delay hiding autocomplete to allow selection
                          setTimeout(() => setShowAutocomplete(false), 200);
                        }}
                      />
                      {isAutocompleteLoading && (
                        <View style={styles.autocompleteLoader}>
                          <ActivityIndicator size="small" color="#1DA4F3" />
                        </View>
                      )}
                    </View>
                    {validationErrors.address_line1 && (
                      <Text style={styles.errorText}>{validationErrors.address_line1}</Text>
                    )}
                    {geocodeError && (
                      <Text style={styles.errorText}>{geocodeError}</Text>
                    )}
                    {!geocodingEnabled && (
                      <Text style={styles.warningText}>
                        Dev note: address verification is disabled until EXPO_PUBLIC_GOOGLE_MAPS_API_KEY is set.
                      </Text>
                    )}

                    {/* Autocomplete Suggestions Dropdown */}
                    {geocodingEnabled && showAutocomplete && suggestions.length > 0 && (
                      <View style={styles.autocompleteDropdown}>
                        {suggestions.map((suggestion) => (
                          <TouchableOpacity
                            key={suggestion.placeId}
                            style={styles.autocompleteItem}
                            onPress={async () => {
                              const placeDetails = await selectPlace(suggestion.placeId);
                              if (placeDetails) {
                                // Auto-fill form fields from place details
                                const streetNumber = placeDetails.addressComponents.streetNumber || '';
                                const streetName = placeDetails.addressComponents.streetName || '';
                                const addressLine1 = streetNumber && streetName
                                  ? `${streetNumber} ${streetName}`
                                  : placeDetails.formattedAddress.split(',')[0];

                                setLocationData({
                                  ...locationData,
                                  address_line1: addressLine1,
                                  city: placeDetails.addressComponents.city || locationData.city || '',
                                  province: placeDetails.addressComponents.province || locationData.province || '',
                                  postal_code: placeDetails.addressComponents.postalCode || locationData.postal_code || '',
                                  latitude: placeDetails.latitude,
                                  longitude: placeDetails.longitude,
                                });
                                setShowAutocomplete(false);
                                // Clear any validation errors
                                setValidationErrors({});
                              }
                            }}
                          >
                            <Ionicons name="location" size={18} color="#1DA4F3" style={styles.autocompleteIcon} />
                            <View style={styles.autocompleteTextContainer}>
                              <Text style={styles.autocompleteMainText}>{suggestion.mainText}</Text>
                              <Text style={styles.autocompleteSecondaryText}>{suggestion.secondaryText}</Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>

                  {/* City */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>City</Text>
                    <TextInput
                      style={[
                        styles.input,
                        validationErrors.city && styles.inputError,
                      ]}
                      placeholder="Toronto"
                      placeholderTextColor="#5F7290"
                      value={locationData.city}
                      onChangeText={(text) => {
                        setLocationData({ ...locationData, city: text });
                        if (validationErrors.city) {
                          setValidationErrors({ ...validationErrors, city: undefined });
                        }
                      }}
                    />
                    {validationErrors.city && (
                      <Text style={styles.errorText}>{validationErrors.city}</Text>
                    )}
                  </View>

                  {/* Province and Postal Code */}
                  <View style={styles.row}>
                    <View style={styles.halfWidth}>
                      <Text style={styles.inputLabel}>Province</Text>
                      <TextInput
                        style={[
                          styles.input,
                          validationErrors.province && styles.inputError,
                        ]}
                        placeholder="ON"
                        placeholderTextColor="#5F7290"
                        value={locationData.province}
                        maxLength={2}
                        autoCapitalize="characters"
                        onChangeText={(text) => {
                          const normalized = normalizeProvince(text);
                          setLocationData({ ...locationData, province: normalized });
                          if (validationErrors.province) {
                            setValidationErrors({ ...validationErrors, province: undefined });
                          }
                        }}
                      />
                      {validationErrors.province && (
                        <Text style={styles.errorText}>{validationErrors.province}</Text>
                      )}
                    </View>
                    <View style={styles.halfWidth}>
                      <Text style={styles.inputLabel}>Postal Code</Text>
                      <TextInput
                        style={[
                          styles.input,
                          validationErrors.postal_code && styles.inputError,
                        ]}
                        placeholder="M1M 1M1"
                        placeholderTextColor="#5F7290"
                        value={locationData.postal_code}
                        autoCapitalize="characters"
                        onChangeText={(text) => {
                          const normalized = normalizePostalCode(text);
                          setLocationData({ ...locationData, postal_code: normalized });
                          if (validationErrors.postal_code) {
                            setValidationErrors({ ...validationErrors, postal_code: undefined });
                          }
                        }}
                      />
                      {validationErrors.postal_code && (
                        <Text style={styles.errorText}>{validationErrors.postal_code}</Text>
                      )}
                    </View>
                  </View>

                  {/* Special Instructions */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Special Instructions (Optional)</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Apartment number, gate code, etc."
                      placeholderTextColor="#5F7290"
                      multiline
                      numberOfLines={3}
                      value={locationData.location_notes || ''}
                      onChangeText={(text) =>
                        setLocationData({ ...locationData, location_notes: text })
                      }
                    />
                  </View>
                </View>
              </View>
            )}
          </TouchableOpacity>

          {/* Spacer for bottom button */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Bottom Summary & CTA */}
        <View style={[styles.bottomSummary, { bottom: 68 + Math.max(insets.bottom, 0) }]}>
          <TouchableOpacity
            onPress={() => handleContinue()}
            disabled={!isReady || isGeocoding}
            activeOpacity={isReady && !isGeocoding ? 0.8 : 1}
            style={[styles.continueButton, (!isReady || isGeocoding) && styles.continueButtonDisabled]}
          >
            {isGeocoding ? (
              <View style={styles.buttonLoadingContainer}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.continueButtonText}>Verifying Address...</Text>
              </View>
            ) : (
              <Text
                style={[
                  styles.continueButtonText,
                  (!isReady || isGeocoding) && styles.continueButtonTextDisabled,
                ]}
              >
                {isReady ? 'Continue to Review' : `Complete ${3 - stepsCompleted} more step${3 - stepsCompleted !== 1 ? 's' : ''}`}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <DetailerProfileCard
        detailer={profileDetailer}
        visible={profileVisible}
        onClose={closeProfile}
        onSelectDetailer={handleSelectFromProfile}
        serviceSummary={
          selectedService
            ? { name: selectedService.name, price: selectedService.price }
            : undefined
        }
      />
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
    paddingBottom: 20,
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
  progressContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  progressSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressStep: {
    flex: 1,
    alignItems: 'center',
  },
  progressCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#C6CFD9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressCircleCompleted: {
    borderWidth: 3,
    borderColor: '#6FF0C4',
  },
  progressStepNumber: {
    color: '#C6CFD9',
    fontSize: 16,
    fontWeight: '600',
  },
  progressLabel: {
    color: '#C6CFD9',
    fontSize: 13,
    fontWeight: '500',
  },
  progressLabelCompleted: {
    color: '#6FF0C4',
  },
  progressBarContainer: {
    marginTop: 4,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: 'rgba(198,207,217,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#1DA4F3',
  },
  progressBarText: {
    color: '#C6CFD9',
    fontSize: 13,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  mainCard: {
    backgroundColor: '#0A1A2F',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardCheckmark: {
    marginRight: 4,
  },
  cardIcon: {
    marginRight: 8,
  },
  cardHeaderContent: {
    flex: 1,
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
  selectedDetailerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  selectedDetailerActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  changeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(29,164,243,0.12)',
    borderWidth: 1,
    borderColor: '#1DA4F3',
  },
  changeButtonText: {
    color: '#1DA4F3',
    fontSize: 13,
    fontWeight: '600',
  },
  detailerAvatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(29,164,243,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1DA4F3',
  },
  detailerInitialsLarge: {
    color: '#F5F7FA',
    fontSize: 32,
    fontWeight: '600',
  },
  detailerInfo: {
    flex: 1,
  },
  detailerNameMain: {
    color: '#F5F7FA',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  ratingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingValueMain: {
    color: '#F5F7FA',
    fontSize: 16,
    fontWeight: '600',
  },
  reviewsCountMain: {
    color: '#C6CFD9',
    fontSize: 14,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(111,240,196,0.4)',
    backgroundColor: 'rgba(111,240,196,0.08)',
  },
  infoPillText: {
    color: '#6FF0C4',
    fontSize: 13,
    fontWeight: '600',
  },
  detailerSelectionContent: {
    marginTop: 8,
  },
  centerContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  errorContainer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#050B12',
    borderRadius: 16,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  errorTextCenter: {
    color: '#FF6B6B',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  detailersListCompact: {
    gap: 12,
  },
  detailerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#050B12',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  detailerItemSelected: {
    borderColor: '#1DA4F3',
    borderWidth: 2,
  },
  detailerItemAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(29,164,243,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailerItemInitials: {
    color: '#F5F7FA',
    fontSize: 18,
    fontWeight: '600',
  },
  detailerItemInfo: {
    flex: 1,
  },
  detailerItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  detailerItemName: {
    color: '#F5F7FA',
    fontSize: 16,
    fontWeight: '600',
  },
  detailerInfoButton: {
    padding: 4,
  },
  detailerItemRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailerItemRatingText: {
    color: '#F5F7FA',
    fontSize: 14,
    fontWeight: '500',
  },
  detailerItemReviews: {
    color: '#C6CFD9',
    fontSize: 12,
  },
  dateTimePills: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  dateTimePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: '#050B12',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  dateTimePillText: {
    color: '#F5F7FA',
    fontSize: 15,
    fontWeight: '500',
  },
  expandedContent: {
    marginTop: 0,
    gap: 16,
  },
  calendarCard: {
    backgroundColor: '#050B12',
    borderRadius: 20,
    padding: 20,
    marginTop: 16,
  },
  calendarView: {
    marginTop: 8,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  calendarNavButton: {
    padding: 8,
  },
  calendarMonthYear: {
    color: '#F5F7FA',
    fontSize: 18,
    fontWeight: '600',
  },
  calendarDaysHeader: {
    flexDirection: 'row',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  calendarDayHeader: {
    width: '14.28%',
    alignItems: 'center',
  },
  calendarDayHeaderText: {
    color: '#C6CFD9',
    fontSize: 14,
    fontWeight: '500',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    justifyContent: 'space-between',
  },
  calendarDayEmpty: {
    width: '14.28%',
    aspectRatio: 1,
    marginBottom: 8,
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDaySelected: {
    backgroundColor: '#1DA4F3',
    borderRadius: 12,
  },
  calendarDayDisabled: {
    opacity: 1,
  },
  calendarDayText: {
    color: '#F5F7FA',
    fontSize: 15,
    fontWeight: '500',
  },
  calendarDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  calendarDayTextDisabled: {
    color: '#C6CFD9',
    opacity: 0.5,
  },
  timeDropdownContainer: {
    marginTop: 12,
    backgroundColor: '#050B12',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  timeDropdown: {
    backgroundColor: 'transparent',
  },
  timeDropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 4,
  },
  timeDropdownItemSelected: {
    backgroundColor: '#1DA4F3',
  },
  timeDropdownText: {
    color: '#F5F7FA',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  timeDropdownTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  locationCard: {
    backgroundColor: '#050B12',
    borderRadius: 16,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#C6CFD9',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0A1A2F',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#F5F7FA',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  bottomSummary: {
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
    backgroundColor: '#0A1A2F',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  continueButtonTextDisabled: {
    color: 'rgba(198,207,217,0.5)',
  },
  buttonLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inputContainer: {
    position: 'relative',
  },
  inputError: {
    borderColor: '#FF6B6B',
    borderWidth: 1.5,
  },
  autocompleteLoader: {
    position: 'absolute',
    right: 16,
    top: 14,
  },
  autocompleteDropdown: {
    marginTop: 8,
    backgroundColor: '#0A1A2F',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    maxHeight: 200,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  autocompleteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  autocompleteIcon: {
    marginRight: 12,
  },
  autocompleteTextContainer: {
    flex: 1,
  },
  autocompleteMainText: {
    color: '#F5F7FA',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  autocompleteSecondaryText: {
    color: '#C6CFD9',
    fontSize: 13,
  },
  warningText: {
    color: '#FFA500',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  skipVerificationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,165,0,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,165,0,0.4)',
    marginBottom: 16,
  },
  skipVerificationButtonText: {
    color: '#FFA500',
    fontSize: 13,
    fontWeight: '600',
  },
});
