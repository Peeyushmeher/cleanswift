import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Detailer, FavoriteDetailer } from '../types/domain';

interface FavoriteDetailerWithDetails extends FavoriteDetailer {
  detailer: Detailer;
}

interface UseFavoriteDetailersReturn {
  favorites: FavoriteDetailerWithDetails[];
  favoriteIds: Set<string>;
  loading: boolean;
  error: Error | null;
  addFavorite: (detailerId: string) => Promise<void>;
  removeFavorite: (detailerId: string) => Promise<void>;
  toggleFavorite: (detailerId: string) => Promise<void>;
  isFavorite: (detailerId: string) => boolean;
  refetch: () => Promise<void>;
}

export function useFavoriteDetailers(): UseFavoriteDetailersReturn {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteDetailerWithDetails[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setFavoriteIds(new Set());
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('favorite_detailers')
        .select(`
          id,
          user_id,
          detailer_id,
          created_at,
          detailer:detailers (
            id,
            full_name,
            avatar_url,
            rating,
            review_count,
            years_experience,
            is_active,
            bio,
            specialties
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      // Transform the data to match our interface
      const transformedData: FavoriteDetailerWithDetails[] = (data || [])
        .filter((item: any) => item.detailer && item.detailer.is_active)
        .map((item: any) => ({
          id: item.id,
          user_id: item.user_id,
          detailer_id: item.detailer_id,
          created_at: item.created_at,
          detailer: item.detailer as Detailer,
        }));

      setFavorites(transformedData);
      setFavoriteIds(new Set(transformedData.map((f) => f.detailer_id)));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch favorites'));
      setFavorites([]);
      setFavoriteIds(new Set());
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const addFavorite = useCallback(
    async (detailerId: string) => {
      if (!user) {
        throw new Error('Must be logged in to add favorites');
      }

      try {
        const { error: insertError } = await supabase
          .from('favorite_detailers')
          .insert({
            user_id: user.id,
            detailer_id: detailerId,
          });

        if (insertError) {
          // If it's a duplicate, ignore the error
          if (insertError.code === '23505') {
            return;
          }
          throw new Error(insertError.message);
        }

        // Optimistically update the favoriteIds set
        setFavoriteIds((prev) => new Set([...prev, detailerId]));

        // Refetch to get the full data
        await fetchFavorites();
      } catch (err) {
        throw err instanceof Error ? err : new Error('Failed to add favorite');
      }
    },
    [user, fetchFavorites]
  );

  const removeFavorite = useCallback(
    async (detailerId: string) => {
      if (!user) {
        throw new Error('Must be logged in to remove favorites');
      }

      try {
        const { error: deleteError } = await supabase
          .from('favorite_detailers')
          .delete()
          .eq('user_id', user.id)
          .eq('detailer_id', detailerId);

        if (deleteError) {
          throw new Error(deleteError.message);
        }

        // Optimistically update state
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(detailerId);
          return next;
        });
        setFavorites((prev) => prev.filter((f) => f.detailer_id !== detailerId));
      } catch (err) {
        throw err instanceof Error ? err : new Error('Failed to remove favorite');
      }
    },
    [user]
  );

  const toggleFavorite = useCallback(
    async (detailerId: string) => {
      if (favoriteIds.has(detailerId)) {
        await removeFavorite(detailerId);
      } else {
        await addFavorite(detailerId);
      }
    },
    [favoriteIds, addFavorite, removeFavorite]
  );

  const isFavorite = useCallback(
    (detailerId: string) => {
      return favoriteIds.has(detailerId);
    },
    [favoriteIds]
  );

  return {
    favorites,
    favoriteIds,
    loading,
    error,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    refetch: fetchFavorites,
  };
}

