import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChooseDetailerScreenProps {
  onBack: () => void;
  onContinue: () => void;
}

const detailers = [
  {
    id: '1',
    name: 'Marcus Thompson',
    rating: 4.9,
    reviews: 142,
    distance: '2.1 km',
    eta: '12–18 min',
    experience: '5+ years',
  },
  {
    id: '2',
    name: 'Alicia Rivera',
    rating: 4.8,
    reviews: 98,
    distance: '3.4 km',
    eta: '18–24 min',
    experience: '4+ years',
  },
  {
    id: '3',
    name: 'Daniel Chen',
    rating: 4.95,
    reviews: 203,
    distance: '1.8 km',
    eta: '10–15 min',
    experience: '7+ years',
  },
];

export default function ChooseDetailerScreen({ onBack, onContinue }: ChooseDetailerScreenProps) {
  const [selectedDetailer, setSelectedDetailer] = useState<string>('');

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
          Choose Your Detailer
        </Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView className="flex-1 px-6 pb-32" showsVerticalScrollIndicator={false}>
        <View className="space-y-4" style={{ gap: 16 }}>
          {detailers.map((detailer) => {
            const isSelected = selectedDetailer === detailer.id;

            return (
              <TouchableOpacity
                key={detailer.id}
                onPress={() => setSelectedDetailer(detailer.id)}
                activeOpacity={isSelected ? 1 : 0.8}
                className={`w-full bg-[#0A1A2F] rounded-3xl p-6 transition-all duration-200 relative ${
                  isSelected
                    ? 'border-2 border-[#6FF0C4] shadow-lg shadow-[#6FF0C4]/20'
                    : 'border border-white/5 active:scale-[0.98]'
                }`}
                style={{
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

                <View className="flex items-start gap-4" style={{ flexDirection: 'row' }}>
                  {/* Profile Photo */}
                  <View className="flex-shrink-0">
                    <View
                      className={`w-16 h-16 rounded-full bg-gradient-to-br from-[#1DA4F3]/20 to-[#6FF0C4]/20 flex items-center justify-center ${
                        isSelected ? 'ring-2 ring-[#6FF0C4]' : ''
                      }`}
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 32,
                        backgroundColor: 'rgba(29,164,243,0.15)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderWidth: isSelected ? 2 : 0,
                        borderColor: isSelected ? '#6FF0C4' : 'transparent',
                      }}
                    >
                      <Text className="text-[#F5F7FA]" style={{ fontSize: 24, fontWeight: '600' }}>
                        {detailer.name.split(' ').map(n => n[0]).join('')}
                      </Text>
                    </View>
                  </View>

                  {/* Details */}
                  <View className="flex-1">
                    {/* Name */}
                    <Text className="text-[#F5F7FA] mb-2" style={{ fontSize: 20, fontWeight: '600' }}>
                      {detailer.name}
                    </Text>

                    {/* Rating */}
                    <View className="flex items-center gap-2 mb-3" style={{ flexDirection: 'row' }}>
                      <View className="flex items-center gap-1" style={{ flexDirection: 'row' }}>
                        <Ionicons name="star" size={16} color="#6FF0C4" />
                        <Text className="text-[#F5F7FA]" style={{ fontSize: 15, fontWeight: '500' }}>
                          {detailer.rating}
                        </Text>
                      </View>
                      <Text className="text-[#C6CFD9]" style={{ fontSize: 14 }}>
                        ({detailer.reviews} reviews)
                      </Text>
                    </View>

                    {/* Distance & ETA */}
                    <View className="space-y-2" style={{ gap: 8 }}>
                      <View className="flex items-center gap-2" style={{ flexDirection: 'row' }}>
                        <Ionicons name="location" size={16} color="#C6CFD9" />
                        <Text className="text-[#C6CFD9]" style={{ fontSize: 14 }}>
                          {detailer.distance} away
                        </Text>
                      </View>
                      <View className="flex items-center gap-2" style={{ flexDirection: 'row' }}>
                        <Ionicons name="time" size={16} color="#1DA4F3" />
                        <Text className="text-[#1DA4F3]" style={{ fontSize: 14, fontWeight: '500' }}>
                          Estimated arrival: {detailer.eta}
                        </Text>
                      </View>
                    </View>

                    {/* Experience Badge */}
                    <View className="mt-3">
                      <View
                        className="px-3 py-1 bg-[#050B12] rounded-full"
                        style={{
                          alignSelf: 'flex-start',
                          paddingHorizontal: 12,
                          paddingVertical: 4,
                          backgroundColor: '#050B12',
                          borderRadius: 999,
                        }}
                      >
                        <Text className="text-[#C6CFD9]" style={{ fontSize: 12 }}>
                          {detailer.experience} experience
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="px-6 pb-8 bg-gradient-to-t from-[#050B12] via-[#050B12] to-transparent pt-6">
        <TouchableOpacity
          onPress={onContinue}
          disabled={!selectedDetailer}
          activeOpacity={selectedDetailer ? 0.8 : 1}
          className={`w-full py-4 rounded-full transition-all duration-200 ${
            selectedDetailer
              ? 'bg-[#1DA4F3] text-white active:scale-[0.98] shadow-lg shadow-[#1DA4F3]/20'
              : 'bg-[#0A1A2F] text-[#C6CFD9]/50 cursor-not-allowed'
          }`}
          style={{
            minHeight: 56,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: selectedDetailer ? '#1DA4F3' : '#0A1A2F',
            shadowColor: selectedDetailer ? '#1DA4F3' : 'transparent',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: selectedDetailer ? 0.2 : 0,
            shadowRadius: 8,
          }}
        >
          <Text
            className={selectedDetailer ? 'text-white' : 'text-[#C6CFD9]/50'}
            style={{
              fontSize: 17,
              fontWeight: '600',
              color: selectedDetailer ? 'white' : 'rgba(198,207,217,0.5)',
            }}
          >
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
