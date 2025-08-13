-- Fix the handle_new_user function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data ->> 'full_name', new.email));
  
  -- Give first user admin role, others get user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    new.id, 
    CASE 
      WHEN (SELECT COUNT(*) FROM public.user_roles WHERE role = 'admin') = 0 
      THEN 'admin'::app_role 
      ELSE 'user'::app_role 
    END
  );
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block user creation
    RAISE LOG 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN new;
END;
$function$;