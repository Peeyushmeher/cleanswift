// Supabase Edge Function: create-payment-intent
// Purpose: Create Stripe PaymentIntent for booking payments

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentIntentRequest {
  booking_id: string;
  amount: number;
}

interface PaymentIntentResponse {
  client_secret: string;
  payment_intent_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('=== create-payment-intent Edge Function called ===');
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
    let requestBody: PaymentIntentRequest;
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

    const { booking_id, amount } = requestBody;

    // Validate required fields
    if (!booking_id || !amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: booking_id and amount' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate amount is positive
    if (amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Amount must be greater than 0' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize Supabase client with auth context
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verify booking exists and belongs to authenticated user
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .select('id, user_id, total_amount')
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      console.error('Booking query error:', bookingError);
      return new Response(
        JSON.stringify({ error: 'Booking not found or access denied' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Note: Duplicate payment protection can be added later via payment_method_id or separate payment tracking

    // Verify amount matches booking total (prevent tampering)
    const amountDifference = Math.abs(amount - booking.total_amount);
    if (amountDifference > 0.01) {
      // Allow 1 cent difference for rounding
      console.error('Amount mismatch:', { provided: amount, expected: booking.total_amount });
      return new Response(
        JSON.stringify({
          error: 'Amount mismatch. Please refresh and try again.',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize Stripe with secret key
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      console.error('STRIPE_SECRET_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Payment service not configured' }),
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

    console.log('Creating PaymentIntent for booking:', booking_id);
    console.log('Amount:', amount, 'CAD');
    console.log('Amount (cents):', Math.round(amount * 100));
    console.log('User ID:', booking.user_id);

    // Create Stripe PaymentIntent
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'cad',
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          booking_id: booking_id,
          user_id: booking.user_id,
        },
        description: `CleanSwift Booking ${booking_id.slice(0, 8)}`,
      });
    } catch (stripeError) {
      console.error('Stripe API error:', stripeError);
      if (stripeError instanceof Stripe.errors.StripeError) {
        return new Response(
          JSON.stringify({
            error: `Stripe error: ${stripeError.message}`,
            code: stripeError.type,
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      throw stripeError; // Re-throw if not a Stripe error
    }

    console.log('✅ PaymentIntent created successfully');
    console.log('  PaymentIntent ID:', paymentIntent.id);
    console.log('  Status:', paymentIntent.status);
    console.log('  Amount:', paymentIntent.amount, 'cents');

    // Validate that client_secret exists
    if (!paymentIntent.client_secret) {
      console.error('❌ PaymentIntent created but client_secret is missing!');
      return new Response(
        JSON.stringify({ error: 'PaymentIntent created but client_secret is missing' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const response: PaymentIntentResponse = {
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
    };

    console.log('✅ Returning response with client_secret and payment_intent_id');
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Unhandled error in create-payment-intent:', error);
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : String(error));

    // Handle Stripe-specific errors
    if (error instanceof Stripe.errors.StripeError) {
      console.error('Stripe error type:', error.type);
      console.error('Stripe error code:', error.code);
      return new Response(
        JSON.stringify({
          error: `Payment service error: ${error.message}`,
          code: error.type,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Handle other known error types
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Returning error response:', errorMessage);

    return new Response(
      JSON.stringify({
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
