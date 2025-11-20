import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';

interface LiveTrackingScreenProps {
  onComplete: () => void;
}

export default function LiveTrackingScreen({ onComplete }: LiveTrackingScreenProps) {
  return (
    <View className="fixed inset-0 bg-[#050B12] flex flex-col">
      {/* Map Area (Simulated) */}
      <View className="flex-1 relative bg-gradient-to-b from-[#0A1A2F] to-[#050B12]">
        {/* Simulated map with route */}
        <View className="absolute inset-0 flex items-center justify-center">
          <View className="relative w-full h-full">
            {/* Route line simulation */}
            <Svg
              className="absolute inset-0 w-full h-full"
              style={{ opacity: 0.6, position: 'absolute', width: '100%', height: '100%' }}
            >
              <Path
                d="M 50 400 Q 150 300, 250 350 T 350 300"
                stroke="#6FF0C4"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
            </Svg>

            {/* Detailer location */}
            <View className="absolute" style={{ top: '40%', left: '60%' }}>
              <View
                className="w-3 h-3 bg-[#6FF0C4] rounded-full animate-pulse shadow-lg shadow-[#6FF0C4]/50"
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: '#6FF0C4',
                  borderRadius: 6,
                  shadowColor: '#6FF0C4',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 8,
                }}
              />
            </View>

            {/* User location */}
            <View className="absolute" style={{ top: '70%', left: '20%' }}>
              <View
                className="w-4 h-4 bg-[#1DA4F3] rounded-full ring-4 ring-[#1DA4F3]/30"
                style={{
                  width: 16,
                  height: 16,
                  backgroundColor: '#1DA4F3',
                  borderRadius: 8,
                  borderWidth: 4,
                  borderColor: 'rgba(29,164,243,0.3)',
                }}
              />
            </View>
          </View>
        </View>

        {/* Status Text */}
        <View className="absolute top-20 left-0 right-0 px-6">
          <View className="text-center" style={{ alignItems: 'center' }}>
            <Text className="text-[#F5F7FA] mb-1" style={{ fontSize: 20, fontWeight: '600' }}>
              Marcus is on the way
            </Text>
            <Text className="text-[#C6CFD9]" style={{ fontSize: 15 }}>
              Arriving in 12–18 minutes
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom Card */}
      <View
        className="bg-[#0A1A2F] rounded-t-[28px] shadow-2xl border-t border-white/5"
        style={{
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.05)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
        }}
      >
        <View className="px-6 py-6">
          {/* Detailer Info Row */}
          <View className="flex items-center gap-4 mb-6" style={{ flexDirection: 'row' }}>
            <View
              className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1DA4F3]/20 to-[#6FF0C4]/20 flex items-center justify-center ring-2 ring-[#6FF0C4]/30"
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: 'rgba(29,164,243,0.15)',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: 'rgba(111,240,196,0.3)',
              }}
            >
              <Text className="text-[#F5F7FA]" style={{ fontSize: 24, fontWeight: '600' }}>
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
                Ford Transit • Black
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="flex gap-2" style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                activeOpacity={0.8}
                className="w-12 h-12 rounded-full bg-[#050B12] border border-[#C6CFD9]/20 flex items-center justify-center transition-all duration-200 active:scale-95"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: '#050B12',
                  borderWidth: 1,
                  borderColor: 'rgba(198,207,217,0.2)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="call" size={20} color="#F5F7FA" />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                className="w-12 h-12 rounded-full bg-[#050B12] border border-[#C6CFD9]/20 flex items-center justify-center transition-all duration-200 active:scale-95"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: '#050B12',
                  borderWidth: 1,
                  borderColor: 'rgba(198,207,217,0.2)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="chatbubble" size={20} color="#F5F7FA" />
              </TouchableOpacity>
            </View>
          </View>

          {/* ETA */}
          <View className="bg-[#050B12] rounded-2xl p-4 mb-4" style={{ backgroundColor: '#050B12' }}>
            <View className="flex items-center justify-between" style={{ flexDirection: 'row' }}>
              <Text className="text-[#C6CFD9]" style={{ fontSize: 15 }}>
                Estimated Arrival
              </Text>
              <Text className="text-[#1DA4F3]" style={{ fontSize: 18, fontWeight: '600' }}>
                12–18 minutes
              </Text>
            </View>
          </View>

          {/* Note */}
          <Text className="text-[#C6CFD9] text-center" style={{ fontSize: 14, textAlign: 'center' }}>
            Please ensure your vehicle is accessible.
          </Text>
        </View>

        {/* Safe area padding */}
        <View className="h-6" style={{ height: 24 }} />
      </View>

      {/* Demo: Auto-transition after 3 seconds */}
      <View className="fixed top-4 right-4" style={{ position: 'absolute', top: 16, right: 16 }}>
        <TouchableOpacity
          onPress={onComplete}
          activeOpacity={0.8}
          className="px-4 py-2 bg-[#1DA4F3] text-white rounded-full"
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            backgroundColor: '#1DA4F3',
            borderRadius: 999,
          }}
        >
          <Text className="text-white" style={{ fontSize: 12 }}>
            Skip to Service
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
