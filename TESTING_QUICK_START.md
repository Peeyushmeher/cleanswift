# 🧪 Phase 1 Testing - Quick Start

## Fastest Way to Test

### 1. Automated Test Script (2 minutes)

```bash
# Make sure .env file has Supabase credentials
node scripts/test-phase-1.js
```

**What it tests:**
- ✅ Enum types exist
- ✅ New tables (booking_services, payments) exist
- ✅ New columns (profiles.role, bookings.payment_status, etc.) exist
- ✅ RLS policies work
- ✅ Payment status can be updated

**Expected output:**
```
🧪 Phase 1 Backend Foundations - Test Suite
==================================================
📋 Test 1: Checking Enum Types...
✅ user_role_enum exists
✅ payment_status_enum exists
...
🎉 All tests passed! Phase 1 is working correctly.
```

---

## Manual Testing (Supabase SQL Editor)

### Quick Schema Check (30 seconds)

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to **SQL Editor**
3. Run this query:

```sql
-- Check everything at once
SELECT 
  'profiles.role' as column_name,
  COUNT(*) as exists_check
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'role'

UNION ALL

SELECT 
  'bookings.payment_status',
  COUNT(*)
FROM information_schema.columns
WHERE table_name = 'bookings' AND column_name = 'payment_status'

UNION ALL

SELECT 
  'booking_services table',
  COUNT(*)
FROM information_schema.tables
WHERE table_name = 'booking_services'

UNION ALL

SELECT 
  'payments table',
  COUNT(*)
FROM information_schema.tables
WHERE table_name = 'payments';
```

**Expected:** All should return `1` (exists)

---

## Test Payment Status Update (Via App)

1. **Start app:**
   ```bash
   npx expo start
   ```

2. **Create a booking:**
   - Sign in
   - Book → Select service → Complete booking
   - Go to Payment screen

3. **Check database:**
   ```sql
   -- In Supabase SQL Editor
   SELECT 
     id,
     receipt_id,
     payment_status,
     stripe_payment_intent_id
   FROM bookings
   ORDER BY created_at DESC
   LIMIT 1;
   ```

4. **Expected:** 
   - `payment_status` should be `'unpaid'` (default)
   - `stripe_payment_intent_id` should be `null` initially

---

## Test Role Assignment

```sql
-- Check your current role
SELECT id, full_name, email, role
FROM profiles
WHERE id = auth.uid();

-- Assign admin role (replace with your user ID)
UPDATE profiles
SET role = 'admin'
WHERE id = 'YOUR_USER_ID';

-- Verify
SELECT id, full_name, role
FROM profiles
WHERE id = 'YOUR_USER_ID';
```

---

## Common Issues

### ❌ "column does not exist"
**Fix:** Migration might not be applied. Check:
```sql
SELECT version, name 
FROM supabase_migrations.schema_migrations 
ORDER BY version DESC;
```
Should see `phase_1_backend_foundations`

### ❌ "permission denied"
**Fix:** RLS is working! You can only see your own data. Test with your own user ID.

### ❌ Test script fails
**Fix:** Make sure `.env` file has:
```
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

---

## Full Testing Guide

For comprehensive testing, see: [`docs/phase_1_testing_guide.md`](./docs/phase_1_testing_guide.md)

