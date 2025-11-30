# Stripe Webhook Setup Guide

## Overview

The `handle-stripe-webhook` Edge Function processes Stripe webhook events to automatically update booking and payment statuses in the database. This ensures payment status is always accurate and backend-driven.

## Function Location

`supabase/functions/handle-stripe-webhook/index.ts`

## Environment Variables Required

The following environment variables must be set in your Supabase project:

1. **STRIPE_SECRET_KEY** - Your Stripe secret key (same as used in `create-payment-intent`)
2. **STRIPE_WEBHOOK_SECRET** - The webhook signing secret from Stripe Dashboard
3. **SUPABASE_URL** - Your Supabase project URL (usually auto-configured)
4. **SUPABASE_SERVICE_ROLE_KEY** - Your Supabase service role key (bypasses RLS)

## Database Migration

Before deploying, ensure you've run the migration that adds a unique constraint on `payments.booking_id`:

```sql
supabase/migrations/20250120000001_add_payments_unique_booking_id.sql
```

This ensures one payment record per booking for idempotent webhook processing.

## Stripe Dashboard Configuration

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Set the endpoint URL to:
   ```
   https://<your-project-ref>.supabase.co/functions/v1/handle-stripe-webhook
   ```
4. Select the following events to send:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
5. Copy the **Signing secret** (starts with `whsec_...`)
6. Add this secret to your Supabase project as `STRIPE_WEBHOOK_SECRET`

## Event Handling

### payment_intent.succeeded

When a payment succeeds:
- Updates `bookings.payment_status` to `'paid'`
- Updates `bookings.stripe_payment_intent_id` with the PaymentIntent ID
- Updates `bookings.status` to `'scheduled'` (if currently in a payment-required state)
- Upserts `payments` record with:
  - `status = 'paid'`
  - `amount_cents` from PaymentIntent
  - `currency` from PaymentIntent
  - `stripe_payment_intent_id` and `stripe_charge_id`

### payment_intent.payment_failed

When a payment fails:
- Updates `bookings.payment_status` to `'failed'`
- Updates `bookings.stripe_payment_intent_id`
- Keeps existing `bookings.status` unchanged
- Upserts `payments` record with `status = 'failed'`

### payment_intent.canceled

When a payment is canceled:
- Updates `bookings.payment_status` to `'unpaid'` (allows retry)
- Updates `bookings.stripe_payment_intent_id`
- Keeps existing `bookings.status` unchanged
- Upserts `payments` record with `status = 'failed'`

## Security Features

1. **Signature Verification**: All webhook requests are verified using Stripe's signature verification
2. **Service Role Key**: Uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS (webhook is backend-only)
3. **Idempotent Operations**: Safe to retry - uses upsert operations
4. **Error Handling**: Returns 200 even on errors to prevent infinite Stripe retries (errors are logged)

## Testing

### Local Testing with Stripe CLI

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks to local function:
   ```bash
   stripe listen --forward-to http://localhost:54321/functions/v1/handle-stripe-webhook
   ```
4. The CLI will show a webhook secret (e.g., `whsec_...`) - use this as `STRIPE_WEBHOOK_SECRET` locally
5. Trigger test events:
   ```bash
   stripe trigger payment_intent.succeeded
   ```

### Manual Testing

1. Create a booking in your app
2. Create a PaymentIntent via `create-payment-intent` Edge Function
3. Use Stripe test card `4242 4242 4242 4242` to complete payment
4. Check Supabase logs for webhook processing
5. Verify:
   - `bookings.payment_status = 'paid'`
   - `payments` table has a record with `status = 'paid'`

### Testing Failed Payments

Use Stripe test card `4000 0000 0000 9995` to simulate a failed payment.

## Monitoring

Check Supabase Edge Function logs:
- Supabase Dashboard → Edge Functions → `handle-stripe-webhook` → Logs

Look for:
- ✅ Success messages when events are processed
- ⚠️ Warnings for missing metadata or booking not found
- ❌ Errors for database update failures

## Troubleshooting

### Webhook not receiving events

1. Verify endpoint URL in Stripe Dashboard matches your Supabase function URL
2. Check that events are enabled in Stripe Dashboard
3. Verify `STRIPE_WEBHOOK_SECRET` matches the signing secret from Stripe

### Signature verification fails

1. Ensure `STRIPE_WEBHOOK_SECRET` is correctly set
2. Verify the webhook secret matches the one in Stripe Dashboard
3. Check that the raw request body is being read correctly (not parsed as JSON first)

### Booking not found errors

- This is expected if a PaymentIntent is created but the booking is deleted
- The webhook returns 200 to prevent Stripe retries
- Check logs to identify which booking_id is missing

### Payment record not created

1. Verify the unique constraint migration has been applied
2. Check that `booking_id` exists in the `bookings` table
3. Review Supabase logs for database errors

## Next Steps

After the webhook is deployed and tested:

1. The payment flow is now fully backend-driven
2. App can query `bookings.payment_status` as the source of truth
3. Consider implementing a booking status state machine function for detailer workflows

