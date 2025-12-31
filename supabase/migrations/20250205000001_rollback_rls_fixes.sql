-- ============================================================================
-- Rollback: RLS Fix Migrations
-- ============================================================================
-- This migration rolls back all changes made in the fix_is_admin_rls_bypass
-- migrations (20251222004650 through 20251222004907).
-- 
-- It restores:
-- 1. The original is_admin() function from 20250119000001_fix_profiles_rls_recursion.sql
-- 2. The admin policies on profiles table
-- ============================================================================

-- Restore the original is_admin() function
-- This is the version from 20250119000001_fix_profiles_rls_recursion.sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
END;
$$;

-- Set the function owner to postgres
ALTER FUNCTION is_admin() OWNER TO postgres;

COMMENT ON FUNCTION is_admin() IS 'Checks if current user has admin role. Uses SECURITY DEFINER to bypass RLS.';

-- Restore the admin policies on profiles table
-- These were removed by temporarily_disable_admin_policies migration
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- Rollback Complete
-- ============================================================================
-- Restored is_admin() function and admin policies to their original state
-- from before the fix_is_admin_rls_bypass migrations.
-- ============================================================================


