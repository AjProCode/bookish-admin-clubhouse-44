/*
  # Create subscriptions table

  1. New Tables
    - `subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles.id)
      - `plan` (text)
      - `status` (text)
      - `start_date` (timestamptz)
      - `end_date` (timestamptz)
      - `stripe_subscription_id` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  plan text NOT NULL CHECK (plan IN ('monthly', 'quarterly', 'biannual', 'annual')),
  status text NOT NULL CHECK (status IN ('active', 'inactive', 'cancelled')),
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz,
  stripe_subscription_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, stripe_subscription_id)
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));