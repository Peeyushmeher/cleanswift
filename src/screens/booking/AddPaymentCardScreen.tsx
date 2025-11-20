import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AddPaymentCardScreenProps {
  onBack: () => void;
  onSave: () => void;
}

export default function AddPaymentCardScreen({ onBack, onSave }: AddPaymentCardScreenProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [setAsDefault, setSetAsDefault] = useState(true);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + ' / ' + v.slice(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (value: string) => {
    setCardNumber(formatCardNumber(value));
  };

  const handleExpiryChange = (value: string) => {
    setExpiry(formatExpiry(value));
  };

  const isFormValid = cardNumber.length >= 15 && expiry.length >= 5 && cvc.length >= 3 && name.length > 0;

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
          Add Card
        </Text>
      </View>

      {/* Form - Scrollable */}
      <ScrollView className="flex-1 px-6 pb-32" showsVerticalScrollIndicator={false}>
        {/* Security Statement */}
        <Text className="text-[#C6CFD9] text-center mb-8" style={{ fontSize: 13 }}>
          Your payment information is encrypted and securely stored.
        </Text>

        {/* Minimal Card Visual */}
        <View
          className="mb-8 bg-[#0A1A2F] rounded-3xl p-6 border border-[#C6CFD9]/20"
          style={{ borderWidth: 1, borderColor: 'rgba(198,207,217,0.2)' }}
        >
          <View className="flex items-center gap-3 mb-4" style={{ flexDirection: 'row' }}>
            <Ionicons name="card" size={32} color="#C6CFD9" />
            <View
              className="w-10 h-6 bg-[#C6CFD9]/20 rounded"
              style={{ width: 40, height: 24, backgroundColor: 'rgba(198,207,217,0.2)' }}
            />
          </View>
          <View
            className="h-px bg-[#C6CFD9]/10 mb-4"
            style={{ height: 1, backgroundColor: 'rgba(198,207,217,0.1)', marginBottom: 16 }}
          />
          <Text
            className="text-[#C6CFD9] tracking-wider"
            style={{ fontSize: 18, fontWeight: '500', letterSpacing: 2 }}
          >
            {cardNumber || '•••• •••• •••• ••••'}
          </Text>
        </View>

        {/* Form Fields */}
        <View className="space-y-4" style={{ gap: 16 }}>
          {/* Card Number */}
          <View>
            <Text
              className="block text-[#C6CFD9] mb-2 px-1"
              style={{ fontSize: 14, fontWeight: '500' }}
            >
              Card Number
            </Text>
            <TextInput
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChangeText={handleCardNumberChange}
              maxLength={19}
              keyboardType="numeric"
              placeholderTextColor="rgba(198,207,217,0.5)"
              className="w-full bg-[#0A1A2F] border border-[#C6CFD9]/20 rounded-2xl px-5 py-4 text-[#F5F7FA] placeholder:text-[#C6CFD9]/50 focus:border-[#1DA4F3] focus:outline-none focus:ring-1 focus:ring-[#1DA4F3]/50 transition-all tracking-wider"
              style={{
                fontSize: 16,
                borderWidth: 1,
                borderColor: 'rgba(198,207,217,0.2)',
                letterSpacing: 2,
              }}
            />
          </View>

          {/* Expiry & CVC Row */}
          <View className="grid grid-cols-2 gap-4" style={{ flexDirection: 'row', gap: 16 }}>
            <View style={{ flex: 1 }}>
              <Text
                className="block text-[#C6CFD9] mb-2 px-1"
                style={{ fontSize: 14, fontWeight: '500' }}
              >
                Expiry Date
              </Text>
              <TextInput
                placeholder="MM / YY"
                value={expiry}
                onChangeText={handleExpiryChange}
                maxLength={7}
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

            <View style={{ flex: 1 }}>
              <Text
                className="block text-[#C6CFD9] mb-2 px-1"
                style={{ fontSize: 14, fontWeight: '500' }}
              >
                CVC
              </Text>
              <TextInput
                placeholder="123"
                value={cvc}
                onChangeText={(value) => setCvc(value.replace(/[^0-9]/g, '').slice(0, 4))}
                maxLength={4}
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
          </View>

          {/* Name on Card */}
          <View>
            <Text
              className="block text-[#C6CFD9] mb-2 px-1"
              style={{ fontSize: 14, fontWeight: '500' }}
            >
              Name on Card
            </Text>
            <TextInput
              placeholder="JOHN DOE"
              value={name}
              onChangeText={(value) => setName(value.toUpperCase())}
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

          {/* Default Card Toggle */}
          <View className="flex items-center justify-between py-4" style={{ flexDirection: 'row' }}>
            <Text className="text-[#F5F7FA]" style={{ fontSize: 16, fontWeight: '500' }}>
              Set as default payment method
            </Text>
            <TouchableOpacity
              onPress={() => setSetAsDefault(!setAsDefault)}
              activeOpacity={0.8}
              className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                setAsDefault ? 'bg-[#6FF0C4]' : 'bg-[#C6CFD9]/30'
              }`}
              style={{
                width: 48,
                height: 28,
                borderRadius: 14,
                backgroundColor: setAsDefault ? '#6FF0C4' : 'rgba(198,207,217,0.3)',
                justifyContent: 'center',
              }}
            >
              <View
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                  setAsDefault ? 'translate-x-6' : 'translate-x-1'
                }`}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: 'white',
                  transform: [{ translateX: setAsDefault ? 24 : 4 }],
                }}
              />
            </TouchableOpacity>
          </View>
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
            Save Card
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
