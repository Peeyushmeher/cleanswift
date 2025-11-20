import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BookingStackParamList } from '../../navigation/BookingStack';
import { useBooking } from '../../contexts/BookingContext';

type Props = NativeStackScreenProps<BookingStackParamList, 'PaymentMethod'>;

const savedCards = [
  { id: '1', type: 'visa', last4: '2741', expiry: '10/27' },
  { id: '2', type: 'mastercard', last4: '8392', expiry: '03/26' },
];

export default function PaymentMethodScreen({ navigation, route }: Props) {
  const { priceBreakdown } = useBooking();
  const [selectedCard, setSelectedCard] = useState<string>('apple-pay');
  const showPriceSummary = route.params?.showPrice ?? true;

  const handleCompletePayment = () => {
    // Navigate to post-payment screen (likely ServiceProgress or LiveTracking)
    navigation.navigate('ServiceProgress');
  };

  const handleAddCard = () => {
    navigation.navigate('AddPaymentCard');
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
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
            <Ionicons name="chevron-back" size={24} color="#C6CFD9" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment Method</Text>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Security Statement */}
          <Text style={styles.securityText}>
            Your payment information is encrypted and securely stored.
          </Text>

          {/* Apple Pay */}
          <TouchableOpacity
            onPress={() => setSelectedCard('apple-pay')}
            activeOpacity={0.8}
            style={[
              styles.applePayButton,
              selectedCard === 'apple-pay' && styles.applePayButtonSelected,
            ]}
          >
            <Ionicons name="logo-apple" size={24} color="white" />
            <Text style={styles.applePayText}>Apple Pay</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Saved Cards */}
          <View style={styles.cardsList}>
            {savedCards.map((card) => {
              const isSelected = selectedCard === card.id;

              return (
                <TouchableOpacity
                  key={card.id}
                  onPress={() => setSelectedCard(card.id)}
                  activeOpacity={0.8}
                  style={[
                    styles.cardOption,
                    isSelected && styles.cardOptionSelected,
                  ]}
                >
                  {isSelected && (
                    <View style={styles.cardCheckmark}>
                      <Ionicons name="checkmark" size={12} color="#050B12" />
                    </View>
                  )}

                  <View style={styles.cardContent}>
                    <Ionicons name="card" size={48} color="white" style={{ opacity: 0.9 }} />
                    <View style={styles.cardDetails}>
                      <Text style={styles.cardNumber}>
                        {card.type === 'visa' ? 'Visa' : 'Mastercard'} •••• {card.last4}
                      </Text>
                      <Text style={styles.cardExpiry}>Exp {card.expiry}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Add New Card */}
          <TouchableOpacity
            onPress={handleAddCard}
            activeOpacity={0.8}
            style={styles.addCardButton}
          >
            <View style={styles.addCardContent}>
              <View style={styles.addCardIcon}>
                <Ionicons name="add" size={20} color="#6FF0C4" />
              </View>
              <Text style={styles.addCardText}>Add New Card</Text>
            </View>
          </TouchableOpacity>

          {/* Price Summary */}
          {showPriceSummary && (
            <View style={styles.priceSummary}>
              <View style={styles.priceRows}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Service</Text>
                  <Text style={styles.priceValue}>
                    {formatCurrency(priceBreakdown.servicePrice)}
                  </Text>
                </View>
                {priceBreakdown.addonsTotal > 0 && (
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Add-ons</Text>
                    <Text style={styles.priceValue}>
                      {formatCurrency(priceBreakdown.addonsTotal)}
                    </Text>
                  </View>
                )}
                {priceBreakdown.taxAmount > 0 && (
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>HST</Text>
                    <Text style={styles.priceValue}>
                      {formatCurrency(priceBreakdown.taxAmount)}
                    </Text>
                  </View>
                )}
                <View style={styles.priceDivider} />
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>
                    {formatCurrency(priceBreakdown.totalAmount)}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Bottom CTA */}
        <View style={styles.bottomCTA}>
          <TouchableOpacity
            onPress={handleCompletePayment}
            activeOpacity={0.8}
            style={styles.completeButton}
          >
            <Text style={styles.completeButtonText}>
              {showPriceSummary ? 'Complete Payment' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050B12',
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
  },
  backButton: {
    padding: 4,
    marginRight: 16,
  },
  headerTitle: {
    color: '#F5F7FA',
    fontSize: 28,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  securityText: {
    color: '#C6CFD9',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
  },
  applePayButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#000000',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  applePayButtonSelected: {
    borderWidth: 2,
    borderColor: '#6FF0C4',
    shadowColor: '#6FF0C4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  applePayText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(198,207,217,0.2)',
  },
  dividerText: {
    color: '#C6CFD9',
    fontSize: 14,
    marginHorizontal: 16,
  },
  cardsList: {
    marginBottom: 16,
  },
  cardOption: {
    width: '100%',
    backgroundColor: '#0A1A2F',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    position: 'relative',
    marginBottom: 12,
  },
  cardOptionSelected: {
    borderWidth: 2,
    borderColor: '#6FF0C4',
    shadowColor: '#6FF0C4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cardCheckmark: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#6FF0C4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardDetails: {
    flex: 1,
    marginLeft: 16,
  },
  cardNumber: {
    color: '#F5F7FA',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  cardExpiry: {
    color: '#C6CFD9',
    fontSize: 14,
  },
  addCardButton: {
    width: '100%',
    backgroundColor: '#0A1A2F',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(111,240,196,0.3)',
    borderStyle: 'dashed',
    marginBottom: 32,
  },
  addCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(111,240,196,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addCardText: {
    color: '#6FF0C4',
    fontSize: 16,
    fontWeight: '500',
  },
  priceSummary: {
    backgroundColor: '#0A1A2F',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  priceRows: {
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    color: '#C6CFD9',
    fontSize: 15,
  },
  priceValue: {
    color: '#F5F7FA',
    fontSize: 15,
  },
  priceDivider: {
    height: 1,
    backgroundColor: 'rgba(198,207,217,0.2)',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: '#F5F7FA',
    fontSize: 18,
    fontWeight: '600',
  },
  totalValue: {
    color: '#6FF0C4',
    fontSize: 24,
    fontWeight: '700',
  },
  bottomCTA: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    backgroundColor: '#050B12',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  completeButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 56,
    backgroundColor: '#1DA4F3',
    shadowColor: '#1DA4F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
