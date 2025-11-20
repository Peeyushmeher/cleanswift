import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OrderSummaryScreenProps {
  onBack: () => void;
  onContinue: () => void;
}

export default function OrderSummaryScreen({ onBack, onContinue }: OrderSummaryScreenProps) {
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
          Order Summary
        </Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView className="flex-1 px-6 pb-32" showsVerticalScrollIndicator={false}>
        {/* Service Card */}
        <View
          className="bg-[#0A1A2F] rounded-3xl p-6 mb-4 border border-white/5"
          style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}
        >
          <View className="flex justify-between items-start mb-3" style={{ flexDirection: 'row' }}>
            <View className="flex-1">
              <Text className="text-[#F5F7FA] mb-1" style={{ fontSize: 20, fontWeight: '600' }}>
                Full Exterior Detail
              </Text>
              <Text className="text-[#C6CFD9]" style={{ fontSize: 14 }}>
                Premium exterior cleaning, hand wash, wax
              </Text>
            </View>
            <TouchableOpacity activeOpacity={0.7}>
              <Text className="text-[#6FF0C4]" style={{ fontSize: 14, fontWeight: '500' }}>
                Change
              </Text>
            </TouchableOpacity>
          </View>
          <Text className="text-[#1DA4F3]" style={{ fontSize: 18, fontWeight: '600' }}>
            $149.00
          </Text>
        </View>

        {/* Car Card */}
        <View
          className="bg-[#0A1A2F] rounded-3xl p-6 mb-4 border border-white/5"
          style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}
        >
          <View className="flex justify-between items-start" style={{ flexDirection: 'row' }}>
            <View className="flex items-start gap-4 flex-1" style={{ flexDirection: 'row' }}>
              <Ionicons name="car-sport" size={40} color="#6FF0C4" />
              <View>
                <Text className="text-[#F5F7FA] mb-1" style={{ fontSize: 18, fontWeight: '600' }}>
                  2022 BMW M4
                </Text>
                <Text className="text-[#C6CFD9]" style={{ fontSize: 14 }}>
                  License: ABC-123
                </Text>
              </View>
            </View>
            <TouchableOpacity activeOpacity={0.7}>
              <Text className="text-[#6FF0C4]" style={{ fontSize: 14, fontWeight: '500' }}>
                Change
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Detailer Card */}
        <View
          className="bg-[#0A1A2F] rounded-3xl p-6 mb-4 border border-white/5"
          style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}
        >
          <View className="flex justify-between items-start" style={{ flexDirection: 'row' }}>
            <View className="flex items-start gap-4 flex-1" style={{ flexDirection: 'row' }}>
              <View
                className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1DA4F3]/20 to-[#6FF0C4]/20 flex items-center justify-center ring-1 ring-[#6FF0C4]/30"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: 'rgba(29,164,243,0.15)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: 'rgba(111,240,196,0.3)',
                }}
              >
                <Text className="text-[#F5F7FA]" style={{ fontSize: 18, fontWeight: '600' }}>
                  MT
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-[#F5F7FA] mb-1" style={{ fontSize: 18, fontWeight: '600' }}>
                  Marcus Thompson
                </Text>
                <View className="flex items-center gap-1 mb-1" style={{ flexDirection: 'row' }}>
                  <Ionicons name="star" size={16} color="#6FF0C4" />
                  <Text className="text-[#F5F7FA]" style={{ fontSize: 14 }}>
                    4.9
                  </Text>
                  <Text className="text-[#C6CFD9]" style={{ fontSize: 12 }}>
                    (142 reviews)
                  </Text>
                </View>
                <Text className="text-[#C6CFD9]" style={{ fontSize: 14 }}>
                  2.1 km away
                </Text>
              </View>
            </View>
            <TouchableOpacity activeOpacity={0.7}>
              <Text className="text-[#6FF0C4]" style={{ fontSize: 14, fontWeight: '500' }}>
                Change
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date & Time Card */}
        <View
          className="bg-[#0A1A2F] rounded-3xl p-6 mb-4 border border-white/5"
          style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}
        >
          <View className="flex justify-between items-start" style={{ flexDirection: 'row' }}>
            <View className="flex items-start gap-4 flex-1" style={{ flexDirection: 'row' }}>
              <Ionicons name="calendar" size={40} color="#1DA4F3" />
              <View>
                <Text className="text-[#F5F7FA] mb-1" style={{ fontSize: 18, fontWeight: '600' }}>
                  Thu, November 16
                </Text>
                <Text className="text-[#C6CFD9]" style={{ fontSize: 14 }}>
                  1:00 PM - 3:00 PM Arrival Window
                </Text>
              </View>
            </View>
            <TouchableOpacity activeOpacity={0.7}>
              <Text className="text-[#6FF0C4]" style={{ fontSize: 14, fontWeight: '500' }}>
                Change
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Price Breakdown */}
        <View
          className="bg-[#0A1A2F] rounded-3xl p-6 border border-white/5"
          style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}
        >
          <Text className="text-[#F5F7FA] mb-4" style={{ fontSize: 18, fontWeight: '600' }}>
            Price Breakdown
          </Text>

          <View className="space-y-3" style={{ gap: 12 }}>
            <View className="flex justify-between" style={{ flexDirection: 'row' }}>
              <Text className="text-[#C6CFD9]" style={{ fontSize: 15 }}>Service</Text>
              <Text className="text-[#F5F7FA]" style={{ fontSize: 15 }}>$149.00</Text>
            </View>
            <View className="flex justify-between" style={{ flexDirection: 'row' }}>
              <Text className="text-[#C6CFD9]" style={{ fontSize: 15 }}>Wax Finish</Text>
              <Text className="text-[#F5F7FA]" style={{ fontSize: 15 }}>$25.00</Text>
            </View>
            <View className="flex justify-between" style={{ flexDirection: 'row' }}>
              <Text className="text-[#C6CFD9]" style={{ fontSize: 15 }}>Tire Shine</Text>
              <Text className="text-[#F5F7FA]" style={{ fontSize: 15 }}>$10.00</Text>
            </View>
            <View className="flex justify-between" style={{ flexDirection: 'row' }}>
              <Text className="text-[#C6CFD9]" style={{ fontSize: 15 }}>HST</Text>
              <Text className="text-[#F5F7FA]" style={{ fontSize: 15 }}>$24.57</Text>
            </View>

            <View className="h-px bg-[#C6CFD9]/20 my-4" style={{ height: 1, backgroundColor: 'rgba(198,207,217,0.2)', marginVertical: 16 }} />

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
            Continue to Payment
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
