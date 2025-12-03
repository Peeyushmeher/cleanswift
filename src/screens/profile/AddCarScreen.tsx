import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { ProfileStackParamList } from '../../navigation/ProfileStack';

type Props = NativeStackScreenProps<ProfileStackParamList, 'AddCar'>;

export default function AddCarScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    trim: '',
    license: '',
    color: '',
  });

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to add a car');
      return;
    }

    setIsSaving(true);
    try {
      // Check if user has any cars to determine if this should be primary
      const { data: existingCars, error: countError } = await supabase
        .from('cars')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (countError) {
        throw countError;
      }

      const isPrimary = !existingCars || existingCars.length === 0;

      const { error } = await supabase
        .from('cars')
        .insert({
          user_id: user.id,
          make: formData.make.trim(),
          model: formData.model.trim(),
          year: formData.year.trim(),
          trim: formData.trim.trim() || null,
          license_plate: formData.license.trim().toUpperCase(),
          color: formData.color.trim() || null,
          is_primary: isPrimary,
        });

      if (error) {
        throw error;
      }

      Alert.alert('Success', 'Car added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error saving car:', error);
      Alert.alert('Error', 'Failed to save car. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = formData.make && formData.model && formData.year && formData.license;

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
                  <Ionicons name="cloud-upload" size={32} color="#1DA4F3" />
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
                placeholderTextColor="rgba(198,207,217,0.5)"
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
                placeholderTextColor="rgba(198,207,217,0.5)"
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
                placeholderTextColor="rgba(198,207,217,0.5)"
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
                placeholderTextColor="rgba(198,207,217,0.5)"
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
                placeholderTextColor="rgba(198,207,217,0.5)"
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
                placeholderTextColor="rgba(198,207,217,0.5)"
                style={styles.input}
              />
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
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text
                style={[
                  styles.saveButtonText,
                  !isFormValid && styles.saveButtonTextDisabled,
                ]}
              >
                Save Car
              </Text>
            )}
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
  photoUploadSection: {
    marginBottom: 32,
  },
  photoUploadCard: {
    width: '100%',
    backgroundColor: '#0A1A2F',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 32,
    borderWidth: 2,
    borderColor: 'rgba(198,207,217,0.2)',
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
    backgroundColor: 'rgba(29,164,243,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoUploadText: {
    color: '#C6CFD9',
    fontSize: 15,
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
});
