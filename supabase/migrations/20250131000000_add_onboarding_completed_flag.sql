-- ============================================================================
-- Add onboarding_completed flag to profiles table
-- ============================================================================
-- This flag tracks whether a user has completed the onboarding process.
-- Once set to true, the user should not be forced through onboarding again.

-- Add onboarding_completed column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'onboarding_completed'
  ) THEN
    ALTER TABLE profiles
      ADD COLUMN onboarding_completed boolean NOT NULL DEFAULT false;
    
    COMMENT ON COLUMN profiles.onboarding_completed IS 'Flag indicating if user has completed onboarding. Once true, user should not be forced through onboarding again.';
    
    -- Set onboarding_completed to true for existing users who have:
    -- - full_name and phone filled
    -- - at least one car
    -- - at least one address
    UPDATE profiles p
    SET onboarding_completed = true
    WHERE 
      p.full_name IS NOT NULL 
      AND p.full_name != ''
      AND p.phone IS NOT NULL 
      AND p.phone != ''
      AND EXISTS (
        SELECT 1 FROM cars c WHERE c.user_id = p.id LIMIT 1
      )
      AND EXISTS (
        SELECT 1 FROM user_addresses ua WHERE ua.user_id = p.id LIMIT 1
      );
  END IF;
END
$$;
