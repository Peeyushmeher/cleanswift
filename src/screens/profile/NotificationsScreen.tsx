import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/ProfileStack';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Notifications'>;

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
      { backgroundColor: enabled ? '#6FF0C4' : 'rgba(198,207,217,0.3)' },
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
  items,
  onToggle,
}: {
  title: string;
  items: ToggleSetting[];
  onToggle: (id: string) => void;
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
    <View style={styles.sectionItems}>
      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          onPress={() => !item.locked && onToggle(item.id)}
          activeOpacity={item.locked ? 1 : 0.8}
          disabled={item.locked}
          style={styles.settingItem}
        >
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>{item.label}</Text>
            <Text style={styles.settingDescription}>{item.description}</Text>
          </View>
          <ToggleSwitch enabled={item.enabled} locked={item.locked} onPress={() => !item.locked && onToggle(item.id)} />
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

export default function NotificationsScreen({ navigation }: Props) {
  const [settings, setSettings] = useState<ToggleSetting[]>([
    { id: 'push', label: 'Push Notifications', description: 'Receive updates about your bookings', enabled: true },
    { id: 'sms', label: 'SMS Notifications', description: 'Get text messages for important updates', enabled: true },
    { id: 'email', label: 'Email Notifications', description: 'Receive booking confirmations via email', enabled: false },
  ]);

  const [serviceUpdates, setServiceUpdates] = useState<ToggleSetting[]>([
    { id: 'booking', label: 'Booking Confirmations', description: 'Confirmation when you book a service', enabled: true },
    { id: 'ontheway', label: 'Detailer On The Way', description: 'When your detailer is approaching', enabled: true },
    { id: 'arrival', label: 'Arrival Alerts', description: 'When your detailer has arrived', enabled: true },
    { id: 'status', label: 'Cleaning Status Updates', description: 'Progress updates during service', enabled: true },
    { id: 'complete', label: 'Completion Notifications', description: 'When your service is complete', enabled: true },
  ]);

  const [reminders, setReminders] = useState<ToggleSetting[]>([
    { id: 'upcoming', label: 'Upcoming Appointment Reminders', description: 'Notifies you 30 minutes before', enabled: true },
    { id: 'maintenance', label: 'Maintenance Suggestions', description: 'Helpful car care tips', enabled: false },
  ]);

  const [promotional, setPromotional] = useState<ToggleSetting[]>([
    { id: 'offers', label: 'Special Offers', description: 'Exclusive deals and promotions', enabled: false },
    { id: 'discounts', label: 'Discount Announcements', description: 'Seasonal savings alerts', enabled: false },
  ]);

  const [system, setSystem] = useState<ToggleSetting[]>([
    { id: 'security', label: 'Account Security Alerts', description: 'You will always receive security notifications', enabled: true, locked: true },
    { id: 'payment', label: 'Payment Status Notifications', description: 'You will always receive payment confirmations', enabled: true, locked: true },
  ]);

  const toggleSetting = (
    settingsArray: ToggleSetting[],
    setSettingsArray: React.Dispatch<React.SetStateAction<ToggleSetting[]>>,
    id: string
  ) => {
    setSettingsArray(
      settingsArray.map((item) =>
        item.id === id && !item.locked ? { ...item, enabled: !item.enabled } : item
      )
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
            <Ionicons name="chevron-back" size={24} color="#C6CFD9" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <SettingsSection
            title="General"
            items={settings}
            onToggle={(id) => toggleSetting(settings, setSettings, id)}
          />

          <SettingsSection
            title="Service Updates"
            items={serviceUpdates}
            onToggle={(id) => toggleSetting(serviceUpdates, setServiceUpdates, id)}
          />

          <SettingsSection
            title="Reminders"
            items={reminders}
            onToggle={(id) => toggleSetting(reminders, setReminders, id)}
          />

          <SettingsSection
            title="Promotions"
            items={promotional}
            onToggle={(id) => toggleSetting(promotional, setPromotional, id)}
          />

          <SettingsSection
            title="System"
            items={system}
            onToggle={(id) => toggleSetting(system, setSystem, id)}
          />
        </ScrollView>
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
    paddingBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#C6CFD9',
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
    backgroundColor: '#0A1A2F',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    color: '#F5F7FA',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    color: '#C6CFD9',
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
});
