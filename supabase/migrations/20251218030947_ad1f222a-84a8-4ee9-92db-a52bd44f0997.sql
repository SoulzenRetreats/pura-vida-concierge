-- Create combined function to get all users with their roles in one query
CREATE OR REPLACE FUNCTION public.get_all_users_with_roles()
RETURNS TABLE(
  user_id uuid, 
  email text, 
  created_at timestamp with time zone,
  role app_role,
  role_created_at timestamp with time zone
)
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
  SELECT 
    au.id as user_id,
    au.email::text,
    au.created_at,
    ur.role,
    ur.created_at as role_created_at
  FROM auth.users au
  LEFT JOIN user_roles ur ON ur.user_id = au.id
  ORDER BY ur.role IS NOT NULL DESC, au.created_at DESC;
END;
$$;