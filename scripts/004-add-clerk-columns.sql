-- Migration: Add Clerk authentication support to users table
-- This migration adds the clerk_id column and fixes the schema to work with Clerk auth

-- Step 1: Add clerk_id column (unique, nullable for existing users)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS clerk_id TEXT UNIQUE;

-- Step 2: Make password_hash nullable (not needed with Clerk)
ALTER TABLE users
ALTER COLUMN password_hash DROP NOT NULL;

-- Step 3: Add profile fields that Clerk auth needs
ALTER TABLE users
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Step 4: Create index on clerk_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);

-- Step 5: Add check constraint to ensure clerk_id or password_hash exists
-- This prevents users from being created without any auth method
ALTER TABLE users
ADD CONSTRAINT auth_method_check 
CHECK (clerk_id IS NOT NULL OR password_hash IS NOT NULL);

-- Step 6: Add comment documenting the change
COMMENT ON COLUMN users.clerk_id IS 'Clerk user ID (user_xxx format) - primary auth identifier with Clerk';
COMMENT ON COLUMN users.password_hash IS 'Legacy password hash - null for Clerk-authenticated users';
COMMENT ON COLUMN users.profile_photo_url IS 'User profile photo URL from Clerk or uploaded';
COMMENT ON COLUMN users.bio IS 'User biography/about text';
