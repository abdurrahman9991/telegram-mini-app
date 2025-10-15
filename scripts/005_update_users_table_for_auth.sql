-- Add email column and make telegram_id optional for email-based users
ALTER TABLE users 
  ALTER COLUMN telegram_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

-- Update RLS policies to work with both Supabase Auth and Telegram users
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

-- Create new RLS policies that work with Supabase Auth
CREATE POLICY "Users can view their own data"
  ON users
  FOR SELECT
  USING (
    auth.uid() = id OR 
    telegram_id = (SELECT telegram_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to insert their own data during signup
CREATE POLICY "Users can insert their own data"
  ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Add default values for new email-based users
ALTER TABLE users 
  ALTER COLUMN balance SET DEFAULT 0.0,
  ALTER COLUMN total_earned SET DEFAULT 0.0,
  ALTER COLUMN total_withdrawn SET DEFAULT 0.0;
