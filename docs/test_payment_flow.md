# Test Payment Flow (Dev Only)

The mobile app now ships with a **“Test: Mark Paid”** button on the Payment screen to help you run the booking > detailer acceptance loop without Stripe. This button calls the new Supabase Edge Function `mark-test-payment`, which marks a booking as `paid` and updates `payment_status` so detailers can accept it.

## Required Environment Variables

### Supabase Project (Edge Function)
Set these secrets in your Supabase project (Dashboard → Project Settings → Secrets):

| Key | Value |
| --- | --- |
| `ENABLE_TEST_PAYMENTS` | `true` |
| `TEST_PAYMENT_SECRET` | Any random string (e.g., `test-secret-123`) |

Deploy the Edge Function:

```bash
cd supabase
supabase functions deploy mark-test-payment
```

### Expo App
Add the same secret to the Expo environment so the mobile client can call the function:

```
EXPO_PUBLIC_TEST_PAYMENT_SECRET=test-secret-123
```

> The button is automatically hidden/disabled unless you run in `__DEV__` **and** the environment variable above is set.

## Flow Summary
1. User creates a booking (same as production flow).
2. Tap **“Test: Mark Paid”** → booking is created (if needed) and the Edge Function is invoked.
3. `mark-test-payment`:
   - Confirms the shared secret.
   - Calls `update_booking_status` RPC (`requires_payment → paid`).
   - Updates `payment_status` to `paid` and stamps `stripe_payment_intent_id = 'test-payment'`.
4. Booking now shows up on the detailer dashboard as a paid job that can be accepted.

## QA Detailer Credentials
Use the pre-seeded account for manual testing:

- **Email:** `test-detailer@cleanswift.dev`
- **Password:** `TestDetailer123!`

Feel free to reset the password through Supabase Auth if you need to.

