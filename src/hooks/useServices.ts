import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Service } from '../types/domain';

interface UseServicesReturn {
  data: Service[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useServices(): UseServicesReturn {
  const [data, setData] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: services, error: fetchError } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setData(services || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch services'));
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();

    // Subscribe to real-time changes on services table
    const subscription = supabase
      .channel('services-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'services' },
        () => {
          // Refetch when any change happens (insert, update, delete)
          fetchServices();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchServices]);

  return {
    data,
    loading,
    error,
    refetch: fetchServices,
  };
}
