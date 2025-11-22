import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BookingStackParamList } from '../../navigation/BookingStack';
import { useBooking } from '../../contexts/BookingContext';
import { useDetailers } from '../../hooks/useDetailers';
import { COLORS } from '../../theme/colors';

type Props = NativeStackScreenProps<BookingStackParamList, 'ChooseDetailer'>;

export default function ChooseDetailerScreen({ navigation, route }: Props) {
  const { setDetailer } = useBooking();
  const { data: detailers, loading, error } = useDetailers();
  const [selectedDetailerId, setSelectedDetailerId] = useState<string>('');

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
            <Ionicons name="chevron-back" size={24} color={COLORS.text.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Choose Your Detailer</Text>
        </View>

        {/* Loading State */}
        {loading && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={COLORS.accent.mint} />
            <Text style={styles.loadingText}>Loading detailers...</Text>
          </View>
        )}

        {/* Error State */}
        {error && !loading && (
          <View style={[styles.centerContainer, styles.errorContainer]}>
            <Ionicons name="alert-circle" size={64} color={COLORS.accent.error} />
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
                      <Ionicons name="checkmark" size={16} color={COLORS.bg.primary} />
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
                          <Ionicons name="star" size={16} color={COLORS.accent.mint} />
                          <Text style={styles.ratingText}>{detailer.rating}</Text>
                        </View>
                        <Text style={styles.reviewsText}>({detailer.review_count} reviews)</Text>
                      </View>

                      {/* Distance & ETA */}
                      <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                          <Ionicons name="location" size={16} color={COLORS.text.secondary} />
                          <Text style={styles.infoText}>N/A</Text>
                          {/* TODO: Replace with real distance when geolocation is implemented */}
                        </View>
                        <View style={styles.infoItem}>
                          <Ionicons name="time" size={16} color={COLORS.accent.blue} />
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
        <View style={styles.bottomCTA}>
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
        </>
        )}
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
  },
  backButton: {
    padding: 4,
    marginRight: 16,
  },
  headerTitle: {
    color: COLORS.text.primary,
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
    color: COLORS.text.secondary,
    fontSize: 16,
    marginTop: 16,
  },
  errorTitle: {
    color: COLORS.text.primary,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  errorMessage: {
    color: COLORS.text.secondary,
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
    backgroundColor: COLORS.bg.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    position: 'relative',
    marginBottom: 16,
  },
  detailerCardSelected: {
    borderWidth: 2,
    borderColor: COLORS.accent.mint,
    shadowColor: COLORS.shadow.mint,
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
    backgroundColor: COLORS.accent.mint,
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
    backgroundColor: COLORS.accentBg.blue15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarSelected: {
    borderWidth: 2,
    borderColor: COLORS.accent.mint,
  },
  profileInitials: {
    color: COLORS.text.primary,
    fontSize: 24,
    fontWeight: '600',
  },
  detailerDetails: {
    flex: 1,
  },
  detailerName: {
    color: COLORS.text.primary,
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
    color: COLORS.text.primary,
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 4,
  },
  reviewsText: {
    color: COLORS.text.secondary,
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
    color: COLORS.text.secondary,
    fontSize: 14,
    marginLeft: 8,
  },
  etaText: {
    color: COLORS.accent.blue,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  experienceBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: COLORS.bg.primary,
    borderRadius: 999,
    marginTop: 12,
  },
  experienceText: {
    color: COLORS.text.secondary,
    fontSize: 12,
  },
  bottomCTA: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    backgroundColor: COLORS.bg.primary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.subtle,
  },
  continueButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 56,
    backgroundColor: COLORS.accent.blue,
    shadowColor: COLORS.shadow.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonDisabled: {
    backgroundColor: COLORS.bg.surface,
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    color: COLORS.text.inverse,
    fontSize: 17,
    fontWeight: '600',
  },
  continueButtonTextDisabled: {
    color: COLORS.text.disabled,
  },
});
