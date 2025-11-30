# Booking State Machine Implementation

## Overview

This document describes the implementation of a centralized booking status state machine and detailer acceptance flow for CleanSwift.

## ✅ Completed Implementation

### 1. Database Migrations

#### Migration 1: `migrate_booking_status_to_enum`
- Migrated `bookings.status` from CHECK constraint to `booking_status_enum`
- Mapped old values: `scheduled` → `paid`/`requires_payment`, `canceled` → `cancelled`
- Preserved existing data during migration

#### Migration 2: `add_update_booking_status_function`
- Created `update_booking_status` RPC function
- Implements role-based state transition rules
- Uses row locking (`FOR UPDATE`) to prevent race conditions
- Supports system calls (webhooks) for payment transitions

#### Migration 3: `add_accept_booking_function`
- Created `accept_booking` RPC function for detailers
- Race-condition safe booking assignment
- Validates payment status and availability

### 2. State Machine Rules

**User Role Permissions:**
- **Users**: Can cancel bookings in `pending`, `requires_payment`, or `paid` (if unassigned)
- **Detailers**: Can transition `accepted` → `in_progress` → `completed` (for assigned bookings)
- **Admins**: Can perform most transitions (except from final states)
- **System (Webhooks)**: Can transition `requires_payment` → `paid` on payment success

**Status Flow:**
```
pending → requires_payment → paid → accepted → in_progress → completed
                              ↓
                          cancelled
```

### 3. TypeScript Integration

**New Functions:**
- `updateBookingStatus(bookingId, newStatus)` - Update booking status via state machine
- `acceptBooking(bookingId)` - Detailer accepts a paid, unassigned booking

**Updated Types:**
- `BookingStatus` type matches `booking_status_enum`
- `BookingRow` interface updated with new status values

### 4. Detailer UI Screens

**AvailableBookingsScreen:**
- Lists paid, unassigned bookings
- Accept button for each booking
- Real-time updates via Supabase queries

**MyBookingsScreen:**
- Shows bookings assigned to the detailer
- Status badges (accepted, in_progress, completed)
- Navigate to booking details

**DetailerBookingDetailScreen:**
- Full booking information
- Status update buttons (Start Work, Mark Complete)
- Customer and vehicle details

### 5. Navigation Integration

- Added `DetailerStack` to `ProfileStack`
- Detailer dashboard accessible from Profile screen (for detailers only)
- Uses `useUserProfile` hook to check user role

### 6. Notifications

**useBookingNotifications Hook:**
- Listens for booking status changes via Supabase Realtime
- Sends push notifications for:
  - Payment success
  - Detailer acceptance
  - Work started
  - Service completed
  - Cancellation

**useDetailerBookingNotifications Hook:**
- Notifies detailers of new available bookings
- Triggers when bookings become paid and unassigned

### 7. Webhook Integration

Updated `handle-stripe-webhook` to:
- Use `update_booking_status` RPC for status transitions
- Maintain direct `payment_status` updates (separate from state machine)
- Handle system calls properly (auth.uid() is null for webhooks)

## Testing

### Manual Testing Steps

1. **As a User:**
   - Create a booking → status should be `requires_payment`
   - Complete payment → status should transition to `paid` (via webhook)
   - Cancel booking → should work for `pending`, `requires_payment`, or `paid` (if unassigned)

2. **As a Detailer:**
   - View available bookings → should see paid, unassigned bookings
   - Accept booking → should set `detailer_id` and status to `accepted`
   - Start work → should transition `accepted` → `in_progress`
   - Complete work → should transition `in_progress` → `completed`

3. **As an Admin:**
   - Should be able to perform most status transitions
   - Can override detailer assignments if needed

### Database Testing

```sql
-- Test update_booking_status function
SELECT * FROM update_booking_status(
  'booking-id-here'::uuid,
  'cancelled'::booking_status_enum
);

-- Test accept_booking function
SELECT * FROM accept_booking('booking-id-here'::uuid);

-- Check booking status transitions
SELECT id, status, payment_status, detailer_id, updated_at
FROM bookings
ORDER BY updated_at DESC;
```

## Files Created/Modified

### New Files
- `supabase/migrations/20250121000000_migrate_booking_status_to_enum.sql`
- `supabase/migrations/20250121000001_add_update_booking_status_function.sql`
- `supabase/migrations/20250121000002_add_accept_booking_function.sql`
- `src/hooks/useDetailerBookings.ts`
- `src/hooks/useUserProfile.ts`
- `src/hooks/useBookingNotifications.ts`
- `src/navigation/DetailerStack.tsx`
- `src/screens/detailer/AvailableBookingsScreen.tsx`
- `src/screens/detailer/MyBookingsScreen.tsx`
- `src/screens/detailer/DetailerBookingDetailScreen.tsx`

### Modified Files
- `supabase/functions/handle-stripe-webhook/index.ts`
- `src/lib/bookings.ts`
- `src/hooks/useBookings.ts`
- `src/screens/orders/OrderDetailsScreen.tsx`
- `src/screens/orders/OrdersHistoryScreen.tsx`
- `src/screens/profile/ProfileScreen.tsx`
- `src/navigation/ProfileStack.tsx`
- `App.tsx`

## Next Steps

1. **Enable Realtime in Supabase:**
   - Go to Database → Replication
   - Enable replication for `bookings` table
   - This is required for notification hooks to work

2. **Configure Push Notifications:**
   - Set up Expo push notification certificates
   - Configure notification permissions in app

3. **Testing:**
   - Test with real user accounts
   - Verify state transitions work correctly
   - Test race conditions (multiple detailers accepting same booking)

4. **Future Enhancements:**
   - Add booking history/audit log
   - Add admin dashboard for status management
   - Add email notifications in addition to push
   - Add booking cancellation reasons
   - Add refund processing for cancelled paid bookings

## Security Notes

- All RPC functions use `SECURITY DEFINER` with proper role checks
- Row locking prevents race conditions
- RLS policies still apply (functions respect user permissions)
- System calls (webhooks) are limited to specific transitions

