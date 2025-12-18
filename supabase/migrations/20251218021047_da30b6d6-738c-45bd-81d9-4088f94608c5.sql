-- Function to get all auth users for admin user management
CREATE OR REPLACE FUNCTION public.get_all_users_for_admin()
RETURNS TABLE(user_id uuid, email text, created_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only allow admins to call this function
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  RETURN QUERY
  SELECT au.id, au.email::text, au.created_at
  FROM auth.users au
  ORDER BY au.created_at DESC;
END;
$$;