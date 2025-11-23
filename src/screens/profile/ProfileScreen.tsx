import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { ProfileStackParamList } from '../../navigation/ProfileStack';
import { useUserProfile } from '../../hooks/useUserProfile';
import type { MainTabsParamList } from '../../navigation/MainTabs';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Profile'>;
type TabsNav = BottomTabNavigationProp<MainTabsParamList>;

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

export default function ProfileScreen({ navigation }: Props) {
  const { profile } = useUserProfile();
  const tabsNavigation = useNavigation<TabsNav>();

  const handleAction = (action: string) => {
    switch (action) {
      case 'edit-profile':
        navigation.navigate('EditProfile');
        break;
      case 'manage-cars':
        navigation.navigate('SelectCar');
        break;
      case 'payment':
        // TODO: Navigate to payment methods screen when implemented
        console.log('Navigate to payment methods');
        break;
      case 'notifications':
        navigation.navigate('Notifications');
        break;
      case 'settings':
        // TODO: Navigate to settings screen when implemented
        console.log('Navigate to settings');
        break;
      case 'support':
        navigation.navigate('HelpSupport');
        break;
    }
  };

  const handleOrders = () => {
    // @ts-ignore - Navigate to different tab stack
    navigation.navigate('Orders');
  };

  const handleLogout = () => {
    // TODO: Implement logout logic
    console.log('Logout');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header with Profile */}
        <View style={styles.profileHeader}>
          <View style={styles.profileRow}>
            {/* Profile Photo */}
            <View style={styles.profileAvatar}>
              <Ionicons name="person" size={40} color="#6FF0C4" />
            </View>

            {/* User Info */}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>Peeyush Yerremsetty</Text>
              <Text style={styles.userEmail}>meherpeeyush@gmail.com</Text>
              <Text style={styles.userPhone}>437-989-6480</Text>
            </View>

            {/* Edit Button */}
            <TouchableOpacity
              onPress={() => navigation.navigate('EditProfile')}
              activeOpacity={0.7}
              style={styles.editButton}
            >
              <Ionicons name="settings" size={20} color="#6FF0C4" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Scrollable Menu */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Quick Order Link */}
          <View style={styles.ordersSection}>
            <TouchableOpacity
              onPress={handleOrders}
              activeOpacity={0.8}
              style={styles.ordersCard}
            >
              <View style={styles.ordersIconContainer}>
                <Ionicons name="cube" size={24} color="#1DA4F3" />
              </View>
              <View style={styles.ordersContent}>
                <Text style={styles.ordersTitle}>Your Orders</Text>
                <Text style={styles.ordersSubtitle}>View booking history & receipts</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#C6CFD9" />
            </TouchableOpacity>
          </View>

          {menuSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.menuSection}>
              {/* Section Title */}
              <Text style={styles.sectionTitle}>
                {section.title.toUpperCase()}
              </Text>

              {/* Menu Items */}
              <View style={styles.menuCard}>
                {section.items.map((item, itemIndex) => {
                  const isLast = itemIndex === section.items.length - 1;

                  return (
                    <TouchableOpacity
                      key={itemIndex}
                      onPress={() => handleAction(item.action)}
                      activeOpacity={0.8}
                      style={[
                        styles.menuItem,
                        !isLast && styles.menuItemWithBorder,
                      ]}
                    >
                      <Ionicons name={item.icon} size={20} color="#C6CFD9" />
                      <Text style={styles.menuItemLabel}>{item.label}</Text>
                      <Ionicons name="chevron-forward" size={20} color="#C6CFD9" />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.8}
            style={styles.logoutButton}
          >
            <Ionicons name="log-out" size={20} color="#C6CFD9" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
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
  profileHeader: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(29,164,243,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(111,240,196,0.4)',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#F5F7FA',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 6,
  },
  userEmail: {
    color: '#C6CFD9',
    fontSize: 15,
    marginBottom: 4,
  },
  userPhone: {
    color: '#C6CFD9',
    fontSize: 15,
  },
  editButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  ordersSection: {
    marginBottom: 32,
  },
  ordersCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A1A2F',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 16,
  },
  ordersIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(29,164,243,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ordersContent: {
    flex: 1,
  },
  ordersTitle: {
    color: '#F5F7FA',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  ordersSubtitle: {
    color: '#C6CFD9',
    fontSize: 14,
  },
  menuSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#C6CFD9',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  menuCard: {
    backgroundColor: '#0A1A2F',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
    paddingHorizontal: 24,
    paddingVertical: 18,
    gap: 16,
  },
  menuItemWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(198,207,217,0.1)',
  },
  menuItemLabel: {
    flex: 1,
    color: '#F5F7FA',
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A1A2F',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 56,
    gap: 12,
  },
  logoutText: {
    color: '#C6CFD9',
    fontSize: 16,
    fontWeight: '500',
  },
});
