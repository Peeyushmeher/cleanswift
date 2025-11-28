import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { Car, Detailer, Service } from '../contexts/BookingContext';
import { supabase } from '../lib/supabase';

export type BookingStatus = 'pending' | 'requires_payment' | 'paid' | 'offered' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export interface BookingHistoryItem {
  id: string;
  receipt_id: string;
  status: BookingStatus;
  scheduled_date: string;
  scheduled_time_start: string;
  scheduled_time_end: string | null;
  service: Service | null;
  detailer: Detailer | null;
  car: Car | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  province: string;
  postal_code: string;
  location_notes: string | null;
  service_price: number;
  addons_total: number;
  tax_amount: number;
  total_amount: number;
  completed_at: string | null;
  created_at: string;
}

interface SupabaseBookingRow {
  id: string;
  receipt_id: string;
  status: BookingStatus;
  scheduled_date: string;
  scheduled_time_start: string;
  scheduled_time_end: string | null;
  service_price: number;
  addons_total: number;
  tax_amount: number;
  total_amount: number;
  completed_at: string | null;
  created_at: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  province: string;
  postal_code: string;
  location_notes: string | null;
  service: any;
  detailer: any;
  car: any;
}

const normalizeService = (service: any): Service => ({
  id: service.id,
  name: service.name,
  description: service.description,
  price: Number(service.price),
  duration_minutes: service.duration_minutes,
  is_active: service.is_active,
  display_order: service.display_order,
});

const normalizeDetailer = (detailer: any): Detailer => ({
  id: detailer.id,
  full_name: detailer.full_name,
  avatar_url: detailer.avatar_url,
  rating: Number(detailer.rating),
  review_count: detailer.review_count,
  years_experience: detailer.years_experience,
  is_active: detailer.is_active,
});

const normalizeCar = (car: any): Car => ({
  id: car.id,
  user_id: car.user_id,
  make: car.make,
  model: car.model,
  year: car.year,
  trim: car.trim,
  license_plate: car.license_plate,
  color: car.color,
  photo_url: car.photo_url,
  is_primary: car.is_primary,
});

const mapRowToHistoryItem = (row: SupabaseBookingRow): BookingHistoryItem => ({
  id: row.id,
  receipt_id: row.receipt_id,
  status: row.status,
  scheduled_date: row.scheduled_date,
  scheduled_time_start: row.scheduled_time_start,
  scheduled_time_end: row.scheduled_time_end,
  service: row.service ? normalizeService(row.service) : null,
  detailer: row.detailer ? normalizeDetailer(row.detailer) : null,
  car: row.car ? normalizeCar(row.car) : null,
  address_line1: row.address_line1,
  address_line2: row.address_line2,
  city: row.city,
  province: row.province,
  postal_code: row.postal_code,
  location_notes: row.location_notes,
  service_price: Number(row.service_price),
  addons_total: Number(row.addons_total),
  tax_amount: Number(row.tax_amount),
  total_amount: Number(row.total_amount),
  completed_at: row.completed_at,
  created_at: row.created_at,
});

interface UseBookingsReturn {
  data: BookingHistoryItem[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useBookings(): UseBookingsReturn {
  const { user } = useAuth();
  const [data, setData] = useState<BookingHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBookings = useCallback(async () => {
    if (!user) {
      setData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: bookings, error: fetchError } = await supabase
        .from('bookings')
        .select(
          `
          id,
          receipt_id,
          status,
          scheduled_date,
          scheduled_time_start,
          scheduled_time_end,
          service_price,
          addons_total,
          tax_amount,
          total_amount,
          completed_at,
          created_at,
          address_line1,
          address_line2,
          city,
          province,
          postal_code,
          location_notes,
          service:service_id (
            id,
            name,
            description,
            price,
            duration_minutes,
            is_active,
            display_order
          ),
          detailer:detailer_id (
            id,
            full_name,
            avatar_url,
            rating,
            review_count,
            years_experience,
            is_active
          ),
          car:car_id (
            id,
            user_id,
            make,
            model,
            year,
            trim,
            license_plate,
            color,
            photo_url,
            is_primary
          )
        `
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        // Check if it's an authentication error (invalid refresh token, etc.)
        if (fetchError.message?.includes('Refresh Token') || 
            fetchError.message?.includes('refresh_token') ||
            fetchError.message?.includes('Invalid Refresh Token') ||
            fetchError.code === 'PGRST301' || // PostgREST unauthorized
            fetchError.status === 401) {
          console.warn('Authentication error in useBookings:', fetchError.message);
          // The AuthContext will handle clearing the session via onAuthStateChange
          // Just clear the data and set a user-friendly error
          setData([]);
          throw new Error('Your session has expired. Please sign in again.');
        }
        throw new Error(fetchError.message);
      }

      setData((bookings || []).map(mapRowToHistoryItem));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load bookings'));
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return { data, loading, error, refetch: fetchBookings };
}


