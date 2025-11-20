import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SelectCarScreenProps {
  onBack: () => void;
  onAddCar: () => void;
  onContinue: () => void;
}

const savedCars = [
  {
    id: '1',
    model: '2022 BMW M4',
    details: 'Competition Package',
    license: 'ABC-123',
    color: 'Black Sapphire Metallic',
  },
  {
    id: '2',
    model: '2021 Tesla Model 3',
    details: 'Performance',
    license: 'XYZ-789',
    color: 'Pearl White Multi-Coat',
  },
  {
    id: '3',
    model: '2023 Porsche 911',
    details: 'Carrera S',
    license: 'POR-911',
    color: 'GT Silver Metallic',
  },
];

export default function SelectCarScreen({ onBack, onAddCar, onContinue }: SelectCarScreenProps) {
  const [selectedCar, setSelectedCar] = useState<string>('1');

  return (
    <View className="fixed inset-0 bg-gradient-to-b from-[#0A1A2F] to-[#050B12] flex flex-col">
      {/* Header */}
      <View className="px-6 pt-16 pb-6 flex items-center gap-4" style={{ flexDirection: 'row' }}>
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.7}
          className="text-[#C6CFD9] hover:text-[#6FF0C4] transition-colors active:scale-95"
        >
          <Ionicons name="chevron-back" size={24} color="#C6CFD9" />
        </TouchableOpacity>
        <Text className="text-[#F5F7FA]" style={{ fontSize: 28, fontWeight: '600' }}>
          Select Your Car
        </Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView className="flex-1 px-6 pb-32" showsVerticalScrollIndicator={false}>
        {/* Vehicle Cards */}
        <View className="space-y-4 mb-6" style={{ gap: 16, marginBottom: 24 }}>
          {savedCars.map((car) => {
            const isSelected = selectedCar === car.id;

            return (
              <TouchableOpacity
                key={car.id}
                onPress={() => setSelectedCar(car.id)}
                activeOpacity={isSelected ? 1 : 0.8}
                className={`w-full bg-[#0A1A2F] rounded-3xl p-6 transition-all duration-200 relative ${
                  isSelected
                    ? 'border-2 border-[#6FF0C4] shadow-lg shadow-[#6FF0C4]/20'
                    : 'border border-white/5 active:scale-[0.98] hover:border-white/10'
                }`}
                style={{
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected ? '#6FF0C4' : 'rgba(255,255,255,0.05)',
                  shadowColor: isSelected ? '#6FF0C4' : 'transparent',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: isSelected ? 0.2 : 0,
                  shadowRadius: isSelected ? 8 : 0,
                }}
              >
                {/* Selection Checkmark */}
                {isSelected && (
                  <View
                    className="absolute top-6 right-6 w-6 h-6 rounded-full bg-[#6FF0C4] flex items-center justify-center"
                    style={{
                      position: 'absolute',
                      top: 24,
                      right: 24,
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: '#6FF0C4',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons name="checkmark" size={16} color="#050B12" />
                  </View>
                )}

                {/* Car Icon */}
                <View className="mb-6 relative" style={{ marginBottom: 24 }}>
                  <Ionicons
                    name="car-sport"
                    size={56}
                    color={isSelected ? '#6FF0C4' : '#1DA4F3'}
                  />
                </View>

                {/* Car Info */}
                <View className="text-left">
                  <Text className="text-[#F5F7FA] mb-3" style={{ fontSize: 20, fontWeight: '600', marginBottom: 12 }}>
                    {car.model}
                  </Text>
                  <View className="space-y-1.5" style={{ gap: 6 }}>
                    <Text className="text-[#C6CFD9]" style={{ fontSize: 14 }}>
                      {car.details}
                    </Text>
                    <Text className="text-[#C6CFD9]" style={{ fontSize: 14 }}>
                      License: {car.license}
                    </Text>
                    <Text className="text-[#C6CFD9]" style={{ fontSize: 14 }}>
                      {car.color}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Add Car Card */}
        <TouchableOpacity
          onPress={onAddCar}
          activeOpacity={0.8}
          className="w-full bg-[#0A1A2F] rounded-3xl p-6 border border-dashed border-[#6FF0C4]/30 transition-all duration-200 active:scale-[0.98] hover:border-[#6FF0C4]/50 hover:bg-[#0A1A2F]/80"
          style={{
            borderWidth: 2,
            borderColor: 'rgba(111,240,196,0.3)',
            borderStyle: 'dashed',
          }}
        >
          <View className="flex flex-col items-center gap-4 py-4" style={{ alignItems: 'center', gap: 16, paddingVertical: 16 }}>
            <View
              className="w-16 h-16 rounded-full bg-[#6FF0C4]/10 flex items-center justify-center"
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: 'rgba(111,240,196,0.1)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="add" size={32} color="#6FF0C4" />
            </View>
            <Text className="text-[#6FF0C4]" style={{ fontSize: 17, fontWeight: '600' }}>
              Add a Car
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="px-6 pb-8 bg-gradient-to-t from-[#050B12] via-[#050B12] to-transparent pt-6">
        <TouchableOpacity
          onPress={onContinue}
          activeOpacity={0.8}
          className="w-full bg-[#1DA4F3] text-white py-4 rounded-full transition-all duration-200 active:scale-[0.98] shadow-lg shadow-[#1DA4F3]/20"
          style={{
            minHeight: 56,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#1DA4F3',
            shadowColor: '#1DA4F3',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
          }}
        >
          <Text className="text-white" style={{ fontSize: 17, fontWeight: '600', color: 'white' }}>
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
