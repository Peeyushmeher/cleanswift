import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/ProfileStack';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

export default function EditProfileScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { profile } = useUserProfile();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.full_name || '');
      setEmail(profile.email || user?.email || '');
      setPhone(profile.phone || '');
    }
  }, [profile, user]);

  const isFormValid = name.length > 0 && email.length > 0 && phone.length > 0;

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to update your profile');
      return;
    }

    if (!isFormValid) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: name,
          email: email,
          phone: phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      Alert.alert('Success', 'Profile updated successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
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
            <Ionicons name="chevron-back" size={24} color="#C6CFD9" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
        </View>

        {/* Form - Scrollable */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Photo */}
          <View style={styles.photoSection}>
            <View style={styles.photoContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={48} color="#6FF0C4" />
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.cameraButton}
              >
                <Ionicons name="camera" size={16} color="#050B12" />
              </TouchableOpacity>
            </View>
            <Text style={styles.photoHint}>Tap to change photo</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formFields}>
            {/* Full Name */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholderTextColor="rgba(198,207,217,0.5)"
                style={styles.input}
              />
            </View>

            {/* Email */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                placeholderTextColor="rgba(198,207,217,0.5)"
                style={styles.input}
              />
            </View>

            {/* Phone */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoComplete="tel"
                placeholderTextColor="rgba(198,207,217,0.5)"
                style={styles.input}
              />
            </View>
          </View>

          {/* Danger Zone */}
          <View style={styles.dangerZone}>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.deleteText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Bottom CTA */}
        <View style={[styles.bottomCTA, { bottom: Math.max(insets.bottom, 8) + 68 }]}>
          <View style={styles.buttonSafeArea}>
          <TouchableOpacity
            onPress={handleSave}
            disabled={!isFormValid || loading}
            activeOpacity={isFormValid && !loading ? 0.8 : 1}
            style={[
              styles.saveButton,
              (!isFormValid || loading) && styles.saveButtonDisabled,
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text
                style={[
                  styles.saveButtonText,
                  !isFormValid && styles.saveButtonTextDisabled,
                ]}
              >
                Save Changes
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
  photoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  photoContainer: {
    position: 'relative',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(29,164,243,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(111,240,196,0.3)',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6FF0C4',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  photoHint: {
    color: '#C6CFD9',
    fontSize: 14,
    marginTop: 12,
  },
  formFields: {
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
  dangerZone: {
    marginTop: 48,
    paddingTop: 32,
    borderTopWidth: 1,
    borderTopColor: 'rgba(198,207,217,0.1)',
  },
  deleteText: {
    color: '#C6CFD9',
    fontSize: 14,
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
