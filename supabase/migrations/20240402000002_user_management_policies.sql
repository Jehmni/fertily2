-- Create a view for user management that combines auth.users with profiles
CREATE OR REPLACE VIEW user_management_view AS
SELECT 
  au.id,
  au.email,
  au.created_at,
  au.last_sign_in_at,
  p.first_name,
  p.last_name,
  ur.role as is_admin
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
LEFT JOIN public.user_roles ur ON ur.user_id = au.id;

-- Function to get all users with their roles
CREATE OR REPLACE FUNCTION get_users()
RETURNS SETOF user_management_view
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the requesting user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT * FROM user_management_view;
END;
$$;

-- Function to toggle user admin status
CREATE OR REPLACE FUNCTION toggle_user_admin(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_is_admin BOOLEAN;
BEGIN
  -- Check if the requesting user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Check if the user already has admin role
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = target_user_id 
    AND role = 'admin'
  ) INTO current_is_admin;

  IF current_is_admin THEN
    -- Remove admin role
    DELETE FROM user_roles 
    WHERE user_id = target_user_id 
    AND role = 'admin';
    RETURN FALSE;
  ELSE
    -- Add admin role
    INSERT INTO user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    RETURN TRUE;
  END IF;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON user_management_view TO authenticated;
GRANT EXECUTE ON FUNCTION get_users() TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_user_admin(UUID) TO authenticated; 