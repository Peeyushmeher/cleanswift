import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainTabsParamList } from '../../navigation/MainTabs';
import type { ProfileStackParamList } from '../../navigation/ProfileStack';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabsParamList, 'Home'>,
  NativeStackNavigationProp<ProfileStackParamList>
>;

const quickActions = [
  { icon: 'water' as const, label: 'Quick Wash', color: '#1DA4F3' },
  { icon: 'sparkles' as const, label: 'Full Detail', color: '#6FF0C4' },
  { icon: 'leaf' as const, label: 'Interior', color: '#1DA4F3' },
  { icon: 'star' as const, label: 'Exterior', color: '#6FF0C4' },
  { icon: 'cube' as const, label: 'Luxury Package', color: '#1DA4F3' },
];

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();

  const handleBookService = () => {
    // Navigate to the Book tab, which shows the BookingStack (ServiceSelection screen)
    navigation.navigate('Book');
  };

  const handleSelectCar = () => {
    // Navigate to Profile tab, then to SelectCar screen
    navigation.navigate('Profile', { screen: 'SelectCar' });
  };

  const handleProfile = () => {
    navigation.navigate('Profile');
  };

  const handleOrders = () => {
    navigation.navigate('Orders');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Good Morning</Text>
              <Text style={styles.title}>CleanSwift</Text>
            </View>
            <TouchableOpacity
              onPress={handleProfile}
              activeOpacity={0.8}
              style={styles.profileButton}
            >
              <Ionicons name="person" size={24} color="#6FF0C4" />
            </TouchableOpacity>
          </View>

          {/* Hero Car Card */}
          <View style={styles.carCardContainer}>
            <TouchableOpacity
              onPress={handleBookService}
              activeOpacity={0.95}
              style={styles.carCard}
            >
              {/* Car Icon */}
              <View style={styles.carIconContainer}>
                <Ionicons name="car-sport" size={64} color="#6FF0C4" />
                <View style={styles.carIconGlow} />
              </View>

              {/* Car Info */}
              <View style={styles.carInfo}>
                <Text style={styles.carName}>2022 BMW M4</Text>
                <Text style={styles.carLabel}>Primary Vehicle</Text>
              </View>

              {/* CTA Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  onPress={handleBookService}
                  activeOpacity={0.8}
                  style={styles.primaryButton}
                >
                  <Text style={styles.primaryButtonText}>Book a Wash</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSelectCar}
                  activeOpacity={0.8}
                  style={styles.secondaryButton}
                >
                  <Text style={styles.secondaryButtonText}>Change</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickActionsScroll}
            >
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={handleBookService}
                  activeOpacity={0.8}
                  style={styles.quickActionCard}
                >
                  <Ionicons
                    name={action.icon}
                    size={32}
                    color={action.color}
                    style={styles.quickActionIcon}
                  />
                  <Text style={styles.quickActionLabel}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Upcoming Bookings */}
          <View style={styles.upcomingContainer}>
            <Text style={styles.sectionTitle}>Upcoming</Text>
            <TouchableOpacity
              onPress={handleOrders}
              activeOpacity={0.8}
              style={styles.upcomingCard}
            >
              <View style={styles.upcomingIconContainer}>
                <Ionicons name="time" size={24} color="#1DA4F3" />
              </View>
              <View style={styles.upcomingContent}>
                <Text style={styles.upcomingTitle}>Full Detail Service</Text>
                <Text style={styles.upcomingSubtitle}>Tomorrow, 2:00 PM</Text>
              </View>
            </TouchableOpacity>
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  greeting: {
    color: '#C6CFD9',
    fontSize: 14,
    marginBottom: 10,
  },
  title: {
    color: '#F5F7FA',
    fontSize: 28,
    fontWeight: '600',
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(111, 240, 196, 0.4)',
    backgroundColor: 'rgba(111, 240, 196, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6FF0C4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  carCardContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  carCard: {
    width: '100%',
    backgroundColor: '#0A1A2F',
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 40,
    elevation: 10,
  },
  carIconContainer: {
    marginBottom: 24,
    position: 'relative',
    alignItems: 'center',
  },
  carIconGlow: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6FF0C4',
    opacity: 0.2,
  },
  carInfo: {
    marginBottom: 24,
  },
  carName: {
    color: '#F5F7FA',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 6,
  },
  carLabel: {
    color: '#C6CFD9',
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#1DA4F3',
    paddingVertical: 16,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 48,
    marginRight: 6,
    shadowColor: '#1DA4F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingHorizontal: 28,
    backgroundColor: '#0A1A2F',
    borderWidth: 1,
    borderColor: 'rgba(198, 207, 217, 0.2)',
    paddingVertical: 16,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 48,
    marginLeft: 6,
  },
  secondaryButtonText: {
    color: '#F5F7FA',
    fontSize: 15,
    fontWeight: '600',
  },
  quickActionsContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#F5F7FA',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  quickActionsScroll: {
    paddingRight: 24,
  },
  quickActionCard: {
    width: 128,
    backgroundColor: '#0A1A2F',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    marginRight: 12,
  },
  quickActionIcon: {
    marginBottom: 14,
  },
  quickActionLabel: {
    color: '#C6CFD9',
    fontSize: 13,
    textAlign: 'center',
  },
  upcomingContainer: {
    paddingHorizontal: 24,
    marginBottom: 96,
  },
  upcomingCard: {
    backgroundColor: '#0A1A2F',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(29, 164, 243, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#1DA4F3',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  },
  upcomingIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(29, 164, 243, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  upcomingContent: {
    flex: 1,
  },
  upcomingTitle: {
    color: '#F5F7FA',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6,
  },
  upcomingSubtitle: {
    color: '#C6CFD9',
    fontSize: 14,
  },
});
