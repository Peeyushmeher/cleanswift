import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BookingStackParamList } from '../../navigation/BookingStack';
import { useServices } from '../../hooks/useServices';
import { useServiceAddons } from '../../hooks/useServiceAddons';
import { useBooking } from '../../contexts/BookingContext';

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
    <View className="fixed inset-0 bg-gradient-to-b from-[#0A1A2F] to-[#050B12] flex flex-col">
      {/* Header */}
      <View className="px-6 pt-16 pb-6 flex items-center gap-4" style={{ flexDirection: 'row' }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          className="text-[#C6CFD9] hover:text-[#6FF0C4] transition-colors active:scale-95"
        >
          <Ionicons name="chevron-back" size={24} color="#C6CFD9" />
        </TouchableOpacity>
        <Text className="text-[#F5F7FA]" style={{ fontSize: 28, fontWeight: '600' }}>
          Select a Service
        </Text>
      </View>

      {/* Loading State */}
      {loading && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#6FF0C4" />
          <Text className="text-[#C6CFD9] mt-4" style={{ fontSize: 16 }}>
            Loading services...
          </Text>
        </View>
      )}

      {/* Error State */}
      {error && !loading && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
          <Ionicons name="alert-circle" size={64} color="#FF6B6B" />
          <Text className="text-[#F5F7FA] mt-4 text-center" style={{ fontSize: 18, fontWeight: '600' }}>
            Unable to load services
          </Text>
          <Text className="text-[#C6CFD9] mt-2 text-center" style={{ fontSize: 14 }}>
            {error.message}
          </Text>
        </View>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          {/* Scrollable Content */}
          <ScrollView className="flex-1 px-6 pb-32" showsVerticalScrollIndicator={false}>
            {/* Service Cards */}
            <View className="space-y-4 mb-8" style={{ gap: 16 }}>
              {services.map((service) => {
                const isSelected = selectedServiceId === service.id;
                const icon = getServiceIcon(service.name);

                return (
                  <TouchableOpacity
                    key={service.id}
                    onPress={() => setSelectedServiceId(service.id)}
                    activeOpacity={isSelected ? 1 : 0.8}
                    className={`w-full bg-[#0A1A2F] rounded-3xl p-6 transition-all duration-200 relative ${
                      isSelected
                        ? 'border-2 border-[#6FF0C4] shadow-lg shadow-[#6FF0C4]/20'
                        : 'border border-white/5 active:scale-[0.98] hover:border-white/10'
                    }`}
                    style={{
                      minHeight: 120,
                      borderWidth: isSelected ? 2 : 1,
                      borderColor: isSelected ? '#6FF0C4' : 'rgba(255,255,255,0.05)',
                      shadowColor: isSelected ? '#6FF0C4' : 'transparent',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: isSelected ? 0.2 : 0,
                      shadowRadius: 8,
                    }}
                  >
                    {/* Selection Checkmark */}
                    {isSelected && (
                      <View
                        className="absolute top-5 right-5 w-6 h-6 rounded-full bg-[#6FF0C4] flex items-center justify-center"
                        style={{ width: 24, height: 24 }}
                      >
                        <Ionicons name="checkmark" size={16} color="#050B12" />
                      </View>
                    )}

                    <View className="flex items-start gap-5" style={{ flexDirection: 'row' }}>
                      {/* Icon */}
                      <View className="flex-shrink-0">
                        <View className="relative">
                          <Ionicons
                            name={icon}
                            size={48}
                            color={isSelected ? '#6FF0C4' : '#1DA4F3'}
                          />
                          {isSelected && (
                            <View className="absolute inset-0 blur-xl opacity-30 bg-[#6FF0C4]" />
                          )}
                        </View>
                      </View>

                      {/* Content */}
                      <View className="flex-1">
                        <View className="flex items-start justify-between mb-2">
                          <Text className="text-[#F5F7FA]" style={{ fontSize: 20, fontWeight: '600' }}>
                            {service.name}
                          </Text>
                        </View>
                        <Text
                          className={`mb-2.5 ${isSelected ? 'text-[#6FF0C4]' : 'text-[#1DA4F3]'}`}
                          style={{ fontSize: 18, fontWeight: '600', color: isSelected ? '#6FF0C4' : '#1DA4F3' }}
                        >
                          ${service.price.toFixed(2)}+
                        </Text>
                        <Text className="text-[#C6CFD9]" style={{ fontSize: 15 }}>
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
              <View className="mb-8">
                <Text className="text-[#F5F7FA] mb-5" style={{ fontSize: 18, fontWeight: '600' }}>
                  Add-Ons
                </Text>
                <View className="space-y-3" style={{ gap: 12 }}>
                  {addons.map((addon) => {
                    const isSelected = selectedAddonIds.includes(addon.id);

                    return (
                      <TouchableOpacity
                        key={addon.id}
                        onPress={() => toggleAddOn(addon.id)}
                        activeOpacity={0.8}
                        className="w-full bg-[#0A1A2F] rounded-2xl p-5 border border-white/5 flex items-center justify-between transition-all duration-200 active:scale-[0.98] hover:border-white/10"
                        style={{
                          minHeight: 64,
                          flexDirection: 'row',
                          borderWidth: 1,
                          borderColor: 'rgba(255,255,255,0.05)',
                        }}
                      >
                        <View className="flex items-center gap-3" style={{ flexDirection: 'row' }}>
                          <View
                            className={`w-6 h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                              isSelected
                                ? 'bg-[#6FF0C4] border-[#6FF0C4]'
                                : 'border-[#C6CFD9]/30'
                            }`}
                            style={{
                              width: 24,
                              height: 24,
                              borderWidth: 2,
                              borderColor: isSelected ? '#6FF0C4' : 'rgba(198,207,217,0.3)',
                              backgroundColor: isSelected ? '#6FF0C4' : 'transparent',
                            }}
                          >
                            {isSelected && (
                              <Ionicons name="checkmark" size={16} color="#050B12" />
                            )}
                          </View>
                          <Text className="text-[#F5F7FA]" style={{ fontSize: 16, fontWeight: '500' }}>
                            {addon.name}
                          </Text>
                        </View>
                        <Text className="text-[#C6CFD9]" style={{ fontSize: 15 }}>
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
          <View className="px-6 pb-8 bg-gradient-to-t from-[#050B12] via-[#050B12] to-transparent pt-6">
            <TouchableOpacity
              onPress={handleContinue}
              disabled={!selectedServiceId}
              activeOpacity={selectedServiceId ? 0.8 : 1}
              className={`w-full py-4 rounded-full transition-all duration-200 ${
                selectedServiceId
                  ? 'bg-[#1DA4F3] text-white active:scale-[0.98] shadow-lg shadow-[#1DA4F3]/20'
                  : 'bg-[#0A1A2F] text-[#C6CFD9]/50 cursor-not-allowed'
              }`}
              style={{
                minHeight: 56,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: selectedServiceId ? '#1DA4F3' : '#0A1A2F',
                shadowColor: selectedServiceId ? '#1DA4F3' : 'transparent',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: selectedServiceId ? 0.2 : 0,
                shadowRadius: 8,
              }}
            >
              <Text
                className={selectedServiceId ? 'text-white' : 'text-[#C6CFD9]/50'}
                style={{ fontSize: 17, fontWeight: '600', color: selectedServiceId ? 'white' : 'rgba(198,207,217,0.5)' }}
              >
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}
