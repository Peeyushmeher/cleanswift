import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BookingStackParamList } from '../../navigation/BookingStack';
import { useBooking } from '../../contexts/BookingContext';

type Props = NativeStackScreenProps<BookingStackParamList, 'ReceiptRating'>;

const tipAmounts = ['$5', '$10', '$20', 'Custom'];

export default function ReceiptRatingScreen({ navigation }: Props) {
  const { clearBooking } = useBooking();
  const [rating, setRating] = useState(0);
  const [selectedTip, setSelectedTip] = useState('');
  const [review, setReview] = useState('');

  const handleSubmitRating = () => {
    // TODO: Submit rating/tip/review to backend

    // Clear all booking selections for the next booking
    clearBooking();

    // Reset the BookingStack navigation to ServiceSelection
    navigation.reset({
      index: 0,
      routes: [{ name: 'ServiceSelection' }],
    });

    // Navigate to Home tab in MainTabs
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate('Home');
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={40} color="#6FF0C4" />
            </View>
            <Text style={styles.headerTitle}>
              Your Detail Is Complete
            </Text>
            <Text style={styles.headerSubtitle}>
              We hope you love the results.
            </Text>
          </View>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Receipt Card */}
          <View style={styles.receiptCard}>
            {/* Service Info */}
            <View style={styles.serviceRow}>
              <View>
                <Text style={styles.serviceTitle}>Full Exterior Detail</Text>
                <Text style={styles.serviceTime}>Completed at 2:42 PM</Text>
              </View>
              <Text style={styles.servicePrice}>$149.00</Text>
            </View>

            {/* Car Info */}
            <View style={styles.infoRow}>
              <Ionicons name="car-sport" size={20} color="#C6CFD9" />
              <View>
                <Text style={styles.infoTitle}>2021 BMW M4</Text>
                <Text style={styles.infoSubtitle}>License: ABC-123</Text>
              </View>
            </View>

            {/* Detailer Info */}
            <View style={styles.infoRow}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>MT</Text>
              </View>
              <View style={styles.detailerInfo}>
                <Text style={styles.detailerName}>Marcus Thompson</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={12} color="#6FF0C4" />
                  <Text style={styles.ratingText}>4.9</Text>
                </View>
              </View>
            </View>

            {/* Price Breakdown */}
            <View style={styles.breakdownSection}>
              <View style={styles.breakdownRows}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Service</Text>
                  <Text style={styles.priceValue}>$149.00</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Wax Finish</Text>
                  <Text style={styles.priceValue}>$25.00</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Interior Refresh</Text>
                  <Text style={styles.priceValue}>$15.00</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>HST</Text>
                  <Text style={styles.priceValue}>$24.57</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>$213.57</Text>
              </View>
            </View>
          </View>

          {/* Rating Section */}
          <View style={styles.ratingSection}>
            <Text style={styles.sectionTitle}>Rate Your Detailer</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={40}
                    color={star <= rating ? '#6FF0C4' : 'rgba(198,207,217,0.3)'}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tip Section */}
          <View style={styles.tipSection}>
            <Text style={styles.sectionTitleLeft}>Add a Tip?</Text>
            <View style={styles.tipGrid}>
              {tipAmounts.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  onPress={() => setSelectedTip(amount)}
                  activeOpacity={0.8}
                  style={[
                    styles.tipButton,
                    selectedTip === amount && styles.tipButtonSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.tipButtonText,
                      selectedTip === amount && styles.tipButtonTextSelected,
                    ]}
                  >
                    {amount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Review Text Field */}
          <View style={styles.reviewSection}>
            <Text style={styles.sectionTitleLeft}>Share Your Experience</Text>
            <TextInput
              value={review}
              onChangeText={setReview}
              placeholder="Tell us how Marcus did..."
              placeholderTextColor="rgba(198,207,217,0.5)"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={styles.reviewInput}
            />
          </View>

          {/* Bottom CTA */}
          <TouchableOpacity
            onPress={handleSubmitRating}
            disabled={rating === 0}
            activeOpacity={rating > 0 ? 0.8 : 1}
            style={[
              styles.submitButton,
              rating === 0 && styles.submitButtonDisabled,
            ]}
          >
            <Text
              style={[
                styles.submitButtonText,
                rating === 0 && styles.submitButtonTextDisabled,
              ]}
            >
              Submit Rating
            </Text>
          </TouchableOpacity>
        </ScrollView>
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(111,240,196,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    color: '#F5F7FA',
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: '#C6CFD9',
    fontSize: 15,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  receiptCard: {
    backgroundColor: '#0A1A2F',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 24,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  serviceTitle: {
    color: '#F5F7FA',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  serviceTime: {
    color: '#C6CFD9',
    fontSize: 14,
  },
  servicePrice: {
    color: '#1DA4F3',
    fontSize: 18,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(198,207,217,0.1)',
    gap: 12,
  },
  infoTitle: {
    color: '#F5F7FA',
    fontSize: 15,
    fontWeight: '500',
  },
  infoSubtitle: {
    color: '#C6CFD9',
    fontSize: 13,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(29,164,243,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#F5F7FA',
    fontSize: 15,
    fontWeight: '600',
  },
  detailerInfo: {
    flex: 1,
  },
  detailerName: {
    color: '#F5F7FA',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: '#C6CFD9',
    fontSize: 12,
  },
  breakdownSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(198,207,217,0.1)',
  },
  breakdownRows: {
    gap: 8,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceLabel: {
    color: '#C6CFD9',
    fontSize: 14,
  },
  priceValue: {
    color: '#F5F7FA',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(198,207,217,0.2)',
    marginBottom: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: '#F5F7FA',
    fontSize: 17,
    fontWeight: '600',
  },
  totalValue: {
    color: '#6FF0C4',
    fontSize: 24,
    fontWeight: '700',
  },
  ratingSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#F5F7FA',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  sectionTitleLeft: {
    color: '#F5F7FA',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  tipSection: {
    marginBottom: 24,
  },
  tipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tipButton: {
    width: '23%',
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(198,207,217,0.2)',
    backgroundColor: '#0A1A2F',
    marginBottom: 12,
  },
  tipButtonSelected: {
    borderWidth: 2,
    borderColor: '#6FF0C4',
  },
  tipButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#F5F7FA',
  },
  tipButtonTextSelected: {
    color: '#6FF0C4',
  },
  reviewSection: {
    marginBottom: 24,
  },
  reviewInput: {
    width: '100%',
    backgroundColor: '#0A1A2F',
    borderWidth: 1,
    borderColor: 'rgba(198,207,217,0.2)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    color: '#F5F7FA',
    fontSize: 16,
    minHeight: 100,
  },
  submitButton: {
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
  submitButtonDisabled: {
    backgroundColor: '#0A1A2F',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  submitButtonTextDisabled: {
    color: 'rgba(198,207,217,0.5)',
  },
});
