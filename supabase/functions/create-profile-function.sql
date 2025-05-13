
-- Function to create a new profile for a user
CREATE OR REPLACE FUNCTION public.create_profile(
  user_id UUID,
  user_email TEXT,
  user_first_name TEXT,
  user_last_name TEXT
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    first_name, 
    last_name, 
    role, 
    status, 
    books_read
  ) VALUES (
    user_id, 
    user_email, 
    user_first_name, 
    user_last_name, 
    'member', 
    'active', 
    0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
