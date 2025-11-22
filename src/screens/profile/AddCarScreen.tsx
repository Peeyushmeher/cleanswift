import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/ProfileStack';
import { useAuth } from '../../contexts/AuthContext';
import { createCar } from '../../services/carsService';
import { COLORS } from '../../theme/colors';

type Props = NativeStackScreenProps<ProfileStackParamList, 'AddCar'>;

export default function AddCarScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    trim: '',
    license: '',
    color: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be signed in to add a car.');
      return;
    }

    if (isSaving) return;

    try {
      setIsSaving(true);

      // Create car using carsService
      await createCar(user.id, {
        make: formData.make.trim(),
        model: formData.model.trim(),
        year: formData.year.trim(),
        trim: formData.trim.trim() || null,
        license_plate: formData.license.trim(),
        color: formData.color.trim() || null,
        is_primary: true, // New cars are set as primary by default
      });

      console.log('Car saved successfully');
      Alert.alert('Success', 'Your car has been added!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error saving car:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to save car. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = formData.make && formData.model && formData.year && formData.license;
  const isButtonDisabled = !isFormValid || isSaving;

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
          <Text style={styles.headerTitle}>Add a Car</Text>
        </View>

        {/* Form - Scrollable */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Optional Photo Upload */}
          <View style={styles.photoUploadSection}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.photoUploadCard}
            >
              <View style={styles.photoUploadContent}>
                <View style={styles.photoUploadIconContainer}>
                  <Ionicons name="cloud-upload" size={32} color={COLORS.accent.blue} />
                </View>
                <Text style={styles.photoUploadText}>Add Photo (Optional)</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.formFields}>
            {/* Make */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Make</Text>
              <TextInput
                placeholder="e.g., BMW"
                value={formData.make}
                onChangeText={(value) => updateField('make', value)}
                placeholderTextColor={COLORS.text.disabled}
                style={styles.input}
              />
            </View>

            {/* Model */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Model</Text>
              <TextInput
                placeholder="e.g., M4"
                value={formData.model}
                onChangeText={(value) => updateField('model', value)}
                placeholderTextColor={COLORS.text.disabled}
                style={styles.input}
              />
            </View>

            {/* Year */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Year</Text>
              <TextInput
                placeholder="e.g., 2022"
                value={formData.year}
                onChangeText={(value) => updateField('year', value)}
                keyboardType="numeric"
                placeholderTextColor={COLORS.text.disabled}
                style={styles.input}
              />
            </View>

            {/* Trim */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Trim <Text style={styles.optionalLabel}>(Optional)</Text>
              </Text>
              <TextInput
                placeholder="e.g., Competition Package"
                value={formData.trim}
                onChangeText={(value) => updateField('trim', value)}
                placeholderTextColor={COLORS.text.disabled}
                style={styles.input}
              />
            </View>

            {/* License Plate */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>License Plate</Text>
              <TextInput
                placeholder="e.g., ABC-123"
                value={formData.license}
                onChangeText={(value) => updateField('license', value)}
                autoCapitalize="characters"
                placeholderTextColor={COLORS.text.disabled}
                style={styles.input}
              />
            </View>

            {/* Color */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Color <Text style={styles.optionalLabel}>(Optional)</Text>
              </Text>
              <TextInput
                placeholder="e.g., Black Sapphire Metallic"
                value={formData.color}
                onChangeText={(value) => updateField('color', value)}
                placeholderTextColor={COLORS.text.disabled}
                style={styles.input}
              />
            </View>
          </View>
        </ScrollView>

        {/* Bottom CTA */}
        <View style={styles.bottomCTA}>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isButtonDisabled}
            activeOpacity={isButtonDisabled ? 1 : 0.8}
            style={[
              styles.saveButton,
              isButtonDisabled && styles.saveButtonDisabled,
            ]}
          >
            <Text
              style={[
                styles.saveButtonText,
                isButtonDisabled && styles.saveButtonTextDisabled,
              ]}
            >
              {isSaving ? 'Saving...' : 'Save Car'}
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
    gap: 16,
  },
  backButton: {
    padding: 4,
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
    paddingBottom: 32,
  },
  photoUploadSection: {
    marginBottom: 32,
  },
  photoUploadCard: {
    width: '100%',
    backgroundColor: COLORS.bg.surface,
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 32,
    borderWidth: 2,
    borderColor: COLORS.border.emphasis,
    borderStyle: 'dashed',
  },
  photoUploadContent: {
    alignItems: 'center',
    gap: 12,
  },
  photoUploadIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.accentBg.blue10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoUploadText: {
    color: COLORS.text.secondary,
    fontSize: 15,
  },
  formFields: {
    gap: 16,
  },
  fieldContainer: {
    gap: 8,
  },
  label: {
    color: COLORS.text.secondary,
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 4,
  },
  optionalLabel: {
    color: COLORS.text.disabled,
  },
  input: {
    width: '100%',
    backgroundColor: COLORS.bg.surface,
    borderWidth: 1,
    borderColor: COLORS.border.emphasis,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    color: COLORS.text.primary,
    fontSize: 16,
  },
  bottomCTA: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
    backgroundColor: COLORS.bg.primary,
  },
  saveButton: {
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.accent.blue,
    borderRadius: 28,
    shadowColor: COLORS.shadow.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.bg.surface,
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: COLORS.text.inverse,
    fontSize: 17,
    fontWeight: '600',
  },
  saveButtonTextDisabled: {
    color: COLORS.text.disabled,
  },
});
