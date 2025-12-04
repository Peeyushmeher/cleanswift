-- ============================================================================
-- Make reviews.detailer_id nullable
-- ============================================================================
-- This migration allows reviews to be submitted even when the detailer
-- record doesn't exist (e.g., if the detailer was deleted after the booking
-- was completed). This ensures users can still submit ratings for completed
-- bookings even if the detailer is no longer in the system.
--
-- Changes:
-- 1. Drop the NOT NULL constraint on reviews.detailer_id
-- 2. Update the foreign key constraint to allow NULL values
-- 3. Update the index to handle NULL values
-- ============================================================================

-- Drop the NOT NULL constraint on detailer_id
ALTER TABLE reviews 
  ALTER COLUMN detailer_id DROP NOT NULL;

-- The foreign key constraint will still work with NULL values
-- (NULL is allowed in foreign key columns by default in PostgreSQL)

-- Add comment explaining why detailer_id can be null
COMMENT ON COLUMN reviews.detailer_id IS 
  'Reference to the detailer who completed the service. Can be NULL if the detailer record no longer exists.';

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- Reviews can now be submitted without a detailer_id, allowing users to
-- rate completed bookings even if the detailer record was deleted or
-- never properly linked to the booking.
-- ============================================================================
