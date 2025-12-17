import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export interface UserPreferences {
  id: string;
  user_id: string;
  language: string;
  units: 'imperial' | 'metric';
  default_tip_percentage: number;
  auto_select_favorite_detailer: boolean;
  created_at: string;
  updated_at: string;
}

interface UseUserPreferencesReturn {
  preferences: UserPreferences | null;
  loading: boolean;
  error: Error | null;
  updatePreferences: (updates: Partial<Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => Promise<void>;
  refetch: () => Promise<void>;
}

const DEFAULT_PREFERENCES: Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  language: 'en',
  units: 'imperial',
  default_tip_percentage: 15.00,
  auto_select_favorite_detailer: false,
};

/**
 * Hook to fetch and update current user's preferences
 */
export function useUserPreferences(): UseUserPreferencesReturn {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPreferences = async () => {
    if (!user) {
      setPreferences(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        // If no preferences exist, create default ones
        if (fetchError.code === 'PGRST116') {
          const { data: newData, error: insertError } = await supabase
            .from('user_preferences')
            .insert({
              user_id: user.id,
              ...DEFAULT_PREFERENCES,
            })
            .select()
            .single();

          if (insertError) throw insertError;
          setPreferences(newData as UserPreferences);
        } else {
          throw fetchError;
        }
      } else {
        setPreferences(data as UserPreferences);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load preferences'));
      console.error('Error fetching preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) {
      throw new Error('User must be logged in to update preferences');
    }

    try {
      setError(null);

      // Check if preferences exist
      const { data: existing } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let result;
      if (existing) {
        // Update existing preferences
        const { data, error: updateError } = await supabase
          .from('user_preferences')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .select()
          .single();

        if (updateError) throw updateError;
        result = data;
      } else {
        // Create new preferences with updates
        const { data, error: insertError } = await supabase
          .from('user_preferences')
          .insert({
            user_id: user.id,
            ...DEFAULT_PREFERENCES,
            ...updates,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        result = data;
      }

      setPreferences(result as UserPreferences);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update preferences');
      setError(error);
      throw error;
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, [user]);

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    refetch: fetchPreferences,
  };
}

