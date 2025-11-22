import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BookingStackParamList } from '../../navigation/BookingStack';
import { useServices } from '../../hooks/useServices';
import { useServiceAddons } from '../../hooks/useServiceAddons';
import { useBooking } from '../../contexts/BookingContext';
import { COLORS } from '../../theme/colors';

type Props = NativeStackScreenProps<BookingStackParamList, 'ServiceSelection'>;

// Map service names to icons
const getServiceIcon = (serviceName: string): keyof typeof Ionicons.glyphMap => {
  const name = serviceName.toLowerCase();
  if (name.includes('quick')) return 'water';
  if (name.includes('exterior')) return 'star';
  if (name.includes('full')) return 'sparkles';
  if (name.includes('luxury')) return 'trophy';
  return 'sparkles'; // default
};

export default function ServiceSelectionScreen({ navigation }: Props) {
  const { data: services, loading: servicesLoading, error: servicesError } = useServices();
  const { data: addons, loading: addonsLoading, error: addonsError } = useServiceAddons();
  const { setService, setAddons } = useBooking();

  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);

  const toggleAddOn = (id: string) => {
    setSelectedAddonIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    // Find selected service and addons from data
    const selectedServiceData = services.find(s => s.id === selectedServiceId);
    const selectedAddonsData = addons.filter(a => selectedAddonIds.includes(a.id));

    if (!selectedServiceData) return;

    // Update BookingContext
    setService(selectedServiceData);
    setAddons(selectedAddonsData);

    // Navigate to next screen with IDs
    navigation.navigate('BookingDateTime', {
      selectedService: selectedServiceId,
      selectedAddons: selectedAddonIds,
    });
  };

  const loading = servicesLoading || addonsLoading;
  const error = servicesError || addonsError;

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
          <Text style={styles.headerTitle}>Select a Service</Text>
      </View>

      {/* Loading State */}
      {loading && (
          <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.accent.mint} />
            <Text style={styles.loadingText}>Loading services...</Text>
        </View>
      )}

      {/* Error State */}
      {error && !loading && (
          <View style={[styles.centerContainer, styles.errorContainer]}>
          <Ionicons name="alert-circle" size={64} color={COLORS.accent.error} />
            <Text style={styles.errorTitle}>Unable to load services</Text>
            <Text style={styles.errorMessage}>{error.message}</Text>
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
            {/* Service Cards */}
              <View style={styles.servicesContainer}>
              {services.map((service) => {
                const isSelected = selectedServiceId === service.id;
                const icon = getServiceIcon(service.name);

                return (
                  <TouchableOpacity
                    key={service.id}
                    onPress={() => setSelectedServiceId(service.id)}
                    activeOpacity={isSelected ? 1 : 0.8}
                      style={[
                        styles.serviceCard,
                        isSelected && styles.serviceCardSelected
                      ]}
                  >
                    {/* Selection Checkmark */}
                    {isSelected && (
                        <View style={styles.checkmark}>
                        <Ionicons name="checkmark" size={16} color={COLORS.bg.primary} />
                      </View>
                    )}

                      <View style={styles.serviceCardContent}>
                      {/* Icon */}
                        <View style={styles.serviceIconContainer}>
                          <Ionicons
                            name={icon}
                            size={48}
                            color={isSelected ? COLORS.accent.mint : COLORS.accent.blue}
                          />
                          {isSelected && (
                            <View style={styles.serviceIconGlow} />
                          )}
                      </View>

                      {/* Content */}
                        <View style={styles.serviceCardText}>
                          <Text style={styles.serviceName}>{service.name}</Text>
                          <Text style={[
                            styles.servicePrice,
                            isSelected && styles.servicePriceSelected
                          ]}>
                            ${service.price.toFixed(2)}+
                          </Text>
                          <Text style={styles.serviceDescription}>
                          {service.description}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Add-Ons Section */}
            {addons.length > 0 && (
                <View style={styles.addonsContainer}>
                  <Text style={styles.sectionTitle}>Add-Ons</Text>
                  <View style={styles.addonsList}>
                  {addons.map((addon) => {
                    const isSelected = selectedAddonIds.includes(addon.id);

                    return (
                      <TouchableOpacity
                        key={addon.id}
                        onPress={() => toggleAddOn(addon.id)}
                        activeOpacity={0.8}
                          style={styles.addonCard}
                        >
                          <View style={styles.addonLeft}>
                            <View style={[
                              styles.addonCheckbox,
                              isSelected && styles.addonCheckboxSelected
                            ]}>
                            {isSelected && (
                              <Ionicons name="checkmark" size={16} color={COLORS.bg.primary} />
                            )}
                            </View>
                            <Text style={styles.addonName}>{addon.name}</Text>
                          </View>
                          <Text style={styles.addonPrice}>
                            +${addon.price.toFixed(2)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Bottom CTA */}
            <View style={styles.bottomCTA}>
            <TouchableOpacity
              onPress={handleContinue}
              disabled={!selectedServiceId}
              activeOpacity={selectedServiceId ? 0.8 : 1}
                style={[
                  styles.continueButton,
                  !selectedServiceId && styles.continueButtonDisabled
                ]}
              >
                <Text style={[
                  styles.continueButtonText,
                  !selectedServiceId && styles.continueButtonTextDisabled
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
  servicesContainer: {
    marginBottom: 32,
  },
  serviceCard: {
    width: '100%',
    backgroundColor: COLORS.bg.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    minHeight: 120,
    position: 'relative',
    marginBottom: 16,
  },
  serviceCardSelected: {
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
  serviceCardContent: {
    flexDirection: 'row',
  },
  serviceIconContainer: {
    position: 'relative',
    marginRight: 20,
  },
  serviceIconGlow: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.accent.mint,
    opacity: 0.3,
  },
  serviceCardText: {
    flex: 1,
  },
  serviceName: {
    color: COLORS.text.primary,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  servicePrice: {
    color: COLORS.accent.blue,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  servicePriceSelected: {
    color: COLORS.accent.mint,
  },
  serviceDescription: {
    color: COLORS.text.secondary,
    fontSize: 15,
  },
  addonsContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: COLORS.text.primary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  addonsList: {
  },
  addonCard: {
    width: '100%',
    backgroundColor: COLORS.bg.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  addonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addonCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border.strong,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addonCheckboxSelected: {
    backgroundColor: COLORS.accent.mint,
    borderColor: COLORS.accent.mint,
  },
  addonName: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  addonPrice: {
    color: COLORS.text.secondary,
    fontSize: 15,
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
