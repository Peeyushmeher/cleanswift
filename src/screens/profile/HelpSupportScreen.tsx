import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileStackParamList } from '../../navigation/ProfileStack';
import { COLORS } from '../../theme/colors';

// Support contact info - update these with your real details
const SUPPORT_PHONE = '+1-800-CLEAN-SW'; // Replace with real number
const SUPPORT_EMAIL = 'support@cleanswift.app'; // Replace with real email

type Props = NativeStackScreenProps<ProfileStackParamList, 'HelpSupport'>;

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
    answer: 'Payment is processed securely at the time of booking using Apple Pay or Stripe. You will receive a detailed receipt after service completion.',
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

export default function HelpSupportScreen({ navigation }: Props) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleContactAction = async (action: string) => {
    try {
      switch (action) {
        case 'call':
          const phoneUrl = `tel:${SUPPORT_PHONE.replace(/[^0-9+]/g, '')}`;
          const canCall = await Linking.canOpenURL(phoneUrl);
          if (canCall) {
            await Linking.openURL(phoneUrl);
          } else {
            Alert.alert('Unable to Call', 'Phone calls are not supported on this device.');
          }
          break;
        case 'email':
          const emailUrl = `mailto:${SUPPORT_EMAIL}?subject=CleanSwift Support Request`;
          const canEmail = await Linking.canOpenURL(emailUrl);
          if (canEmail) {
            await Linking.openURL(emailUrl);
          } else {
            Alert.alert('Unable to Email', 'Email is not configured on this device.');
          }
          break;
        case 'chat':
          // For now, show a message. In future, integrate with Intercom/Zendesk/etc.
          Alert.alert(
            'Live Chat', 
            'Live chat support is coming soon! In the meantime, please email us or call our support line.',
            [
              { text: 'Email Us', onPress: () => handleContactAction('email') },
              { text: 'Call Us', onPress: () => handleContactAction('call') },
              { text: 'OK', style: 'cancel' },
            ]
          );
          break;
      }
    } catch (error) {
      console.error('Error handling contact action:', error);
      Alert.alert('Error', 'Unable to complete this action. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.text.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Support</Text>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Quick Actions */}
          <View style={styles.quickActionsSection}>
            <View style={styles.quickActionsList}>
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.8}
                  style={styles.quickActionCard}
                >
                  <View style={styles.quickActionIconContainer}>
                    <Ionicons name={action.icon} size={24} color={COLORS.accent.blue} />
                  </View>
                  <View style={styles.quickActionContent}>
                    <Text style={styles.quickActionTitle}>{action.title}</Text>
                    <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* FAQs */}
          <View style={styles.faqSection}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            <View style={styles.faqList}>
              {faqs.map((faq, index) => {
                const isExpanded = expandedFaq === index;
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setExpandedFaq(isExpanded ? null : index)}
                    activeOpacity={0.8}
                    style={styles.faqCard}
                  >
                    <View style={styles.faqHeader}>
                      <Text style={styles.faqQuestion}>{faq.question}</Text>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={COLORS.text.secondary}
                        style={{
                          transform: [{ rotate: isExpanded ? '90deg' : '0deg' }],
                        }}
                      />
                    </View>
                    {isExpanded && (
                      <Text style={styles.faqAnswer}>{faq.answer}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Contact Us */}
          <View style={styles.contactSection}>
            <Text style={styles.sectionTitle}>Contact Us</Text>
            <View style={styles.contactCard}>
              {contactOptions.map((option, index) => {
                const isLast = index === contactOptions.length - 1;
                return (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.8}
                    onPress={() => handleContactAction(option.action)}
                    style={[
                      styles.contactOption,
                      !isLast && styles.contactOptionWithBorder,
                    ]}
                  >
                    <Ionicons name={option.icon} size={20} color={COLORS.text.secondary} />
                    <View style={styles.contactOptionContent}>
                      <Text style={styles.contactOptionLabel}>{option.label}</Text>
                      <Text style={styles.contactOptionSubtitle}>{option.subtitle}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.text.secondary} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Policies */}
          <View style={styles.policiesSection}>
            <Text style={styles.sectionTitle}>Policies</Text>
            <View style={styles.policiesCard}>
              {policies.map((policy, index) => {
                const isLast = index === policies.length - 1;
                return (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.8}
                    style={[
                      styles.policyOption,
                      !isLast && styles.policyOptionWithBorder,
                    ]}
                  >
                    <Text style={styles.policyLabel}>{policy.label}</Text>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.text.secondary} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: COLORS.text.primary,
    fontSize: 28,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  quickActionsSection: {
    marginBottom: 32,
  },
  quickActionsList: {
    gap: 12,
  },
  quickActionCard: {
    width: '100%',
    backgroundColor: COLORS.bg.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  quickActionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.accentBg.blue10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    color: COLORS.text.secondary,
    fontSize: 14,
  },
  faqSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: COLORS.text.primary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  faqList: {
    gap: 12,
  },
  faqCard: {
    width: '100%',
    backgroundColor: COLORS.bg.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  faqQuestion: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  faqAnswer: {
    color: COLORS.text.secondary,
    fontSize: 15,
    marginTop: 12,
  },
  contactSection: {
    marginBottom: 32,
  },
  contactCard: {
    backgroundColor: COLORS.bg.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    overflow: 'hidden',
  },
  contactOption: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  contactOptionWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  contactOptionContent: {
    flex: 1,
  },
  contactOptionLabel: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  contactOptionSubtitle: {
    color: COLORS.text.secondary,
    fontSize: 13,
  },
  policiesSection: {
    marginBottom: 32,
  },
  policiesCard: {
    backgroundColor: COLORS.bg.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    overflow: 'hidden',
  },
  policyOption: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  policyOptionWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  policyLabel: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '500',
  },
});
