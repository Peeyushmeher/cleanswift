import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { DEMO_DETAILER } from '../../config/demoData';
import { COLORS } from '../../theme/colors';

interface LiveTrackingScreenProps {
  onComplete: () => void;
}

export default function LiveTrackingScreen({ onComplete }: LiveTrackingScreenProps) {
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: COLORS.bg.primary, flex: 1, flexDirection: 'column' }}>
      {/* Map Area (Simulated) */}
      <View style={{ flex: 1, position: 'relative', backgroundColor: COLORS.bg.primary }}>
        {/* Simulated map with route */}
        <View className="absolute inset-0 flex items-center justify-center">
          <View className="relative w-full h-full">
            {/* Route line simulation */}
            <Svg
              style={{ opacity: 0.6, position: 'absolute', width: '100%', height: '100%' }}
            >
              <Path
                d="M 50 400 Q 150 300, 250 350 T 350 300"
                stroke={COLORS.accent.mint}
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
            </Svg>

            {/* Detailer location */}
            <View style={{ position: 'absolute', top: '40%', left: '60%' }}>
              <View
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: COLORS.accent.mint,
                  borderRadius: 6,
                  shadowColor: COLORS.shadow.mint,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 8,
                }}
              />
            </View>

            {/* User location */}
            <View style={{ position: 'absolute', top: '70%', left: '20%' }}>
              <View
                style={{
                  width: 16,
                  height: 16,
                  backgroundColor: COLORS.accent.blue,
                  borderRadius: 8,
                  borderWidth: 4,
                  borderColor: COLORS.accentBg.blue20,
                }}
              />
            </View>
          </View>
        </View>

        {/* Status Text */}
        <View style={{ position: 'absolute', top: 80, left: 0, right: 0, paddingHorizontal: 24 }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: COLORS.text.primary, fontSize: 20, fontWeight: '600', marginBottom: 4 }}>
              {DEMO_DETAILER.name} is on the way
            </Text>
            <Text style={{ color: COLORS.text.secondary, fontSize: 15 }}>
              Arriving in {DEMO_DETAILER.arrivalTime}
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom Card */}
      <View
        style={{
          backgroundColor: COLORS.bg.surface,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          borderTopWidth: 1,
          borderTopColor: COLORS.border.subtle,
          shadowColor: COLORS.shadow.default,
          shadowOffset: { width: 0, height: -10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
        }}
      >
        <View style={{ paddingHorizontal: 24, paddingVertical: 24 }}>
          {/* Detailer Info Row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: COLORS.accentBg.blue15,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: COLORS.accentBg.mint30,
              }}
            >
              <Text style={{ color: COLORS.text.primary, fontSize: 24, fontWeight: '600' }}>
                MT
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ color: COLORS.text.primary, fontSize: 18, fontWeight: '600', marginBottom: 4 }}>
                Marcus Thompson
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                <Ionicons name="star" size={16} color={COLORS.accent.mint} />
                <Text style={{ color: COLORS.text.primary, fontSize: 14 }}>
                  4.9
                </Text>
                <Text style={{ color: COLORS.text.secondary, fontSize: 12 }}>
                  (142 reviews)
                </Text>
              </View>
              <Text style={{ color: COLORS.text.secondary, fontSize: 14 }}>
                Ford Transit • Black
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: COLORS.bg.primary,
                  borderWidth: 1,
                  borderColor: COLORS.border.emphasis,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="call" size={20} color={COLORS.text.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: COLORS.bg.primary,
                  borderWidth: 1,
                  borderColor: COLORS.border.emphasis,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="chatbubble" size={20} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* ETA */}
          <View style={{ backgroundColor: COLORS.bg.primary, borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: COLORS.text.secondary, fontSize: 15 }}>
                Estimated Arrival
              </Text>
              <Text style={{ color: COLORS.accent.blue, fontSize: 18, fontWeight: '600' }}>
                12–18 minutes
              </Text>
            </View>
          </View>

          {/* Note */}
          <Text style={{ color: COLORS.text.secondary, fontSize: 14, textAlign: 'center' }}>
            Please ensure your vehicle is accessible.
          </Text>
        </View>

        {/* Safe area padding */}
        <View style={{ height: 24 }} />
      </View>

      {/* Demo: Auto-transition after 3 seconds */}
      <View style={{ position: 'absolute', top: 16, right: 16 }}>
        <TouchableOpacity
          onPress={onComplete}
          activeOpacity={0.8}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            backgroundColor: COLORS.accent.blue,
            borderRadius: 999,
          }}
        >
          <Text style={{ color: COLORS.text.inverse, fontSize: 12 }}>
            Skip to Service
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
