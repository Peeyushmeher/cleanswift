// Payment Service: Handles Stripe payment operations
import { supabase } from '../lib/supabase';

interface CreatePaymentIntentRequest {
  booking_id: string;
  amount: number;
}

interface CreatePaymentIntentResponse {
  client_secret: string;
  payment_intent_id: string;
}

interface UpdateBookingPaymentRequest {
  booking_id: string;
  payment_intent_id: string;
  payment_status: 'paid' | 'failed' | 'pending';
}

/**
 * Calls the Supabase Edge Function to create a Stripe PaymentIntent
 */
export async function createPaymentIntent(
  bookingId: string,
  amount: number
): Promise<CreatePaymentIntentResponse> {
  try {
    // Get current session for authentication
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('No active session. Please sign in.');
    }

    // Call the Edge Function
    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      body: {
        booking_id: bookingId,
        amount: amount,
      } as CreatePaymentIntentRequest,
    });

    if (error) {
      console.error('Edge Function error:', error);
      throw new Error(error.message || 'Failed to create payment intent');
    }

    if (!data || !data.client_secret) {
      throw new Error('Invalid response from payment service');
    }

    return data as CreatePaymentIntentResponse;
  } catch (error) {
    console.error('createPaymentIntent error:', error);
    throw error;
  }
}

/**
 * Updates the booking payment status in Supabase
 */
export async function updateBookingPaymentStatus({
  booking_id,
  payment_intent_id,
  payment_status,
}: UpdateBookingPaymentRequest): Promise<void> {
  try {
    const updateData: any = {
      payment_status,
      updated_at: new Date().toISOString(),
    };

    // Only add payment_intent_id and paid_at if payment succeeded
    if (payment_status === 'paid') {
      updateData.payment_intent_id = payment_intent_id;
      updateData.paid_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', booking_id);

    if (error) {
      console.error('Failed to update booking payment status:', error);
      throw new Error('Failed to update booking status');
    }

    console.log(`Booking ${booking_id} payment status updated to: ${payment_status}`);
  } catch (error) {
    console.error('updateBookingPaymentStatus error:', error);
    throw error;
  }
}

/**
 * Creates a booking in Supabase and returns the booking_id
 * This will be called before payment processing
 */
export async function createBooking(bookingData: {
  user_id: string;
  service_id: string;
  car_id: string | null;
  detailer_id: string | null;
  scheduled_date: string;
  scheduled_time_start: string;
  total_amount: number;
  service_price: number;
  addons_total: number;
  tax_amount: number;
  address_line1: string;
  address_line2: string | null;
  city: string;
  province: string;
  postal_code: string;
  latitude: number | null;
  longitude: number | null;
  location_notes: string | null;
}): Promise<string> {
  try {
    // Generate unique receipt ID (format: CS-YYYYMMDD-HHMMSS-RANDOM)
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const timeStr = now.toISOString().slice(11, 19).replace(/:/g, ''); // HHMMSS
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase(); // 4 char random
    const receipt_id = `CS-${dateStr}-${timeStr}-${randomStr}`;

    const insertPayload = {
      receipt_id: receipt_id,
      user_id: bookingData.user_id,
      service_id: bookingData.service_id,
      car_id: bookingData.car_id,
      detailer_id: bookingData.detailer_id,
      scheduled_date: bookingData.scheduled_date,
      scheduled_time_start: bookingData.scheduled_time_start,
      scheduled_time_end: null,
      address_line1: bookingData.address_line1,
      address_line2: bookingData.address_line2,
      city: bookingData.city,
      province: bookingData.province,
      postal_code: bookingData.postal_code,
      latitude: bookingData.latitude,
      longitude: bookingData.longitude,
      location_notes: bookingData.location_notes,
      status: 'scheduled',
      service_price: bookingData.service_price,
      addons_total: bookingData.addons_total,
      tax_amount: bookingData.tax_amount,
      total_amount: bookingData.total_amount,
      payment_method_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log('createBooking payload:', insertPayload);

    const { data, error } = await supabase
      .from('bookings')
      .insert(insertPayload)
      .select('id')
      .single();

    if (error) {
      console.error('Failed to create booking:', error);
      throw new Error('Failed to create booking');
    }

    if (!data || !data.id) {
      throw new Error('No booking ID returned');
    }

    console.log('Booking created with ID:', data.id);
    return data.id;
  } catch (error) {
    console.error('createBooking error:', error);
    throw error;
  }
}

/**
 * Creates addon entries for a booking
 */
export async function createBookingAddons(
  bookingId: string,
  addons: Array<{ id: string; price: number }>
): Promise<void> {
  if (addons.length === 0) return;

  try {
    const addonEntries = addons.map((addon) => ({
      booking_id: bookingId,
      addon_id: addon.id,
      price: addon.price,
      created_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('booking_addons')
      .insert(addonEntries);

    if (error) {
      console.error('Failed to create booking addons:', error);
      throw new Error('Failed to save add-ons');
    }

    console.log(`Created ${addons.length} addon(s) for booking ${bookingId}`);
  } catch (error) {
    console.error('createBookingAddons error:', error);
    throw error;
  }
}
