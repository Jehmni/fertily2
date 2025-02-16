-- Get user ID and assign admin role
DO $$ 
DECLARE
  user_id UUID;
BEGIN
  -- Get the user ID from auth.users
  SELECT id INTO user_id 
  FROM auth.users 
  WHERE email = 'ofoneset@gmail.com';

  -- Insert admin role for the user
  INSERT INTO user_roles (user_id, role)
  VALUES (user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Verify the insertion
  IF NOT FOUND THEN
    RAISE NOTICE 'Admin role already exists for user or user not found';
  END IF;
END $$; 