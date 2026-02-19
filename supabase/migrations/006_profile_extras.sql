-- Add location and build_goal to user profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS build_goal TEXT;
