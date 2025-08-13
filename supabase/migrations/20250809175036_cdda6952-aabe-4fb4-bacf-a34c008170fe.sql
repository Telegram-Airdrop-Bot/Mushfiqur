-- Check if RLS is enabled and add policy if needed
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Ensure admin policy exists for orders
DROP POLICY IF EXISTS "Enable admin access to orders" ON public.orders;
CREATE POLICY "Enable admin access to orders" ON public.orders
FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Ensure admin policy exists for profiles  
DROP POLICY IF EXISTS "Enable admin access to profiles" ON public.profiles;
CREATE POLICY "Enable admin access to profiles" ON public.profiles
FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role));