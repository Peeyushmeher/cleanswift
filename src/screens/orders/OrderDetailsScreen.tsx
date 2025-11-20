import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OrderDetailsScreenProps {
  onBack: () => void;
  onBookAgain: () => void;
}

export default function OrderDetailsScreen({ onBack, onBookAgain }: OrderDetailsScreenProps) {
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
          Service Details
        </Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView className="flex-1 px-6 pb-32" showsVerticalScrollIndicator={false}>
        {/* Service Summary */}
        <View
          className="bg-[#0A1A2F] rounded-3xl p-6 mb-4 border border-white/5"
          style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}
        >
          <View className="flex items-center gap-2 mb-4" style={{ flexDirection: 'row' }}>
            <View
              className="w-2 h-2 rounded-full bg-[#6FF0C4]"
              style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#6FF0C4' }}
            />
            <Text className="text-[#6FF0C4]" style={{ fontSize: 14, fontWeight: '500' }}>
              Completed
            </Text>
          </View>

          <Text className="text-[#F5F7FA] mb-2" style={{ fontSize: 24, fontWeight: '600' }}>
            Full Exterior Detail
          </Text>
          <Text className="text-[#C6CFD9] mb-4" style={{ fontSize: 15 }}>
            Completed on Nov 16 at 2:42 PM
          </Text>
        </View>

        {/* Car Details */}
        <View
          className="bg-[#0A1A2F] rounded-3xl p-6 mb-4 border border-white/5"
          style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}
        >
          <View className="flex items-start gap-4" style={{ flexDirection: 'row' }}>
            <Ionicons name="car-sport" size={40} color="#6FF0C4" />
            <View>
              <Text className="text-[#F5F7FA] mb-1" style={{ fontSize: 18, fontWeight: '600' }}>
                2022 BMW M4
              </Text>
              <Text className="text-[#C6CFD9]" style={{ fontSize: 14 }}>
                License: ABC-123
              </Text>
              <Text className="text-[#C6CFD9]" style={{ fontSize: 14 }}>
                Black Sapphire Metallic
              </Text>
            </View>
          </View>
        </View>

        {/* Detailer Information */}
        <View
          className="bg-[#0A1A2F] rounded-3xl p-6 mb-4 border border-white/5"
          style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}
        >
          <View className="flex items-start gap-4" style={{ flexDirection: 'row' }}>
            <View
              className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1DA4F3]/20 to-[#6FF0C4]/20 flex items-center justify-center ring-2 ring-[#6FF0C4]/30"
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: 'rgba(29,164,243,0.15)',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: 'rgba(111,240,196,0.3)',
              }}
            >
              <Text className="text-[#F5F7FA]" style={{ fontSize: 20, fontWeight: '600' }}>
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
                Detailer since 2021
              </Text>
            </View>
          </View>
        </View>

        {/* Date & Time */}
        <View
          className="bg-[#0A1A2F] rounded-3xl p-6 mb-4 border border-white/5"
          style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}
        >
          <View className="space-y-3" style={{ gap: 12 }}>
            <View className="flex items-center gap-3" style={{ flexDirection: 'row' }}>
              <Ionicons name="calendar" size={20} color="#C6CFD9" />
              <View>
                <Text className="text-[#F5F7FA]" style={{ fontSize: 15, fontWeight: '500' }}>
                  Thursday, November 16
                </Text>
              </View>
            </View>
            <View className="flex items-center gap-3" style={{ flexDirection: 'row' }}>
              <Ionicons name="time" size={20} color="#C6CFD9" />
              <View>
                <Text className="text-[#F5F7FA]" style={{ fontSize: 15, fontWeight: '500' }}>
                  1:00 PM - 3:00 PM
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Payment Summary */}
        <View
          className="bg-[#0A1A2F] rounded-3xl p-6 mb-4 border border-white/5"
          style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}
        >
          <Text className="text-[#F5F7FA] mb-4" style={{ fontSize: 18, fontWeight: '600' }}>
            Payment Summary
          </Text>

          <View className="space-y-2 mb-3" style={{ gap: 8 }}>
            <View className="flex justify-between" style={{ flexDirection: 'row' }}>
              <Text className="text-[#C6CFD9]" style={{ fontSize: 15 }}>Full Exterior Detail</Text>
              <Text className="text-[#F5F7FA]" style={{ fontSize: 15 }}>$149.00</Text>
            </View>
            <View className="flex justify-between" style={{ flexDirection: 'row' }}>
              <Text className="text-[#C6CFD9]" style={{ fontSize: 15 }}>Wax Finish</Text>
              <Text className="text-[#F5F7FA]" style={{ fontSize: 15 }}>$25.00</Text>
            </View>
            <View className="flex justify-between" style={{ flexDirection: 'row' }}>
              <Text className="text-[#C6CFD9]" style={{ fontSize: 15 }}>Interior Refresh</Text>
              <Text className="text-[#F5F7FA]" style={{ fontSize: 15 }}>$15.00</Text>
            </View>
            <View className="flex justify-between" style={{ flexDirection: 'row' }}>
              <Text className="text-[#C6CFD9]" style={{ fontSize: 15 }}>HST</Text>
              <Text className="text-[#F5F7FA]" style={{ fontSize: 15 }}>$24.57</Text>
            </View>
          </View>

          <View
            className="h-px bg-[#C6CFD9]/20 mb-3"
            style={{ height: 1, backgroundColor: 'rgba(198,207,217,0.2)', marginBottom: 12 }}
          />

          <View className="flex justify-between items-center mb-4" style={{ flexDirection: 'row' }}>
            <Text className="text-[#F5F7FA]" style={{ fontSize: 18, fontWeight: '600' }}>
              Total
            </Text>
            <Text className="text-[#6FF0C4]" style={{ fontSize: 24, fontWeight: '700' }}>
              $213.57
            </Text>
          </View>

          <View
            className="pt-4 border-t border-[#C6CFD9]/10"
            style={{
              paddingTop: 16,
              borderTopWidth: 1,
              borderTopColor: 'rgba(198,207,217,0.1)',
            }}
          >
            <View className="flex justify-between mb-1" style={{ flexDirection: 'row' }}>
              <Text className="text-[#C6CFD9]" style={{ fontSize: 14 }}>Payment Method</Text>
              <Text className="text-[#F5F7FA]" style={{ fontSize: 14 }}>Visa •••• 2741</Text>
            </View>
            <View className="flex justify-between" style={{ flexDirection: 'row' }}>
              <Text className="text-[#C6CFD9]" style={{ fontSize: 14 }}>Receipt ID</Text>
              <Text className="text-[#F5F7FA]" style={{ fontSize: 14 }}>8F3D-21B7</Text>
            </View>
          </View>
        </View>

        {/* Download/Share */}
        <View className="flex gap-3 mb-4" style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            activeOpacity={0.8}
            className="flex-1 bg-[#0A1A2F] rounded-2xl px-5 py-4 border border-white/5 flex items-center justify-center gap-2 transition-all duration-200 active:bg-[#050B12]"
            style={{
              flex: 1,
              flexDirection: 'row',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.05)',
            }}
          >
            <Ionicons name="download" size={20} color="#C6CFD9" />
            <Text className="text-[#F5F7FA]" style={{ fontSize: 15, fontWeight: '500' }}>
              Download
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            className="flex-1 bg-[#0A1A2F] rounded-2xl px-5 py-4 border border-white/5 flex items-center justify-center gap-2 transition-all duration-200 active:bg-[#050B12]"
            style={{
              flex: 1,
              flexDirection: 'row',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.05)',
            }}
          >
            <Ionicons name="share-social" size={20} color="#C6CFD9" />
            <Text className="text-[#F5F7FA]" style={{ fontSize: 15, fontWeight: '500' }}>
              Share
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="px-6 pb-8 bg-gradient-to-t from-[#050B12] via-[#050B12] to-transparent pt-6">
        <TouchableOpacity
          onPress={onBookAgain}
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
            Book Again
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
