import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAddressAutocomplete } from '../../hooks/useAddressAutocomplete';
import { useUserAddresses, type UserAddress } from '../../hooks/useUserAddresses';
import { ProfileStackParamList } from '../../navigation/ProfileStack';
import { isGoogleMapsConfigured } from '../../services/googleGeocoding';
import {
  normalizePostalCode,
  normalizeProvince,
  validateCity,
  validatePostalCode,
  validateProvince,
  validateStreetAddress,
} from '../../utils/addressValidation';

type Props = NativeStackScreenProps<ProfileStackParamList, 'AddEditAddress'>;

export default function AddEditAddressScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { addressId } = route.params || {};
  const { addresses, addAddress, updateAddress } = useUserAddresses();
  const isEditMode = !!addressId;

  const existingAddress = addressId ? addresses.find((a) => a.id === addressId) : null;

  const [formData, setFormData] = useState({
    name: existingAddress?.name || '',
    address_line1: existingAddress?.address_line1 || '',
    address_line2: existingAddress?.address_line2 || '',
    city: existingAddress?.city || '',
    province: existingAddress?.province || '',
    postal_code: existingAddress?.postal_code || '',
    is_default: existingAddress?.is_default || false,
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const addressInputRef = useRef<TextInput>(null);
  
  // Autocomplete hook
  const geocodingEnabled = isGoogleMapsConfigured;
  const {
    suggestions,
    isLoading: isAutocompleteLoading,
    searchAddress,
    selectPlace,
    clearSuggestions,
  } = useAddressAutocomplete({
    debounceMs: 300,
    minInputLength: 3,
    enabled: geocodingEnabled,
  });

  // Auto-generate name if not provided and in add mode
  useEffect(() => {
    if (!isEditMode && !formData.name && addresses.length > 0) {
      const nextNumber = addresses.length + 1;
      setFormData((prev) => ({ ...prev, name: `Address ${nextNumber}` }));
    }
  }, [isEditMode, addresses.length]);

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate name (optional, but if provided should not be empty)
    if (formData.name.trim().length === 0) {
      errors.name = 'Address name is required';
    }

    // Validate address fields
    const addressValidation = validateStreetAddress(formData.address_line1);
    if (!addressValidation.isValid) {
      errors.address_line1 = addressValidation.error || 'Invalid street address';
    }

    const cityValidation = validateCity(formData.city);
    if (!cityValidation.isValid) {
      errors.city = cityValidation.error || 'Invalid city';
    }

    const provinceValidation = validateProvince(formData.province);
    if (!provinceValidation.isValid) {
      errors.province = provinceValidation.error || 'Invalid province';
    }

    const postalCodeValidation = validatePostalCode(formData.postal_code);
    if (!postalCodeValidation.isValid) {
      errors.postal_code = postalCodeValidation.error || 'Invalid postal code';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      const normalizedProvince = normalizeProvince(formData.province);
      const normalizedPostalCode = normalizePostalCode(formData.postal_code);

      const addressData = {
        name: formData.name.trim(),
        address_line1: formData.address_line1.trim(),
        address_line2: formData.address_line2.trim() || null,
        city: formData.city.trim(),
        province: normalizedProvince,
        postal_code: normalizedPostalCode,
        latitude: null,
        longitude: null,
        is_default: formData.is_default,
      };

      if (isEditMode && addressId) {
        await updateAddress(addressId, addressData);
        Alert.alert('Success', 'Address updated successfully');
      } else {
        await addAddress(addressData, false); // Don't auto-generate name since we have one
        Alert.alert('Success', 'Address added successfully');
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save address');
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid =
    formData.name.trim() &&
    formData.address_line1.trim() &&
    formData.city.trim() &&
    formData.province.trim() &&
    formData.postal_code.trim() &&
    Object.keys(validationErrors).length === 0;

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
          <Text style={styles.headerTitle}>{isEditMode ? 'Edit Address' : 'Add Address'}</Text>
        </View>

        {/* Form - Scrollable */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Form Fields */}
          <View style={styles.formFields}>
            {/* Address Name */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Address Name</Text>
              <TextInput
                placeholder="e.g., Home, Work, Office"
                value={formData.name}
                onChangeText={(value) => updateField('name', value)}
                placeholderTextColor="rgba(198,207,217,0.5)"
                style={[styles.input, validationErrors.name && styles.inputError]}
              />
              {validationErrors.name && (
                <Text style={styles.errorText}>{validationErrors.name}</Text>
              )}
            </View>

            {/* Street Address with Autocomplete */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Street Address</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  ref={addressInputRef}
                  placeholder="123 Main Street"
                  value={formData.address_line1}
                  onChangeText={(value) => {
                    updateField('address_line1', value);
                    if (geocodingEnabled && value.length >= 3) {
                      setShowAutocomplete(true);
                      searchAddress(value);
                    } else {
                      setShowAutocomplete(false);
                      clearSuggestions();
                    }
                  }}
                  onFocus={() => {
                    if (
                      geocodingEnabled &&
                      formData.address_line1 &&
                      formData.address_line1.length >= 3
                    ) {
                      setShowAutocomplete(true);
                      searchAddress(formData.address_line1);
                    }
                  }}
                  onBlur={() => {
                    // Delay hiding autocomplete to allow selection
                    setTimeout(() => setShowAutocomplete(false), 200);
                  }}
                  placeholderTextColor="rgba(198,207,217,0.5)"
                  style={[styles.input, validationErrors.address_line1 && styles.inputError]}
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

                          setFormData({
                            ...formData,
                            address_line1: addressLine1,
                            city: placeDetails.addressComponents.city || formData.city || '',
                            province: placeDetails.addressComponents.province || formData.province || '',
                            postal_code: placeDetails.addressComponents.postalCode || formData.postal_code || '',
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

            {/* Address Line 2 */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Address Line 2 <Text style={styles.optionalLabel}>(Optional)</Text>
              </Text>
              <TextInput
                placeholder="Apt, suite, etc."
                value={formData.address_line2}
                onChangeText={(value) => updateField('address_line2', value)}
                placeholderTextColor="rgba(198,207,217,0.5)"
                style={styles.input}
              />
            </View>

            {/* City */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>City</Text>
              <TextInput
                placeholder="e.g., Toronto"
                value={formData.city}
                onChangeText={(value) => updateField('city', value)}
                placeholderTextColor="rgba(198,207,217,0.5)"
                style={[styles.input, validationErrors.city && styles.inputError]}
              />
              {validationErrors.city && (
                <Text style={styles.errorText}>{validationErrors.city}</Text>
              )}
            </View>

            {/* Province */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Province</Text>
              <TextInput
                placeholder="e.g., ON, BC, QC"
                value={formData.province}
                onChangeText={(value) => updateField('province', value.toUpperCase())}
                autoCapitalize="characters"
                maxLength={2}
                placeholderTextColor="rgba(198,207,217,0.5)"
                style={[styles.input, validationErrors.province && styles.inputError]}
              />
              {validationErrors.province && (
                <Text style={styles.errorText}>{validationErrors.province}</Text>
              )}
            </View>

            {/* Postal Code */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Postal Code</Text>
              <TextInput
                placeholder="e.g., M1M 1M1"
                value={formData.postal_code}
                onChangeText={(value) => {
                  // Auto-format postal code
                  const cleaned = value.replace(/\s+/g, '').toUpperCase();
                  if (cleaned.length <= 6) {
                    const formatted = cleaned.length > 3 ? `${cleaned.slice(0, 3)} ${cleaned.slice(3)}` : cleaned;
                    updateField('postal_code', formatted);
                  }
                }}
                autoCapitalize="characters"
                maxLength={7}
                placeholderTextColor="rgba(198,207,217,0.5)"
                style={[styles.input, validationErrors.postal_code && styles.inputError]}
              />
              {validationErrors.postal_code && (
                <Text style={styles.errorText}>{validationErrors.postal_code}</Text>
              )}
            </View>

            {/* Set as Default */}
            <View style={styles.fieldContainer}>
              <View style={styles.switchContainer}>
                <View style={styles.switchLabelContainer}>
                  <Text style={styles.label}>Set as Default Address</Text>
                  <Text style={styles.switchDescription}>
                    This address will be used by default for bookings
                  </Text>
                </View>
                <Switch
                  value={formData.is_default}
                  onValueChange={(value) => updateField('is_default', value)}
                  trackColor={{ false: '#0A1A2F', true: '#6FF0C4' }}
                  thumbColor={formData.is_default ? '#050B12' : '#C6CFD9'}
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom CTA */}
        <View style={[styles.bottomCTA, { bottom: Math.max(insets.bottom, 8) + 68 }]}>
          <View style={styles.buttonSafeArea}>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!isFormValid || isSaving}
              activeOpacity={isFormValid && !isSaving ? 0.8 : 1}
              style={[
                styles.saveButton,
                (!isFormValid || isSaving) && styles.saveButtonDisabled,
              ]}
            >
              <Text
                style={[
                  styles.saveButtonText,
                  (!isFormValid || isSaving) && styles.saveButtonTextDisabled,
                ]}
              >
                {isSaving ? 'Saving...' : isEditMode ? 'Save Changes' : 'Add Address'}
              </Text>
            </TouchableOpacity>
          </View>
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
  formFields: {
    gap: 16,
  },
  fieldContainer: {
    gap: 8,
  },
  label: {
    color: '#C6CFD9',
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 4,
  },
  optionalLabel: {
    color: 'rgba(198,207,217,0.5)',
  },
  inputWrapper: {
    position: 'relative',
    width: '100%',
  },
  input: {
    width: '100%',
    backgroundColor: '#0A1A2F',
    borderWidth: 1,
    borderColor: 'rgba(198,207,217,0.2)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    color: '#F5F7FA',
    fontSize: 16,
  },
  autocompleteLoader: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    paddingHorizontal: 4,
    marginTop: 4,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0A1A2F',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  switchLabelContainer: {
    flex: 1,
    marginRight: 16,
  },
  switchDescription: {
    color: 'rgba(198,207,217,0.6)',
    fontSize: 12,
    marginTop: 4,
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
  },
  saveButton: {
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1DA4F3',
    borderRadius: 28,
    shadowColor: '#1DA4F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: '#0A1A2F',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  saveButtonTextDisabled: {
    color: 'rgba(198,207,217,0.5)',
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
});

