/*
  # Create books table

  1. New Tables
    - `books`
      - `id` (uuid, primary key)
      - `title` (text)
      - `author` (text)
      - `description` (text)
      - `coverimage` (text)
      - `categories` (text[])
      - `rating` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for public read access
    - Add policies for admin write access
*/

-- Create books table
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL,
  description text,
  coverimage text,
  categories text[],
  rating integer CHECK (rating >= 0 AND rating <= 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Books are readable by everyone"
  ON books
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only admins can insert/update/delete books"
  ON books
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));