// Supabase Edge Function: create-tip-payment-intent
// Purpose: Create Stripe PaymentIntent for tip payments to detailers
//
// Security features:
// - Validates booking ownership via RLS
// - Validates detailer_id matches booking
// - Amount is provided by client (tip amount)
// - Stores payment intent ID in metadata for tracking

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TipPaymentIntentRequest {
  booking_id: string;
  tip_amount: number;
  detailer_id: string;
}

interface TipPaymentIntentResponse {
  paymentIntentClientSecret: string;
  bookingId: string;
  amountCents: number;
  currency: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('=== create-tip-payment-intent Edge Function called ===');
    console.log('Method:', req.method);

    // Get JWT token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    let requestBody: TipPaymentIntentRequest;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid request body. Expected JSON.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { booking_id, tip_amount, detailer_id } = requestBody;

    // Validate required fields
    if (!booking_id || !tip_amount || !detailer_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: booking_id, tip_amount, detailer_id' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate tip amount
    if (tip_amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Tip amount must be greater than 0' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize Supabase client with auth context
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase configuration');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Get user from auth token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('Failed to get user:', userError);
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('User ID:', user.id);

    // Verify booking exists and belongs to user
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .select('id, user_id, detailer_id, status')
      .eq('id', booking_id)
      .eq('user_id', user.id)
      .single();

    if (bookingError || !booking) {
      console.error('Booking not found or access denied:', bookingError);
      return new Response(
        JSON.stringify({ error: 'Booking not found or access denied' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Verify detailer_id matches booking
    if (booking.detailer_id !== detailer_id) {
      console.error('Detailer ID mismatch');
      return new Response(
        JSON.stringify({ error: 'Detailer ID does not match booking' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('✅ Booking verified:', booking_id);
    console.log('Tip amount:', tip_amount, 'CAD');
    console.log('Detailer ID:', detailer_id);

    // Initialize Stripe
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      console.error('Missing Stripe secret key');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Convert tip amount to cents
    const amountCents = Math.round(tip_amount * 100);

    console.log('Creating PaymentIntent for tip...');
    console.log('Amount (cents):', amountCents);

    // Create PaymentIntent for tip
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'cad',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        booking_id: booking_id,
        user_id: user.id,
        detailer_id: detailer_id,
        payment_type: 'tip',
      },
      description: `Tip for CleanSwift Booking ${booking_id.slice(0, 8)}`,
    });

    console.log('✅ Tip PaymentIntent created successfully');
    console.log('  PaymentIntent ID:', paymentIntent.id);
    console.log('  Status:', paymentIntent.status);
    console.log('  Amount:', paymentIntent.amount, 'cents');

    // Return response
    const response: TipPaymentIntentResponse = {
      paymentIntentClientSecret: paymentIntent.client_secret!,
      bookingId: booking_id,
      amountCents: amountCents,
      currency: 'cad',
    };

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: `Internal server error: ${errorMessage}` }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
