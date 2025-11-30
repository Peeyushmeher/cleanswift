# Phase 1 Backend Foundations - Testing Guide

This guide helps you test all the Phase 1 changes: new schema, RLS policies, payment tracking, and role-based access.

---

## 🚀 Quick Start

### Option 1: Run Automated Test Script (Easiest)

```bash
# Make sure you have .env file with Supabase credentials
node scripts/test-phase-1.js
```

This will automatically test:
- ✅ Enum types exist
- ✅ New tables exist  
- ✅ New columns exist
- ✅ RLS policies work
- ✅ Payment status updates work

### Option 2: Test via Supabase SQL Editor

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to SQL Editor
3. Run the queries from "Test 1: Verify Schema Changes" below

### Option 3: Test via App

1. Start the app: `npx expo start`
2. Create a booking and test payment flow
3. Verify payment status updates in the database

---

## 🧪 Testing Methods

### Method 1: Supabase SQL Editor (Recommended for Schema Testing)

Open Supabase Dashboard → SQL Editor and run these queries.

### Method 2: App Testing (Recommended for RLS & Payment Flow)

Test through the React Native app to verify RLS policies work correctly.

### Method 3: Direct Database Queries

Use `mcp_supabase_execute_sql` or Supabase client to run queries programmatically.

---

## ✅ Test 1: Verify Schema Changes

### 1.1 Check Enum Types Exist

```sql
-- Check user_role_enum
SELECT enum_range(NULL::user_role_enum);

-- Expected: {user,detailer,admin}

-- Check booking_status_enum
SELECT enum_range(NULL::booking_status_enum);

-- Expected: {pending,requires_payment,paid,offered,accepted,in_progress,completed,cancelled,no_show}

-- Check payment_status_enum
SELECT enum_range(NULL::payment_status_enum);

-- Expected: {unpaid,requires_payment,processing,paid,refunded,failed}
```

### 1.2 Check New Tables Exist

```sql
-- Check booking_services table
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'booking_services'
ORDER BY ordinal_position;

-- Check payments table
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'payments'
ORDER BY ordinal_position;
```

### 1.3 Check New Columns in Existing Tables

```sql
-- Check profiles.role column
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' 
  AND column_name = 'role';

-- Expected: role | user_role_enum | 'user'::user_role_enum | NO

-- Check bookings new columns
SELECT 
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'bookings' 
  AND column_name IN (
    'payment_status',
    'stripe_payment_intent_id',
    'receipt_payment_id',
    'scheduled_start',
    'scheduled_end',
    'location_address',
    'location_lat',
    'location_lng'
  )
ORDER BY column_name;
```

---

## ✅ Test 2: Test Role Assignment

### 2.1 Check Current User Roles

```sql
-- View all profiles with their roles
SELECT 
  id,
  full_name,
  email,
  role,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- Expected: All existing users should have role = 'user' by default
```

### 2.2 Assign Admin Role (for testing)

```sql
-- ⚠️ Replace 'YOUR_USER_ID' with an actual user UUID
-- Get your user ID from auth.users or profiles table first

UPDATE profiles
SET role = 'admin'
WHERE id = 'YOUR_USER_ID';

-- Verify the change
SELECT id, full_name, email, role
FROM profiles
WHERE id = 'YOUR_USER_ID';
```

### 2.3 Assign Detailer Role

```sql
-- Assign detailer role to a test user
UPDATE profiles
SET role = 'detailer'
WHERE id = 'ANOTHER_USER_ID';

-- Verify
SELECT id, full_name, email, role
FROM profiles
WHERE role = 'detailer';
```

---

## ✅ Test 3: Test RLS Policies

### 3.1 Test Profiles RLS (User Access)

**As a regular user:**
```sql
-- This should only return YOUR profile
SELECT id, full_name, email, role
FROM profiles;

-- This should fail (trying to see another user's profile)
-- Replace 'OTHER_USER_ID' with a different user's UUID
SELECT id, full_name, email, role
FROM profiles
WHERE id = 'OTHER_USER_ID';
```

### 3.2 Test Profiles RLS (Admin Access)

**As an admin user:**
```sql
-- This should return ALL profiles
SELECT id, full_name, email, role
FROM profiles
ORDER BY created_at DESC;

-- Admin should be able to update any profile
UPDATE profiles
SET full_name = 'Updated Name'
WHERE id = 'SOME_USER_ID';
```

### 3.3 Test Cars RLS

**As a regular user:**
```sql
-- Should only see your own cars
SELECT id, make, model, year, license_plate
FROM cars;

-- Should fail (trying to see another user's car)
SELECT id, make, model
FROM cars
WHERE user_id = 'OTHER_USER_ID';
```

**As an admin:**
```sql
-- Should see ALL cars
SELECT 
  c.id,
  c.make,
  c.model,
  c.year,
  p.full_name as owner_name
FROM cars c
JOIN profiles p ON p.id = c.user_id;
```

### 3.4 Test Bookings RLS

**As a regular user:**
```sql
-- Should only see your own bookings
SELECT 
  id,
  receipt_id,
  status,
  payment_status,
  total_amount,
  created_at
FROM bookings
ORDER BY created_at DESC;
```

**As a detailer (after linking detailer to profile):**
```sql
-- Should see bookings assigned to them
-- Note: This requires detailer_id to reference profiles.id
-- Currently detailer_id references detailers table, so this won't work yet
-- This will work in a future migration when detailers are linked to profiles
```

---

## ✅ Test 4: Test Payment Status Updates

### 4.1 Create a Test Payment Record

```sql
-- First, get a booking ID
SELECT id, receipt_id, total_amount, user_id
FROM bookings
LIMIT 1;

-- Create a payment record (replace BOOKING_ID with actual ID)
INSERT INTO payments (
  booking_id,
  amount_cents,
  currency,
  status,
  stripe_payment_intent_id
)
VALUES (
  'BOOKING_ID',
  10000,  -- $100.00 in cents
  'CAD',
  'paid',
  'pi_test_1234567890'
)
RETURNING *;
```

### 4.2 Update Booking Payment Status

```sql
-- Update booking with payment status
UPDATE bookings
SET 
  payment_status = 'paid',
  stripe_payment_intent_id = 'pi_test_1234567890',
  receipt_payment_id = (
    SELECT id FROM payments 
    WHERE booking_id = bookings.id 
    LIMIT 1
  )
WHERE id = 'BOOKING_ID'
RETURNING 
  id,
  receipt_id,
  payment_status,
  stripe_payment_intent_id,
  receipt_payment_id;
```

### 4.3 Test Payment Status Enum Values

```sql
-- Try all valid payment status values
UPDATE bookings
SET payment_status = 'unpaid'
WHERE id = 'BOOKING_ID';

UPDATE bookings
SET payment_status = 'requires_payment'
WHERE id = 'BOOKING_ID';

UPDATE bookings
SET payment_status = 'processing'
WHERE id = 'BOOKING_ID';

UPDATE bookings
SET payment_status = 'paid'
WHERE id = 'BOOKING_ID';

-- This should fail (invalid enum value)
UPDATE bookings
SET payment_status = 'invalid_status'
WHERE id = 'BOOKING_ID';
-- Expected: ERROR: invalid input value for enum payment_status_enum
```

---

## ✅ Test 5: Test Payment Service Integration

### 5.1 Test via App (Recommended)

1. **Start the app:**
   ```bash
   npx expo start
   ```

2. **Create a booking:**
   - Sign in
   - Navigate to Book tab
   - Complete booking flow
   - Go to Payment screen

3. **Test payment status update:**
   - The `updateBookingPaymentStatus()` function should now work
   - Check console logs for:
     ```
     ✅ Booking [id] payment status updated: paid
     Payment Intent ID: pi_...
     ```

4. **Verify in database:**
   ```sql
   SELECT 
     id,
     receipt_id,
     payment_status,
     stripe_payment_intent_id,
     total_amount
   FROM bookings
   WHERE id = 'YOUR_BOOKING_ID';
   ```

### 5.2 Test Payment Service Function Directly

Create a test script or use the app's console:

```typescript
import { updateBookingPaymentStatus } from './src/services/paymentService';

// Test payment status update
await updateBookingPaymentStatus({
  booking_id: 'YOUR_BOOKING_ID',
  payment_intent_id: 'pi_test_1234567890',
  payment_status: 'paid'
});
```

---

## ✅ Test 6: Test Booking Services Junction Table

### 6.1 Create Multi-Service Booking Entry

```sql
-- Get a booking ID
SELECT id FROM bookings LIMIT 1;

-- Get service IDs
SELECT id, name FROM services LIMIT 2;

-- Add multiple services to a booking
INSERT INTO booking_services (booking_id, service_id, quantity)
VALUES 
  ('BOOKING_ID', 'SERVICE_ID_1', 1),
  ('BOOKING_ID', 'SERVICE_ID_2', 2)
RETURNING *;
```

### 6.2 Query Booking with Services

```sql
-- View booking with all services
SELECT 
  b.id as booking_id,
  b.receipt_id,
  s.name as service_name,
  bs.quantity,
  s.price
FROM bookings b
JOIN booking_services bs ON bs.booking_id = b.id
JOIN services s ON s.id = bs.service_id
WHERE b.id = 'BOOKING_ID';
```

### 6.3 Test Booking Services RLS

**As a regular user:**
```sql
-- Should only see booking_services for your own bookings
SELECT 
  bs.id,
  bs.booking_id,
  s.name as service_name,
  bs.quantity
FROM booking_services bs
JOIN bookings b ON b.id = bs.booking_id
JOIN services s ON s.id = bs.service_id
WHERE b.user_id = auth.uid();
```

---

## ✅ Test 7: Test Payments Table RLS

### 7.1 Create Payment Record

```sql
-- Create payment for your booking
INSERT INTO payments (
  booking_id,
  amount_cents,
  currency,
  status,
  stripe_payment_intent_id
)
SELECT 
  id,
  (total_amount * 100)::int,  -- Convert to cents
  'CAD',
  'paid',
  'pi_test_' || id::text
FROM bookings
WHERE user_id = auth.uid()
LIMIT 1
RETURNING *;
```

### 7.2 Test Payments RLS (User Access)

**As a regular user:**
```sql
-- Should only see payments for your own bookings
SELECT 
  p.id,
  p.amount_cents,
  p.status,
  p.stripe_payment_intent_id,
  b.receipt_id
FROM payments p
JOIN bookings b ON b.id = p.booking_id
WHERE b.user_id = auth.uid();
```

**As an admin:**
```sql
-- Should see ALL payments
SELECT 
  p.id,
  p.amount_cents,
  p.status,
  p.stripe_payment_intent_id,
  b.receipt_id,
  p.full_name as customer_name
FROM payments p
JOIN bookings b ON b.id = p.booking_id
JOIN profiles p ON p.id = b.user_id
ORDER BY p.created_at DESC;
```

---

## ✅ Test 8: Verify Backward Compatibility

### 8.1 Existing Queries Still Work

```sql
-- Old booking query (should still work)
SELECT 
  id,
  receipt_id,
  status,  -- Old status column (CHECK constraint)
  service_id,  -- Old single service reference
  detailer_id,  -- Old detailer reference
  total_amount
FROM bookings
LIMIT 5;
```

### 8.2 New Columns Are Optional

```sql
-- Bookings can exist without new columns populated
SELECT 
  id,
  receipt_id,
  payment_status,  -- New column (has default)
  stripe_payment_intent_id,  -- New column (nullable)
  scheduled_start,  -- New column (nullable)
  location_address  -- New column (nullable)
FROM bookings
WHERE scheduled_start IS NULL;  -- Should return existing bookings
```

---

## 🐛 Troubleshooting

### Issue: "column does not exist"

**Solution:** Make sure the migration was applied:
```sql
SELECT version, name 
FROM supabase_migrations.schema_migrations 
ORDER BY version DESC;
```

### Issue: "permission denied for table"

**Solution:** Check RLS policies:
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'bookings', 'payments');

-- Check policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('profiles', 'bookings', 'payments', 'booking_services')
ORDER BY tablename, policyname;
```

### Issue: "invalid input value for enum"

**Solution:** Check valid enum values:
```sql
SELECT enum_range(NULL::payment_status_enum);
-- Use only these values: unpaid, requires_payment, processing, paid, refunded, failed
```

### Issue: Payment status update fails

**Solution:** Verify the booking exists and you own it:
```sql
SELECT 
  id,
  user_id,
  payment_status,
  stripe_payment_intent_id
FROM bookings
WHERE id = 'YOUR_BOOKING_ID'
  AND user_id = auth.uid();
```

---

## 📋 Quick Test Checklist

- [ ] Enum types exist (user_role_enum, booking_status_enum, payment_status_enum)
- [ ] New tables created (booking_services, payments)
- [ ] New columns added to profiles (role)
- [ ] New columns added to bookings (payment_status, stripe_payment_intent_id, etc.)
- [ ] RLS enabled on all new tables
- [ ] User can only see their own data
- [ ] Admin can see all data
- [ ] Payment status can be updated via paymentService.ts
- [ ] Existing queries still work (backward compatibility)
- [ ] booking_services table accepts inserts
- [ ] payments table accepts inserts

---

## 🚀 Next Steps After Testing

1. **If all tests pass:** Phase 1 is complete! ✅
2. **If issues found:** Check the troubleshooting section above
3. **Future enhancements:**
   - Link detailers to profiles (for detailer RLS to work fully)
   - Migrate bookings.status to use booking_status_enum
   - Update frontend to use booking_services for multi-service bookings

---

## 📝 Notes

- **Detailer RLS:** Currently, detailer RLS policies won't work fully because `detailer_id` references the `detailers` table, not `profiles`. This will be fixed in a future migration when detailers are linked to profiles.

- **Status Column:** The `bookings.status` column still uses the old CHECK constraint. The new `booking_status_enum` is ready for future migration.

- **Payment Tracking:** The `payments` table is separate from `bookings`. Use `receipt_payment_id` in bookings to link them.

