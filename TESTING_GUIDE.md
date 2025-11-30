# Detailer Dashboard Testing Guide

## Prerequisites

1. **Database Migration**: Run the migration to create new tables
2. **Supabase Storage**: Create storage bucket for job photos
3. **Test User**: Have a detailer user account ready

## Step 1: Run Database Migration

```bash
# Apply the migration to your Supabase database
# In Supabase Dashboard: SQL Editor → Run the migration file
# Or use Supabase CLI:
supabase db push
```

Migration file: `supabase/migrations/20250123000000_solo_mode_enhancements.sql`

## Step 2: Create Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Create a new bucket named `job-photos`
3. Set it to **Public** (or configure RLS policies)
4. Enable file uploads

Alternatively, run this SQL:

```sql
-- Create storage bucket for job photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('job-photos', 'job-photos', true);

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload job photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'job-photos');

-- Allow authenticated users to read job photos
CREATE POLICY "Authenticated users can read job photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'job-photos');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete their own job photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'job-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Step 3: Start the Development Server

```bash
cd web-dashboard
npm install  # if not already done
npm run dev
```

The dashboard should be available at `http://localhost:3000`

## Step 4: Test Authentication

1. Navigate to `/auth/login`
2. Login with a detailer account
3. Verify redirect to `/detailer/dashboard`

## Step 5: Test Dashboard Features

### A. Dashboard Overview
- [ ] Verify stats cards display correctly
- [ ] Check earnings chart renders
- [ ] Verify today's jobs list shows bookings
- [ ] Check rating summary displays
- [ ] Test navigation sidebar

### B. Jobs Module
1. Navigate to `/detailer/bookings`
2. Test features:
   - [ ] Jobs table displays bookings
   - [ ] Filter by date range (Today, Tomorrow, This Week)
   - [ ] Filter by status
   - [ ] Search by booking ID, customer name, or license plate
   - [ ] Sort by time, price, or assignment time
   - [ ] Pagination works correctly
   - [ ] Click job row navigates to detail page

### C. Job Detail Page
1. Click on a booking to view details
2. Test features:
   - [ ] All booking information displays
   - [ ] Job Timeline shows status transitions
   - [ ] Payment Breakdown calculates correctly
   - [ ] Location map renders (Google Maps embed)
   - [ ] Can add internal notes
   - [ ] Can upload before/after photos
   - [ ] Can update job status (Start Service, Mark as Completed)
   - [ ] Contact customer buttons work

### D. Schedule Module
1. Navigate to `/detailer/schedule`
2. Test features:
   - [ ] Calendar displays bookings
   - [ ] Can navigate months
   - [ ] Booking status colors are correct
   - [ ] Calendar links to job detail pages

### E. Earnings Module
1. Navigate to `/detailer/earnings`
2. Test features:
   - [ ] Total earnings displays correctly
   - [ ] Pending payouts shows (if any completed bookings)
   - [ ] Earnings chart renders
   - [ ] Earnings breakdown table shows completed jobs
   - [ ] Amounts are formatted as currency

### F. Reviews Module
1. Navigate to `/detailer/reviews`
2. Test features:
   - [ ] Reviews list displays
   - [ ] Rating summary shows average
   - [ ] Filter by rating works
   - [ ] Sort by date/rating works
   - [ ] Click review navigates to detail (if implemented)

### G. Settings Module
1. Navigate to `/detailer/settings`
2. Test features:
   - [ ] Can update profile (name, phone)
   - [ ] Email field is read-only
   - [ ] Can update service area (city, province, postal code)
   - [ ] Notification preferences can be toggled
   - [ ] Settings save successfully
   - [ ] Stripe Connect placeholder displays

## Step 6: Test Real-time Updates

1. Open dashboard in two browser windows/tabs
2. In one tab, update a booking status
3. Verify the other tab updates automatically (if real-time hook is integrated)

## Step 7: Test Edge Cases

- [ ] Dashboard with 0 bookings (empty states)
- [ ] Dashboard with many bookings (pagination)
- [ ] Job detail page with no photos/notes/timeline entries
- [ ] Settings page with missing service area
- [ ] Mobile responsive design (resize browser)

## Common Issues & Fixes

### Issue: Migration fails
**Fix**: Check if tables already exist. The migration uses `IF NOT EXISTS` so it should be safe to re-run.

### Issue: Photo upload fails
**Fix**: 
- Verify storage bucket exists and is public
- Check RLS policies on storage.objects
- Verify user has authenticated session

### Issue: RLS policy errors
**Fix**: Verify detailer has `profile_id` set and role is 'detailer' in profiles table

### Issue: Components not rendering
**Fix**: 
- Check browser console for errors
- Verify all imports are correct
- Check TypeScript compilation: `npm run build`

## Database Verification Queries

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('booking_notes', 'booking_timeline', 'job_photos', 'service_areas');

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('booking_notes', 'booking_timeline', 'job_photos', 'service_areas');

-- Verify detailer can access bookings
SELECT * FROM bookings 
WHERE detailer_id IN (
  SELECT id FROM detailers WHERE profile_id = auth.uid()
);
```

## Next Steps After Testing

If all tests pass, you're ready for:
- Phase 2: Organization Foundation
- Phase 3: Organization Features

If issues are found, document them and fix before proceeding.

