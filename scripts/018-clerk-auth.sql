-- Clerk becomes the source of truth for credentials and sessions.
-- The local users table is kept as the profile/relational record.

ALTER TABLE users ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_clerk_user_id
  ON users (clerk_user_id);

-- Passwords are managed by Clerk, so local hashes are no longer required.
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Clerk manages sessions; the local sessions table is no longer read from.
DROP TABLE IF EXISTS sessions;
