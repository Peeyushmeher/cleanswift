import { useState, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps, useNavigation } from '@react-navigation/native';
import { BookingStackParamList } from '../../navigation/BookingStack';
import { useBooking } from '../../contexts/BookingContext';
import { useDetailers } from '../../hooks/useDetailers';

type Props = NativeStackScreenProps<BookingStackParamList, 'ChooseDetailer'>;

export default function ChooseDetailerScreen({ navigation, route }: Props) {
  const { setDetailer } = useBooking();
  const parentNavigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { data: detailers, loading, error } = useDetailers();
  const [selectedDetailerId, setSelectedDetailerId] = useState<string>('');

  useLayoutEffect(() => {
    const parent = parentNavigation.getParent();
    if (parent) {
      parent.setOptions({
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
      });
    }
  }, [parentNavigation]);

  const handleContinue = () => {
    if (!selectedDetailerId) return;

    // Find selected detailer (data now comes from Supabase with real UUIDs)
    const selectedDetailerData = detailers.find(d => d.id === selectedDetailerId);
    if (!selectedDetailerData) return;

    // Update BookingContext - data already matches Detailer type
    setDetailer(selectedDetailerData);

    // Navigate to next screen
    navigation.navigate('OrderSummary', {
      selectedService: route.params.selectedService,
      selectedAddons: route.params.selectedAddons,
      date: route.params.date,
      time: route.params.time,
      detailerId: selectedDetailerId,
    });
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
          <Text style={styles.headerTitle}>Choose Your Detailer</Text>
        </View>

        {/* Loading State */}
        {loading && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#6FF0C4" />
            <Text style={styles.loadingText}>Loading detailers...</Text>
          </View>
        )}

        {/* Error State */}
        {error && !loading && (
          <View style={[styles.centerContainer, styles.errorContainer]}>
            <Ionicons name="alert-circle" size={64} color="#FF6B6B" />
            <Text style={styles.errorTitle}>Unable to load detailers</Text>
            <Text style={styles.errorMessage}>{error.message}</Text>
          </View>
        )}

        {/* Scrollable Content */}
        {!loading && !error && (
          <>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.detailersList}>
                {detailers.map((detailer) => {
              const isSelected = selectedDetailerId === detailer.id;

              return (
                <TouchableOpacity
                  key={detailer.id}
                  onPress={() => setSelectedDetailerId(detailer.id)}
                  activeOpacity={isSelected ? 1 : 0.8}
                  style={[
                    styles.detailerCard,
                    isSelected && styles.detailerCardSelected,
                  ]}
                >
                  {/* Selection Checkmark */}
                  {isSelected && (
                    <View style={styles.checkmark}>
                      <Ionicons name="checkmark" size={16} color="#050B12" />
                    </View>
                  )}

                  <View style={styles.detailerCardContent}>
                    {/* Profile Photo */}
                    <View style={styles.profileContainer}>
                      <View style={[
                        styles.profileAvatar,
                        isSelected && styles.profileAvatarSelected,
                      ]}>
                        <Text style={styles.profileInitials}>
                          {detailer.full_name.split(' ').map(n => n[0]).join('')}
                        </Text>
                      </View>
                    </View>

                    {/* Details */}
                    <View style={styles.detailerDetails}>
                      {/* Name */}
                      <Text style={styles.detailerName}>{detailer.full_name}</Text>

                      {/* Rating */}
                      <View style={styles.ratingRow}>
                        <View style={styles.ratingContainer}>
                          <Ionicons name="star" size={16} color="#6FF0C4" />
                          <Text style={styles.ratingText}>{detailer.rating}</Text>
                        </View>
                        <Text style={styles.reviewsText}>({detailer.review_count} reviews)</Text>
                      </View>

                      {/* Distance & ETA */}
                      <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                          <Ionicons name="location" size={16} color="#C6CFD9" />
                          <Text style={styles.infoText}>N/A</Text>
                          {/* TODO: Replace with real distance when geolocation is implemented */}
                        </View>
                        <View style={styles.infoItem}>
                          <Ionicons name="time" size={16} color="#1DA4F3" />
                          <Text style={styles.etaText}>Estimated arrival: Calculating...</Text>
                          {/* TODO: Replace with real ETA when geolocation is implemented */}
                        </View>
                      </View>

                      {/* Experience Badge */}
                      <View style={styles.experienceBadge}>
                        <Text style={styles.experienceText}>{detailer.years_experience}+ years experience</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Bottom CTA */}
        <View style={[styles.bottomCTA, { bottom: Math.max(insets.bottom, 8) + 68 }]}>
          <View style={styles.buttonSafeArea}>
          <TouchableOpacity
            onPress={handleContinue}
            disabled={!selectedDetailerId}
            activeOpacity={selectedDetailerId ? 0.8 : 1}
            style={[
              styles.continueButton,
              !selectedDetailerId && styles.continueButtonDisabled,
            ]}
          >
            <Text style={[
              styles.continueButtonText,
              !selectedDetailerId && styles.continueButtonTextDisabled,
            ]}>
              Continue
            </Text>
          </TouchableOpacity>
          </View>
        </View>
        </>
        )}
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
  },
  backButton: {
    padding: 4,
    marginRight: 16,
  },
  headerTitle: {
    color: '#F5F7FA',
    fontSize: 28,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    paddingHorizontal: 24,
  },
  loadingText: {
    color: '#C6CFD9',
    fontSize: 16,
    marginTop: 16,
  },
  errorTitle: {
    color: '#F5F7FA',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  errorMessage: {
    color: '#C6CFD9',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  detailersList: {
  },
  detailerCard: {
    width: '100%',
    backgroundColor: '#0A1A2F',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    position: 'relative',
    marginBottom: 16,
  },
  detailerCardSelected: {
    borderWidth: 2,
    borderColor: '#6FF0C4',
    shadowColor: '#6FF0C4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  checkmark: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6FF0C4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailerCardContent: {
    flexDirection: 'row',
  },
  profileContainer: {
    marginRight: 16,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(29,164,243,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarSelected: {
    borderWidth: 2,
    borderColor: '#6FF0C4',
  },
  profileInitials: {
    color: '#F5F7FA',
    fontSize: 24,
    fontWeight: '600',
  },
  detailerDetails: {
    flex: 1,
  },
  detailerName: {
    color: '#F5F7FA',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  ratingText: {
    color: '#F5F7FA',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 4,
  },
  reviewsText: {
    color: '#C6CFD9',
    fontSize: 14,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    color: '#C6CFD9',
    fontSize: 14,
    marginLeft: 8,
  },
  etaText: {
    color: '#1DA4F3',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  experienceBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#050B12',
    borderRadius: 999,
    marginTop: 12,
  },
  experienceText: {
    color: '#C6CFD9',
    fontSize: 12,
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
  continueButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 56,
    backgroundColor: '#1DA4F3',
    shadowColor: '#1DA4F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonDisabled: {
    backgroundColor: '#0A1A2F',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  continueButtonTextDisabled: {
    color: 'rgba(198,207,217,0.5)',
  },
});
