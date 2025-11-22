import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OrdersStackParamList } from '../../navigation/OrdersStack';
import { COLORS } from '../../theme/colors';

type Props = NativeStackScreenProps<OrdersStackParamList, 'OrderDetails'>;

export default function OrderDetailsScreen({ navigation, route }: Props) {
  const { orderId } = route.params;

  const handleBookAgain = () => {
    // Navigate to booking flow
    // @ts-ignore - Navigate to different tab stack
    navigation.navigate('Book');
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
          <Text style={styles.headerTitle}>Service Details</Text>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Service Summary */}
          <View style={styles.card}>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Completed</Text>
            </View>

            <Text style={styles.serviceTitle}>Full Exterior Detail</Text>
            <Text style={styles.completedDate}>Completed on Nov 16 at 2:42 PM</Text>
          </View>

          {/* Car Details */}
          <View style={styles.card}>
            <View style={styles.rowStart}>
              <Ionicons name="car-sport" size={40} color={COLORS.accent.mint} />
              <View>
                <Text style={styles.carName}>2022 BMW M4</Text>
                <Text style={styles.carDetail}>License: ABC-123</Text>
                <Text style={styles.carDetail}>Black Sapphire Metallic</Text>
              </View>
            </View>
          </View>

          {/* Detailer Information */}
          <View style={styles.card}>
            <View style={styles.rowStart}>
              <View style={styles.detailerAvatar}>
                <Text style={styles.detailerInitials}>MT</Text>
              </View>
              <View style={styles.flex1}>
                <Text style={styles.detailerName}>Marcus Thompson</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={16} color={COLORS.accent.mint} />
                  <Text style={styles.ratingScore}>4.9</Text>
                  <Text style={styles.ratingCount}>(142 reviews)</Text>
                </View>
                <Text style={styles.detailerSince}>Detailer since 2021</Text>
              </View>
            </View>
          </View>

          {/* Date & Time */}
          <View style={styles.card}>
            <View style={styles.dateTimeContainer}>
              <View style={styles.dateTimeRow}>
                <Ionicons name="calendar" size={20} color={COLORS.text.secondary} />
                <Text style={styles.dateTimeText}>Thursday, November 16</Text>
              </View>
              <View style={styles.dateTimeRow}>
                <Ionicons name="time" size={20} color={COLORS.text.secondary} />
                <Text style={styles.dateTimeText}>1:00 PM - 3:00 PM</Text>
              </View>
            </View>
          </View>

          {/* Payment Summary */}
          <View style={styles.card}>
            <Text style={styles.paymentTitle}>Payment Summary</Text>

            <View style={styles.lineItemsContainer}>
              <View style={styles.lineItem}>
                <Text style={styles.lineItemLabel}>Full Exterior Detail</Text>
                <Text style={styles.lineItemValue}>$149.00</Text>
              </View>
              <View style={styles.lineItem}>
                <Text style={styles.lineItemLabel}>Wax Finish</Text>
                <Text style={styles.lineItemValue}>$25.00</Text>
              </View>
              <View style={styles.lineItem}>
                <Text style={styles.lineItemLabel}>Interior Refresh</Text>
                <Text style={styles.lineItemValue}>$15.00</Text>
              </View>
              <View style={styles.lineItem}>
                <Text style={styles.lineItemLabel}>HST</Text>
                <Text style={styles.lineItemValue}>$24.57</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>$213.57</Text>
            </View>

            <View style={styles.metaSection}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Payment Method</Text>
                <Text style={styles.metaValue}>Visa •••• 2741</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Receipt ID</Text>
                <Text style={styles.metaValue}>8F3D-21B7</Text>
              </View>
            </View>
          </View>

          {/* Download/Share */}
          <View style={styles.actionsRow}>
            <TouchableOpacity activeOpacity={0.8} style={styles.actionButton}>
              <Ionicons name="download" size={20} color={COLORS.text.secondary} />
              <Text style={styles.actionButtonText}>Download</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.8} style={styles.actionButton}>
              <Ionicons name="share-social" size={20} color={COLORS.text.secondary} />
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Bottom CTA */}
        <View style={styles.bottomCTA}>
          <TouchableOpacity
            onPress={handleBookAgain}
            activeOpacity={0.8}
            style={styles.bookAgainButton}
          >
            <Text style={styles.bookAgainText}>Book Again</Text>
          </TouchableOpacity>
        </View>
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
  card: {
    backgroundColor: COLORS.bg.surface,
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  // Service Summary
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent.mint,
  },
  statusText: {
    color: COLORS.accent.mint,
    fontSize: 14,
    fontWeight: '500',
  },
  serviceTitle: {
    color: COLORS.text.primary,
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  completedDate: {
    color: COLORS.text.secondary,
    fontSize: 15,
  },
  // Car Details
  rowStart: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  carName: {
    color: COLORS.text.primary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  carDetail: {
    color: COLORS.text.secondary,
    fontSize: 14,
  },
  // Detailer Information
  detailerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.accentBg.blue15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border.accentMint,
  },
  detailerInitials: {
    color: COLORS.text.primary,
    fontSize: 20,
    fontWeight: '600',
  },
  flex1: {
    flex: 1,
  },
  detailerName: {
    color: COLORS.text.primary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  ratingScore: {
    color: COLORS.text.primary,
    fontSize: 14,
  },
  ratingCount: {
    color: COLORS.text.secondary,
    fontSize: 12,
  },
  detailerSince: {
    color: COLORS.text.secondary,
    fontSize: 14,
  },
  // Date & Time
  dateTimeContainer: {
    gap: 12,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateTimeText: {
    color: COLORS.text.primary,
    fontSize: 15,
    fontWeight: '500',
  },
  // Payment Summary
  paymentTitle: {
    color: COLORS.text.primary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  lineItemsContainer: {
    gap: 8,
    marginBottom: 12,
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lineItemLabel: {
    color: COLORS.text.secondary,
    fontSize: 15,
  },
  lineItemValue: {
    color: COLORS.text.primary,
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border.emphasis,
    marginBottom: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    color: COLORS.text.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  totalValue: {
    color: COLORS.accent.mint,
    fontSize: 24,
    fontWeight: '700',
  },
  metaSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  metaLabel: {
    color: COLORS.text.secondary,
    fontSize: 14,
  },
  metaValue: {
    color: COLORS.text.primary,
    fontSize: 14,
  },
  // Actions Row
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.bg.surface,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: COLORS.text.primary,
    fontSize: 15,
    fontWeight: '500',
  },
  // Bottom CTA
  bottomCTA: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
    backgroundColor: COLORS.bg.primary,
  },
  bookAgainButton: {
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.accent.blue,
    borderRadius: 28,
    shadowColor: COLORS.shadow.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  bookAgainText: {
    color: COLORS.text.inverse,
    fontSize: 17,
    fontWeight: '600',
  },
});
