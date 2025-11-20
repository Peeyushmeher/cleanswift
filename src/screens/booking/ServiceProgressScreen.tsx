import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ServiceProgressScreenProps {
  onComplete: () => void;
}

const steps = [
  { id: 1, title: 'Arrived', subtitle: 'Detailer is preparing equipment', icon: 'location' as const, status: 'completed' },
  { id: 2, title: 'Cleaning Exterior', subtitle: 'Deep cleaning your car', icon: 'water' as const, status: 'current' },
  { id: 3, title: 'Detailing Interior', subtitle: 'Interior refresh and detailing', icon: 'sparkles' as const, status: 'upcoming' },
  { id: 4, title: 'Final Touches', subtitle: 'Adding finishing treatments', icon: 'checkmark' as const, status: 'upcoming' },
];

export default function ServiceProgressScreen({ onComplete }: ServiceProgressScreenProps) {
  return (
    <View className="fixed inset-0 bg-gradient-to-b from-[#0A1A2F] to-[#050B12] flex flex-col">
      {/* Header */}
      <View className="px-6 pt-16 pb-6">
        <Text className="text-[#F5F7FA] text-center mb-2" style={{ fontSize: 28, fontWeight: '600', textAlign: 'center' }}>
          Cleaning In Progress
        </Text>
        <Text className="text-[#C6CFD9] text-center" style={{ fontSize: 15, textAlign: 'center' }}>
          Your detailer is working on your vehicle
        </Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView className="flex-1 px-6 pb-32" showsVerticalScrollIndicator={false}>
        {/* Progress Timeline */}
        <View className="mb-8">
          <View className="relative">
            {/* Vertical Line */}
            <View
              className="absolute left-6 top-0 bottom-0 w-0.5 bg-[#C6CFD9]/20"
              style={{
                position: 'absolute',
                left: 24,
                top: 0,
                bottom: 0,
                width: 2,
                backgroundColor: 'rgba(198,207,217,0.2)',
              }}
            />

            {/* Steps */}
            <View className="space-y-8" style={{ gap: 32 }}>
              {steps.map((step, index) => {
                const isCompleted = step.status === 'completed';
                const isCurrent = step.status === 'current';
                const isUpcoming = step.status === 'upcoming';

                return (
                  <View key={step.id} className="relative flex items-start gap-6" style={{ flexDirection: 'row' }}>
                    {/* Icon Circle */}
                    <View
                      className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCurrent
                          ? 'bg-[#6FF0C4]/20 ring-4 ring-[#6FF0C4]/30'
                          : isCompleted
                          ? 'bg-[#6FF0C4]/10'
                          : 'bg-[#0A1A2F] border-2 border-[#C6CFD9]/20'
                      }`}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: isCurrent
                          ? 'rgba(111,240,196,0.2)'
                          : isCompleted
                          ? 'rgba(111,240,196,0.1)'
                          : '#0A1A2F',
                        borderWidth: isCurrent ? 4 : isUpcoming ? 2 : 0,
                        borderColor: isCurrent
                          ? 'rgba(111,240,196,0.3)'
                          : isUpcoming
                          ? 'rgba(198,207,217,0.2)'
                          : 'transparent',
                      }}
                    >
                      <Ionicons
                        name={step.icon}
                        size={24}
                        color={isCurrent || isCompleted ? '#6FF0C4' : '#C6CFD9'}
                      />
                    </View>

                    {/* Content */}
                    <View className="flex-1 pt-1">
                      <Text
                        className={`mb-1 ${
                          isCurrent ? 'text-[#F5F7FA]' : isCompleted ? 'text-[#F5F7FA]/80' : 'text-[#C6CFD9]'
                        }`}
                        style={{
                          fontSize: 18,
                          fontWeight: isCurrent ? '600' : '500',
                          color: isCurrent ? '#F5F7FA' : isCompleted ? 'rgba(245,247,250,0.8)' : '#C6CFD9',
                        }}
                      >
                        {step.title}
                      </Text>
                      <Text
                        className={`${
                          isCurrent ? 'text-[#C6CFD9]' : 'text-[#C6CFD9]/60'
                        }`}
                        style={{
                          fontSize: 14,
                          color: isCurrent ? '#C6CFD9' : 'rgba(198,207,217,0.6)',
                        }}
                      >
                        {step.subtitle}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Estimated Time */}
        <View
          className="bg-[#0A1A2F] rounded-3xl p-6 mb-6 border border-white/5"
          style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}
        >
          <View className="text-center" style={{ alignItems: 'center' }}>
            <Text className="text-[#C6CFD9] mb-2" style={{ fontSize: 15 }}>
              Estimated Time Remaining
            </Text>
            <Text className="text-[#1DA4F3]" style={{ fontSize: 32, fontWeight: '700' }}>
              22 minutes
            </Text>
            <Text className="text-[#C6CFD9] mt-2" style={{ fontSize: 13, marginTop: 8 }}>
              Finishing by 3:45 PM
            </Text>
          </View>
        </View>

        {/* Detailer Card */}
        <View
          className="bg-[#0A1A2F] rounded-3xl p-6 border border-white/5"
          style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}
        >
          <View className="flex items-center gap-4" style={{ flexDirection: 'row' }}>
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
              <Text className="text-[#F5F7FA] mb-1" style={{ fontSize: 17, fontWeight: '600' }}>
                Marcus Thompson
              </Text>
              <Text className="text-[#C6CFD9]" style={{ fontSize: 14 }}>
                On-site
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="flex gap-2" style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                activeOpacity={0.8}
                className="w-10 h-10 rounded-full bg-[#050B12] border border-[#C6CFD9]/20 flex items-center justify-center transition-all duration-200 active:scale-95"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#050B12',
                  borderWidth: 1,
                  borderColor: 'rgba(198,207,217,0.2)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="call" size={16} color="#F5F7FA" />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                className="w-10 h-10 rounded-full bg-[#050B12] border border-[#C6CFD9]/20 flex items-center justify-center transition-all duration-200 active:scale-95"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#050B12',
                  borderWidth: 1,
                  borderColor: 'rgba(198,207,217,0.2)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="chatbubble" size={16} color="#F5F7FA" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Note */}
        <Text className="text-[#C6CFD9] text-center mt-6" style={{ fontSize: 14, textAlign: 'center', marginTop: 24 }}>
          We'll notify you once the detailing is complete.
        </Text>
      </ScrollView>

      {/* Demo: Auto-transition */}
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
            Complete Service
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
