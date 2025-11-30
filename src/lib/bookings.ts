// Booking API: Handles booking creation via Supabase RPC
import { supabase } from './supabase';

export interface CreateBookingParams {
  carId: string;
  scheduledStart: string; // ISO timestamp string
  locationAddress: string;
  city: string;
  province: string;
  postalCode: string;
  locationLat?: number | null;
  locationLng?: number | null;
  serviceIds: string[]; // Array of service UUIDs
  locationNotes?: string | null;
}

export interface ServiceInfo {
  id: string;
  name: string;
  description: string;
  price: number;
  price_cents: number;
  duration_minutes: number | null;
  is_active: boolean;
  display_order: number;
}

export interface BookingRow {
  id: string;
  receipt_id: string;
  user_id: string;
  car_id: string;
  service_id: string | null;
  detailer_id: string | null;
  scheduled_date: string;
  scheduled_time_start: string;
  scheduled_time_end: string | null;
  scheduled_start: string;
  scheduled_end: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  location_address: string;
  location_lat: number | null;
  location_lng: number | null;
  location_notes: string | null;
  status: 'pending' | 'requires_payment' | 'paid' | 'offered' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  payment_status: 'unpaid' | 'requires_payment' | 'processing' | 'paid' | 'refunded' | 'failed';
  service_price: number;
  addons_total: number;
  tax_amount: number;
  total_amount: number;
  payment_method_id: string | null;
  stripe_payment_intent_id: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface CreateBookingResponse {
  booking: BookingRow;
  total_price_cents: number;
  total_duration_minutes: number;
  services: ServiceInfo[];
}

/**
 * Creates a booking via the Supabase RPC function.
 * This function handles validation, car ownership checks, and service validation
 * on the server side.
 */
export async function createBooking(
  params: CreateBookingParams
): Promise<CreateBookingResponse> {
  try {
    const { data, error } = await supabase.rpc('create_booking', {
      p_car_id: params.carId,
      p_scheduled_start: params.scheduledStart,
      p_location_address: params.locationAddress,
      p_city: params.city,
      p_province: params.province,
      p_postal_code: params.postalCode,
      p_service_ids: params.serviceIds,
      p_location_lat: params.locationLat ?? null,
      p_location_lng: params.locationLng ?? null,
      p_location_notes: params.locationNotes ?? null,
    });

    if (error) {
      console.error('create_booking RPC error:', error);
      // Provide user-friendly error messages
      if (error.message.includes('Not authenticated')) {
        throw new Error('You must be logged in to create a booking');
      } else if (error.message.includes('Car does not belong to user')) {
        throw new Error('Selected car does not belong to you');
      } else if (error.message.includes('Invalid or inactive service')) {
        throw new Error('One or more selected services are no longer available');
      } else if (error.message.includes('No services provided')) {
        throw new Error('Please select at least one service');
      } else {
        throw new Error(error.message || 'Failed to create booking');
      }
    }

    if (!data) {
      throw new Error('No data returned from create_booking');
    }

    return data as CreateBookingResponse;
  } catch (error) {
    console.error('createBooking error:', error);
    throw error;
  }
}

/**
 * Booking status type matching booking_status_enum
 */
export type BookingStatus = 
  | 'pending'
  | 'requires_payment'
  | 'paid'
  | 'offered'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

/**
 * Updates a booking's status using the central state machine function.
 * This function enforces allowed state transitions based on user role.
 * 
 * @param bookingId - The UUID of the booking to update
 * @param newStatus - The new status to transition to
 * @returns The updated booking row
 * @throws Error if the transition is not allowed or if there's an error
 */
export async function updateBookingStatus(
  bookingId: string,
  newStatus: BookingStatus
): Promise<BookingRow> {
  try {
    const { data, error } = await supabase.rpc('update_booking_status', {
      p_booking_id: bookingId,
      p_new_status: newStatus,
    });

    if (error) {
      console.error('update_booking_status RPC error:', error);
      // Provide user-friendly error messages
      if (error.message.includes('Not authenticated')) {
        throw new Error('You must be logged in to update booking status');
      } else if (error.message.includes('not allowed')) {
        throw new Error(error.message || 'This status change is not allowed');
      } else if (error.message.includes('not found')) {
        throw new Error('Booking not found');
      } else {
        throw new Error(error.message || 'Failed to update booking status');
      }
    }

    if (!data) {
      throw new Error('No data returned from update_booking_status');
    }

    return data as BookingRow;
  } catch (error) {
    console.error('updateBookingStatus error:', error);
    throw error;
  }
}

/**
 * Allows a detailer to accept/claim a paid, unassigned booking.
 * This function is race-condition safe and prevents double-assignment.
 * 
 * @param bookingId - The UUID of the booking to accept
 * @returns The updated booking row with detailer_id set and status = 'accepted'
 * @throws Error if the booking is not available for acceptance or if caller is not a detailer
 */
export async function acceptBooking(bookingId: string): Promise<BookingRow> {
  try {
    const { data, error } = await supabase.rpc('accept_booking', {
      p_booking_id: bookingId,
    });

    if (error) {
      console.error('accept_booking RPC error:', error);
      // Provide user-friendly error messages
      if (error.message.includes('Not authenticated')) {
        throw new Error('You must be logged in to accept bookings');
      } else if (error.message.includes('Only detailers')) {
        throw new Error('Only detailers can accept bookings');
      } else if (error.message.includes('not paid')) {
        throw new Error('This booking has not been paid yet');
      } else if (error.message.includes('already assigned')) {
        throw new Error('This booking has already been assigned to another detailer');
      } else if (error.message.includes('does not allow acceptance')) {
        throw new Error('This booking is not available for acceptance');
      } else if (error.message.includes('not found')) {
        throw new Error('Booking not found');
      } else {
        throw new Error(error.message || 'Failed to accept booking');
      }
    }

    if (!data) {
      throw new Error('No data returned from accept_booking');
    }

    return data as BookingRow;
  } catch (error) {
    console.error('acceptBooking error:', error);
    throw error;
  }
}

