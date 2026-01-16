<!-- 34a8f86a-627e-41a1-9803-2dc2c80c8c7d 845c2542-5ea4-4696-8ac2-02d65ce2fada -->
# Pre-Deployment Checklist for App Store Submission

## Critical Requirements (Must Complete)

### 1. Privacy Policy & Terms of Service (REQUIRED BY APPLE)

**Status:** ⚠️ **MISSING - APP WILL BE REJECTED WITHOUT THIS**

**Current State:**

- App has placeholder links in `src/screens/profile/HelpSupportScreen.tsx` and `src/screens/profile/ProfileScreen.tsx`
- Links exist but don't navigate anywhere (no handlers implemented)
- No actual privacy policy document exists

**Action Required:**

1. Create privacy policy document covering:

   - Data collection (user accounts, payment info via Stripe, location data, booking history)
   - Third-party services (Stripe, Supabase, Google Maps API)
   - Data retention and deletion policies
   - User rights (access, deletion, consent revocation)

2. Create Terms of Service document
3. Host both documents (web page or in-app)
4. Implement navigation handlers in:

   - `src/screens/profile/HelpSupportScreen.tsx` (lines 50-53, 206-222)
   - `src/screens/profile/ProfileScreen.tsx` (lines 35-36, 67)

5. Add privacy policy URL to App Store Connect metadata (REQUIRED)

### 2. Database Verification

**Status:** ⚠️ **VERIFY ALL MIGRATIONS APPLIED**

**Action Required:**

1. Verify all 35 migrations in `supabase/migrations/` are applied to production database
2. Run verification script: `node scripts/test-phase-1.js` (or equivalent)
3. Check critical tables exist:

   - `profiles` (with `role` column)
   - `bookings` (with `payment_status`, `stripe_payment_intent_id`)
   - `payments`
   - `booking_services`
   - `detailers`
   - `services`
   - `cars`

4. Verify RLS policies are enabled and working
5. Test database queries work with production Supabase URL

### 3. Environment Variables / EAS Secrets

**Status:** ⚠️ **VERIFY PRODUCTION SECRETS SET**

**Action Required:**

1. Verify all production secrets are set:
   ```bash
   node scripts/check-eas-secrets.js
   # OR
   eas env:list --environment production --scope project
   ```

2. Required secrets (from `eas.json`):

   - `EXPO_PUBLIC_SUPABASE_URL` (production Supabase URL)
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY` (production anon key)
   - `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` (production key: `pk_live_...`)
   - `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` (production key)
   - `EXPO_PUBLIC_TEST_PAYMENT_SECRET` (if still needed)

3. **CRITICAL:** Switch from test to production Stripe keys:

   - Current: `pk_test_...` (in `SET_SECRETS_COMMANDS.md`)
   - Required: `pk_live_...` for App Store
   - Update in Stripe Dashboard → API keys → Publishable key (Live mode)

4. Set secrets using:
   ```bash
   eas env:create --name EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY --value pk_live_... --environment production --scope project
   ```


### 4. Stripe Production Configuration

**Status:** ⚠️ **SWITCH TO PRODUCTION MODE**

**Action Required:**

1. Switch Stripe account to Live mode
2. Get production publishable key (`pk_live_...`)
3. Get production secret key for Edge Functions
4. Configure production webhook endpoint:

   - URL: `https://<your-project-ref>.supabase.co/functions/v1/handle-stripe-webhook`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`
   - Get production webhook signing secret (`whsec_...`)

5. Update Supabase Edge Function secrets:

   - `STRIPE_SECRET_KEY` (production)
   - `STRIPE_WEBHOOK_SECRET` (production)
   - Set in Supabase Dashboard → Project Settings → Edge Functions → Secrets

### 5. App Store Connect Metadata (REQUIRED)

**Status:** ⚠️ **MUST COMPLETE BEFORE SUBMISSION**

**Action Required:**

1. **Privacy Policy URL** (REQUIRED) - Add link to your privacy policy
2. **Support URL** - Add customer support contact (currently placeholder: `support@cleanswift.app`)
3. **App Description** - Write compelling description
4. **Screenshots** - Required for all device sizes:

   - iPhone 6.7" (iPhone 14 Pro Max, etc.)
   - iPhone 6.5" (iPhone 11 Pro Max, etc.)
   - iPhone 5.5" (iPhone 8 Plus, etc.)

5. **App Preview Video** (optional but recommended)
6. **Keywords** - SEO keywords for App Store search
7. **Category** - Lifestyle or Utilities
8. **Age Rating** - Complete questionnaire
9. **Marketing URL** (optional) - Your website

### 6. App Configuration Verification

**Status:** ✅ **MOSTLY CONFIGURED**

**Verify:**

1. `app.json`:

   - ✅ Bundle ID: `com.cleanswift.app`
   - ✅ App icon configured
   - ✅ Splash screen configured
   - ✅ Camera permission configured
   - ✅ Encryption declaration: `ITSAppUsesNonExemptEncryption: false`

2. `eas.json`:

   - ✅ Apple ID: `meherpeeyush@gmail.com`
   - ✅ App Store Connect App ID: `6756033007`
   - ✅ Apple Team ID: `CX54B578R9`
   - ✅ Auto-increment build number enabled

### 7. Code Cleanup

**Status:** ⚠️ **VERIFY NO TEST/DEBUG CODE**

**Action Required:**

1. Remove or disable test payment secret if not needed
2. Verify no hardcoded test API keys
3. Check for console.log statements (optional cleanup)
4. Verify support contact info is production-ready:

   - `src/screens/profile/HelpSupportScreen.tsx` (lines 10-11):
     - `SUPPORT_PHONE = '+1-800-CLEAN-SW'` (placeholder)
     - `SUPPORT_EMAIL = 'support@cleanswift.app'` (verify this is correct)

### 8. Location Permissions (Verify if Needed)

**Status:** ⚠️ **VERIFY IF REQUIRED**

**Current State:**

- App uses Google Maps API for server-side geocoding
- No direct device location access detected
- No location permission strings in `app.json`

**Action Required:**

- Only add if app directly accesses device GPS
- If needed, add to `app.json`:
  ```json
  "infoPlist": {
    "NSLocationWhenInUseUsageDescription": "This app uses your location to find nearby detailers and calculate service distances."
  }
  ```


## Recommended Pre-Submission Testing

1. **TestFlight Internal Testing:**

   - Build and submit to TestFlight first
   - Test all critical flows:
     - User registration/login
     - Booking creation
     - Payment processing (with production Stripe)
     - Detailer assignment
     - Booking status updates
   - Verify privacy policy links work
   - Test on physical devices

2. **Database Production Test:**

   - Create test booking in production database
   - Verify payment webhook processes correctly
   - Test RLS policies work as expected

3. **Stripe Production Test:**

   - Test with real payment method (small amount)
   - Verify webhook receives events
   - Check payment status updates in database

## Files That Need Changes

1. **`src/screens/profile/HelpSupportScreen.tsx`**

   - Add navigation handlers for privacy/terms links (lines 206-222)
   - Update support contact info if needed (lines 10-11)

2. **`src/screens/profile/ProfileScreen.tsx`**

   - Add navigation handlers for privacy/terms (lines 35-36, 67)

3. **EAS Secrets** (via CLI, not code)

   - Update Stripe key to production
   - Verify all other secrets are production values

4. **Supabase Edge Function Secrets** (via Supabase Dashboard)

   - Update Stripe keys to production
   - Update webhook secret to production

## Priority Order

1. **HIGHEST PRIORITY:**

   - Create privacy policy and add URL to App Store Connect
   - Switch Stripe to production keys
   - Verify all EAS secrets are set correctly

2. **HIGH PRIORITY:**

   - Implement privacy/terms navigation in app
   - Verify database migrations are applied
   - Complete App Store Connect metadata

3. **MEDIUM PRIORITY:**

   - TestFlight testing
   - Update support contact info
   - Prepare screenshots

4. **LOW PRIORITY:**

   - Code cleanup (console.logs, etc.)
   - Location permissions (only if needed)

## Quick Verification Commands

```bash
# Check EAS secrets
node scripts/check-eas-secrets.js

# Verify database (if test script exists)
node scripts/test-phase-1.js

# Check EAS login
eas whoami

# List recent builds
eas build:list --platform ios --limit 5
```

## Estimated Time

- Privacy Policy Creation: 2-4 hours
- App Store Connect Setup: 1-2 hours
- Code Changes (privacy links): 30 minutes
- Stripe Production Setup: 1 hour
- Database Verification: 30 minutes
- Testing: 2-4 hours

**Total: 7-12 hours**

### To-dos

- [ ] Create privacy policy document covering data collection, third-party services, retention policies, and user rights. Host it online or in-app.
- [ ] Create Terms of Service document and host it online or in-app.
- [ ] Implement navigation handlers for Privacy Policy and Terms of Service links in HelpSupportScreen.tsx and ProfileScreen.tsx
- [ ] Add privacy policy URL to App Store Connect metadata (REQUIRED field)
- [ ] Verify all 35 database migrations are applied to production Supabase database. Run test script to verify schema.
- [ ] Verify all production EAS secrets are set: Supabase URL/key, Stripe publishable key, Google Maps API key. Use check-eas-secrets.js script.
- [ ] Switch Stripe from test to production mode: update EAS secret with pk_live_ key, update Supabase Edge Function secrets with production Stripe secret key
- [ ] Configure production Stripe webhook endpoint in Stripe Dashboard and update STRIPE_WEBHOOK_SECRET in Supabase Edge Function secrets
- [ ] Complete all required App Store Connect metadata: description, screenshots (all sizes), support URL, keywords, category, age rating
- [ ] Build and submit to TestFlight, then test all critical flows: registration, booking, payment, detailer assignment on physical devices
