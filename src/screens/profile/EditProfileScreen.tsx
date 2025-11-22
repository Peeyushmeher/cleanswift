import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/ProfileStack';
import { COLORS } from '../../theme/colors';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

export default function EditProfileScreen({ navigation }: Props) {
  const [name, setName] = useState('Peeyush Yerremsetty');
  const [email, setEmail] = useState('meherpeeyush@gmail.com');
  const [phone, setPhone] = useState('437-989-6480');

  const isFormValid = name.length > 0 && email.length > 0 && phone.length > 0;

  const handleSave = () => {
    // TODO: Implement save logic
    console.log('Save profile changes');
    navigation.goBack();
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
                <Ionicons name="person" size={48} color={COLORS.accent.mint} />
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.cameraButton}
              >
                <Ionicons name="camera" size={16} color={COLORS.bg.primary} />
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
                placeholderTextColor={COLORS.text.disabled}
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
                placeholderTextColor={COLORS.text.disabled}
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
                placeholderTextColor={COLORS.text.disabled}
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
        <View style={styles.bottomCTA}>
          <TouchableOpacity
            onPress={handleSave}
            disabled={!isFormValid}
            activeOpacity={isFormValid ? 0.8 : 1}
            style={[
              styles.saveButton,
              !isFormValid && styles.saveButtonDisabled,
            ]}
          >
            <Text
              style={[
                styles.saveButtonText,
                !isFormValid && styles.saveButtonTextDisabled,
              ]}
            >
              Save Changes
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
    backgroundColor: COLORS.accentBg.blue15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border.accentMint,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accent.mint,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadow.default,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  photoHint: {
    color: COLORS.text.secondary,
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
    color: COLORS.text.secondary,
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 4,
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
  dangerZone: {
    marginTop: 48,
    paddingTop: 32,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
  },
  deleteText: {
    color: COLORS.text.secondary,
    fontSize: 14,
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
