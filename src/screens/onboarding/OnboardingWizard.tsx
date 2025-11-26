import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useProfileCompleteness } from '../../hooks/useProfileCompleteness';
import { supabase } from '../../lib/supabase';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import { useCallback } from 'react';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

const STEPS = [
  { title: 'Profile', label: 'Profile Setup' },
  { title: 'Vehicle', label: 'Add Vehicle' },
  { title: 'Address', label: 'Add Address' },
];

export default function OnboardingWizard() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { profile, refetch: refetchProfile } = useUserProfile();
  const { isComplete, refetch: refetchCompleteness } = useProfileCompleteness();

  // Navigate to Main when profile becomes complete
  useFocusEffect(
    useCallback(() => {
      if (isComplete && user) {
        console.log('OnboardingWizard: Profile is complete, navigating to Main...');
        // Get parent navigator to reset the root stack
        const parent = navigation.getParent();
        if (parent) {
          parent.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          });
        } else {
          // Fallback: try direct navigation
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          });
        }
      }
    }, [isComplete, user, navigation])
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Step 1: Profile data
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Step 2: Car data
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [color, setColor] = useState('');
  const [trim, setTrim] = useState('');

  // Step 3: Address data
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Pre-fill data from existing profile (only once on mount)
  // This prevents the form from being reset when profile refetches after saving
  useEffect(() => {
    // Only initialize once when component mounts
    if (profile) {
      // Only set if field is empty to preserve any existing user input
      if (!fullName && profile.full_name) setFullName(profile.full_name);
      if (!email && (profile.email || user?.email)) setEmail(profile.email || user?.email || '');
      if (!phone && profile.phone) setPhone(profile.phone);
      if (!addressLine1 && profile.address_line1) setAddressLine1(profile.address_line1);
      if (!addressLine2 && profile.address_line2) setAddressLine2(profile.address_line2);
      if (!city && profile.city) setCity(profile.city);
      if (!province && profile.province) setProvince(profile.province);
      if (!postalCode && profile.postal_code) setPostalCode(profile.postal_code);
    } else if (user?.email && !email) {
      setEmail(user.email);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const handleStep1Continue = async () => {
    if (!fullName.trim() || !phone.trim()) {
      Alert.alert('Required Fields', 'Please fill in your full name and phone number');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName.trim(),
          email: email.trim() || user.email,
          phone: phone.trim(),
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Refetch profile so completeness check updates
      await refetchProfile();
      setCurrentStep(1);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Continue = async () => {
    if (!make.trim() || !model.trim() || !year.trim() || !licensePlate.trim()) {
      Alert.alert('Required Fields', 'Please fill in make, model, year, and license plate');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('cars').insert({
        user_id: user.id,
        make: make.trim(),
        model: model.trim(),
        year: year.trim(),
        license_plate: licensePlate.trim(),
        color: color.trim() || null,
        trim: trim.trim() || null,
        is_primary: true,
      });

      if (error) throw error;

      // Refetch profile so completeness check updates
      await refetchProfile();
      setCurrentStep(2);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save vehicle');
    } finally {
      setLoading(false);
    }
  };

  const handleStep3Continue = async () => {
    if (!addressLine1.trim() || !city.trim() || !province.trim() || !postalCode.trim()) {
      Alert.alert('Required Fields', 'Please fill in all address fields');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          address_line1: addressLine1.trim(),
          address_line2: addressLine2.trim() || null,
          city: city.trim(),
          province: province.trim(),
          postal_code: postalCode.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error saving address:', error);
        throw error;
      }

      console.log('Address saved successfully');

      // Refetch profile first to ensure it's updated
      await refetchProfile();
      
      // Small delay to ensure database write is committed
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Now refetch completeness - this will fetch fresh data from Supabase
      // and should detect the profile is complete
      console.log('Refetching completeness...');
      await refetchCompleteness();
      
      console.log('Profile and completeness refetched. RootNavigator should navigate to MainTabs.');
      
      // The RootNavigator will automatically navigate when isComplete becomes true
      // No need to manually navigate - the conditional rendering handles it
    } catch (error) {
      console.error('Failed to save address:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      // On last step, allow user to proceed even with incomplete profile
      // The RootNavigator will show MainTabs, but onboarding will reappear on next login
      // if profile is still incomplete
      await refetchCompleteness();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep1 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Let's set up your profile</Text>
      <Text style={styles.stepSubtitle}>We need some basic information to get started</Text>

      <View style={styles.form}>
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            placeholderTextColor="rgba(198,207,217,0.5)"
            style={styles.input}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            placeholder="Enter your email"
            placeholderTextColor="rgba(198,207,217,0.5)"
            style={styles.input}
            editable={!user?.email} // Make read-only if from auth
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoComplete="tel"
            placeholder="Enter your phone number"
            placeholderTextColor="rgba(198,207,217,0.5)"
            style={styles.input}
          />
        </View>
      </View>
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Add your vehicle</Text>
      <Text style={styles.stepSubtitle}>We need at least one vehicle for booking</Text>

      <View style={styles.form}>
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Make *</Text>
          <TextInput
            value={make}
            onChangeText={setMake}
            placeholder="e.g., Toyota"
            placeholderTextColor="rgba(198,207,217,0.5)"
            style={styles.input}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Model *</Text>
          <TextInput
            value={model}
            onChangeText={setModel}
            placeholder="e.g., Camry"
            placeholderTextColor="rgba(198,207,217,0.5)"
            style={styles.input}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Year *</Text>
          <TextInput
            value={year}
            onChangeText={setYear}
            placeholder="e.g., 2023"
            placeholderTextColor="rgba(198,207,217,0.5)"
            style={styles.input}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>License Plate *</Text>
          <TextInput
            value={licensePlate}
            onChangeText={setLicensePlate}
            placeholder="e.g., ABC-1234"
            placeholderTextColor="rgba(198,207,217,0.5)"
            style={styles.input}
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Color</Text>
          <TextInput
            value={color}
            onChangeText={setColor}
            placeholder="e.g., Blue"
            placeholderTextColor="rgba(198,207,217,0.5)"
            style={styles.input}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Trim</Text>
          <TextInput
            value={trim}
            onChangeText={setTrim}
            placeholder="e.g., LE, XLE"
            placeholderTextColor="rgba(198,207,217,0.5)"
            style={styles.input}
          />
        </View>
      </View>
    </ScrollView>
  );

  const renderStep3 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Add your service address</Text>
      <Text style={styles.stepSubtitle}>Where should we provide the service?</Text>

      <View style={styles.form}>
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Address Line 1 *</Text>
          <TextInput
            value={addressLine1}
            onChangeText={setAddressLine1}
            placeholder="Street address"
            placeholderTextColor="rgba(198,207,217,0.5)"
            style={styles.input}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Address Line 2</Text>
          <TextInput
            value={addressLine2}
            onChangeText={setAddressLine2}
            placeholder="Apt, suite, etc. (optional)"
            placeholderTextColor="rgba(198,207,217,0.5)"
            style={styles.input}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>City *</Text>
          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder="Enter city"
            placeholderTextColor="rgba(198,207,217,0.5)"
            style={styles.input}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Province *</Text>
          <TextInput
            value={province}
            onChangeText={setProvince}
            placeholder="e.g., ON, BC, QC"
            placeholderTextColor="rgba(198,207,217,0.5)"
            style={styles.input}
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Postal Code *</Text>
          <TextInput
            value={postalCode}
            onChangeText={setPostalCode}
            placeholder="e.g., M5H 2N2"
            placeholderTextColor="rgba(198,207,217,0.5)"
            style={styles.input}
            autoCapitalize="characters"
          />
        </View>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          {STEPS.map((step, index) => (
            <View key={index} style={styles.progressStep}>
              <View
                style={[
                  styles.progressDot,
                  index <= currentStep && styles.progressDotActive,
                ]}
              />
              {index < STEPS.length - 1 && (
                <View
                  style={[
                    styles.progressLine,
                    index < currentStep && styles.progressLineActive,
                  ]}
                />
              )}
            </View>
          ))}
        </View>
        <Text style={styles.progressLabel}>{STEPS[currentStep].label}</Text>

        {/* Step Content */}
        {currentStep === 0 && renderStep1()}
        {currentStep === 1 && renderStep2()}
        {currentStep === 2 && renderStep3()}

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          {currentStep > 0 && (
            <TouchableOpacity
              onPress={handleBack}
              disabled={loading}
              style={[styles.button, styles.backButton]}
            >
              <Ionicons name="chevron-back" size={20} color="#C6CFD9" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              onPress={handleSkip}
              disabled={loading}
              style={[styles.button, styles.skipButton]}
            >
              <Text style={styles.skipButtonText}>Skip for now</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={
                currentStep === 0
                  ? handleStep1Continue
                  : currentStep === 1
                  ? handleStep2Continue
                  : handleStep3Continue
              }
              disabled={loading}
              style={[styles.button, styles.continueButton]}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.continueButtonText}>Continue</Text>
                  <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                </>
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
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(198,207,217,0.3)',
  },
  progressDotActive: {
    backgroundColor: '#1DA4F3',
  },
  progressLine: {
    width: 60,
    height: 2,
    backgroundColor: 'rgba(198,207,217,0.3)',
    marginHorizontal: 8,
  },
  progressLineActive: {
    backgroundColor: '#1DA4F3',
  },
  progressLabel: {
    color: '#C6CFD9',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  stepTitle: {
    color: '#F5F7FA',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  stepSubtitle: {
    color: '#C6CFD9',
    fontSize: 16,
    marginBottom: 32,
  },
  form: {
    gap: 20,
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
    justifyContent: 'flex-end',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 28,
    minHeight: 56,
    gap: 8,
  },
  backButton: {
    backgroundColor: '#0A1A2F',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  backButtonText: {
    color: '#C6CFD9',
    fontSize: 16,
    fontWeight: '500',
  },
  skipButton: {
    backgroundColor: 'transparent',
  },
  skipButtonText: {
    color: '#C6CFD9',
    fontSize: 16,
    fontWeight: '500',
  },
  continueButton: {
    backgroundColor: '#1DA4F3',
    flex: 1,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

