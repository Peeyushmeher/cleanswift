import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBooking } from '../../contexts/BookingContext';
import { useServiceAddons } from '../../hooks/useServiceAddons';
import { useServices } from '../../hooks/useServices';
import { BookingStackParamList } from '../../navigation/BookingStack';

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

export default function ServiceSelectionScreen({ navigation, route }: Props) {
  const { data: services, loading: servicesLoading, error: servicesError } = useServices();
  const { data: addons, loading: addonsLoading, error: addonsError } = useServiceAddons();
  const { setService, setAddons, selectedService } = useBooking();
  const parentNavigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [selectedServiceId, setSelectedServiceId] = useState<string>(selectedService?.id || '');
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const isRebook = Boolean(route?.params?.rebookFromBookingId);

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

  useEffect(() => {
    if (selectedService?.id) {
      setSelectedServiceId(selectedService.id);
    }
  }, [selectedService?.id]);

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
    // Use CombinedSelectionScreen instead of separate BookingDateTime/ChooseDetailer screens
    navigation.navigate('CombinedSelection', {
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
          <Ionicons name="chevron-back" size={24} color="#C6CFD9" />
        </TouchableOpacity>
          <Text style={styles.headerTitle}>Select a Service</Text>
      </View>

      {/* Loading State */}
      {loading && (
          <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#6FF0C4" />
            <Text style={styles.loadingText}>Loading services...</Text>
        </View>
      )}

      {/* Error State */}
      {error && !loading && (
          <View style={[styles.centerContainer, styles.errorContainer]}>
          <Ionicons name="alert-circle" size={64} color="#FF6B6B" />
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
            {isRebook && (
              <View style={styles.rebookBanner}>
                <Ionicons name="refresh" size={18} color="#6FF0C4" />
                <View style={styles.rebookBannerCopy}>
                  <Text style={styles.rebookBannerTitle}>We saved your last picks</Text>
                  <Text style={styles.rebookBannerSubtitle}>Review the service, then choose a new time.</Text>
                </View>
              </View>
            )}

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
                        <Ionicons name="checkmark" size={16} color="#050B12" />
                      </View>
                    )}

                      <View style={styles.serviceCardContent}>
                      {/* Icon */}
                        <View style={styles.serviceIconContainer}>
                          <Ionicons
                            name={icon}
                            size={48}
                            color={isSelected ? '#6FF0C4' : '#1DA4F3'}
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
                              <Ionicons name="checkmark" size={16} color="#050B12" />
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
            <View style={[styles.bottomCTA, { bottom: 68 + Math.max(insets.bottom, 0) }]}>
              <View style={styles.buttonSafeArea}>
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
  servicesContainer: {
    marginBottom: 32,
  },
  serviceCard: {
    width: '100%',
    backgroundColor: '#0A1A2F',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    minHeight: 120,
    position: 'relative',
    marginBottom: 16,
  },
  serviceCardSelected: {
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
    backgroundColor: '#6FF0C4',
    opacity: 0.3,
  },
  serviceCardText: {
    flex: 1,
  },
  serviceName: {
    color: '#F5F7FA',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  servicePrice: {
    color: '#1DA4F3',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  servicePriceSelected: {
    color: '#6FF0C4',
  },
  serviceDescription: {
    color: '#C6CFD9',
    fontSize: 15,
  },
  addonsContainer: {
    marginBottom: 32,
  },
  rebookBanner: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(111,240,196,0.3)',
    backgroundColor: 'rgba(111,240,196,0.08)',
    marginBottom: 24,
  },
  rebookBannerCopy: {
    flex: 1,
  },
  rebookBannerTitle: {
    color: '#F5F7FA',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  rebookBannerSubtitle: {
    color: '#C6CFD9',
    fontSize: 13,
  },
  sectionTitle: {
    color: '#F5F7FA',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  addonsList: {
  },
  addonCard: {
    width: '100%',
    backgroundColor: '#0A1A2F',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
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
    borderColor: 'rgba(198,207,217,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addonCheckboxSelected: {
    backgroundColor: '#6FF0C4',
    borderColor: '#6FF0C4',
  },
  addonName: {
    color: '#F5F7FA',
    fontSize: 16,
    fontWeight: '500',
  },
  addonPrice: {
    color: '#C6CFD9',
    fontSize: 15,
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
