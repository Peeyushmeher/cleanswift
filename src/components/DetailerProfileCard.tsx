import { Ionicons } from '@expo/vector-icons';
import { Modal, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import type { Detailer } from '../contexts/BookingContext';

interface DetailerProfileCardProps {
  detailer: Detailer | null;
  visible: boolean;
  onClose: () => void;
  onSelectDetailer: (detailer: Detailer) => void;
  serviceSummary?: {
    name: string;
    price: number;
  } | null;
}

export function DetailerProfileCard({
  detailer,
  visible,
  onClose,
  onSelectDetailer,
  serviceSummary,
}: DetailerProfileCardProps) {
  if (!detailer) return null;

  const initials = detailer.full_name
    .split(' ')
    .map((name) => name[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.8}>
            <Ionicons name="close" size={20} color="#C6CFD9" />
          </TouchableOpacity>

          <View style={styles.avatarContainer}>
            {detailer.avatar_url ? (
              <Image source={{ uri: detailer.avatar_url }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{detailer.full_name}</Text>
              <Text style={styles.subtitle}>{detailer.years_experience}+ years keeping rides showroom-ready</Text>
            </View>
          </View>

          <View style={styles.statRow}>
            <View style={styles.statChip}>
              <Ionicons name="star" size={16} color="#6FF0C4" />
              <Text style={styles.statValue}>{detailer.rating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>({detailer.review_count} reviews)</Text>
            </View>
            <View style={styles.statChip}>
              <Ionicons name="briefcase" size={16} color="#1DA4F3" />
              <Text style={styles.statValue}>{detailer.years_experience}+ yrs</Text>
              <Text style={styles.statLabel}>experience</Text>
            </View>
          </View>

          {serviceSummary ? (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Popular for</Text>
              <Text style={styles.sectionTitle}>{serviceSummary.name}</Text>
              <Text style={styles.sectionSubtext}>
                Base price ${serviceSummary.price.toFixed(2)} · Confirm add-ons at checkout
              </Text>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>What drivers notice</Text>
            <View style={styles.badgeGroup}>
              <View style={styles.badge}>
                <Ionicons name="people" size={14} color="#6FF0C4" />
                <Text style={styles.badgeText}>{detailer.review_count}+ reviews</Text>
              </View>
              <View style={styles.badge}>
                <Ionicons name="briefcase" size={14} color="#1DA4F3" />
                <Text style={styles.badgeText}>{detailer.years_experience}+ yrs pro</Text>
              </View>
              <View style={styles.badge}>
                <Ionicons name="star" size={14} color="#C6CFD9" />
                <Text style={styles.badgeText}>{detailer.rating.toFixed(1)} / 5 rating</Text>
              </View>
            </View>
          </View>

          <View style={styles.ctaGroup}>
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.85}
              onPress={() => onSelectDetailer(detailer)}
            >
              <Text style={styles.primaryButtonText}>Select this detailer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.85} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>Back to list</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 11, 18, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#0A1A2F',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(198,207,217,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarFallback: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(111,240,196,0.1)',
    borderWidth: 2,
    borderColor: 'rgba(111,240,196,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: '#6FF0C4',
    fontSize: 24,
    fontWeight: '600',
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    color: '#F5F7FA',
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: '#C6CFD9',
    marginTop: 4,
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(5,11,18,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statValue: {
    color: '#F5F7FA',
    fontWeight: '600',
    fontSize: 15,
  },
  statLabel: {
    color: '#C6CFD9',
    fontSize: 13,
  },
  section: {
    marginTop: 12,
  },
  sectionLabel: {
    color: '#C6CFD9',
    fontSize: 13,
    marginBottom: 4,
  },
  sectionTitle: {
    color: '#F5F7FA',
    fontSize: 18,
    fontWeight: '600',
  },
  sectionSubtext: {
    color: '#C6CFD9',
    fontSize: 13,
    marginTop: 4,
  },
  badgeGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(198,207,217,0.1)',
  },
  badgeText: {
    color: '#F5F7FA',
    fontSize: 13,
  },
  ctaGroup: {
    marginTop: 24,
    gap: 12,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 24,
    backgroundColor: '#1DA4F3',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 14,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#C6CFD9',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default DetailerProfileCard;

