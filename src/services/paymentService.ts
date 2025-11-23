// Payment Service: Handles Stripe payment operations
import { supabase } from '../lib/supabase';

interface CreatePaymentIntentRequest {
  booking_id: string;
}

interface CreatePaymentIntentResponse {
  paymentIntentClientSecret: string;
  bookingId: string;
  amountCents: number;
  currency: string;
}

interface UpdateBookingPaymentRequest {
  booking_id: string;
  payment_intent_id?: string; // Optional - Edge Function already stores it
  payment_status: 'paid' | 'failed' | 'pending';
}

/**
 * Calls the Supabase Edge Function to create a Stripe PaymentIntent.
 * The amount is computed server-side from the booking's total_amount for security.
 */
export async function createPaymentIntent(
  bookingId: string
): Promise<CreatePaymentIntentResponse> {
  try {
    // Get current session for authentication
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('No active session. Please sign in.');
    }

    // Get Supabase URL and anon key for manual fetch
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('Supabase URL not configured');
    }

    // Manually fetch the Edge Function to get better error messages
    const functionUrl = `${supabaseUrl}/functions/v1/create-payment-intent`;
    
    console.log('📞 Calling Edge Function:', functionUrl);
    console.log('📦 Request body:', { booking_id: bookingId });

    const fetchResponse = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
      },
      body: JSON.stringify({
        booking_id: bookingId,
      }),
    });

    // Parse response body
    const responseData = await fetchResponse.json();

    if (!fetchResponse.ok) {
      // Extract error message from response
      const errorMessage = responseData.error || responseData.message || `HTTP ${fetchResponse.status}: ${fetchResponse.statusText}`;
      console.error('❌ Edge Function error response:', {
        status: fetchResponse.status,
        statusText: fetchResponse.statusText,
        data: responseData,
      });
      throw new Error(errorMessage);
    }

    // Handle both old and new response formats for backward compatibility
    // Old format: { client_secret, payment_intent_id }
    // New format: { paymentIntentClientSecret, bookingId, amountCents, currency }
    let response: CreatePaymentIntentResponse;
    
    if (responseData.paymentIntentClientSecret) {
      // New format
      response = responseData as CreatePaymentIntentResponse;
      
      // Verify bookingId matches
      if (response.bookingId !== bookingId) {
        console.warn('Booking ID mismatch in response:', { expected: bookingId, received: response.bookingId });
      }
      
      console.log('✅ PaymentIntent created/retrieved successfully (new format)');
      console.log(`  Booking ID: ${response.bookingId}`);
      console.log(`  Amount: ${response.amountCents} cents (${response.currency})`);
    } else if (responseData.client_secret) {
      // Old format - convert to new format
      console.warn('⚠️ Edge Function returned old format. Please deploy the updated function.');
      response = {
        paymentIntentClientSecret: responseData.client_secret,
        bookingId: bookingId,
        amountCents: 0, // Not available in old format
        currency: 'cad',
      };
      
      console.log('✅ PaymentIntent created/retrieved successfully (old format - converted)');
      console.log(`  Booking ID: ${response.bookingId}`);
      console.log(`  ⚠️ Amount not available in old format`);
    } else {
      console.error('Invalid response from payment service:', responseData);
      throw new Error('Invalid response from payment service: missing paymentIntentClientSecret or client_secret');
    }

    return response;
  } catch (error) {
    console.error('createPaymentIntent error:', error);
    throw error;
  }
}

/**
 * Updates the booking payment status in Supabase
 * 
 * Now uses the payment_status and stripe_payment_intent_id columns added in Phase 1 migration.
 */
export async function updateBookingPaymentStatus({
  booking_id,
  payment_intent_id,
  payment_status,
}: UpdateBookingPaymentRequest): Promise<void> {
  try {
    // Map payment_status to database enum values
    // payment_status_enum: 'unpaid' | 'requires_payment' | 'processing' | 'paid' | 'refunded' | 'failed'
    let dbPaymentStatus: 'unpaid' | 'requires_payment' | 'processing' | 'paid' | 'refunded' | 'failed';
    
    if (payment_status === 'paid') {
      dbPaymentStatus = 'paid';
    } else if (payment_status === 'failed') {
      dbPaymentStatus = 'failed';
    } else if (payment_status === 'pending') {
      dbPaymentStatus = 'processing';
    } else {
      dbPaymentStatus = 'requires_payment';
    }

    // Update the booking with payment status
    // Note: stripe_payment_intent_id is already stored by the Edge Function, so we only update it if provided
    const updateData: any = {
      payment_status: dbPaymentStatus,
      updated_at: new Date().toISOString(),
    };
    
    // Only update stripe_payment_intent_id if provided (Edge Function already stores it)
    if (payment_intent_id) {
      updateData.stripe_payment_intent_id = payment_intent_id;
    }

    const { error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', booking_id);

    if (error) {
      console.error('Failed to update booking payment status:', error);
      throw new Error(`Failed to update payment status: ${error.message}`);
    }

    console.log(`✅ Booking ${booking_id} payment status updated: ${dbPaymentStatus}`);
    if (payment_intent_id) {
      console.log(`   Payment Intent ID: ${payment_intent_id}`);
    }
    
    if (payment_status === 'paid') {
      console.log(`✅ Payment successful for booking ${booking_id}`);
    } else if (payment_status === 'failed') {
      console.log(`❌ Payment failed for booking ${booking_id}`);
    }
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
      status: 'requires_payment',  // Valid enum value: booking created, waiting for payment
      payment_status: 'requires_payment',  // Payment status enum
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
