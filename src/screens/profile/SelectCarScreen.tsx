import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/ProfileStack';
import { useBooking } from '../../contexts/BookingContext';
import { useCars } from '../../hooks/useCars';
import type { Car } from '../../types/domain';
import { COLORS } from '../../theme/colors';

type Props = NativeStackScreenProps<ProfileStackParamList, 'SelectCar'>;

export default function SelectCarScreen({ navigation, route }: Props) {
  const { selectedCar, setCar } = useBooking();
  const { data: cars, loading, error, refetch } = useCars();
  const [localSelectedCarId, setLocalSelectedCarId] = useState<string | null>(
    selectedCar?.id || null
  );

  // Sync local selection with context on mount
  useEffect(() => {
    if (selectedCar) {
      setLocalSelectedCarId(selectedCar.id);
    }
  }, [selectedCar]);

  const handleCarSelect = (car: Car) => {
    setLocalSelectedCarId(car.id);
  };

  const handleContinue = () => {
    // Find the selected car
    const selected = cars.find(c => c.id === localSelectedCarId);
    if (!selected) return;

    // Update BookingContext
    setCar(selected);

    // Determine navigation destination
    const returnTo = route.params?.returnTo;

    if (returnTo === 'OrderSummary') {
      // Cross-stack navigation: Return to BookingStack → OrderSummary
      navigation.getParent()?.getParent()?.navigate('Book', {
        screen: 'OrderSummary',
        params: route.params?.originalParams || {},
      });
    } else {
      // Normal flow: just go back to previous screen
      navigation.goBack();
    }
  };

  const handleAddCar = () => {
    navigation.navigate('AddCar');
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
          <Text style={styles.headerTitle}>Select Your Car</Text>
        </View>

        {/* Loading State */}
        {loading && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={COLORS.accent.mint} />
            <Text style={styles.loadingText}>Loading your vehicles...</Text>
          </View>
        )}

        {/* Error State */}
        {error && !loading && (
          <View style={[styles.centerContainer, styles.errorContainer]}>
            <Ionicons name="alert-circle" size={64} color={COLORS.accent.error} />
            <Text style={styles.errorTitle}>Unable to load vehicles</Text>
            <Text style={styles.errorMessage}>{error.message}</Text>
            <TouchableOpacity onPress={refetch} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Scrollable Content */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* No Cars State */}
              {cars.length === 0 && (
                <View style={styles.emptyState}>
                  <Ionicons name="car-sport-outline" size={80} color={COLORS.text.disabledAlt} />
                  <Text style={styles.emptyTitle}>No vehicles yet</Text>
                  <Text style={styles.emptyMessage}>
                    Add your first vehicle to start booking services
                  </Text>
                  <TouchableOpacity onPress={handleAddCar} style={styles.emptyButton}>
                    <Text style={styles.emptyButtonText}>Add a Car</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Vehicle Cards */}
              {cars.length > 0 && (
                <View style={styles.cardsContainer}>
                  {cars.map((car) => {
                    const isSelected = localSelectedCarId === car.id;

                    return (
                      <TouchableOpacity
                        key={car.id}
                        onPress={() => handleCarSelect(car)}
                        activeOpacity={isSelected ? 1 : 0.8}
                        style={[
                          styles.carCard,
                          isSelected && styles.carCardSelected,
                        ]}
                      >
                        {/* Selection Checkmark */}
                        {isSelected && (
                          <View style={styles.checkmarkContainer}>
                            <Ionicons name="checkmark" size={16} color={COLORS.bg.primary} />
                          </View>
                        )}

                        {/* Primary Badge */}
                        {car.is_primary && (
                          <View style={styles.primaryBadge}>
                            <Text style={styles.primaryBadgeText}>Primary</Text>
                          </View>
                        )}

                        {/* Car Icon */}
                        <View style={styles.carIconContainer}>
                          <Ionicons
                            name="car-sport"
                            size={56}
                            color={isSelected ? COLORS.accent.mint : COLORS.accent.blue}
                          />
                        </View>

                        {/* Car Info */}
                        <View>
                          <Text style={styles.carModel}>
                            {car.year} {car.make} {car.model}
                          </Text>
                          <View style={styles.carDetailsContainer}>
                            {car.trim && (
                              <Text style={styles.carDetail}>{car.trim}</Text>
                            )}
                            <Text style={styles.carDetail}>
                              License: {car.license_plate}
                            </Text>
                            {car.color && (
                              <Text style={styles.carDetail}>{car.color}</Text>
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Add Car Card */}
              {cars.length > 0 && (
                <TouchableOpacity
                  onPress={handleAddCar}
                  activeOpacity={0.8}
                  style={styles.addCarCard}
                >
                  <View style={styles.addCarContent}>
                    <View style={styles.addCarIconContainer}>
                      <Ionicons name="add" size={32} color={COLORS.accent.mint} />
                    </View>
                    <Text style={styles.addCarText}>Add Another Car</Text>
                  </View>
                </TouchableOpacity>
              )}
            </ScrollView>

            {/* Bottom CTA */}
            {cars.length > 0 && (
              <View style={styles.bottomCTA}>
                <TouchableOpacity
                  onPress={handleContinue}
                  disabled={!localSelectedCarId}
                  activeOpacity={localSelectedCarId ? 0.8 : 1}
                  style={[
                    styles.continueButton,
                    !localSelectedCarId && styles.continueButtonDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.continueButtonText,
                      !localSelectedCarId && styles.continueButtonTextDisabled,
                    ]}
                  >
                    {route.params?.returnTo === 'OrderSummary' ? 'Update Car' : 'Continue'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.text.secondary,
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    paddingHorizontal: 24,
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
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: COLORS.accent.blue,
    borderRadius: 16,
  },
  retryButtonText: {
    color: COLORS.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    color: COLORS.text.primary,
    fontSize: 24,
    fontWeight: '600',
    marginTop: 24,
  },
  emptyMessage: {
    color: COLORS.text.secondary,
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  emptyButton: {
    marginTop: 32,
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: COLORS.accent.blue,
    borderRadius: 24,
  },
  emptyButtonText: {
    color: COLORS.text.inverse,
    fontSize: 17,
    fontWeight: '600',
  },
  cardsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  carCard: {
    width: '100%',
    backgroundColor: COLORS.bg.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    position: 'relative',
  },
  carCardSelected: {
    borderWidth: 2,
    borderColor: COLORS.accent.mint,
    shadowColor: COLORS.shadow.mint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 24,
    right: 24,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.accent.mint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBadge: {
    position: 'absolute',
    top: 24,
    left: 24,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: COLORS.accentBg.blue20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.accent.blue,
  },
  primaryBadgeText: {
    color: COLORS.accent.blue,
    fontSize: 12,
    fontWeight: '600',
  },
  carIconContainer: {
    marginBottom: 24,
    marginTop: 16,
  },
  carModel: {
    color: COLORS.text.primary,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  carDetailsContainer: {
    gap: 6,
  },
  carDetail: {
    color: COLORS.text.secondary,
    fontSize: 14,
  },
  addCarCard: {
    width: '100%',
    backgroundColor: COLORS.bg.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    borderColor: COLORS.accentBg.mint40,
    borderStyle: 'dashed',
  },
  addCarContent: {
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
  },
  addCarIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.accentBg.mint10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCarText: {
    color: COLORS.accent.mint,
    fontSize: 17,
    fontWeight: '600',
  },
  bottomCTA: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
    backgroundColor: COLORS.bg.primary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.subtle,
  },
  continueButton: {
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
  continueButtonDisabled: {
    backgroundColor: COLORS.bg.surfaceDisabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    color: COLORS.text.inverse,
    fontSize: 17,
    fontWeight: '600',
  },
  continueButtonTextDisabled: {
    color: COLORS.text.disabledAlt,
  },
});
