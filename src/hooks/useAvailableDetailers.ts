import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Detailer } from '../types/domain';
import { formatTimeForRPC, formatDateForRPC, parseDateFromRoute } from '../utils/availabilityCheck';

interface UseAvailableDetailersParams {
  date: Date | string | null | undefined;
  time: string | null | undefined;
  serviceDurationMinutes: number | null | undefined;
}

interface UseAvailableDetailersReturn {
  data: Detailer[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch detailers filtered by availability at a specific date/time
 * 
 * This hook:
 * 1. Fetches all active detailers
 * 2. For each detailer, checks if they're available using find_available_detailer RPC
 * 3. Returns only detailers who are available at the specified time
 * 
 * If date/time are not provided, returns all active detailers (fallback behavior)
 */
export function useAvailableDetailers(
  params: UseAvailableDetailersParams
): UseAvailableDetailersReturn {
  const { date, time, serviceDurationMinutes } = params;
  const [data, setData] = useState<Detailer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAvailableDetailers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // If date/time/service duration are not provided, fall back to showing all detailers
      if (!date || !time || !serviceDurationMinutes) {
        const { data: detailers, error: fetchError } = await supabase
          .from('detailers')
          .select('*')
          .eq('is_active', true)
          .order('rating', { ascending: false });

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        setData(detailers || []);
        return;
      }

      // Parse date - handle both Date objects and string day numbers
      let bookingDate: Date;
      if (date instanceof Date) {
        bookingDate = date;
      } else {
        const parsed = parseDateFromRoute(date, time);
        if (!parsed) {
          throw new Error('Invalid date provided');
        }
        bookingDate = parsed;
      }

      // Format date and time for RPC
      const formattedDate = formatDateForRPC(bookingDate);
      const formattedTime = formatTimeForRPC(time);

      console.log('🔍 Checking availability:', {
        formattedDate,
        formattedTime,
        serviceDurationMinutes,
        dayOfWeek: bookingDate.getDay(),
      });

      // First, fetch all active detailers
      const { data: allDetailers, error: fetchError } = await supabase
        .from('detailers')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      if (!allDetailers || allDetailers.length === 0) {
        setData([]);
        return;
      }

      // Check availability for each detailer by querying their availability slots,
      // days off, and existing bookings directly
      const availableDetailers: Detailer[] = [];

      for (const detailer of allDetailers) {
        try {
          // Check if detailer has availability for this day/time
          // We check availability slots, days off, and existing bookings directly
          const dayOfWeek = bookingDate.getDay(); // 0=Sunday, 1=Monday, etc.
          
          // Get detailer's availability for this day
          const { data: availability, error: availError } = await supabase
            .from('detailer_availability')
            .select('*')
            .eq('detailer_id', detailer.id)
            .eq('day_of_week', dayOfWeek)
            .eq('is_active', true)
            .maybeSingle();

          if (availError) {
            console.error(`Error fetching availability for detailer ${detailer.id}:`, availError);
            continue;
          }

          if (!availability) {
            console.log(`Detailer ${detailer.id} has no availability for day ${dayOfWeek}`);
            continue; // No availability for this day
          }

          console.log(`Detailer ${detailer.id} availability:`, {
            start_time: availability.start_time,
            end_time: availability.end_time,
            lunch_start: availability.lunch_start_time,
            lunch_end: availability.lunch_end_time,
          });

          // Check if booking time fits within availability window
          // Normalize time formats - ensure both have seconds
          const bookingStartTime = formattedTime; // Already in HH:mm:ss format
          const bookingEndTime = calculateEndTime(bookingStartTime, serviceDurationMinutes);
          
          // Normalize database times to HH:mm:ss format for comparison
          const normalizeTime = (timeStr: string | null): string => {
            if (!timeStr) return '';
            // If time is in HH:mm format, add :00
            if (timeStr.match(/^\d{2}:\d{2}$/)) {
              return `${timeStr}:00`;
            }
            return timeStr;
          };

          const availStart = normalizeTime(availability.start_time);
          const availEnd = normalizeTime(availability.end_time);
          const lunchStart = normalizeTime(availability.lunch_start_time);
          const lunchEnd = normalizeTime(availability.lunch_end_time);
          
          console.log(`Checking time window: booking ${bookingStartTime}-${bookingEndTime} vs availability ${availStart}-${availEnd}`);
          
          if (bookingStartTime < availStart || bookingEndTime > availEnd) {
            console.log(`Detailer ${detailer.id} booking time doesn't fit in availability window`);
            continue; // Booking doesn't fit in availability window
          }

          // Check if booking overlaps with lunch break
          if (lunchStart && lunchEnd) {
            if (
              bookingStartTime < lunchEnd &&
              bookingEndTime > lunchStart
            ) {
              console.log(`Detailer ${detailer.id} booking overlaps with lunch break ${lunchStart}-${lunchEnd}`);
              continue; // Booking overlaps with lunch break
            }
          }

          // Check if detailer has a day off on this date
          const { data: dayOff, error: dayOffError } = await supabase
            .from('detailer_days_off')
            .select('id')
            .eq('detailer_id', detailer.id)
            .eq('date', formattedDate)
            .eq('is_active', true)
            .maybeSingle();

          if (dayOffError) {
            console.error('Error checking day off:', dayOffError);
            continue; // Skip on error
          }

          if (dayOff) {
            console.log(`Detailer ${detailer.id} has a day off on ${formattedDate}`);
            continue; // Detailer has a day off
          }

          // Check if detailer has conflicting bookings
          // Get all bookings for this detailer on this date
          const { data: bookings, error: bookingError } = await supabase
            .from('bookings')
            .select('scheduled_time_start, scheduled_time_end')
            .eq('detailer_id', detailer.id)
            .eq('scheduled_date', formattedDate)
            .in('status', ['pending', 'requires_payment', 'paid', 'offered', 'accepted', 'in_progress']);

          if (bookingError) {
            console.error('Error checking bookings:', bookingError);
            continue; // Skip on error
          }

          // Check if any booking overlaps with our requested time
          const hasConflict = bookings?.some((booking) => {
            const bookingStart = booking.scheduled_time_start;
            const bookingEnd = booking.scheduled_time_end || calculateEndTime(bookingStart, 120); // Default 2 hours if no end time
            
            // Check for overlap: booking starts before our end AND booking ends after our start
            return bookingStart < bookingEndTime && bookingEnd > bookingStartTime;
          });

          if (hasConflict) {
            console.log(`Detailer ${detailer.id} has conflicting booking`);
            continue; // Detailer has a conflicting booking
          }

          // If we get here, detailer is available
          console.log(`Detailer ${detailer.id} (${detailer.full_name}) is available for ${formattedDate} at ${formattedTime}`);
          availableDetailers.push(detailer);
        } catch (err) {
          console.error(`Error checking availability for detailer ${detailer.id}:`, err);
          // Continue checking other detailers
        }
      }

      setData(availableDetailers);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch available detailers'));
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [date, time, serviceDurationMinutes]);

  useEffect(() => {
    fetchAvailableDetailers();
  }, [fetchAvailableDetailers]);

  return {
    data,
    loading,
    error,
    refetch: fetchAvailableDetailers,
  };
}

/**
 * Calculates end time from start time and duration
 */
function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);
  
  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
  const endHours = endDate.getHours().toString().padStart(2, '0');
  const endMinutes = endDate.getMinutes().toString().padStart(2, '0');
  
  return `${endHours}:${endMinutes}:00`;
}

