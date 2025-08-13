-- Update orders table to add payment and project requirement fields
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS project_requirements TEXT[],
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS delivery_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS project_files JSONB;

-- Update existing orders to have default values
UPDATE public.orders 
SET 
  payment_method = 'pending',
  project_requirements = ARRAY[]::TEXT[],
  payment_status = 'pending'
WHERE payment_method IS NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON public.orders(payment_method);

-- Add comments for documentation
COMMENT ON COLUMN public.orders.payment_method IS 'Payment method: crypto, bkash, nagad, etc.';
COMMENT ON COLUMN public.orders.project_requirements IS 'Array of project requirements/features';
COMMENT ON COLUMN public.orders.payment_status IS 'Payment status: pending, paid, failed, refunded';
COMMENT ON COLUMN public.orders.admin_notes IS 'Admin notes and internal comments';
COMMENT ON COLUMN public.orders.delivery_date IS 'Expected or actual project delivery date';
COMMENT ON COLUMN public.orders.project_files IS 'JSON object containing project files and links'; 