# Setting Up Supabase Storage for Project Images

## Manual Setup Steps

Since the automatic migration might not work in all environments, follow these steps to manually create the storage bucket:

### 1. Go to Supabase Dashboard
- Navigate to your Supabase project dashboard
- Go to **Storage** in the left sidebar

### 2. Create New Bucket
- Click **"New bucket"**
- Set the following values:
  - **Name**: `project-images`
  - **Public bucket**: ✅ Check this (so images are publicly accessible)
  - **File size limit**: `5 MB`
  - **Allowed MIME types**: 
    - `image/jpeg`
    - `image/png` 
    - `image/webp`
    - `image/gif`

### 3. Set Storage Policies
After creating the bucket, go to **Storage > Policies** and add these policies:

#### Policy 1: Public Read Access
- **Policy name**: `Public read access for project images`
- **Target roles**: `public`
- **Policy definition**:
```sql
(bucket_id = 'project-images')
```

#### Policy 2: Authenticated Upload
- **Policy name**: `Authenticated users can upload project images`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
(bucket_id = 'project-images')
```

#### Policy 3: Authenticated Update
- **Policy name**: `Authenticated users can update project images`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
(bucket_id = 'project-images')
```

#### Policy 4: Authenticated Delete
- **Policy name**: `Authenticated users can delete project images`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
(bucket_id = 'project-images')
```

### 4. Test the Setup
After setting up the bucket and policies:
1. Go to your admin panel
2. Try to create/edit a project
3. Upload an image
4. The image should now persist and be visible

## Troubleshooting

### If images still don't persist:
1. Check the browser console for errors
2. Verify the storage bucket name is exactly `project-images`
3. Ensure all policies are set correctly
4. Check that your Supabase client has the correct permissions

### If you get permission errors:
1. Make sure you're logged in as an admin user
2. Verify the storage policies allow authenticated users
3. Check that RLS (Row Level Security) is properly configured

## Alternative: Use Existing Bucket

If you already have a storage bucket, you can:
1. Update the bucket name in `ImagePreview.tsx` (line 95)
2. Change `'project-images'` to your existing bucket name
3. Ensure the bucket has public read access
4. Set appropriate upload policies 