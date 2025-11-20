import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BookingDateTimeScreenProps {
  onBack: () => void;
  onContinue: () => void;
}

const dates = [
  { day: 'Mon', date: 13 },
  { day: 'Tue', date: 14 },
  { day: 'Wed', date: 15 },
  { day: 'Thu', date: 16, available: true },
  { day: 'Fri', date: 17, available: true },
  { day: 'Sat', date: 18, available: true },
  { day: 'Sun', date: 19, available: true },
];

const timeSlots = [
  { time: '8:00 AM', available: true },
  { time: '9:30 AM', available: true },
  { time: '11:00 AM', available: true },
  { time: '1:00 PM', available: true },
  { time: '3:30 PM', available: true },
  { time: '5:00 PM', available: false },
  { time: '6:30 PM', available: false },
  { time: '8:00 PM', available: false },
];

export default function BookingDateTimeScreen({ onBack, onContinue }: BookingDateTimeScreenProps) {
  const [selectedDate, setSelectedDate] = useState<number>(16);
  const [selectedTime, setSelectedTime] = useState<string>('');

  return (
    <View className="fixed inset-0 bg-gradient-to-b from-[#0A1A2F] to-[#050B12] flex flex-col">
      {/* Header */}
      <View className="px-6 pt-16 pb-6 flex items-center gap-4" style={{ flexDirection: 'row' }}>
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.7}
          className="text-[#C6CFD9] hover:text-[#6FF0C4] transition-colors active:scale-95"
        >
          <Ionicons name="chevron-back" size={24} color="#C6CFD9" />
        </TouchableOpacity>
        <Text className="text-[#F5F7FA]" style={{ fontSize: 28, fontWeight: '600' }}>
          Choose Date & Time
        </Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView className="flex-1 px-6 pb-32" showsVerticalScrollIndicator={false}>
        {/* Date Picker */}
        <View className="mb-8">
          <View className="flex items-center gap-2 mb-5" style={{ flexDirection: 'row' }}>
            <Ionicons name="calendar" size={20} color="#6FF0C4" />
            <Text className="text-[#F5F7FA]" style={{ fontSize: 18, fontWeight: '600' }}>
              Select Date
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex gap-3 pb-2"
            contentContainerStyle={{ gap: 12 }}
          >
            {dates.map((date) => {
              const isSelected = selectedDate === date.date;
              const isAvailable = date.available;

              return (
                <TouchableOpacity
                  key={date.date}
                  onPress={() => isAvailable && setSelectedDate(date.date)}
                  disabled={!isAvailable}
                  activeOpacity={isAvailable ? 0.8 : 1}
                  className={`flex-shrink-0 w-20 py-4 rounded-2xl transition-all duration-200 ${
                    isSelected
                      ? 'bg-[#0A1A2F] border-2 border-[#6FF0C4] shadow-lg shadow-[#6FF0C4]/20'
                      : isAvailable
                      ? 'bg-[#0A1A2F] border border-white/5 active:scale-95 hover:border-white/10'
                      : 'bg-[#0A1A2F]/30 border border-white/5 opacity-40 cursor-not-allowed'
                  }`}
                  style={{
                    width: 80,
                    borderWidth: isSelected ? 2 : 1,
                    borderColor: isSelected ? '#6FF0C4' : 'rgba(255,255,255,0.05)',
                    backgroundColor: isAvailable ? '#0A1A2F' : 'rgba(10,26,47,0.3)',
                    opacity: isAvailable ? 1 : 0.4,
                    shadowColor: isSelected ? '#6FF0C4' : 'transparent',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isSelected ? 0.2 : 0,
                    shadowRadius: 8,
                  }}
                >
                  <Text
                    className={`mb-1 ${
                      isSelected ? 'text-[#6FF0C4]' : 'text-[#C6CFD9]'
                    }`}
                    style={{ fontSize: 14, textAlign: 'center', color: isSelected ? '#6FF0C4' : '#C6CFD9' }}
                  >
                    {date.day}
                  </Text>
                  <Text
                    className={`${isSelected ? 'text-[#F5F7FA]' : 'text-[#F5F7FA]'}`}
                    style={{ fontSize: 24, fontWeight: '600', textAlign: 'center', color: '#F5F7FA' }}
                  >
                    {date.date}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Time Slot Grid */}
        <View className="mb-8">
          <View className="flex items-center gap-2 mb-5" style={{ flexDirection: 'row' }}>
            <Ionicons name="time" size={20} color="#1DA4F3" />
            <Text className="text-[#F5F7FA]" style={{ fontSize: 18, fontWeight: '600' }}>
              Select Time
            </Text>
          </View>
          <View
            className="grid grid-cols-2 gap-3"
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            {timeSlots.map((slot) => {
              const isSelected = selectedTime === slot.time;
              const isAvailable = slot.available;

              return (
                <TouchableOpacity
                  key={slot.time}
                  onPress={() => isAvailable && setSelectedTime(slot.time)}
                  disabled={!isAvailable}
                  activeOpacity={isAvailable ? 0.8 : 1}
                  className={`py-4 rounded-2xl transition-all duration-200 ${
                    isSelected
                      ? 'bg-[#0A1A2F] border-2 border-[#6FF0C4] shadow-lg shadow-[#6FF0C4]/20'
                      : isAvailable
                      ? 'bg-[#0A1A2F] border border-white/5 active:scale-95 hover:border-white/10'
                      : 'bg-[#0A1A2F]/30 border border-white/5 opacity-40 cursor-not-allowed'
                  }`}
                  style={{
                    minHeight: 56,
                    width: '48%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: isSelected ? 2 : 1,
                    borderColor: isSelected ? '#6FF0C4' : 'rgba(255,255,255,0.05)',
                    backgroundColor: isAvailable ? '#0A1A2F' : 'rgba(10,26,47,0.3)',
                    opacity: isAvailable ? 1 : 0.4,
                    shadowColor: isSelected ? '#6FF0C4' : 'transparent',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isSelected ? 0.2 : 0,
                    shadowRadius: 8,
                  }}
                >
                  <Text
                    className={`${
                      isSelected ? 'text-[#6FF0C4]' : isAvailable ? 'text-[#F5F7FA]' : 'text-[#C6CFD9]'
                    }`}
                    style={{
                      fontSize: 16,
                      fontWeight: '500',
                      color: isSelected ? '#6FF0C4' : isAvailable ? '#F5F7FA' : '#C6CFD9',
                    }}
                  >
                    {slot.time}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="px-6 pb-8 bg-gradient-to-t from-[#050B12] via-[#050B12] to-transparent pt-6">
        <TouchableOpacity
          onPress={onContinue}
          disabled={!selectedTime}
          activeOpacity={selectedTime ? 0.8 : 1}
          className={`w-full py-4 rounded-full transition-all duration-200 ${
            selectedTime
              ? 'bg-[#1DA4F3] text-white active:scale-[0.98] shadow-lg shadow-[#1DA4F3]/20'
              : 'bg-[#0A1A2F] text-[#C6CFD9]/50 cursor-not-allowed'
          }`}
          style={{
            minHeight: 56,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: selectedTime ? '#1DA4F3' : '#0A1A2F',
            shadowColor: selectedTime ? '#1DA4F3' : 'transparent',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: selectedTime ? 0.2 : 0,
            shadowRadius: 8,
          }}
        >
          <Text
            className={selectedTime ? 'text-white' : 'text-[#C6CFD9]/50'}
            style={{
              fontSize: 17,
              fontWeight: '600',
              color: selectedTime ? 'white' : 'rgba(198,207,217,0.5)',
            }}
          >
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
