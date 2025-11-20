import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HomeScreenProps {
  onBookService: () => void;
  onSelectCar: () => void;
  onProfile?: () => void;
  onOrders?: () => void;
}

const quickActions = [
  { icon: 'water' as const, label: 'Quick Wash', color: '#1DA4F3' },
  { icon: 'sparkles' as const, label: 'Full Detail', color: '#6FF0C4' },
  { icon: 'leaf' as const, label: 'Interior', color: '#1DA4F3' },
  { icon: 'star' as const, label: 'Exterior', color: '#6FF0C4' },
  { icon: 'cube' as const, label: 'Luxury Package', color: '#1DA4F3' },
];

export default function HomeScreen({ onBookService, onSelectCar, onProfile, onOrders }: HomeScreenProps) {
  return (
    <View className="fixed inset-0 bg-gradient-to-b from-[#0A1A2F] to-[#050B12] flex flex-col">
      {/* Main Content - Scrollable */}
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-6 pt-16 pb-8 flex items-center justify-between" style={{ flexDirection: 'row' }}>
          <View>
            <Text className="text-[#C6CFD9] mb-2.5" style={{ fontSize: 14 }}>Good Morning</Text>
            <Text className="text-[#F5F7FA]" style={{ fontSize: 28, fontWeight: '600' }}>
              CleanSwift
            </Text>
          </View>
          <TouchableOpacity
            onPress={onProfile}
            activeOpacity={0.8}
            className="w-12 h-12 rounded-full border-2 border-[#6FF0C4]/40 bg-[#6FF0C4]/5 flex items-center justify-center transition-all duration-200 active:scale-95 hover:border-[#6FF0C4]/60 hover:bg-[#6FF0C4]/10"
            style={{
              shadowColor: '#6FF0C4',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
            }}
          >
            <Ionicons name="person" size={24} color="#6FF0C4" />
          </TouchableOpacity>
        </View>

        {/* Hero Car Card */}
        <View className="px-6 mb-8">
          <TouchableOpacity
            onPress={onBookService}
            activeOpacity={0.95}
            className="w-full bg-[#0A1A2F] rounded-3xl p-7 shadow-xl border border-white/5 transition-all duration-200 active:scale-[0.99]"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 20 },
              shadowOpacity: 0.4,
              shadowRadius: 40,
            }}
          >
            {/* Car Icon */}
            <View className="mb-6 relative">
              <Ionicons name="car-sport" size={64} color="#6FF0C4" />
              <View className="absolute inset-0 blur-2xl opacity-20 bg-[#6FF0C4]" />
            </View>

            {/* Car Info */}
            <View className="mb-6">
              <Text className="text-[#F5F7FA] mb-1.5" style={{ fontSize: 20, fontWeight: '600' }}>
                2022 BMW M4
              </Text>
              <Text className="text-[#C6CFD9]" style={{ fontSize: 14 }}>
                Primary Vehicle
              </Text>
            </View>

            {/* CTA Buttons */}
            <View className="flex gap-3" style={{ flexDirection: 'row' }}>
              <TouchableOpacity
                onPress={onBookService}
                activeOpacity={0.8}
                className="flex-1 bg-[#1DA4F3] text-white py-4 rounded-full transition-all duration-200 active:scale-[0.98] shadow-lg shadow-[#1DA4F3]/25"
                style={{
                  minHeight: 48,
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#1DA4F3',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                }}
              >
                <Text className="text-white" style={{ fontSize: 16, fontWeight: '600' }}>
                  Book a Wash
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onSelectCar}
                activeOpacity={0.8}
                className="px-7 bg-[#0A1A2F] border border-[#C6CFD9]/20 text-[#F5F7FA] py-4 rounded-full transition-all duration-200 active:scale-[0.98] hover:border-[#6FF0C4]/30"
                style={{
                  minHeight: 48,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: 'rgba(198,207,217,0.2)',
                }}
              >
                <Text className="text-[#F5F7FA]" style={{ fontSize: 15, fontWeight: '600' }}>
                  Change
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-8">
          <Text className="text-[#F5F7FA] mb-5" style={{ fontSize: 18, fontWeight: '600' }}>
            Quick Actions
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex gap-3 pb-2"
            contentContainerStyle={{ gap: 12 }}
          >
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                onPress={onBookService}
                activeOpacity={0.8}
                className="flex-shrink-0 bg-[#0A1A2F] rounded-2xl p-5 border border-white/5 transition-all duration-200 active:scale-95 hover:border-[#6FF0C4]/30"
                style={{ width: 128, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}
              >
                <Ionicons
                  name={action.icon}
                  size={32}
                  color={action.color}
                  style={{ marginBottom: 14, alignSelf: 'center' }}
                />
                <Text className="text-[#C6CFD9] text-center" style={{ fontSize: 13 }}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Upcoming Bookings */}
        <View className="px-6 mb-24">
          <Text className="text-[#F5F7FA] mb-5" style={{ fontSize: 18, fontWeight: '600' }}>
            Upcoming
          </Text>
          <View
            className="bg-[#0A1A2F] rounded-2xl p-6 border border-[#1DA4F3]/20 flex items-center gap-4"
            style={{
              flexDirection: 'row',
              shadowColor: '#1DA4F3',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.1,
              shadowRadius: 20,
              borderWidth: 1,
              borderColor: 'rgba(29,164,243,0.2)',
            }}
          >
            <View className="w-12 h-12 rounded-full bg-[#1DA4F3]/10 flex items-center justify-center flex-shrink-0">
              <Ionicons name="time" size={24} color="#1DA4F3" />
            </View>
            <View className="flex-1">
              <Text className="text-[#F5F7FA] mb-1.5" style={{ fontSize: 16, fontWeight: '500' }}>
                Full Detail Service
              </Text>
              <Text className="text-[#C6CFD9]" style={{ fontSize: 14 }}>
                Tomorrow, 2:00 PM
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View
        className="bg-[#0A1A2F]/95 backdrop-blur-lg border-t border-white/5 px-6 py-4 safe-area-inset-bottom"
        style={{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' }}
      >
        <View className="flex items-center justify-around" style={{ flexDirection: 'row' }}>
          <TouchableOpacity className="flex flex-col items-center gap-1.5">
            <Ionicons name="home" size={24} color="#6FF0C4" />
            <Text className="text-[#6FF0C4]" style={{ fontSize: 11, fontWeight: '500' }}>
              Home
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onBookService} className="flex flex-col items-center gap-1.5">
            <Ionicons name="water" size={24} color="#C6CFD9" />
            <Text className="text-[#C6CFD9]" style={{ fontSize: 11, fontWeight: '500' }}>
              Book
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onOrders} className="flex flex-col items-center gap-1.5">
            <Ionicons name="cube" size={24} color="#C6CFD9" />
            <Text className="text-[#C6CFD9]" style={{ fontSize: 11, fontWeight: '500' }}>
              Orders
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onProfile} className="flex flex-col items-center gap-1.5">
            <Ionicons name="person" size={24} color="#C6CFD9" />
            <Text className="text-[#C6CFD9]" style={{ fontSize: 11, fontWeight: '500' }}>
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
