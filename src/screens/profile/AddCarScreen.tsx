import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AddCarScreenProps {
  onBack: () => void;
  onSave: () => void;
}

export default function AddCarScreen({ onBack, onSave }: AddCarScreenProps) {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    trim: '',
    license: '',
    color: '',
  });

  const handleSubmit = () => {
    onSave();
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = formData.make && formData.model && formData.year && formData.license;

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
          Add a Car
        </Text>
      </View>

      {/* Form - Scrollable */}
      <ScrollView className="flex-1 px-6 pb-32" showsVerticalScrollIndicator={false}>
        {/* Optional Photo Upload */}
        <View className="mb-8">
          <TouchableOpacity
            activeOpacity={0.8}
            className="w-full bg-[#0A1A2F] rounded-3xl p-8 border border-dashed border-[#C6CFD9]/20 transition-all duration-200 active:scale-[0.98] hover:border-[#6FF0C4]/30"
            style={{
              borderWidth: 2,
              borderColor: 'rgba(198,207,217,0.2)',
              borderStyle: 'dashed',
              paddingVertical: 32,
            }}
          >
            <View className="flex flex-col items-center gap-3" style={{ alignItems: 'center', gap: 12 }}>
              <View
                className="w-16 h-16 rounded-full bg-[#1DA4F3]/10 flex items-center justify-center"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: 'rgba(29,164,243,0.1)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="cloud-upload" size={32} color="#1DA4F3" />
              </View>
              <Text className="text-[#C6CFD9]" style={{ fontSize: 15 }}>
                Add Photo (Optional)
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View className="space-y-4" style={{ gap: 16 }}>
          {/* Make */}
          <View>
            <Text
              className="block text-[#C6CFD9] mb-2 px-1"
              style={{ fontSize: 14, fontWeight: '500' }}
            >
              Make
            </Text>
            <TextInput
              placeholder="e.g., BMW"
              value={formData.make}
              onChangeText={(value) => updateField('make', value)}
              placeholderTextColor="rgba(198,207,217,0.5)"
              className="w-full bg-[#0A1A2F] border border-[#C6CFD9]/20 rounded-2xl px-5 py-4 text-[#F5F7FA] placeholder:text-[#C6CFD9]/50 focus:border-[#1DA4F3] focus:outline-none focus:ring-1 focus:ring-[#1DA4F3]/50 transition-all"
              style={{
                fontSize: 16,
                borderWidth: 1,
                borderColor: 'rgba(198,207,217,0.2)',
              }}
            />
          </View>

          {/* Model */}
          <View>
            <Text
              className="block text-[#C6CFD9] mb-2 px-1"
              style={{ fontSize: 14, fontWeight: '500' }}
            >
              Model
            </Text>
            <TextInput
              placeholder="e.g., M4"
              value={formData.model}
              onChangeText={(value) => updateField('model', value)}
              placeholderTextColor="rgba(198,207,217,0.5)"
              className="w-full bg-[#0A1A2F] border border-[#C6CFD9]/20 rounded-2xl px-5 py-4 text-[#F5F7FA] placeholder:text-[#C6CFD9]/50 focus:border-[#1DA4F3] focus:outline-none focus:ring-1 focus:ring-[#1DA4F3]/50 transition-all"
              style={{
                fontSize: 16,
                borderWidth: 1,
                borderColor: 'rgba(198,207,217,0.2)',
              }}
            />
          </View>

          {/* Year */}
          <View>
            <Text
              className="block text-[#C6CFD9] mb-2 px-1"
              style={{ fontSize: 14, fontWeight: '500' }}
            >
              Year
            </Text>
            <TextInput
              placeholder="e.g., 2022"
              value={formData.year}
              onChangeText={(value) => updateField('year', value)}
              keyboardType="numeric"
              placeholderTextColor="rgba(198,207,217,0.5)"
              className="w-full bg-[#0A1A2F] border border-[#C6CFD9]/20 rounded-2xl px-5 py-4 text-[#F5F7FA] placeholder:text-[#C6CFD9]/50 focus:border-[#1DA4F3] focus:outline-none focus:ring-1 focus:ring-[#1DA4F3]/50 transition-all"
              style={{
                fontSize: 16,
                borderWidth: 1,
                borderColor: 'rgba(198,207,217,0.2)',
              }}
            />
          </View>

          {/* Trim */}
          <View>
            <Text
              className="block text-[#C6CFD9] mb-2 px-1"
              style={{ fontSize: 14, fontWeight: '500' }}
            >
              Trim <Text className="text-[#C6CFD9]/50" style={{ color: 'rgba(198,207,217,0.5)' }}>(Optional)</Text>
            </Text>
            <TextInput
              placeholder="e.g., Competition Package"
              value={formData.trim}
              onChangeText={(value) => updateField('trim', value)}
              placeholderTextColor="rgba(198,207,217,0.5)"
              className="w-full bg-[#0A1A2F] border border-[#C6CFD9]/20 rounded-2xl px-5 py-4 text-[#F5F7FA] placeholder:text-[#C6CFD9]/50 focus:border-[#1DA4F3] focus:outline-none focus:ring-1 focus:ring-[#1DA4F3]/50 transition-all"
              style={{
                fontSize: 16,
                borderWidth: 1,
                borderColor: 'rgba(198,207,217,0.2)',
              }}
            />
          </View>

          {/* License Plate */}
          <View>
            <Text
              className="block text-[#C6CFD9] mb-2 px-1"
              style={{ fontSize: 14, fontWeight: '500' }}
            >
              License Plate
            </Text>
            <TextInput
              placeholder="e.g., ABC-123"
              value={formData.license}
              onChangeText={(value) => updateField('license', value)}
              autoCapitalize="characters"
              placeholderTextColor="rgba(198,207,217,0.5)"
              className="w-full bg-[#0A1A2F] border border-[#C6CFD9]/20 rounded-2xl px-5 py-4 text-[#F5F7FA] placeholder:text-[#C6CFD9]/50 focus:border-[#1DA4F3] focus:outline-none focus:ring-1 focus:ring-[#1DA4F3]/50 transition-all"
              style={{
                fontSize: 16,
                borderWidth: 1,
                borderColor: 'rgba(198,207,217,0.2)',
              }}
            />
          </View>

          {/* Color */}
          <View>
            <Text
              className="block text-[#C6CFD9] mb-2 px-1"
              style={{ fontSize: 14, fontWeight: '500' }}
            >
              Color <Text className="text-[#C6CFD9]/50" style={{ color: 'rgba(198,207,217,0.5)' }}>(Optional)</Text>
            </Text>
            <TextInput
              placeholder="e.g., Black Sapphire Metallic"
              value={formData.color}
              onChangeText={(value) => updateField('color', value)}
              placeholderTextColor="rgba(198,207,217,0.5)"
              className="w-full bg-[#0A1A2F] border border-[#C6CFD9]/20 rounded-2xl px-5 py-4 text-[#F5F7FA] placeholder:text-[#C6CFD9]/50 focus:border-[#1DA4F3] focus:outline-none focus:ring-1 focus:ring-[#1DA4F3]/50 transition-all"
              style={{
                fontSize: 16,
                borderWidth: 1,
                borderColor: 'rgba(198,207,217,0.2)',
              }}
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="px-6 pb-8 bg-gradient-to-t from-[#050B12] via-[#050B12] to-transparent pt-6">
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!isFormValid}
          activeOpacity={isFormValid ? 0.8 : 1}
          className={`w-full py-4 rounded-full transition-all duration-200 ${
            isFormValid
              ? 'bg-[#1DA4F3] text-white active:scale-[0.98] shadow-lg shadow-[#1DA4F3]/20'
              : 'bg-[#0A1A2F] text-[#C6CFD9]/50 cursor-not-allowed'
          }`}
          style={{
            minHeight: 56,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: isFormValid ? '#1DA4F3' : '#0A1A2F',
            shadowColor: isFormValid ? '#1DA4F3' : 'transparent',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isFormValid ? 0.2 : 0,
            shadowRadius: 8,
          }}
        >
          <Text
            className={isFormValid ? 'text-white' : 'text-[#C6CFD9]/50'}
            style={{
              fontSize: 17,
              fontWeight: '600',
              color: isFormValid ? 'white' : 'rgba(198,207,217,0.5)',
            }}
          >
            Save Car
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
