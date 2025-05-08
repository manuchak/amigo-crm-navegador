
-- Function to get users by role
CREATE OR REPLACE FUNCTION public.get_users_by_role(role_param TEXT)
RETURNS TABLE (
  uid UUID,
  email TEXT,
  display_name TEXT,
  role TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id AS uid, 
    p.email, 
    p.display_name, 
    ur.role
  FROM 
    auth.users u
  JOIN 
    public.profiles p ON u.id = p.id
  JOIN 
    public.user_roles ur ON u.id = ur.user_id
  WHERE 
    ur.role = role_param
  ORDER BY 
    p.display_name;
END;
$$;
