import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBooking } from '../../contexts/BookingContext';
import { useFavoriteDetailers } from '../../hooks/useFavoriteDetailers';
import { supabase } from '../../lib/supabase';
import type { DetailersStackParamList } from '../../navigation/DetailersStack';
import type { Detailer } from '../../types/domain';

type Props = NativeStackScreenProps<DetailersStackParamList, 'DetailerProfile'>;

export default function DetailerProfileScreen({ navigation, route }: Props) {
  const { detailerId } = route.params;
  const rootNavigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { setDetailer } = useBooking();
  const { isFavorite, toggleFavorite } = useFavoriteDetailers();

  const [detailer, setDetailerState] = useState<Detailer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [togglingFavorite, setTogglingFavorite] = useState(false);

  useEffect(() => {
    const fetchDetailer = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('detailers')
          .select('*')
          .eq('id', detailerId)
          .single();

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        setDetailerState(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load detailer'));
      } finally {
        setLoading(false);
      }
    };

    fetchDetailer();
  }, [detailerId]);

  const handleToggleFavorite = useCallback(async () => {
    if (!detailer) return;
    setTogglingFavorite(true);
    try {
      await toggleFavorite(detailer.id);
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    } finally {
      setTogglingFavorite(false);
    }
  }, [detailer, toggleFavorite]);

  const handleBookDetailer = useCallback(() => {
    if (!detailer) return;

    // Pre-select the detailer in the booking context
    setDetailer(detailer);

    // Navigate to the Book tab to start the booking flow
    rootNavigation.navigate('Book', {
      screen: 'ServiceSelection',
      params: { preselectedDetailerId: detailer.id },
    });
  }, [detailer, setDetailer, rootNavigation]);

  if (loading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#6FF0C4" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </SafeAreaView>
      </View>
    );
  }

  if (error || !detailer) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={24} color="#C6CFD9" />
            </TouchableOpacity>
          </View>
          <View style={styles.centerContainer}>
            <Ionicons name="alert-circle" size={64} color="#FF6B6B" />
            <Text style={styles.errorTitle}>Unable to load profile</Text>
            <Text style={styles.errorMessage}>{error?.message || 'Detailer not found'}</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const initials = detailer.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const isDetailerFavorite = isFavorite(detailer.id);

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
          <TouchableOpacity
            onPress={handleToggleFavorite}
            disabled={togglingFavorite}
            activeOpacity={0.7}
            style={styles.favoriteHeaderButton}
          >
            {togglingFavorite ? (
              <ActivityIndicator size="small" color="#FF6B8A" />
            ) : (
              <Ionicons
                name={isDetailerFavorite ? 'heart' : 'heart-outline'}
                size={26}
                color={isDetailerFavorite ? '#FF6B8A' : '#C6CFD9'}
              />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            {detailer.avatar_url ? (
              <Image source={{ uri: detailer.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
            <Text style={styles.name}>{detailer.full_name}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={18} color="#6FF0C4" />
              <Text style={styles.ratingText}>{detailer.rating.toFixed(1)}</Text>
              <Text style={styles.reviewsText}>({detailer.review_count} reviews)</Text>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="star" size={24} color="#6FF0C4" />
              <Text style={styles.statValue}>{detailer.rating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="chatbubbles" size={24} color="#1DA4F3" />
              <Text style={styles.statValue}>{detailer.review_count}</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="briefcase" size={24} color="#FF9F43" />
              <Text style={styles.statValue}>{detailer.years_experience}+</Text>
              <Text style={styles.statLabel}>Years</Text>
            </View>
          </View>

          {/* Bio Section */}
          {detailer.bio && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <View style={styles.bioCard}>
                <Text style={styles.bioText}>{detailer.bio}</Text>
              </View>
            </View>
          )}

          {/* Specialties Section */}
          {detailer.specialties && detailer.specialties.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Specialties</Text>
              <View style={styles.specialtiesContainer}>
                {detailer.specialties.map((specialty, index) => (
                  <View key={index} style={styles.specialtyBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#6FF0C4" />
                    <Text style={styles.specialtyText}>{specialty}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* What Drivers Notice */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Why Choose {detailer.full_name.split(' ')[0]}</Text>
            <View style={styles.highlightsContainer}>
              <View style={styles.highlightRow}>
                <View style={styles.highlightIcon}>
                  <Ionicons name="shield-checkmark" size={20} color="#6FF0C4" />
                </View>
                <View style={styles.highlightContent}>
                  <Text style={styles.highlightTitle}>Verified Professional</Text>
                  <Text style={styles.highlightText}>Background checked and insured</Text>
                </View>
              </View>
              <View style={styles.highlightRow}>
                <View style={styles.highlightIcon}>
                  <Ionicons name="time" size={20} color="#1DA4F3" />
                </View>
                <View style={styles.highlightContent}>
                  <Text style={styles.highlightTitle}>Punctual & Reliable</Text>
                  <Text style={styles.highlightText}>Arrives on time, every time</Text>
                </View>
              </View>
              <View style={styles.highlightRow}>
                <View style={styles.highlightIcon}>
                  <Ionicons name="star" size={20} color="#FF9F43" />
                </View>
                <View style={styles.highlightContent}>
                  <Text style={styles.highlightTitle}>Highly Rated</Text>
                  <Text style={styles.highlightText}>
                    {detailer.rating.toFixed(1)} stars from {detailer.review_count} reviews
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom CTA */}
        <View style={[styles.bottomCTA, { paddingBottom: Math.max(insets.bottom, 16) + 68 }]}>
          <TouchableOpacity
            onPress={handleBookDetailer}
            activeOpacity={0.8}
            style={styles.bookButton}
          >
            <Ionicons name="calendar" size={20} color="#FFFFFF" style={styles.bookButtonIcon} />
            <Text style={styles.bookButtonText}>Book {detailer.full_name.split(' ')[0]}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030B18',
  },
  safeArea: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    color: '#C6CFD9',
    fontSize: 16,
    marginTop: 16,
  },
  errorTitle: {
    color: '#F5F7FA',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  errorMessage: {
    color: '#C6CFD9',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteHeaderButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 180,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  avatarFallback: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(111,240,196,0.1)',
    borderWidth: 3,
    borderColor: 'rgba(111,240,196,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarInitials: {
    color: '#6FF0C4',
    fontSize: 40,
    fontWeight: '600',
  },
  name: {
    color: '#F5F7FA',
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#F5F7FA',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  reviewsText: {
    color: '#C6CFD9',
    fontSize: 15,
    marginLeft: 6,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#0A1A2F',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  statValue: {
    color: '#F5F7FA',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
  },
  statLabel: {
    color: '#C6CFD9',
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#F5F7FA',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  bioCard: {
    backgroundColor: '#0A1A2F',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  bioText: {
    color: '#C6CFD9',
    fontSize: 15,
    lineHeight: 22,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(111,240,196,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  specialtyText: {
    color: '#F5F7FA',
    fontSize: 14,
    fontWeight: '500',
  },
  highlightsContainer: {
    backgroundColor: '#0A1A2F',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  highlightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  highlightContent: {
    flex: 1,
  },
  highlightTitle: {
    color: '#F5F7FA',
    fontSize: 15,
    fontWeight: '600',
  },
  highlightText: {
    color: '#C6CFD9',
    fontSize: 13,
    marginTop: 2,
  },
  bottomCTA: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1DA4F3',
    paddingVertical: 16,
    borderRadius: 24,
    shadowColor: '#1DA4F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bookButtonIcon: {
    marginRight: 8,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});

