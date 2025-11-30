import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { ServiceAddon } from '../types/domain';

interface UseServiceAddonsReturn {
  data: ServiceAddon[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useServiceAddons(): UseServiceAddonsReturn {
  const [data, setData] = useState<ServiceAddon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchServiceAddons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: addons, error: fetchError } = await supabase
        .from('service_addons')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setData(addons || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch service addons'));
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServiceAddons();

    // Subscribe to real-time changes on service_addons table
    const subscription = supabase
      .channel('service-addons-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'service_addons' },
        () => {
          // Refetch when any change happens (insert, update, delete)
          fetchServiceAddons();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchServiceAddons]);

  return {
    data,
    loading,
    error,
    refetch: fetchServiceAddons,
  };
}
