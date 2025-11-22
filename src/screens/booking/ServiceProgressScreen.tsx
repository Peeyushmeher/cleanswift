import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BookingStackParamList } from '../../navigation/BookingStack';
import { DEMO_SERVICE_STEPS } from '../../config/demoData';
import { COLORS } from '../../theme/colors';

type Props = NativeStackScreenProps<BookingStackParamList, 'ServiceProgress'>;

export default function ServiceProgressScreen({ navigation }: Props) {
  const handleCompleteService = () => {
    navigation.navigate('ReceiptRating');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Cleaning In Progress
          </Text>
          <Text style={styles.headerSubtitle}>
            Your detailer is working on your vehicle
          </Text>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Progress Timeline */}
          <View style={styles.timelineContainer}>
            <View style={styles.timelineWrapper}>
              {/* Vertical Line */}
              <View style={styles.verticalLine} />

              {/* Steps */}
              <View style={styles.stepsContainer}>
                {DEMO_SERVICE_STEPS.map((step, index) => {
                  const isCompleted = step.status === 'completed';
                  const isCurrent = step.status === 'current';
                  const isUpcoming = step.status === 'upcoming';

                  return (
                    <View key={step.id} style={styles.stepRow}>
                      {/* Icon Circle */}
                      <View
                        style={[
                          styles.iconCircle,
                          isCurrent && styles.iconCircleCurrent,
                          isCompleted && styles.iconCircleCompleted,
                          isUpcoming && styles.iconCircleUpcoming,
                        ]}
                      >
                        <Ionicons
                          name={step.icon}
                          size={24}
                          color={isCurrent || isCompleted ? COLORS.accent.mint : COLORS.text.secondary}
                        />
                      </View>

                      {/* Content */}
                      <View style={styles.stepContent}>
                        <Text
                          style={[
                            styles.stepTitle,
                            isCurrent && styles.stepTitleCurrent,
                            isCompleted && styles.stepTitleCompleted,
                            isUpcoming && styles.stepTitleUpcoming,
                          ]}
                        >
                          {step.title}
                        </Text>
                        <Text
                          style={[
                            styles.stepSubtitle,
                            isCurrent ? styles.stepSubtitleCurrent : styles.stepSubtitleMuted,
                          ]}
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
          <View style={styles.card}>
            <View style={styles.cardCenter}>
              <Text style={styles.estimatedLabel}>
                Estimated Time Remaining
              </Text>
              <Text style={styles.estimatedTime}>
                22 minutes
              </Text>
              <Text style={styles.estimatedFinish}>
                Finishing by 3:45 PM
              </Text>
            </View>
          </View>

          {/* Detailer Card */}
          <View style={styles.card}>
            <View style={styles.detailerRow}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>MT</Text>
              </View>

              <View style={styles.detailerInfo}>
                <Text style={styles.detailerName}>Marcus Thompson</Text>
                <Text style={styles.detailerStatus}>On-site</Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity activeOpacity={0.8} style={styles.actionButton}>
                  <Ionicons name="call" size={16} color={COLORS.text.primary} />
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.8} style={styles.actionButton}>
                  <Ionicons name="chatbubble" size={16} color={COLORS.text.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Note */}
          <Text style={styles.footerNote}>
            We'll notify you once the detailing is complete.
          </Text>

          {/* Complete Service Button */}
          <TouchableOpacity
            onPress={handleCompleteService}
            activeOpacity={0.8}
            style={styles.completeButton}
          >
            <Text style={styles.completeButtonText}>Complete Service</Text>
          </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTitle: {
    color: COLORS.text.primary,
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: COLORS.text.secondary,
    fontSize: 15,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  timelineContainer: {
    marginBottom: 32,
  },
  timelineWrapper: {
    position: 'relative',
  },
  verticalLine: {
    position: 'absolute',
    left: 24,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: COLORS.border.emphasis,
  },
  stepsContainer: {
    gap: 32,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  iconCircleCurrent: {
    backgroundColor: COLORS.accentBg.mint20,
    borderWidth: 4,
    borderColor: COLORS.accentBg.mint30,
  },
  iconCircleCompleted: {
    backgroundColor: COLORS.accentBg.mint10,
  },
  iconCircleUpcoming: {
    backgroundColor: COLORS.bg.surface,
    borderWidth: 2,
    borderColor: COLORS.border.emphasis,
  },
  stepContent: {
    flex: 1,
    marginLeft: 16,
    paddingTop: 4,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 4,
  },
  stepTitleCurrent: {
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  stepTitleCompleted: {
    color: 'rgba(245,247,250,0.8)',
  },
  stepTitleUpcoming: {
    color: COLORS.text.secondary,
  },
  stepSubtitle: {
    fontSize: 14,
  },
  stepSubtitleCurrent: {
    color: COLORS.text.secondary,
  },
  stepSubtitleMuted: {
    color: 'rgba(198,207,217,0.6)',
  },
  card: {
    backgroundColor: COLORS.bg.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    marginBottom: 16,
  },
  cardCenter: {
    alignItems: 'center',
  },
  estimatedLabel: {
    color: COLORS.text.secondary,
    fontSize: 15,
    marginBottom: 8,
  },
  estimatedTime: {
    color: COLORS.accent.blue,
    fontSize: 32,
    fontWeight: '700',
  },
  estimatedFinish: {
    color: COLORS.text.secondary,
    fontSize: 13,
    marginTop: 8,
  },
  detailerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.accentBg.blue15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.accentBg.mint30,
  },
  avatarText: {
    color: COLORS.text.primary,
    fontSize: 20,
    fontWeight: '600',
  },
  detailerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  detailerName: {
    color: COLORS.text.primary,
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  detailerStatus: {
    color: COLORS.text.secondary,
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bg.primary,
    borderWidth: 1,
    borderColor: COLORS.border.emphasis,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerNote: {
    color: COLORS.text.secondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  completeButton: {
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
  },
  completeButtonText: {
    color: COLORS.text.inverse,
    fontSize: 17,
    fontWeight: '600',
  },
});
