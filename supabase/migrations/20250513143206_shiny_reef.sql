/*
  # Create admin user

  This migration creates an initial admin user for the application.
  
  Email: admin@skillbagbooks.com
  Password: Admin@123
*/

-- Insert admin user into auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change_token_current,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@skillbagbooks.com',
  crypt('Admin@123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING
RETURNING id;

-- Create admin profile
INSERT INTO profiles (
  id,
  email,
  first_name,
  last_name,
  role,
  status
)
SELECT 
  id,
  email,
  'Admin',
  'User',
  'admin',
  'active'
FROM auth.users
WHERE email = 'admin@skillbagbooks.com'
ON CONFLICT (id) DO NOTHING;