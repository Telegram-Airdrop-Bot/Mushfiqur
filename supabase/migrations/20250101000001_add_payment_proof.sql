-- Add payment proof field to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_proof TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.orders.payment_proof IS 'Payment proof file URL or reference'; 