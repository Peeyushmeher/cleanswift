-- ============================================================================
-- Create Avatars Storage Bucket and RLS Policies
-- ============================================================================
-- This migration creates a public storage bucket for user profile avatars
-- with appropriate RLS policies to ensure users can only manage their own avatars
-- while allowing public read access for displaying avatars.
-- ============================================================================

-- Create the avatars storage bucket (public access for reading avatars)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true, -- Public read access
  5242880, -- 5MB file size limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- RLS Policies for Storage Objects
-- ============================================================================

-- Policy: Public read access (anyone can view avatars)
CREATE POLICY "Public Avatar Access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Policy: Authenticated users can upload their own avatars
-- Users can only upload to paths matching their user ID: {userId}/*
CREATE POLICY "Users can upload own avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (string_to_array(name, '/'))[1] = auth.uid()::text
);

-- Policy: Authenticated users can update their own avatars
-- Users can only update files in their own user folder
CREATE POLICY "Users can update own avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (string_to_array(name, '/'))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND (string_to_array(name, '/'))[1] = auth.uid()::text
);

-- Policy: Authenticated users can delete their own avatars
-- Users can only delete files in their own user folder
CREATE POLICY "Users can delete own avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (string_to_array(name, '/'))[1] = auth.uid()::text
);

COMMENT ON POLICY "Public Avatar Access" ON storage.objects IS 
'Allows public read access to avatar images for display purposes';

COMMENT ON POLICY "Users can upload own avatars" ON storage.objects IS 
'Allows authenticated users to upload avatars to their own user folder ({userId}/*)';

COMMENT ON POLICY "Users can update own avatars" ON storage.objects IS 
'Allows authenticated users to update avatars in their own user folder ({userId}/*)';

COMMENT ON POLICY "Users can delete own avatars" ON storage.objects IS 
'Allows authenticated users to delete avatars from their own user folder ({userId}/*)';

