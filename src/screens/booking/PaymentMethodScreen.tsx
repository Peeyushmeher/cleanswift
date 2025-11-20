import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PaymentMethodScreenProps {
  onBack: () => void;
  onContinue: () => void;
  onAddCard: () => void;
  showPriceSummary?: boolean;
}

const savedCards = [
  { id: '1', type: 'visa', last4: '2741', expiry: '10/27' },
  { id: '2', type: 'mastercard', last4: '8392', expiry: '03/26' },
];

export default function PaymentMethodScreen({ onBack, onContinue, onAddCard, showPriceSummary = true }: PaymentMethodScreenProps) {
  const [selectedCard, setSelectedCard] = useState<string>('apple-pay');

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
          Payment Method
        </Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView className="flex-1 px-6 pb-32" showsVerticalScrollIndicator={false}>
        {/* Security Statement */}
        <Text className="text-[#C6CFD9] text-center mb-6" style={{ fontSize: 13 }}>
          Your payment information is encrypted and securely stored.
        </Text>

        {/* Apple Pay */}
        <TouchableOpacity
          onPress={() => setSelectedCard('apple-pay')}
          activeOpacity={0.8}
          className={`w-full bg-black border py-4 rounded-full mb-6 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-3 ${
            selectedCard === 'apple-pay'
              ? 'border-[#6FF0C4] shadow-lg shadow-[#6FF0C4]/20'
              : 'border-white/10'
          }`}
          style={{
            flexDirection: 'row',
            borderWidth: selectedCard === 'apple-pay' ? 2 : 1,
            borderColor: selectedCard === 'apple-pay' ? '#6FF0C4' : 'rgba(255,255,255,0.1)',
            shadowColor: selectedCard === 'apple-pay' ? '#6FF0C4' : 'transparent',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: selectedCard === 'apple-pay' ? 0.2 : 0,
            shadowRadius: 8,
          }}
        >
          <Ionicons name="logo-apple" size={24} color="white" />
          <Text className="text-white" style={{ fontSize: 16, fontWeight: '500' }}>
            Apple Pay
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View className="flex items-center gap-4 mb-6" style={{ flexDirection: 'row' }}>
          <View className="flex-1 h-px bg-[#C6CFD9]/20" style={{ height: 1 }} />
          <Text className="text-[#C6CFD9]" style={{ fontSize: 14 }}>OR</Text>
          <View className="flex-1 h-px bg-[#C6CFD9]/20" style={{ height: 1 }} />
        </View>

        {/* Saved Cards */}
        <View className="space-y-3 mb-4" style={{ gap: 12 }}>
          {savedCards.map((card) => {
            const isSelected = selectedCard === card.id;
            const iconName = card.type === 'visa' ? 'card' : 'card';

            return (
              <TouchableOpacity
                key={card.id}
                onPress={() => setSelectedCard(card.id)}
                activeOpacity={0.8}
                className={`w-full bg-[#0A1A2F] rounded-2xl p-5 transition-all duration-200 relative ${
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
                {isSelected && (
                  <View
                    className="absolute top-4 right-4 w-5 h-5 rounded-full bg-[#6FF0C4] flex items-center justify-center"
                    style={{ width: 20, height: 20 }}
                  >
                    <Ionicons name="checkmark" size={12} color="#050B12" />
                  </View>
                )}

                <View className="flex items-center gap-4" style={{ flexDirection: 'row' }}>
                  <Ionicons name={iconName} size={48} color="white" style={{ opacity: 0.9 }} />
                  <View className="flex-1">
                    <Text className="text-[#F5F7FA] mb-1" style={{ fontSize: 16, fontWeight: '500' }}>
                      {card.type === 'visa' ? 'Visa' : 'Mastercard'} •••• {card.last4}
                    </Text>
                    <Text className="text-[#C6CFD9]" style={{ fontSize: 14 }}>
                      Exp {card.expiry}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Add New Card */}
        <TouchableOpacity
          onPress={onAddCard}
          activeOpacity={0.8}
          className="w-full bg-[#0A1A2F] rounded-2xl p-5 border border-dashed border-[#6FF0C4]/30 transition-all duration-200 active:scale-[0.98] hover:border-[#6FF0C4]/50"
          style={{
            borderWidth: 1,
            borderColor: 'rgba(111,240,196,0.3)',
            borderStyle: 'dashed',
          }}
        >
          <View className="flex items-center justify-center gap-3" style={{ flexDirection: 'row' }}>
            <View
              className="w-10 h-10 rounded-full bg-[#6FF0C4]/10 flex items-center justify-center"
              style={{ width: 40, height: 40 }}
            >
              <Ionicons name="add" size={20} color="#6FF0C4" />
            </View>
            <Text className="text-[#6FF0C4]" style={{ fontSize: 16, fontWeight: '500' }}>
              Add New Card
            </Text>
          </View>
        </TouchableOpacity>

        {/* Price Summary */}
        {showPriceSummary && (
          <View
            className="mt-8 bg-[#0A1A2F] rounded-2xl p-5 border border-white/5"
            style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}
          >
            <View className="space-y-2" style={{ gap: 8 }}>
              <View className="flex justify-between" style={{ flexDirection: 'row' }}>
                <Text className="text-[#C6CFD9]" style={{ fontSize: 15 }}>Service</Text>
                <Text className="text-[#F5F7FA]" style={{ fontSize: 15 }}>$149.00</Text>
              </View>
              <View className="flex justify-between" style={{ flexDirection: 'row' }}>
                <Text className="text-[#C6CFD9]" style={{ fontSize: 15 }}>Add-ons</Text>
                <Text className="text-[#F5F7FA]" style={{ fontSize: 15 }}>$35.00</Text>
              </View>
              <View className="flex justify-between" style={{ flexDirection: 'row' }}>
                <Text className="text-[#C6CFD9]" style={{ fontSize: 15 }}>HST</Text>
                <Text className="text-[#F5F7FA]" style={{ fontSize: 15 }}>$24.57</Text>
              </View>
              <View
                className="h-px bg-[#C6CFD9]/20 my-3"
                style={{ height: 1, backgroundColor: 'rgba(198,207,217,0.2)', marginVertical: 12 }}
              />
              <View className="flex justify-between items-center" style={{ flexDirection: 'row' }}>
                <Text className="text-[#F5F7FA]" style={{ fontSize: 18, fontWeight: '600' }}>
                  Total
                </Text>
                <Text className="text-[#6FF0C4]" style={{ fontSize: 24, fontWeight: '700' }}>
                  $208.57
                </Text>
              </View>
            </View>
          </View>
        )}
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
          <Text className="text-white" style={{ fontSize: 17, fontWeight: '600' }}>
            {showPriceSummary ? 'Complete Payment' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
