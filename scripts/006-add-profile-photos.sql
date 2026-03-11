-- Add profile photo support to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo_public_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Create index for profile photo queries
CREATE INDEX IF NOT EXISTS idx_users_profile_photo ON users(profile_photo_url) WHERE profile_photo_url IS NOT NULL;

-- Update existing users to have updated_at timestamps
UPDATE users SET updated_at = created_at WHERE updated_at IS NULL;
