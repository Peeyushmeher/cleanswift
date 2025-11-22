import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BookingStackParamList } from '../../navigation/BookingStack';
import { COLORS } from '../../theme/colors';

type Props = NativeStackScreenProps<BookingStackParamList, 'AddPaymentCard'>;

export default function AddPaymentCardScreen({ navigation }: Props) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [setAsDefault, setSetAsDefault] = useState(true);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + ' / ' + v.slice(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (value: string) => {
    setCardNumber(formatCardNumber(value));
  };

  const handleExpiryChange = (value: string) => {
    setExpiry(formatExpiry(value));
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = () => {
    // TODO: Save card to backend/Stripe
    // For now, just navigate back to PaymentMethod
    navigation.goBack();
  };

  const isFormValid = cardNumber.length >= 15 && expiry.length >= 5 && cvc.length >= 3 && name.length > 0;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBack}
            activeOpacity={0.7}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.text.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Card</Text>
        </View>

        {/* Form - Scrollable */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Security Statement */}
          <Text style={styles.securityText}>
            Your payment information is encrypted and securely stored.
          </Text>

          {/* Minimal Card Visual */}
          <View style={styles.cardPreview}>
            <View style={styles.cardHeader}>
              <Ionicons name="card" size={32} color={COLORS.text.secondary} />
              <View style={styles.chipPlaceholder} />
            </View>
            <View style={styles.cardDivider} />
            <Text style={styles.cardNumber}>
              {cardNumber || '•••• •••• •••• ••••'}
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formFields}>
            {/* Card Number */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Card Number</Text>
              <TextInput
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChangeText={handleCardNumberChange}
                maxLength={19}
                keyboardType="numeric"
                placeholderTextColor={COLORS.text.disabled}
                style={styles.inputCardNumber}
              />
            </View>

            {/* Expiry & CVC Row */}
            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>Expiry Date</Text>
                <TextInput
                  placeholder="MM / YY"
                  value={expiry}
                  onChangeText={handleExpiryChange}
                  maxLength={7}
                  keyboardType="numeric"
                  placeholderTextColor={COLORS.text.disabled}
                  style={styles.input}
                />
              </View>

              <View style={styles.halfField}>
                <Text style={styles.label}>CVC</Text>
                <TextInput
                  placeholder="123"
                  value={cvc}
                  onChangeText={(value) => setCvc(value.replace(/[^0-9]/g, '').slice(0, 4))}
                  maxLength={4}
                  keyboardType="numeric"
                  placeholderTextColor={COLORS.text.disabled}
                  style={styles.input}
                />
              </View>
            </View>

            {/* Name on Card */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Name on Card</Text>
              <TextInput
                placeholder="JOHN DOE"
                value={name}
                onChangeText={(value) => setName(value.toUpperCase())}
                autoCapitalize="characters"
                placeholderTextColor={COLORS.text.disabled}
                style={styles.input}
              />
            </View>

            {/* Default Card Toggle */}
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Set as default payment method</Text>
              <TouchableOpacity
                onPress={() => setSetAsDefault(!setAsDefault)}
                activeOpacity={0.8}
                style={[
                  styles.toggleTrack,
                  setAsDefault && styles.toggleTrackActive,
                ]}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    { transform: [{ translateX: setAsDefault ? 24 : 4 }] },
                  ]}
                />
              </TouchableOpacity>
            </View>

            {/* Bottom CTA */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={!isFormValid}
              activeOpacity={isFormValid ? 0.8 : 1}
              style={[
                styles.saveButton,
                !isFormValid && styles.saveButtonDisabled,
              ]}
            >
              <Text
                style={[
                  styles.saveButtonText,
                  !isFormValid && styles.saveButtonTextDisabled,
                ]}
              >
                Save Card
              </Text>
            </TouchableOpacity>
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
  securityText: {
    color: COLORS.text.secondary,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 32,
  },
  cardPreview: {
    marginBottom: 32,
    backgroundColor: COLORS.bg.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border.emphasis,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  chipPlaceholder: {
    width: 40,
    height: 24,
    backgroundColor: COLORS.border.emphasis,
    borderRadius: 4,
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.border.default,
    marginBottom: 16,
  },
  cardNumber: {
    color: COLORS.text.secondary,
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 2,
  },
  formFields: {
    gap: 16,
  },
  fieldContainer: {
    gap: 8,
  },
  label: {
    color: COLORS.text.secondary,
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 4,
  },
  input: {
    width: '100%',
    backgroundColor: COLORS.bg.surface,
    borderWidth: 1,
    borderColor: COLORS.border.emphasis,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    color: COLORS.text.primary,
    fontSize: 16,
  },
  inputCardNumber: {
    width: '100%',
    backgroundColor: COLORS.bg.surface,
    borderWidth: 1,
    borderColor: COLORS.border.emphasis,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    color: COLORS.text.primary,
    fontSize: 16,
    letterSpacing: 2,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfField: {
    flex: 1,
    gap: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  toggleLabel: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  toggleTrack: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.border.strong,
    justifyContent: 'center',
  },
  toggleTrackActive: {
    backgroundColor: COLORS.accent.mint,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  saveButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 56,
    backgroundColor: COLORS.accent.blue,
    shadowColor: COLORS.shadow.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 32,
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.bg.surface,
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: COLORS.text.inverse,
    fontSize: 17,
    fontWeight: '600',
  },
  saveButtonTextDisabled: {
    color: COLORS.text.disabled,
  },
});
