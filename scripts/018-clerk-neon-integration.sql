-- ---------------------------------------------------------------------------
-- 018 — Clerk ↔ Neon integration
--
-- Bridges Clerk (identity provider) with the Neon `users` table that every
-- foreign key in this app points at.
--
-- lib/auth.ts resolves a Clerk `user_xxx` id into the internal `users.id`
-- UUID. For that to work the table needs two changes that no earlier
-- migration makes:
--
--   1. a `clerk_id` column (+ unique index) to store the Clerk subject
--   2. `password_hash` must become NULLABLE — Clerk owns credentials now,
--      so inserts from lib/auth.ts never supply a hash. Leaving the
--      original NOT NULL constraint in place makes every first-time
--      sign-in fail with a null-violation.
--
-- Idempotent: safe to re-run.
-- ---------------------------------------------------------------------------

-- 1. Clerk subject id -------------------------------------------------------
ALTER TABLE users ADD COLUMN IF NOT EXISTS clerk_id TEXT;

-- Unique, but allows many NULLs (pre-existing password users not yet linked).
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_clerk_id
  ON users (clerk_id)
  WHERE clerk_id IS NOT NULL;

-- 2. Clerk owns credentials, so a local hash is no longer required ----------
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- 3. Columns lib/auth.ts selects on every request ---------------------------
-- (normally created by 006-add-profile-photos.sql; repeated here so this
--  migration is self-sufficient regardless of which files have been applied)
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 4. `is_active = true` is part of the hot-path lookup ----------------------
ALTER TABLE users ALTER COLUMN is_active SET DEFAULT true;
UPDATE users SET is_active = true WHERE is_active IS NULL;

-- 5. Supporting index for the link-by-email upsert path ---------------------
CREATE INDEX IF NOT EXISTS idx_users_email_active ON users (email, is_active);
