# Stripe Integration Analysis

**Date:** 2025-01-18  
**Status:** Analysis Complete - Ready for Implementation

---

## What is Already Implemented

### ✅ Client-Side (React Native / Expo)

1. **StripeProvider Setup** (`App.tsx`)
   - ✅ `@stripe/stripe-react-native` package installed (v0.50.3)
   - ✅ `StripeProvider` wraps the entire app
   - ✅ Reads `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` from env
   - ⚠️ **Issue:** No error handling if key is missing (only console.error)

2. **Payment Screen** (`src/screens/booking/PaymentMethodScreen.tsx`)
   - ✅ Uses `useStripe()` hook
   - ✅ Calls `createPaymentIntent()` service function
   - ✅ Initializes PaymentSheet with `initPaymentSheet()`
   - ✅ Presents PaymentSheet with `presentPaymentSheet()`
   - ✅ Handles success/failure/cancellation
   - ✅ Calls `updateBookingPaymentStatus()` after payment
   - ⚠️ **Issue:** Missing `payment_intent_id` in response handling (expects it but Edge Function may not return it correctly)

3. **Payment Service** (`src/services/paymentService.ts`)
   - ✅ `createPaymentIntent()` - calls Edge Function
   - ✅ `updateBookingPaymentStatus()` - updates booking in Supabase
   - ✅ `createBooking()` - creates booking before payment
   - ✅ `createBookingAddons()` - creates addon entries
   - ⚠️ **Issue:** `updateBookingPaymentStatus()` tries to update `payment_status`, `payment_intent_id`, and `paid_at` columns that **DO NOT EXIST** in the database schema

### ✅ Server-Side (Supabase Edge Function)

1. **Edge Function** (`supabase/functions/create-payment-intent/index.ts`)
   - ✅ Handles CORS preflight
   - ✅ Validates authentication (JWT token)
   - ✅ Validates request body (booking_id, amount)
   - ✅ Fetches booking from Supabase
   - ✅ Validates amount matches booking total
   - ✅ Initializes Stripe SDK
   - ✅ Creates PaymentIntent with metadata
   - ✅ Returns `client_secret` and `payment_intent_id`
   - ✅ Error handling with try/catch
   - ⚠️ **Issue:** May not handle Stripe errors correctly (Stripe.errors.StripeError check)

---

## What is Partially Implemented

1. **Payment Status Tracking**
   - Code attempts to update `payment_status`, `payment_intent_id`, `paid_at`
   - **Problem:** These columns don't exist in the `bookings` table schema
   - **Schema has:** `payment_method_id` (references payment_methods table), but no payment status fields

2. **Error Handling**
   - Basic error handling exists but may not cover all edge cases
   - Edge Function error responses may not be properly parsed on client

3. **Environment Variables**
   - Client expects `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Edge Function expects `STRIPE_SECRET_KEY`
   - No validation or fallback if missing

---

## What is Missing / Broken

### 🔴 Critical Issues

1. **Database Schema Mismatch**
   - `updateBookingPaymentStatus()` tries to update non-existent columns:
     - `payment_status` ❌ (doesn't exist)
     - `payment_intent_id` ❌ (doesn't exist)
     - `paid_at` ❌ (doesn't exist)
   - **Impact:** Payment success updates will fail silently or throw errors
   - **Solution:** Either:
     - Option A: Store payment info in `payment_method_id` field (workaround, not ideal)
     - Option B: Use existing `status` field creatively (not recommended)
     - Option C: Store payment_intent_id in a JSON/text field (requires schema change - NOT ALLOWED)
     - **Recommended:** Remove payment status updates OR find alternative storage

2. **Missing Payment Intent ID in Response**
   - Edge Function returns `payment_intent_id` ✅
   - But client code may not handle it correctly if response structure is wrong
   - Need to verify response parsing

3. **No Payment Status Persistence**
   - Even if we fix the update function, there's no way to query payment status later
   - Bookings table has no payment tracking fields

### ⚠️ Medium Priority Issues

4. **Error Handling Gaps**
   - Edge Function may throw unhandled Stripe errors
   - Client may not show user-friendly error messages
   - Network failures not explicitly handled

5. **Missing Validation**
   - No check if booking already has payment
   - No duplicate payment prevention
   - No validation that booking belongs to authenticated user (Edge Function does this ✅)

6. **Environment Variable Validation**
   - App.tsx only logs error, doesn't prevent app from running
   - Edge Function returns 500 if key missing, but error message may not be clear

### 📝 Nice-to-Haves (Not Blockers)

7. **Payment Method Storage**
   - PaymentSheet doesn't save payment methods to `payment_methods` table
   - No way to reuse saved cards

8. **Webhook Handling**
   - No webhook endpoint to handle Stripe events (payment.succeeded, payment.failed)
   - Relies on client-side confirmation only

---

## Implementation Plan

### Step 1: Fix Database Update Issue
- **Problem:** Cannot update non-existent columns
- **Solution:** Remove payment status updates OR use workaround
- **Decision:** Since schema cannot be changed, we'll:
  - Remove `payment_status`, `payment_intent_id`, `paid_at` updates
  - Optionally store payment_intent_id in a comment/notes field if available
  - OR: Simply log success and rely on Stripe webhooks later (future enhancement)

### Step 2: Fix Edge Function Response
- Ensure `payment_intent_id` is always returned
- Verify response structure matches client expectations

### Step 3: Improve Error Handling
- Add better error messages
- Handle network failures
- Validate environment variables

### Step 4: Add Logging
- Log PaymentSheet initialization
- Log PaymentSheet presentation
- Log success/failure
- Log booking updates

### Step 5: Test End-to-End
- Create test booking
- Trigger payment flow
- Verify Stripe PaymentSheet opens
- Verify success navigation
- Verify no database errors

---

## Files That Need Changes

1. `src/services/paymentService.ts`
   - Fix `updateBookingPaymentStatus()` to not update non-existent columns
   - OR remove payment status updates entirely

2. `src/screens/booking/PaymentMethodScreen.tsx`
   - Verify `payment_intent_id` handling
   - Improve error messages
   - Add logging

3. `supabase/functions/create-payment-intent/index.ts`
   - Verify response structure
   - Improve error handling
   - Add logging

4. `App.tsx`
   - Add better env variable validation (optional)

---

## Environment Variables Required

### Client (Expo)
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (pk_test_... or pk_live_...)

### Server (Supabase Edge Function)
- `STRIPE_SECRET_KEY` - Stripe secret key (sk_test_... or sk_live_...)
- Set via: `npx supabase secrets set STRIPE_SECRET_KEY=sk_test_...`

---

## Testing Checklist

- [ ] App starts without Stripe key (shows error but doesn't crash)
- [ ] PaymentMethodScreen loads
- [ ] Create booking succeeds
- [ ] Edge Function creates PaymentIntent
- [ ] PaymentSheet initializes
- [ ] PaymentSheet presents
- [ ] Payment succeeds in Stripe test mode
- [ ] Navigation to success screen works
- [ ] No database errors on payment success
- [ ] Payment cancellation handled gracefully
- [ ] Payment failure shows error message

---

## Notes

- Database schema is locked - cannot add payment tracking columns
- Must work within existing schema constraints
- Payment status can be inferred from Stripe dashboard or webhooks (future)
- Current implementation focuses on completing payment flow, not payment history tracking

