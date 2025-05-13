/*
  # Create profiles table with admin support

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - matches auth.users.id
      - `email` (text, unique)
      - `first_name` (text)
      - `last_name` (text)
      - `role` (text) - either 'admin' or 'member'
      - `status` (text) - 'active' or 'inactive'
      - `books_read` (integer)
      - `stripe_customer_id` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  books_read integer DEFAULT 0,
  stripe_customer_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();