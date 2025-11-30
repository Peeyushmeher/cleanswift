import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BookingStackParamList } from '../../navigation/BookingStack';
import { useBooking } from '../../contexts/BookingContext';
import { COLORS } from '../../theme/colors';

type Props = NativeStackScreenProps<BookingStackParamList, 'LocationSelection'>;

const ONTARIO_PROVINCES = [
  'ON', 'QC', 'BC', 'AB', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE', 'NT', 'YT', 'NU'
];

export default function LocationSelectionScreen({ navigation, route }: Props) {
  const { location, setLocation } = useBooking();

  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('ON');
  const [postalCode, setPostalCode] = useState('');
  const [locationNotes, setLocationNotes] = useState('');

  // Pre-fill from context if location exists
  useEffect(() => {
    if (location) {
      setAddressLine1(location.address_line1);
      setAddressLine2(location.address_line2 || '');
      setCity(location.city);
      setProvince(location.province);
      setPostalCode(location.postal_code);
    }
  }, [location]);

  const validatePostalCode = (code: string): boolean => {
    // Canadian postal code format: A1A 1A1
    const postalRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
    return postalRegex.test(code);
  };

  const formatPostalCode = (code: string): string => {
    // Auto-format as user types: A1A1A1 → A1A 1A1
    const cleaned = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (cleaned.length > 3) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)}`;
    }
    return cleaned;
  };

  const handlePostalCodeChange = (text: string) => {
    const formatted = formatPostalCode(text);
    setPostalCode(formatted);
  };

  const handleContinue = () => {
    // Validate required fields
    if (!addressLine1.trim()) {
      alert('Please enter your street address');
      return;
    }
    if (!city.trim()) {
      alert('Please enter your city');
      return;
    }
    if (!postalCode.trim()) {
      alert('Please enter your postal code');
      return;
    }
    if (!validatePostalCode(postalCode)) {
      alert('Please enter a valid Canadian postal code (e.g., M5V 3A8)');
      return;
    }

    // Save to context
    setLocation({
      address_line1: addressLine1.trim(),
      address_line2: addressLine2.trim() || null,
      city: city.trim(),
      province,
      postal_code: postalCode.trim(),
    });

    // Navigate to next screen with route params
    navigation.navigate('ChooseDetailer', {
      selectedService: route.params.selectedService,
      selectedAddons: route.params.selectedAddons,
      date: route.params.date,
      time: route.params.time,
    });
  };

  const isFormValid = () => {
    return (
      addressLine1.trim() !== '' &&
      city.trim() !== '' &&
      postalCode.trim() !== '' &&
      validatePostalCode(postalCode)
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
            <Ionicons name="chevron-back" size={24} color={COLORS.text.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Service Location</Text>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Info Message */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color={COLORS.accent.blue} />
            <Text style={styles.infoText}>
              Where should our detailer come to service your vehicle?
            </Text>
          </View>

          {/* Address Line 1 */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Street Address <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={addressLine1}
              onChangeText={setAddressLine1}
              placeholder="123 Main Street"
              placeholderTextColor={COLORS.text.disabledAlt}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>

          {/* Address Line 2 */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Apt / Suite / Unit (Optional)</Text>
            <TextInput
              style={styles.input}
              value={addressLine2}
              onChangeText={setAddressLine2}
              placeholder="Apt 4B, Unit 205, etc."
              placeholderTextColor={COLORS.text.disabledAlt}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>

          {/* City */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              City <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder="Toronto"
              placeholderTextColor={COLORS.text.disabledAlt}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>

          {/* Province & Postal Code Row */}
          <View style={styles.rowContainer}>
            {/* Province */}
            <View style={[styles.fieldContainer, styles.halfWidth]}>
              <Text style={styles.label}>
                Province <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.input}>
                <Text style={styles.provinceText}>{province}</Text>
                <Text style={styles.provinceSubtext}>Ontario</Text>
              </View>
            </View>

            {/* Postal Code */}
            <View style={[styles.fieldContainer, styles.halfWidth]}>
              <Text style={styles.label}>
                Postal Code <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={postalCode}
                onChangeText={handlePostalCodeChange}
                placeholder="M5V 3A8"
                placeholderTextColor={COLORS.text.disabledAlt}
                autoCapitalize="characters"
                maxLength={7}
                returnKeyType="done"
              />
            </View>
          </View>

          {/* Location Notes */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Special Instructions (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={locationNotes}
              onChangeText={setLocationNotes}
              placeholder="Parking instructions, gate code, etc."
              placeholderTextColor={COLORS.text.disabledAlt}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              returnKeyType="done"
            />
          </View>
        </ScrollView>

        {/* Bottom CTA */}
        <View style={styles.bottomCTA}>
          <TouchableOpacity
            onPress={handleContinue}
            disabled={!isFormValid()}
            activeOpacity={isFormValid() ? 0.8 : 1}
            style={[
              styles.continueButton,
              !isFormValid() && styles.continueButtonDisabled,
            ]}
          >
            <Text
              style={[
                styles.continueButtonText,
                !isFormValid() && styles.continueButtonTextDisabled,
              ]}
            >
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
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentBg.blue10,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border.accentBlue,
  },
  infoText: {
    flex: 1,
    color: COLORS.text.secondary,
    fontSize: 14,
    marginLeft: 12,
    lineHeight: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    color: COLORS.text.primary,
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 8,
  },
  required: {
    color: COLORS.accent.error,
  },
  input: {
    backgroundColor: COLORS.bg.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: COLORS.text.primary,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 14,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  provinceText: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  provinceSubtext: {
    color: COLORS.text.secondary,
    fontSize: 13,
    marginTop: 2,
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
