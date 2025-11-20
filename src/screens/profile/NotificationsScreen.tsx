import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NotificationsScreenProps {
  onBack: () => void;
}

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
    className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
      enabled ? 'bg-[#6FF0C4]' : 'bg-[#C6CFD9]/30'
    } ${locked ? 'opacity-50' : ''}`}
    style={{
      width: 48,
      height: 28,
      borderRadius: 14,
      backgroundColor: enabled ? '#6FF0C4' : 'rgba(198,207,217,0.3)',
      opacity: locked ? 0.5 : 1,
      justifyContent: 'center',
    }}
  >
    <View
      className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
        enabled ? 'translate-x-6' : 'translate-x-1'
      }`}
      style={{
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'white',
        transform: [{ translateX: enabled ? 24 : 4 }],
      }}
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
  <View className="mb-8">
    <Text
      className="text-[#C6CFD9] mb-3 px-1"
      style={{
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
      }}
    >
      {title.toUpperCase()}
    </Text>
    <View className="space-y-4" style={{ gap: 16 }}>
      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          onPress={() => !item.locked && onToggle(item.id)}
          activeOpacity={item.locked ? 1 : 0.8}
          disabled={item.locked}
          className="bg-[#0A1A2F] rounded-2xl p-5 border border-white/5 flex items-start justify-between gap-4 transition-all duration-200 active:bg-[#050B12]"
          style={{
            flexDirection: 'row',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.05)',
          }}
        >
          <View className="flex-1">
            <Text className="text-[#F5F7FA] mb-1" style={{ fontSize: 16, fontWeight: '500' }}>
              {item.label}
            </Text>
            <Text className="text-[#C6CFD9]" style={{ fontSize: 14 }}>
              {item.description}
            </Text>
          </View>
          <ToggleSwitch enabled={item.enabled} locked={item.locked} onPress={() => !item.locked && onToggle(item.id)} />
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

export default function NotificationsScreen({ onBack }: NotificationsScreenProps) {
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
    <View className="fixed inset-0 bg-gradient-to-b from-[#0A1A2F] to-[#050B12] flex flex-col">
      {/* Header */}
      <View className="px-6 pt-16 pb-6 flex items-center gap-4" style={{ flexDirection: 'row' }}>
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.7}
          className="text-[#C6CFD9] hover:text-[#6FF0C4] transition-colors"
        >
          <Ionicons name="chevron-back" size={24} color="#C6CFD9" />
        </TouchableOpacity>
        <Text className="text-[#F5F7FA]" style={{ fontSize: 28, fontWeight: '600' }}>
          Notifications
        </Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView className="flex-1 px-6 pb-8" showsVerticalScrollIndicator={false}>
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
    </View>
  );
}
