import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Constants from 'expo-constants';
import { ProfileStackParamList } from '../../navigation/ProfileStack';
import { COLORS } from '../../theme/colors';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import ChangePasswordModal from '../../components/ChangePasswordModal';
import { clearCache, downloadUserData, deleteAccount } from '../../services/settingsService';
import { useAuth } from '../../contexts/AuthContext';
// File export functionality - using clipboard as fallback since expo-file-system may not be installed

type Props = NativeStackScreenProps<ProfileStackParamList, 'Settings'>;

interface ToggleSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  locked?: boolean;
}

const ToggleSwitch = ({ enabled, locked, onPress }: { enabled: boolean; locked?: boolean; onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={locked}
    activeOpacity={locked ? 1 : 0.8}
    style={[
      styles.toggleSwitch,
      { backgroundColor: enabled ? COLORS.accent.mint : COLORS.border.emphasis },
      locked && styles.toggleSwitchLocked,
    ]}
  >
    <View
      style={[
        styles.toggleThumb,
        { transform: [{ translateX: enabled ? 24 : 4 }] },
      ]}
    />
  </TouchableOpacity>
);

const SettingsSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
    <View style={styles.sectionItems}>
      {children}
    </View>
  </View>
);

const SettingItem = ({
  icon,
  label,
  description,
  onPress,
  rightElement,
  destructive,
}: {
  icon?: string;
  label: string;
  description?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  destructive?: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={onPress ? 0.8 : 1}
    style={styles.settingItem}
    disabled={!onPress}
  >
    {icon && (
      <Ionicons
        name={icon as any}
        size={20}
        color={destructive ? COLORS.accent.error : COLORS.text.secondary}
        style={styles.settingIcon}
      />
    )}
    <View style={styles.settingContent}>
      <Text style={[styles.settingLabel, destructive && styles.settingLabelDestructive]}>
        {label}
      </Text>
      {description && (
        <Text style={styles.settingDescription}>{description}</Text>
      )}
    </View>
    {rightElement || (onPress && <Ionicons name="chevron-forward" size={20} color={COLORS.text.secondary} />)}
  </TouchableOpacity>
);

export default function SettingsScreen({ navigation }: Props) {
  const { user, signOut } = useAuth();
  const { preferences, loading: prefsLoading, updatePreferences } = useUserPreferences();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [tipPercentage, setTipPercentage] = useState<string>(preferences?.default_tip_percentage?.toString() || '15');
  const [showTipInput, setShowTipInput] = useState(false);

  const handleChangePassword = () => {
    setShowPasswordModal(true);
  };

  const handleUnitsChange = () => {
    if (!preferences) return;
    const newUnits = preferences.units === 'imperial' ? 'metric' : 'imperial';
    updatePreferences({ units: newUnits });
  };

  const handleAutoSelectDetailer = () => {
    if (!preferences) return;
    updatePreferences({ auto_select_favorite_detailer: !preferences.auto_select_favorite_detailer });
  };

  const handleTipPercentageSave = () => {
    const percentage = parseFloat(tipPercentage);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      Alert.alert('Error', 'Please enter a valid percentage between 0 and 100');
      return;
    }
    updatePreferences({ default_tip_percentage: percentage });
    setShowTipInput(false);
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data but keep your login session. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            const { error } = await clearCache();
            if (error) {
              Alert.alert('Error', error.message);
            } else {
              Alert.alert('Success', 'Cache cleared successfully');
            }
          },
        },
      ]
    );
  };

  const handleDownloadData = async () => {
    Alert.alert(
      'Download Data',
      'This will generate a JSON file with all your account data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Download',
          onPress: async () => {
            try {
              const { data, error } = await downloadUserData();
              if (error) {
                Alert.alert('Error', error.message);
                return;
              }

              if (!data) {
                Alert.alert('Error', 'No data to download');
                return;
              }

              // Show data in alert (simpler approach - can be enhanced with file system later)
              const jsonString = JSON.stringify(data, null, 2);
              Alert.alert(
                'Your Data',
                `Data exported successfully. Length: ${jsonString.length} characters.\n\nTo save: Copy the data from console logs.`,
                [
                  { text: 'OK' },
                  {
                    text: 'Copy to Console',
                    onPress: () => {
                      console.log('=== USER DATA EXPORT ===');
                      console.log(jsonString);
                      console.log('=== END USER DATA ===');
                      Alert.alert('Success', 'Data logged to console. Check your development console.');
                    },
                  },
                ]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to export data. Please try again.');
              console.error('Export error:', error);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data. This action cannot be undone.\n\nAre you sure you want to continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            // Second confirmation
            Alert.alert(
              'Final Confirmation',
              'This is your last chance. Your account will be permanently deleted.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete Forever',
                  style: 'destructive',
                  onPress: async () => {
                    const { error } = await deleteAccount();
                    if (error) {
                      Alert.alert('Error', error.message || 'Failed to delete account. Please contact support.');
                    } else {
                      // Sign out and navigate to auth
                      await signOut();
                      // Navigation will be handled by auth state change
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const buildNumber = Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode || '';

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
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Security Section */}
          <SettingsSection title="Security">
            <SettingItem
              icon="lock-closed"
              label="Change Password"
              description="Update your account password"
              onPress={handleChangePassword}
            />
            <SettingItem
              icon="shield-checkmark"
              label="Two-Factor Authentication"
              description="Coming soon"
              onPress={() => Alert.alert('Coming Soon', 'Two-factor authentication will be available in a future update.')}
            />
          </SettingsSection>

          {/* App Preferences Section */}
          <SettingsSection title="App Preferences">
            <SettingItem
              icon="language"
              label="Language"
              description="English (en)"
              onPress={() => Alert.alert('Language', 'Language selection will be available in a future update.')}
            />
            <TouchableOpacity
              style={styles.settingItem}
              activeOpacity={0.8}
              onPress={handleUnitsChange}
            >
              <Ionicons name="resize" size={20} color={COLORS.text.secondary} style={styles.settingIcon} />
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Units</Text>
                <Text style={styles.settingDescription}>
                  {preferences?.units === 'imperial' ? 'Imperial (miles, Fahrenheit)' : 'Metric (kilometers, Celsius)'}
                </Text>
              </View>
              <ToggleSwitch
                enabled={preferences?.units === 'metric'}
                onPress={handleUnitsChange}
              />
            </TouchableOpacity>
            {showTipInput ? (
              <View style={styles.settingItem}>
                <Ionicons name="cash" size={20} color={COLORS.text.secondary} style={styles.settingIcon} />
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Default Tip Percentage</Text>
                  <View style={styles.tipInputContainer}>
                    <TextInput
                      style={styles.tipInput}
                      value={tipPercentage}
                      onChangeText={setTipPercentage}
                      placeholder="15"
                      placeholderTextColor={COLORS.text.disabled}
                      keyboardType="numeric"
                      autoFocus
                    />
                    <Text style={styles.tipPercent}>%</Text>
                    <TouchableOpacity
                      onPress={handleTipPercentageSave}
                      style={styles.tipSaveButton}
                    >
                      <Text style={styles.tipSaveButtonText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setTipPercentage(preferences?.default_tip_percentage?.toString() || '15');
                        setShowTipInput(false);
                      }}
                      style={styles.tipCancelButton}
                    >
                      <Text style={styles.tipCancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ) : (
              <SettingItem
                icon="cash"
                label="Default Tip Percentage"
                description={`${preferences?.default_tip_percentage || 15}%`}
                onPress={() => {
                  setTipPercentage(preferences?.default_tip_percentage?.toString() || '15');
                  setShowTipInput(true);
                }}
              />
            )}
            <TouchableOpacity
              style={styles.settingItem}
              activeOpacity={0.8}
              onPress={handleAutoSelectDetailer}
            >
              <Ionicons name="star" size={20} color={COLORS.text.secondary} style={styles.settingIcon} />
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Auto-select Favorite Detailer</Text>
                <Text style={styles.settingDescription}>
                  Automatically select your favorite detailer when booking
                </Text>
              </View>
              <ToggleSwitch
                enabled={preferences?.auto_select_favorite_detailer || false}
                onPress={handleAutoSelectDetailer}
              />
            </TouchableOpacity>
          </SettingsSection>

          {/* Privacy & Data Section */}
          <SettingsSection title="Privacy & Data">
            <SettingItem
              icon="trash"
              label="Clear Cache"
              description="Remove cached data (keeps your login)"
              onPress={handleClearCache}
            />
            <SettingItem
              icon="download"
              label="Download My Data"
              description="Export all your account data as JSON"
              onPress={handleDownloadData}
            />
            <SettingItem
              icon="warning"
              label="Delete Account"
              description="Permanently delete your account and all data"
              onPress={handleDeleteAccount}
              destructive
            />
          </SettingsSection>

          {/* App Info Section */}
          <SettingsSection title="App Information">
            <SettingItem
              label="Version"
              description={`${appVersion}${buildNumber ? ` (Build ${buildNumber})` : ''}`}
            />
            <SettingItem
              label="About CleanSwift"
              description="Car detailing service booking app"
            />
          </SettingsSection>

          {prefsLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.accent.blue} />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Change Password Modal */}
      <ChangePasswordModal
        visible={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: COLORS.text.secondary,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionItems: {
    gap: 16,
  },
  settingItem: {
    backgroundColor: COLORS.bg.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  settingIcon: {
    marginTop: 2,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingLabelDestructive: {
    color: COLORS.accent.error,
  },
  settingDescription: {
    color: COLORS.text.secondary,
    fontSize: 14,
  },
  toggleSwitch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
  },
  toggleSwitchLocked: {
    opacity: 0.5,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  tipInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  tipInput: {
    backgroundColor: COLORS.bg.primary,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: COLORS.text.primary,
    fontSize: 16,
    minWidth: 80,
  },
  tipPercent: {
    color: COLORS.text.secondary,
    fontSize: 16,
  },
  tipSaveButton: {
    backgroundColor: COLORS.accent.blue,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tipSaveButtonText: {
    color: COLORS.text.inverse,
    fontSize: 14,
    fontWeight: '600',
  },
  tipCancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tipCancelButtonText: {
    color: COLORS.text.secondary,
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
});

