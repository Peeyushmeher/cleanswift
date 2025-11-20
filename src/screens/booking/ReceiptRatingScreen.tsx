import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ReceiptRatingScreenProps {
  onComplete: () => void;
}

const tipAmounts = ['$5', '$10', '$20', 'Custom'];

export default function ReceiptRatingScreen({ onComplete }: ReceiptRatingScreenProps) {
  const [rating, setRating] = useState(0);
  const [selectedTip, setSelectedTip] = useState('');
  const [review, setReview] = useState('');

  return (
    <View className="fixed inset-0 bg-gradient-to-b from-[#0A1A2F] to-[#050B12] flex flex-col">
      {/* Header */}
      <View className="px-6 pt-16 pb-6">
        <View className="text-center mb-6" style={{ alignItems: 'center' }}>
          <View
            className="w-20 h-20 rounded-full bg-[#6FF0C4]/10 flex items-center justify-center mx-auto mb-4"
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: 'rgba(111,240,196,0.1)',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Ionicons name="checkmark" size={40} color="#6FF0C4" />
          </View>
          <Text className="text-[#F5F7FA] mb-2" style={{ fontSize: 28, fontWeight: '600', textAlign: 'center' }}>
            Your Detail Is Complete
          </Text>
          <Text className="text-[#C6CFD9]" style={{ fontSize: 15, textAlign: 'center' }}>
            We hope you love the results.
          </Text>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView className="flex-1 px-6 pb-32" showsVerticalScrollIndicator={false}>
        {/* Receipt Card */}
        <View
          className="bg-[#0A1A2F] rounded-3xl p-6 mb-6 border border-white/5"
          style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}
        >
          {/* Service Info */}
          <View className="flex justify-between items-start mb-4" style={{ flexDirection: 'row' }}>
            <View>
              <Text className="text-[#F5F7FA] mb-1" style={{ fontSize: 18, fontWeight: '600' }}>
                Full Exterior Detail
              </Text>
              <Text className="text-[#C6CFD9]" style={{ fontSize: 14 }}>
                Completed at 2:42 PM
              </Text>
            </View>
            <Text className="text-[#1DA4F3]" style={{ fontSize: 18, fontWeight: '600' }}>
              $149.00
            </Text>
          </View>

          {/* Car Info */}
          <View
            className="flex items-center gap-3 py-4 border-t border-[#C6CFD9]/10"
            style={{
              flexDirection: 'row',
              paddingVertical: 16,
              borderTopWidth: 1,
              borderTopColor: 'rgba(198,207,217,0.1)',
            }}
          >
            <Ionicons name="car-sport" size={20} color="#C6CFD9" />
            <View>
              <Text className="text-[#F5F7FA]" style={{ fontSize: 15, fontWeight: '500' }}>
                2021 BMW M4
              </Text>
              <Text className="text-[#C6CFD9]" style={{ fontSize: 13 }}>
                License: ABC-123
              </Text>
            </View>
          </View>

          {/* Detailer Info */}
          <View
            className="flex items-center gap-3 py-4 border-t border-[#C6CFD9]/10"
            style={{
              flexDirection: 'row',
              paddingVertical: 16,
              borderTopWidth: 1,
              borderTopColor: 'rgba(198,207,217,0.1)',
            }}
          >
            <View
              className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1DA4F3]/20 to-[#6FF0C4]/20 flex items-center justify-center"
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(29,164,243,0.15)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text className="text-[#F5F7FA]" style={{ fontSize: 15, fontWeight: '600' }}>
                MT
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-[#F5F7FA] mb-0.5" style={{ fontSize: 15, fontWeight: '500' }}>
                Marcus Thompson
              </Text>
              <View className="flex items-center gap-1" style={{ flexDirection: 'row' }}>
                <Ionicons name="star" size={12} color="#6FF0C4" />
                <Text className="text-[#C6CFD9]" style={{ fontSize: 12 }}>
                  4.9
                </Text>
              </View>
            </View>
          </View>

          {/* Price Breakdown */}
          <View
            className="pt-4 border-t border-[#C6CFD9]/10"
            style={{
              paddingTop: 16,
              borderTopWidth: 1,
              borderTopColor: 'rgba(198,207,217,0.1)',
            }}
          >
            <View className="space-y-2 mb-3" style={{ gap: 8, marginBottom: 12 }}>
              <View className="flex justify-between" style={{ flexDirection: 'row' }}>
                <Text className="text-[#C6CFD9]" style={{ fontSize: 14 }}>Service</Text>
                <Text className="text-[#F5F7FA]" style={{ fontSize: 14 }}>$149.00</Text>
              </View>
              <View className="flex justify-between" style={{ flexDirection: 'row' }}>
                <Text className="text-[#C6CFD9]" style={{ fontSize: 14 }}>Wax Finish</Text>
                <Text className="text-[#F5F7FA]" style={{ fontSize: 14 }}>$25.00</Text>
              </View>
              <View className="flex justify-between" style={{ flexDirection: 'row' }}>
                <Text className="text-[#C6CFD9]" style={{ fontSize: 14 }}>Interior Refresh</Text>
                <Text className="text-[#F5F7FA]" style={{ fontSize: 14 }}>$15.00</Text>
              </View>
              <View className="flex justify-between" style={{ flexDirection: 'row' }}>
                <Text className="text-[#C6CFD9]" style={{ fontSize: 14 }}>HST</Text>
                <Text className="text-[#F5F7FA]" style={{ fontSize: 14 }}>$24.57</Text>
              </View>
            </View>
            <View className="h-px bg-[#C6CFD9]/20 mb-3" style={{ height: 1, backgroundColor: 'rgba(198,207,217,0.2)', marginBottom: 12 }} />
            <View className="flex justify-between items-center" style={{ flexDirection: 'row' }}>
              <Text className="text-[#F5F7FA]" style={{ fontSize: 17, fontWeight: '600' }}>
                Total
              </Text>
              <Text className="text-[#6FF0C4]" style={{ fontSize: 24, fontWeight: '700' }}>
                $213.57
              </Text>
            </View>
          </View>
        </View>

        {/* Rating Section */}
        <View className="mb-6">
          <Text className="text-[#F5F7FA] mb-4 text-center" style={{ fontSize: 18, fontWeight: '600', textAlign: 'center' }}>
            Rate Your Detailer
          </Text>
          <View className="flex justify-center gap-3" style={{ flexDirection: 'row', justifyContent: 'center', gap: 12 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                activeOpacity={0.7}
                className="transition-all duration-200 active:scale-90"
              >
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={40}
                  color={star <= rating ? '#6FF0C4' : 'rgba(198,207,217,0.3)'}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tip Section */}
        <View className="mb-6">
          <Text className="text-[#F5F7FA] mb-4" style={{ fontSize: 18, fontWeight: '600' }}>
            Add a Tip?
          </Text>
          <View
            className="grid grid-cols-4 gap-3"
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            {tipAmounts.map((amount) => (
              <TouchableOpacity
                key={amount}
                onPress={() => setSelectedTip(amount)}
                activeOpacity={0.8}
                className={`py-3 rounded-2xl transition-all duration-200 ${
                  selectedTip === amount
                    ? 'bg-[#0A1A2F] border-2 border-[#6FF0C4] text-[#6FF0C4]'
                    : 'bg-[#0A1A2F] border border-[#C6CFD9]/20 text-[#F5F7FA] active:scale-95'
                }`}
                style={{
                  width: '22%',
                  paddingVertical: 12,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 16,
                  borderWidth: selectedTip === amount ? 2 : 1,
                  borderColor: selectedTip === amount ? '#6FF0C4' : 'rgba(198,207,217,0.2)',
                  backgroundColor: '#0A1A2F',
                }}
              >
                <Text
                  className={selectedTip === amount ? 'text-[#6FF0C4]' : 'text-[#F5F7FA]'}
                  style={{
                    fontSize: 15,
                    fontWeight: '500',
                    color: selectedTip === amount ? '#6FF0C4' : '#F5F7FA',
                  }}
                >
                  {amount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Review Text Field */}
        <View className="mb-6">
          <Text className="text-[#F5F7FA] mb-4" style={{ fontSize: 18, fontWeight: '600' }}>
            Share Your Experience
          </Text>
          <TextInput
            value={review}
            onChangeText={setReview}
            placeholder="Tell us how Marcus did..."
            placeholderTextColor="rgba(198,207,217,0.5)"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            className="w-full bg-[#0A1A2F] border border-[#C6CFD9]/20 rounded-2xl px-5 py-4 text-[#F5F7FA] placeholder:text-[#C6CFD9]/50 focus:border-[#1DA4F3] focus:outline-none focus:ring-1 focus:ring-[#1DA4F3]/50 transition-all"
            style={{
              fontSize: 16,
              minHeight: 100,
              borderWidth: 1,
              borderColor: 'rgba(198,207,217,0.2)',
            }}
          />
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="px-6 pb-8 bg-gradient-to-t from-[#050B12] via-[#050B12] to-transparent pt-6">
        <TouchableOpacity
          onPress={onComplete}
          disabled={rating === 0}
          activeOpacity={rating > 0 ? 0.8 : 1}
          className={`w-full py-4 rounded-full transition-all duration-200 ${
            rating > 0
              ? 'bg-[#1DA4F3] text-white active:scale-[0.98] shadow-lg shadow-[#1DA4F3]/20'
              : 'bg-[#0A1A2F] text-[#C6CFD9]/50 cursor-not-allowed'
          }`}
          style={{
            minHeight: 56,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: rating > 0 ? '#1DA4F3' : '#0A1A2F',
            shadowColor: rating > 0 ? '#1DA4F3' : 'transparent',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: rating > 0 ? 0.2 : 0,
            shadowRadius: 8,
          }}
        >
          <Text
            className={rating > 0 ? 'text-white' : 'text-[#C6CFD9]/50'}
            style={{
              fontSize: 17,
              fontWeight: '600',
              color: rating > 0 ? 'white' : 'rgba(198,207,217,0.5)',
            }}
          >
            Submit Rating
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
