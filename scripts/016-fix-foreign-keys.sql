-- Fix foreign key constraints
-- Drop conflicting constraints first (if tables exist)
ALTER TABLE IF EXISTS articles DROP CONSTRAINT IF EXISTS articles_author_id_fkey;
ALTER TABLE IF EXISTS content_drafts DROP CONSTRAINT IF EXISTS content_drafts_author_id_fkey;
ALTER TABLE IF EXISTS success_stories DROP CONSTRAINT IF EXISTS success_stories_author_id_fkey;
ALTER TABLE IF EXISTS quizzes DROP CONSTRAINT IF EXISTS quizzes_author_id_fkey;
ALTER TABLE IF EXISTS topics DROP CONSTRAINT IF EXISTS topics_author_id_fkey;
ALTER TABLE IF EXISTS user_favorites DROP CONSTRAINT IF EXISTS user_favorites_user_id_fkey;
ALTER TABLE IF EXISTS user_progress DROP CONSTRAINT IF EXISTS user_progress_user_id_fkey;
ALTER TABLE IF EXISTS reviews DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;

-- Ensure users table exists with proper structure
CREATE TABLE IF NOT EXISTS public.users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  password_hash VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add author_id to articles if it doesn't exist
DO $$
BEGIN
  ALTER TABLE articles ADD COLUMN IF NOT EXISTS author_id BIGINT;
  EXCEPTION WHEN UNDEFINED_TABLE THEN NULL;
END $$;

ALTER TABLE IF EXISTS articles ADD CONSTRAINT articles_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- Add author_id to content_drafts if it doesn't exist
DO $$
BEGIN
  ALTER TABLE content_drafts ADD COLUMN IF NOT EXISTS author_id BIGINT;
  EXCEPTION WHEN UNDEFINED_TABLE THEN NULL;
END $$;

ALTER TABLE IF EXISTS content_drafts ADD CONSTRAINT content_drafts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- Add author_id to success_stories if it doesn't exist
DO $$
BEGIN
  ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS author_id BIGINT;
  EXCEPTION WHEN UNDEFINED_TABLE THEN NULL;
END $$;

ALTER TABLE IF EXISTS success_stories ADD CONSTRAINT success_stories_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- Add author_id to quizzes if it doesn't exist
DO $$
BEGIN
  ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS author_id BIGINT;
  EXCEPTION WHEN UNDEFINED_TABLE THEN NULL;
END $$;

ALTER TABLE IF EXISTS quizzes ADD CONSTRAINT quizzes_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- Add author_id to topics if it doesn't exist
DO $$
BEGIN
  ALTER TABLE topics ADD COLUMN IF NOT EXISTS author_id BIGINT;
  EXCEPTION WHEN UNDEFINED_TABLE THEN NULL;
END $$;

ALTER TABLE IF EXISTS topics ADD CONSTRAINT topics_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- Ensure user_favorites table has proper constraints
ALTER TABLE IF EXISTS user_favorites DROP CONSTRAINT IF EXISTS user_favorites_user_id_fkey;
ALTER TABLE IF EXISTS user_favorites ADD CONSTRAINT user_favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Ensure user_progress table has proper constraints
ALTER TABLE IF EXISTS user_progress DROP CONSTRAINT IF EXISTS user_progress_user_id_fkey;
ALTER TABLE IF EXISTS user_progress ADD CONSTRAINT user_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Ensure reviews table has proper constraints
DO $$
BEGIN
  ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_id BIGINT;
  EXCEPTION WHEN UNDEFINED_TABLE THEN NULL;
END $$;

ALTER TABLE IF EXISTS reviews DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;
ALTER TABLE IF EXISTS reviews ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Ensure all new tables exist for the enhancements
CREATE TABLE IF NOT EXISTS recently_viewed (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content_type VARCHAR(50) NOT NULL,
  content_id BIGINT NOT NULL,
  title VARCHAR(255),
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, content_type, content_id)
);

CREATE TABLE IF NOT EXISTS coupons (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_percent INTEGER NOT NULL,
  max_uses INTEGER,
  times_redeemed INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS certificates (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  certificate_url VARCHAR(255),
  UNIQUE(user_id, course_id)
);

-- Ensure view_counts table exists
CREATE TABLE IF NOT EXISTS view_counts (
  id BIGSERIAL PRIMARY KEY,
  content_type VARCHAR(50) NOT NULL,
  content_id BIGINT NOT NULL,
  view_date DATE NOT NULL,
  view_count INTEGER DEFAULT 0,
  unique_viewers INTEGER DEFAULT 0,
  UNIQUE(content_type, content_id, view_date)
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_view_counts_content ON view_counts(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_reviews_content ON reviews(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_recently_viewed_user ON recently_viewed(user_id);
CREATE INDEX IF NOT EXISTS idx_recently_viewed_viewed_at ON recently_viewed(viewed_at);
CREATE INDEX IF NOT EXISTS idx_certificates_user ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO neondb_owner;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO neondb_owner;

COMMIT;
