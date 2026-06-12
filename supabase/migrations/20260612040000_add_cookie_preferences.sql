-- Add cookie_preferences column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS cookie_preferences JSONB DEFAULT '{"essential": true, "functional": false, "analytics": false}'::jsonb;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_cookie_preferences ON profiles USING GIN (cookie_preferences);
