import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EditProfileScreenProps {
  onBack: () => void;
  onSave: () => void;
}

export default function EditProfileScreen({ onBack, onSave }: EditProfileScreenProps) {
  const [name, setName] = useState('Peeyush Yerremsetty');
  const [email, setEmail] = useState('meherpeeyush@gmail.com');
  const [phone, setPhone] = useState('437-989-6480');

  const isFormValid = name.length > 0 && email.length > 0 && phone.length > 0;

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
          Edit Profile
        </Text>
      </View>

      {/* Form - Scrollable */}
      <ScrollView className="flex-1 px-6 pb-32" showsVerticalScrollIndicator={false}>
        {/* Profile Photo */}
        <View className="flex flex-col items-center mb-8" style={{ alignItems: 'center' }}>
          <View className="relative">
            <View
              className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1DA4F3]/20 to-[#6FF0C4]/20 flex items-center justify-center ring-2 ring-[#6FF0C4]/30"
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                backgroundColor: 'rgba(29,164,243,0.15)',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: 'rgba(111,240,196,0.3)',
              }}
            >
              <Ionicons name="person" size={48} color="#6FF0C4" />
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#6FF0C4] flex items-center justify-center shadow-lg transition-all duration-200 active:scale-95"
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#6FF0C4',
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
              }}
            >
              <Ionicons name="camera" size={16} color="#050B12" />
            </TouchableOpacity>
          </View>
          <Text className="text-[#C6CFD9] mt-3" style={{ fontSize: 14, marginTop: 12 }}>
            Tap to change photo
          </Text>
        </View>

        {/* Form Fields */}
        <View className="space-y-5" style={{ gap: 20 }}>
          {/* Full Name */}
          <View>
            <Text
              className="block text-[#C6CFD9] mb-2 px-1"
              style={{ fontSize: 14, fontWeight: '500' }}
            >
              Full Name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholderTextColor="rgba(198,207,217,0.5)"
              className="w-full bg-[#0A1A2F] border border-[#C6CFD9]/20 rounded-2xl px-5 py-4 text-[#F5F7FA] placeholder:text-[#C6CFD9]/50 focus:border-[#1DA4F3] focus:outline-none focus:ring-1 focus:ring-[#1DA4F3]/50 transition-all"
              style={{
                fontSize: 16,
                borderWidth: 1,
                borderColor: 'rgba(198,207,217,0.2)',
              }}
            />
          </View>

          {/* Email */}
          <View>
            <Text
              className="block text-[#C6CFD9] mb-2 px-1"
              style={{ fontSize: 14, fontWeight: '500' }}
            >
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              placeholderTextColor="rgba(198,207,217,0.5)"
              className="w-full bg-[#0A1A2F] border border-[#C6CFD9]/20 rounded-2xl px-5 py-4 text-[#F5F7FA] placeholder:text-[#C6CFD9]/50 focus:border-[#1DA4F3] focus:outline-none focus:ring-1 focus:ring-[#1DA4F3]/50 transition-all"
              style={{
                fontSize: 16,
                borderWidth: 1,
                borderColor: 'rgba(198,207,217,0.2)',
              }}
            />
          </View>

          {/* Phone */}
          <View>
            <Text
              className="block text-[#C6CFD9] mb-2 px-1"
              style={{ fontSize: 14, fontWeight: '500' }}
            >
              Phone Number
            </Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoComplete="tel"
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

        {/* Danger Zone */}
        <View
          className="mt-12 pt-8 border-t border-[#C6CFD9]/10"
          style={{
            marginTop: 48,
            paddingTop: 32,
            borderTopWidth: 1,
            borderTopColor: 'rgba(198,207,217,0.1)',
          }}
        >
          <TouchableOpacity activeOpacity={0.7}>
            <Text className="text-[#C6CFD9]" style={{ fontSize: 14, color: '#C6CFD9' }}>
              Delete Account
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="px-6 pb-8 bg-gradient-to-t from-[#050B12] via-[#050B12] to-transparent pt-6">
        <TouchableOpacity
          onPress={onSave}
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
            Save Changes
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
