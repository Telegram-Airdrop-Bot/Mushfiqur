-- Add project preview support fields
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS has_web_preview BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS image_preview_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS preview_type TEXT DEFAULT 'image' CHECK (preview_type IN ('image', 'web', 'both', 'none'));

-- Add comments for documentation
COMMENT ON COLUMN public.projects.has_web_preview IS 'Whether the project has a live web demo available';
COMMENT ON COLUMN public.projects.image_preview_enabled IS 'Whether to show image preview when web preview is not available';
COMMENT ON COLUMN public.projects.preview_type IS 'Type of preview available: image, web, both, or none';

-- Update existing projects to have default values
UPDATE public.projects 
SET 
  has_web_preview = COALESCE(has_web_preview, false),
  image_preview_enabled = COALESCE(image_preview_enabled, true),
  preview_type = CASE 
    WHEN demo_url IS NOT NULL AND demo_url != '' THEN 'web'
    WHEN image_url IS NOT NULL AND image_url != '' THEN 'image'
    ELSE 'none'
  END
WHERE has_web_preview IS NULL OR image_preview_enabled IS NULL OR preview_type IS NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_preview_type ON public.projects(preview_type);
CREATE INDEX IF NOT EXISTS idx_projects_has_web_preview ON public.projects(has_web_preview);
CREATE INDEX IF NOT EXISTS idx_projects_image_preview_enabled ON public.projects(image_preview_enabled);

-- Add RLS policy for preview fields if needed
-- (This assumes you already have RLS enabled and policies set up) 