import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Car } from '../types/domain';

interface UseCarsReturn {
  data: Car[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useCars(): UseCarsReturn {
  const { user } = useAuth();
  const [data, setData] = useState<Car[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCars = useCallback(async () => {
    if (!user) {
      setData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: cars, error: fetchError } = await supabase
        .from('cars')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setData(cars || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch cars'));
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  return {
    data,
    loading,
    error,
    refetch: fetchCars,
  };
}
