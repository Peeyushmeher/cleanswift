# Session Notes - Booking Flow Navigation Fix

**Date:** 2025-11-20
**Status:** Fix implemented, pending iOS cache clear for verification

---

## Problem
Navigation error: "Couldn't find a navigation context" when clicking service cards in ServiceSelectionScreen, despite NavigationContainer being properly initialized.

## Root Cause
Incorrect import path in `ServiceSelectionScreen.tsx` line 5:
```typescript
// ❌ WRONG
import { BookingStackParamList } from '../navigation/BookingStack';

// ✅ FIXED
import { BookingStackParamList } from '../../navigation/BookingStack';
```

## Fix Applied
- **File:** `src/screens/booking/ServiceSelectionScreen.tsx`
- **Change:** Fixed relative import path (from `../` to `../../`)
- **Why:** File is 2 levels deep (src/screens/booking/), needs to go up 2 levels to reach src/navigation/

## Testing Results
- ✅ **Web:** Works perfectly - all 4 services + addons visible, navigation works
- ⏳ **iOS:** Needs cache clear - still showing old version (only 1 service)

## Next Steps

### 1. Clear iOS Cache
```bash
# Method A: Delete app from simulator (fastest)
# Long-press app → Delete App

# Method B: Reset simulator
xcrun simctl shutdown all
xcrun simctl erase all

# If Xcode issues:
sudo xcode-select --reset
```

### 2. Test
```bash
npx expo start --clear
# Press 'i' for iOS
```

### 3. Verify
- Should see all 4 services + Add-Ons section
- Click "Quick Wash" → green border
- Click "Continue" → navigate to BookingDateTime WITHOUT error

---

## Architecture Summary

### Navigation Structure
```
App.tsx (NavigationContainer)
 └── RootNavigator (Auth or Main)
      └── MainTabs (if authenticated)
           └── BookingStack (Book tab)
                └── ServiceSelectionScreen ← Fixed import here
                └── BookingDateTimeScreen
                └── ChooseDetailerScreen
                └── OrderSummaryScreen
                └── PaymentMethodScreen
                └── etc.
```

### Key Files
- `index.js` - Entry point, registers App component
- `App.tsx` - NavigationContainer + providers
- `src/contexts/BookingContext.tsx` - Booking state management
- `src/hooks/useServices.ts` - Fetch services from Supabase
- `src/hooks/useServiceAddons.ts` - Fetch addons from Supabase
- `src/screens/booking/ServiceSelectionScreen.tsx` - **FIXED TODAY**
- `src/navigation/BookingStack.tsx` - Booking flow navigator

### Database
- **Services:** Quick Wash ($29), Exterior Wash ($49), Full Detail ($79), Luxury Package ($149)
- **Addons:** Tire Shine ($10), Wax Finish ($20), Clay Bar Treatment ($35), Pet Hair Removal ($15)
- **Detailers:** 3 test detailers with ratings
- **Profiles:** Address fields added (address_line1, city, province, postal_code)

---

## Verified Best Practices
✅ Single NavigationContainer at root
✅ All navigation imports from `@react-navigation/native` (not /core)
✅ Navigation hooks only used inside navigator screens
✅ No Expo Router remnants
✅ Proper TypeScript typing with NativeStackScreenProps

---

## Known Issues
- iOS simulator has Xcode configuration issue (exit code 69) - may need `sudo xcode-select --reset`
- iOS aggressively caches bundles - requires manual cache clear

---

**Status:** Fix complete. Once iOS cache is cleared, navigation should work! 🎯

---

# Session Notes - Booking Creation & Payment Flow Fixes

**Date:** 2025-11-21
**Status:** ✅ Booking creation fully working | ⏳ Payment Edge Function needs Stripe key

---

## Problems Fixed

### 1. UUID Bug - Invalid `detailer_id`
**Error:** `invalid input syntax for type uuid: "3"`
**Root Cause:** ChooseDetailerScreen used hardcoded array with string IDs ("1", "2", "3") instead of real UUIDs from Supabase

**Fix:**
- Created `src/hooks/useDetailers.ts` hook (follows `useServices.ts` pattern)
- Fetches detailers from Supabase with real UUID `id` fields
- Updated `src/screens/booking/ChooseDetailerScreen.tsx`:
  - Removed hardcoded `detailers` array
  - Added `useDetailers()` hook
  - Added loading/error states
  - Fixed field mappings: `name` → `full_name`, `reviews` → `review_count`
  - Placeholder text for distance/ETA (TODO: geolocation)

**Result:** ✅ `detailer_id` now passes valid UUIDs (e.g., `d6b2b0cb-a567-4d68-adfa-77effae282fd`)

---

### 2. Missing `receipt_id`
**Error:** `null value in column "receipt_id" violates not-null constraint`
**Root Cause:** Bookings table requires unique `receipt_id`, but insert payload didn't include it

**Fix:**
- Added auto-generation in `src/services/paymentService.ts` (lines 121-126)
- Format: `CS-YYYYMMDD-HHMMSS-XXXX` (e.g., `CS-20251121-025051-8CDV`)
- Uses timestamp + 4-char random suffix for uniqueness

**Result:** ✅ Every booking now gets unique `receipt_id`

---

### 3. Missing `car_id`
**Error:** `null value in column "car_id" violates not-null constraint`
**Root Cause:** No car selection screen in booking flow, `car_id` passed as `null`

**Fix (Option B: Auto-use primary car):**
- Added logic in `src/screens/booking/PaymentMethodScreen.tsx` (lines 56-98)
- Checks `BookingContext.selectedCar` first
- If null, fetches user's primary car from Supabase (`is_primary = true`)
- If still no car, shows Alert: "Please add a vehicle to your profile"
- Blocks booking creation until car exists
- Added test car for `test@cleanswift.com`: Tesla Model 3 (UUID: `91f937eb-a150-4f7a-a888-c44c572bbfbf`)

**Result:** ✅ `car_id` now passes valid UUIDs

---

### 4. Parameter Mismatches in `createBooking()`
**Issues:**
- Passed `scheduled_time` instead of `scheduled_time_start`
- Passed non-existent fields: `service_duration_minutes`, `location_address`, `notes`
- Missing required address fields

**Fix:**
- Fixed parameter name: `scheduled_time_start`
- Removed non-existent fields
- Added address fields with TODO placeholders (city: 'Toronto', postal_code: 'M1M 1M1', etc.)
- Fixed `createBookingAddons()` to pass `Array<{id, price}>` instead of `string[]`

**Result:** ✅ Booking payload now matches function signature

---

### 5. Payment Edge Function - Missing Column
**Error:** Edge Function returned 404
**Root Cause:** Function tried to SELECT non-existent `payment_status` column

**Fix:**
- Edited `supabase/functions/create-payment-intent/index.ts`
- Removed `payment_status` from SELECT query (line 75)
- Removed duplicate payment check (lines 90-98)
- Added error logging
- Deployed function: `npx supabase functions deploy create-payment-intent`

**Result:** ✅ 404 error fixed, now getting 500 (progress!)

---

### 6. Payment Edge Function - Missing Stripe Key
**Error:** Edge Function returned 500
**Root Cause:** `STRIPE_SECRET_KEY` environment variable not configured

**Next Step:** User needs to set Stripe secret:
```bash
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_...
```

**Status:** ⏳ Waiting for user to configure

---

## Verified Working

### Booking Creation ✅
**Sample successful booking:**
```json
{
  "id": "252992f2-2984-4e22-9721-ca811e7ce6e0",
  "receipt_id": "CS-20251121-025051-8CDV",
  "user_id": "990591dc-0c01-4032-a320-e40cb85c009f",
  "car_id": "91f937eb-a150-4f7a-a888-c44c572bbfbf",
  "service_id": "c62286ad-170b-4479-a184-4397bb324c90",
  "detailer_id": "d6b2b0cb-a567-4d68-adfa-77effae282fd",
  "status": "scheduled",
  "total_amount": 168.37
}
```

**All UUID fields are valid! No more 22P02 or 23502 errors.**

---

## Files Changed

### New Files
1. `src/hooks/useDetailers.ts` - Fetch detailers from Supabase

### Modified Files
1. `src/services/paymentService.ts`
   - Added `receipt_id` generation
   - Added debug logging for booking payload

2. `src/screens/booking/PaymentMethodScreen.tsx`
   - Fixed `createBooking()` parameter names
   - Added address fields (TODO placeholders)
   - Fixed `createBookingAddons()` format
   - Added car auto-fetch logic
   - Added "Vehicle Required" error handling

3. `src/screens/booking/ChooseDetailerScreen.tsx`
   - Replaced hardcoded detailers with `useDetailers()` hook
   - Added loading/error states
   - Fixed field mappings
   - Placeholder distance/ETA

4. `supabase/functions/create-payment-intent/index.ts`
   - Removed `payment_status` references
   - Added error logging
   - Deployed to Supabase

---

## Test Data Added

### Cars Table
- Tesla Model 3 (2023) - License: TEST-123
- User: `test@cleanswift.com`
- Primary: Yes
- UUID: `91f937eb-a150-4f7a-a888-c44c572bbfbf`

---

## Next Steps

1. **User:** Set Stripe test secret key
   ```bash
   npx supabase secrets set STRIPE_SECRET_KEY=sk_test_...
   ```

2. **Test:** Full payment flow (booking → payment intent → Stripe sheet)

3. **Future TODOs:**
   - Add real address selection (replace placeholders)
   - Add geolocation for detailer distance/ETA
   - Add explicit car selection screen (optional)
   - Add duplicate payment protection (via `payment_method_id` or new column)

---

## Architecture Decisions (War Map Constraints Followed)

✅ No database schema changes
✅ No new screens added (reused existing flow)
✅ No route/flow modifications
✅ Minimal, surgical fixes only
✅ Followed PROJECT_BRIEF.md constraints

**Strategy:** Fix data flow issues within existing architecture rather than redesigning.

---

**Status:** Booking creation is fully working! Payment flow will work once Stripe key is configured. 🎉
