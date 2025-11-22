import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BookingStackParamList } from '../../navigation/BookingStack';

type Props = NativeStackScreenProps<BookingStackParamList, 'ServiceProgress'>;

const steps = [
  { id: 1, title: 'Arrived', subtitle: 'Detailer is preparing equipment', icon: 'location' as const, status: 'completed' },
  { id: 2, title: 'Cleaning Exterior', subtitle: 'Deep cleaning your car', icon: 'water' as const, status: 'current' },
  { id: 3, title: 'Detailing Interior', subtitle: 'Interior refresh and detailing', icon: 'sparkles' as const, status: 'upcoming' },
  { id: 4, title: 'Final Touches', subtitle: 'Adding finishing treatments', icon: 'checkmark' as const, status: 'upcoming' },
];

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
                {steps.map((step, index) => {
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
                          color={isCurrent || isCompleted ? '#6FF0C4' : '#C6CFD9'}
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
                  <Ionicons name="call" size={16} color="#F5F7FA" />
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.8} style={styles.actionButton}>
                  <Ionicons name="chatbubble" size={16} color="#F5F7FA" />
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
    backgroundColor: 'rgba(198,207,217,0.2)',
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
    backgroundColor: 'rgba(111,240,196,0.2)',
    borderWidth: 4,
    borderColor: 'rgba(111,240,196,0.3)',
  },
  iconCircleCompleted: {
    backgroundColor: 'rgba(111,240,196,0.1)',
  },
  iconCircleUpcoming: {
    backgroundColor: '#0A1A2F',
    borderWidth: 2,
    borderColor: 'rgba(198,207,217,0.2)',
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
    color: '#F5F7FA',
    fontWeight: '600',
  },
  stepTitleCompleted: {
    color: 'rgba(245,247,250,0.8)',
  },
  stepTitleUpcoming: {
    color: '#C6CFD9',
  },
  stepSubtitle: {
    fontSize: 14,
  },
  stepSubtitleCurrent: {
    color: '#C6CFD9',
  },
  stepSubtitleMuted: {
    color: 'rgba(198,207,217,0.6)',
  },
  card: {
    backgroundColor: '#0A1A2F',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 16,
  },
  cardCenter: {
    alignItems: 'center',
  },
  estimatedLabel: {
    color: '#C6CFD9',
    fontSize: 15,
    marginBottom: 8,
  },
  estimatedTime: {
    color: '#1DA4F3',
    fontSize: 32,
    fontWeight: '700',
  },
  estimatedFinish: {
    color: '#C6CFD9',
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
    backgroundColor: 'rgba(29,164,243,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(111,240,196,0.3)',
  },
  avatarText: {
    color: '#F5F7FA',
    fontSize: 20,
    fontWeight: '600',
  },
  detailerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  detailerName: {
    color: '#F5F7FA',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  detailerStatus: {
    color: '#C6CFD9',
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
    backgroundColor: '#050B12',
    borderWidth: 1,
    borderColor: 'rgba(198,207,217,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerNote: {
    color: '#C6CFD9',
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
