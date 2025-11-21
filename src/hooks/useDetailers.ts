import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Detailer } from '../contexts/BookingContext';

interface UseDetailersReturn {
  data: Detailer[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useDetailers(): UseDetailersReturn {
  const [data, setData] = useState<Detailer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDetailers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: detailers, error: fetchError } = await supabase
        .from('detailers')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setData(detailers || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch detailers'));
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDetailers();
  }, [fetchDetailers]);

  return {
    data,
    loading,
    error,
    refetch: fetchDetailers,
  };
}
