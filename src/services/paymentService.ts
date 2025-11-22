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
      console.error('Invalid response from payment service:', data);
      throw new Error('Invalid response from payment service: missing client_secret');
    }

    // Verify payment_intent_id is present
    if (!data.payment_intent_id) {
      console.warn('Payment Intent ID missing from response, but client_secret present');
      // Still proceed - client_secret is the critical field for PaymentSheet
    }

    console.log('✅ PaymentIntent created successfully');
    console.log(`  Booking ID: ${bookingId}`);
    console.log(`  Amount: $${amount.toFixed(2)} CAD`);
    console.log(`  Payment Intent ID: ${data.payment_intent_id || 'N/A'}`);

    return data as CreatePaymentIntentResponse;
  } catch (error) {
    console.error('createPaymentIntent error:', error);
    throw error;
  }
}

/**
 * Updates the booking payment status in Supabase
 * 
 * NOTE: The bookings table does not have payment_status, payment_intent_id, or paid_at columns.
 * This function logs payment information for tracking purposes.
 * Payment status can be verified via Stripe dashboard using the payment_intent_id.
 * 
 * To enable payment status tracking in the database, add these columns to the bookings table:
 * - payment_status: text (e.g., 'paid', 'failed', 'pending')
 * - payment_intent_id: text (Stripe PaymentIntent ID)
 * - paid_at: timestamptz (timestamp when payment succeeded)
 */
export async function updateBookingPaymentStatus({
  booking_id,
  payment_intent_id,
  payment_status,
}: UpdateBookingPaymentRequest): Promise<void> {
  try {
    // Log payment information for tracking
    // Since the database schema doesn't include payment status columns,
    // we log this information instead of updating the database.
    console.log('=== Payment Status Update ===');
    console.log(`Booking ID: ${booking_id}`);
    console.log(`Payment Intent ID: ${payment_intent_id}`);
    console.log(`Payment Status: ${payment_status}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log('=============================');

    // Update the booking's updated_at timestamp to reflect payment activity
    // This is the only field we can safely update without schema changes
    const { error } = await supabase
      .from('bookings')
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq('id', booking_id);

    if (error) {
      console.error('Failed to update booking timestamp:', error);
      // Don't throw - payment succeeded, this is just a timestamp update
      console.warn('Payment succeeded but failed to update booking timestamp. Payment Intent ID:', payment_intent_id);
    } else {
      console.log(`Booking ${booking_id} updated_at timestamp refreshed`);
    }

    // Payment status is tracked in Stripe - verify via Stripe dashboard
    if (payment_status === 'paid') {
      console.log(`✅ Payment successful for booking ${booking_id}. Verify in Stripe: ${payment_intent_id}`);
    } else if (payment_status === 'failed') {
      console.log(`❌ Payment failed for booking ${booking_id}. Payment Intent: ${payment_intent_id}`);
    }
  } catch (error) {
    console.error('updateBookingPaymentStatus error:', error);
    // Don't throw - payment may have succeeded, we just couldn't log it
    console.warn('Payment status logging failed, but payment may have succeeded. Check Stripe dashboard.');
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
