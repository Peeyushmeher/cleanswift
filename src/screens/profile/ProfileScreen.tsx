import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProfileScreenProps {
  onEditProfile: () => void;
  onOrders: () => void;
  onManageCars?: () => void;
  onPayment: () => void;
  onNotifications: () => void;
  onSupport: () => void;
  onSettings: () => void;
  onLogout: () => void;
  onBack?: () => void;
}

const menuSections = [
  {
    title: 'Account',
    items: [
      { icon: 'person' as const, label: 'Personal Info', action: 'edit-profile' },
      { icon: 'car-sport' as const, label: 'Manage Cars', action: 'manage-cars' },
      { icon: 'card' as const, label: 'Payment Methods', action: 'payment' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { icon: 'notifications' as const, label: 'Notifications', action: 'notifications' },
      { icon: 'settings' as const, label: 'Settings', action: 'settings' },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: 'help-circle' as const, label: 'Help Center', action: 'support' },
      { icon: 'document-text' as const, label: 'Terms of Service', action: 'terms' },
      { icon: 'shield-checkmark' as const, label: 'Privacy Policy', action: 'privacy' },
    ],
  },
];

export default function ProfileScreen({
  onEditProfile,
  onOrders,
  onManageCars,
  onPayment,
  onNotifications,
  onSupport,
  onSettings,
  onLogout,
  onBack,
}: ProfileScreenProps) {
  const handleAction = (action: string) => {
    switch (action) {
      case 'edit-profile':
        onEditProfile();
        break;
      case 'manage-cars':
        onManageCars?.();
        break;
      case 'payment':
        onPayment();
        break;
      case 'notifications':
        onNotifications();
        break;
      case 'settings':
        onSettings();
        break;
      case 'support':
        onSupport();
        break;
    }
  };

  return (
    <View className="fixed inset-0 bg-gradient-to-b from-[#0A1A2F] to-[#050B12] flex flex-col">
      {/* Header with Back Button */}
      {onBack && (
        <View className="px-6 pt-16 pb-4 flex items-center gap-4" style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            onPress={onBack}
            activeOpacity={0.7}
            className="text-[#C6CFD9] hover:text-[#6FF0C4] transition-colors active:scale-95"
          >
            <Ionicons name="chevron-back" size={24} color="#C6CFD9" />
          </TouchableOpacity>
          <Text className="text-[#F5F7FA]" style={{ fontSize: 28, fontWeight: '600' }}>
            Profile
          </Text>
        </View>
      )}

      {/* Header with Profile */}
      <View className={onBack ? "px-6 pb-8" : "px-6 pt-16 pb-8"}>
        <View className="flex items-center gap-4" style={{ flexDirection: 'row' }}>
          {/* Profile Photo */}
          <View
            className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1DA4F3]/20 to-[#6FF0C4]/20 flex items-center justify-center ring-2 ring-[#6FF0C4]/40"
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: 'rgba(29,164,243,0.15)',
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 2,
              borderColor: 'rgba(111,240,196,0.4)',
            }}
          >
            <Ionicons name="person" size={40} color="#6FF0C4" />
          </View>

          {/* User Info */}
          <View className="flex-1">
            <Text className="text-[#F5F7FA] mb-1.5" style={{ fontSize: 24, fontWeight: '600' }}>
              Peeyush Yerremsetty
            </Text>
            <Text className="text-[#C6CFD9] mb-1" style={{ fontSize: 15 }}>
              meherpeeyush@gmail.com
            </Text>
            <Text className="text-[#C6CFD9]" style={{ fontSize: 15 }}>
              437-989-6480
            </Text>
          </View>

          {/* Edit Button */}
          <TouchableOpacity
            onPress={onEditProfile}
            activeOpacity={0.7}
            className="text-[#6FF0C4] hover:text-[#6FF0C4]/80 transition-colors active:scale-95"
          >
            <Ionicons name="settings" size={20} color="#6FF0C4" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Menu */}
      <ScrollView className="flex-1 px-6 pb-32" showsVerticalScrollIndicator={false}>
        {/* Quick Order Link */}
        <View className="mb-8">
          <TouchableOpacity
            onPress={onOrders}
            activeOpacity={0.8}
            className="w-full bg-[#0A1A2F] rounded-2xl border border-white/5 px-6 py-5 flex items-center gap-4 transition-all duration-200 active:bg-[#050B12] hover:border-[#6FF0C4]/30"
            style={{
              flexDirection: 'row',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.05)',
            }}
          >
            <View
              className="w-12 h-12 rounded-full bg-[#1DA4F3]/10 flex items-center justify-center flex-shrink-0"
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: 'rgba(29,164,243,0.1)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="cube" size={24} color="#1DA4F3" />
            </View>
            <View className="flex-1">
              <Text className="text-[#F5F7FA] mb-1" style={{ fontSize: 16, fontWeight: '600' }}>
                Your Orders
              </Text>
              <Text className="text-[#C6CFD9]" style={{ fontSize: 14 }}>
                View booking history & receipts
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C6CFD9" />
          </TouchableOpacity>
        </View>

        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} className="mb-8">
            {/* Section Title */}
            <Text
              className="text-[#C6CFD9] mb-4 px-1"
              style={{
                fontSize: 13,
                fontWeight: '600',
                letterSpacing: 0.8,
                textTransform: 'uppercase',
              }}
            >
              {section.title.toUpperCase()}
            </Text>

            {/* Menu Items */}
            <View
              className="bg-[#0A1A2F] rounded-2xl border border-white/5 overflow-hidden"
              style={{
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.05)',
                borderRadius: 16,
                overflow: 'hidden',
              }}
            >
              {section.items.map((item, itemIndex) => {
                const isLast = itemIndex === section.items.length - 1;

                return (
                  <TouchableOpacity
                    key={itemIndex}
                    onPress={() => handleAction(item.action)}
                    activeOpacity={0.8}
                    className={`w-full flex items-center gap-4 px-6 py-4.5 transition-all duration-200 active:bg-[#050B12] hover:bg-[#0A1A2F]/80 ${
                      !isLast ? 'border-b border-[#C6CFD9]/10' : ''
                    }`}
                    style={{
                      minHeight: 60,
                      flexDirection: 'row',
                      borderBottomWidth: isLast ? 0 : 1,
                      borderBottomColor: isLast ? 'transparent' : 'rgba(198,207,217,0.1)',
                    }}
                  >
                    <Ionicons name={item.icon} size={20} color="#C6CFD9" />
                    <Text className="flex-1 text-[#F5F7FA]" style={{ fontSize: 16, fontWeight: '500' }}>
                      {item.label}
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color="#C6CFD9" />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity
          onPress={onLogout}
          activeOpacity={0.8}
          className="w-full bg-[#0A1A2F] rounded-2xl border border-white/5 px-6 py-4 flex items-center justify-center gap-3 transition-all duration-200 active:bg-[#050B12] hover:border-red-500/30"
          style={{
            minHeight: 56,
            flexDirection: 'row',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.05)',
          }}
        >
          <Ionicons name="log-out" size={20} color="#C6CFD9" />
          <Text className="text-[#C6CFD9]" style={{ fontSize: 16, fontWeight: '500' }}>
            Log Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
