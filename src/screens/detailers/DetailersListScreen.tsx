import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFavoriteDetailers } from '../../hooks/useFavoriteDetailers';
import { useDetailers } from '../../hooks/useDetailers';
import type { DetailersStackParamList } from '../../navigation/DetailersStack';
import type { Detailer } from '../../types/domain';

type Props = NativeStackScreenProps<DetailersStackParamList, 'DetailersList'>;

export default function DetailersListScreen({ navigation }: Props) {
  const { data: detailers, loading, error, refetch } = useDetailers();
  const { isFavorite, toggleFavorite } = useFavoriteDetailers();
  const [searchQuery, setSearchQuery] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Filter detailers based on search query
  const filteredDetailers = useMemo(() => {
    if (!searchQuery.trim()) {
      return detailers;
    }
    const query = searchQuery.toLowerCase().trim();
    return detailers.filter((detailer) => {
      const nameMatch = detailer.full_name.toLowerCase().includes(query);
      const specialtiesMatch = detailer.specialties?.some((s) =>
        s.toLowerCase().includes(query)
      );
      return nameMatch || specialtiesMatch;
    });
  }, [detailers, searchQuery]);

  const handleDetailerPress = (detailer: Detailer) => {
    navigation.navigate('DetailerProfile', { detailerId: detailer.id });
  };

  const handleToggleFavorite = useCallback(
    async (detailerId: string) => {
      setTogglingId(detailerId);
      try {
        await toggleFavorite(detailerId);
      } catch (err) {
        console.error('Failed to toggle favorite:', err);
      } finally {
        setTogglingId(null);
      }
    },
    [toggleFavorite]
  );

  const renderDetailerCard = (detailer: Detailer) => {
    const initials = detailer.full_name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const isDetailerFavorite = isFavorite(detailer.id);
    const isToggling = togglingId === detailer.id;

    return (
      <TouchableOpacity
        key={detailer.id}
        onPress={() => handleDetailerPress(detailer)}
        activeOpacity={0.8}
        style={styles.detailerCard}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {detailer.avatar_url ? (
            <Image source={{ uri: detailer.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{detailer.full_name}</Text>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#6FF0C4" />
            <Text style={styles.ratingText}>{detailer.rating.toFixed(1)}</Text>
            <Text style={styles.reviewsText}>({detailer.review_count} reviews)</Text>
          </View>

          {/* Specialties */}
          {detailer.specialties && detailer.specialties.length > 0 && (
            <View style={styles.specialtiesRow}>
              {detailer.specialties.slice(0, 2).map((specialty, index) => (
                <View key={index} style={styles.specialtyBadge}>
                  <Text style={styles.specialtyText}>{specialty}</Text>
                </View>
              ))}
              {detailer.specialties.length > 2 && (
                <Text style={styles.moreSpecialties}>
                  +{detailer.specialties.length - 2}
                </Text>
              )}
            </View>
          )}

          {/* Experience */}
          <View style={styles.experienceRow}>
            <Ionicons name="briefcase-outline" size={14} color="#C6CFD9" />
            <Text style={styles.experienceText}>
              {detailer.years_experience}+ years experience
            </Text>
          </View>
        </View>

        {/* Favorite Button */}
        <TouchableOpacity
          onPress={() => handleToggleFavorite(detailer.id)}
          disabled={isToggling}
          style={styles.favoriteButton}
          activeOpacity={0.7}
        >
          {isToggling ? (
            <ActivityIndicator size="small" color="#FF6B8A" />
          ) : (
            <Ionicons
              name={isDetailerFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isDetailerFavorite ? '#FF6B8A' : '#C6CFD9'}
            />
          )}
        </TouchableOpacity>

        {/* Chevron */}
        <Ionicons name="chevron-forward" size={20} color="#C6CFD9" style={styles.chevron} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Detailers</Text>
          <Text style={styles.headerSubtitle}>Find your perfect detailer</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#C6CFD9" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or specialty..."
              placeholderTextColor="#6B7B8F"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
                <Ionicons name="close-circle" size={20} color="#C6CFD9" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Loading State */}
        {loading && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#6FF0C4" />
            <Text style={styles.loadingText}>Loading detailers...</Text>
          </View>
        )}

        {/* Error State */}
        {error && !loading && (
          <View style={styles.centerContainer}>
            <Ionicons name="alert-circle" size={64} color="#FF6B6B" />
            <Text style={styles.errorTitle}>Unable to load detailers</Text>
            <Text style={styles.errorMessage}>{error.message}</Text>
            <TouchableOpacity onPress={refetch} style={styles.retryButton} activeOpacity={0.8}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Detailers List */}
        {!loading && !error && (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredDetailers.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={64} color="#C6CFD9" />
                <Text style={styles.emptyTitle}>No detailers found</Text>
                <Text style={styles.emptyMessage}>
                  {searchQuery
                    ? 'Try adjusting your search terms'
                    : 'No detailers available at the moment'}
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.resultsCount}>
                  {filteredDetailers.length} detailer{filteredDetailers.length !== 1 ? 's' : ''}{' '}
                  {searchQuery ? 'found' : 'available'}
                </Text>
                {filteredDetailers.map(renderDetailerCard)}
              </>
            )}
          </ScrollView>
        )}
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
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    color: '#F5F7FA',
    fontSize: 28,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#C6CFD9',
    fontSize: 15,
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A1A2F',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  searchInput: {
    flex: 1,
    color: '#F5F7FA',
    fontSize: 16,
    marginLeft: 12,
    marginRight: 8,
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
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#1DA4F3',
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  resultsCount: {
    color: '#C6CFD9',
    fontSize: 14,
    marginBottom: 16,
  },
  detailerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A1A2F',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  avatarContainer: {
    marginRight: 14,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarFallback: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(111,240,196,0.1)',
    borderWidth: 2,
    borderColor: 'rgba(111,240,196,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: '#6FF0C4',
    fontSize: 20,
    fontWeight: '600',
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    color: '#F5F7FA',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    color: '#F5F7FA',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  reviewsText: {
    color: '#C6CFD9',
    fontSize: 13,
    marginLeft: 4,
  },
  specialtiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  specialtyBadge: {
    backgroundColor: 'rgba(29,164,243,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  specialtyText: {
    color: '#1DA4F3',
    fontSize: 11,
    fontWeight: '500',
  },
  moreSpecialties: {
    color: '#C6CFD9',
    fontSize: 11,
  },
  experienceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  experienceText: {
    color: '#C6CFD9',
    fontSize: 12,
    marginLeft: 6,
  },
  favoriteButton: {
    padding: 8,
    marginRight: 4,
  },
  chevron: {
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    color: '#F5F7FA',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyMessage: {
    color: '#C6CFD9',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});

