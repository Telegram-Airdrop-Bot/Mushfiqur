-- This migration is no longer needed since we're using base64 image storage
-- Images are now stored directly in the projects table as base64 strings
-- No external storage setup required

-- If you previously created a storage bucket and want to remove it:
-- 1. Go to Supabase Dashboard > Storage
-- 2. Delete the 'project-images' bucket if it exists
-- 3. This will clean up any unused storage

-- The base64 approach is simpler and doesn't require any special permissions 