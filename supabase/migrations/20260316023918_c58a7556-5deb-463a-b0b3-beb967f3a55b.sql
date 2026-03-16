
CREATE OR REPLACE FUNCTION public.get_notification_recipient()
RETURNS TABLE(email text, first_name text, whatsapp_number text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT au.email::text, p.first_name, p.whatsapp_number
  FROM app_settings s
  JOIN auth.users au ON au.email = (s.value #>> '{}')
  JOIN profiles p ON p.id = au.id
  WHERE s.key = 'notification_email'
  LIMIT 1;
END;
$$;
