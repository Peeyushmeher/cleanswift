import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HelpSupportScreenProps {
  onBack: () => void;
}

const quickActions = [
  { icon: 'alert-circle' as const, title: 'Report an Issue', subtitle: 'Having a problem? Let us know' },
  { icon: 'chatbubble' as const, title: 'Booking Not Completed?', subtitle: 'We will help you resolve it' },
  { icon: 'call' as const, title: 'Payment Problem', subtitle: 'Questions about charges' },
];

const faqs = [
  {
    question: 'How do I modify a booking?',
    answer: 'You can modify your booking up to 2 hours before the scheduled time from the Orders screen.',
  },
  {
    question: "What if my detailer is late?",
    answer: 'We track all detailers in real-time. If there are any delays, you will be notified immediately.',
  },
  {
    question: 'How do payments work?',
    answer: 'We securely store your payment method and charge you after service completion. You will receive a detailed receipt.',
  },
  {
    question: 'What happens during a detailing service?',
    answer: 'Our certified professionals follow a comprehensive checklist tailored to your selected service package.',
  },
  {
    question: 'How do I cancel?',
    answer: 'You can cancel free of charge up to 4 hours before your appointment. After that, a cancellation fee may apply.',
  },
];

const contactOptions = [
  { icon: 'call' as const, label: 'Call Support', subtitle: 'Available 24/7', action: 'call' },
  { icon: 'chatbubble' as const, label: 'Chat With Us', subtitle: 'Typically replies in 5 minutes', action: 'chat' },
  { icon: 'mail' as const, label: 'Email Support', subtitle: 'Response within 24 hours', action: 'email' },
];

const policies = [
  { label: 'Terms of Service', action: 'terms' },
  { label: 'Privacy Policy', action: 'privacy' },
  { label: 'Refund Policy', action: 'refund' },
];

export default function HelpSupportScreen({ onBack }: HelpSupportScreenProps) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

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
          Support
        </Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView className="flex-1 px-6 pb-8" showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View className="mb-8">
          <View className="space-y-3" style={{ gap: 12 }}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                className="w-full bg-[#0A1A2F] rounded-2xl p-5 border border-white/5 flex items-start gap-4 transition-all duration-200 active:bg-[#050B12]"
                style={{
                  flexDirection: 'row',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.05)',
                }}
              >
                <View
                  className="w-12 h-12 rounded-full bg-[#1DA4F3]/10 flex items-center justify-center flex-shrink-0"
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: 'rgba(29,164,243,0.1)',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name={action.icon} size={24} color="#1DA4F3" />
                </View>
                <View className="flex-1">
                  <Text className="text-[#F5F7FA] mb-1" style={{ fontSize: 16, fontWeight: '500' }}>
                    {action.title}
                  </Text>
                  <Text className="text-[#C6CFD9]" style={{ fontSize: 14 }}>
                    {action.subtitle}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQs */}
        <View className="mb-8">
          <Text className="text-[#F5F7FA] mb-4" style={{ fontSize: 18, fontWeight: '600' }}>
            Frequently Asked Questions
          </Text>
          <View className="space-y-3" style={{ gap: 12 }}>
            {faqs.map((faq, index) => {
              const isExpanded = expandedFaq === index;
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => setExpandedFaq(isExpanded ? null : index)}
                  activeOpacity={0.8}
                  className="w-full bg-[#0A1A2F] rounded-2xl p-5 border border-white/5 transition-all duration-200"
                  style={{
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.05)',
                  }}
                >
                  <View className="flex items-start justify-between gap-3" style={{ flexDirection: 'row' }}>
                    <Text className="text-[#F5F7FA] flex-1" style={{ fontSize: 16, fontWeight: '500', flex: 1 }}>
                      {faq.question}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#C6CFD9"
                      style={{
                        transform: [{ rotate: isExpanded ? '90deg' : '0deg' }],
                      }}
                    />
                  </View>
                  {isExpanded && (
                    <Text className="text-[#C6CFD9] mt-3" style={{ fontSize: 15, marginTop: 12 }}>
                      {faq.answer}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Contact Us */}
        <View className="mb-8">
          <Text className="text-[#F5F7FA] mb-4" style={{ fontSize: 18, fontWeight: '600' }}>
            Contact Us
          </Text>
          <View
            className="bg-[#0A1A2F] rounded-2xl border border-white/5 overflow-hidden"
            style={{
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.05)',
              borderRadius: 16,
              overflow: 'hidden',
            }}
          >
            {contactOptions.map((option, index) => {
              const isLast = index === contactOptions.length - 1;
              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.8}
                  className={`w-full flex items-center gap-4 px-5 py-4 transition-all duration-200 active:bg-[#050B12] ${
                    !isLast ? 'border-b border-[#C6CFD9]/10' : ''
                  }`}
                  style={{
                    flexDirection: 'row',
                    borderBottomWidth: isLast ? 0 : 1,
                    borderBottomColor: isLast ? 'transparent' : 'rgba(198,207,217,0.1)',
                  }}
                >
                  <Ionicons name={option.icon} size={20} color="#C6CFD9" />
                  <View className="flex-1">
                    <Text className="text-[#F5F7FA] mb-0.5" style={{ fontSize: 16, fontWeight: '500' }}>
                      {option.label}
                    </Text>
                    <Text className="text-[#C6CFD9]" style={{ fontSize: 13 }}>
                      {option.subtitle}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#C6CFD9" />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Policies */}
        <View className="mb-8">
          <Text className="text-[#F5F7FA] mb-4" style={{ fontSize: 18, fontWeight: '600' }}>
            Policies
          </Text>
          <View
            className="bg-[#0A1A2F] rounded-2xl border border-white/5 overflow-hidden"
            style={{
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.05)',
              borderRadius: 16,
              overflow: 'hidden',
            }}
          >
            {policies.map((policy, index) => {
              const isLast = index === policies.length - 1;
              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.8}
                  className={`w-full flex items-center justify-between px-5 py-4 transition-all duration-200 active:bg-[#050B12] ${
                    !isLast ? 'border-b border-[#C6CFD9]/10' : ''
                  }`}
                  style={{
                    flexDirection: 'row',
                    borderBottomWidth: isLast ? 0 : 1,
                    borderBottomColor: isLast ? 'transparent' : 'rgba(198,207,217,0.1)',
                  }}
                >
                  <Text className="text-[#F5F7FA]" style={{ fontSize: 16, fontWeight: '500' }}>
                    {policy.label}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#C6CFD9" />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
