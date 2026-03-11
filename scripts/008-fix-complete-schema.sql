-- Complete schema fix for WealthPath platform
-- This migration adds all missing fields to content tables and creates the quizzes table

-- ============================================================================
-- FIX USERS TABLE
-- ============================================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;

-- ============================================================================
-- FIX ARTICLES TABLE
-- ============================================================================
ALTER TABLE articles ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced'));
ALTER TABLE articles ADD COLUMN IF NOT EXISTS tone VARCHAR(30) DEFAULT 'educational' CHECK (tone IN ('educational', 'inspirational', 'professional', 'casual'));
ALTER TABLE articles ADD COLUMN IF NOT EXISTS length VARCHAR(20) DEFAULT 'medium' CHECK (length IN ('short', 'medium', 'long'));
ALTER TABLE articles ADD COLUMN IF NOT EXISTS audience VARCHAR(30) DEFAULT 'general' CHECK (audience IN ('general', 'students', 'professionals', 'beginners'));
ALTER TABLE articles ADD COLUMN IF NOT EXISTS key_points JSONB DEFAULT '[]';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS estimated_read_time INTEGER DEFAULT 5;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS image_alt VARCHAR(500);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS image_caption TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS image_attribution JSONB;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- ============================================================================
-- FIX SUCCESS_STORIES TABLE
-- ============================================================================
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced'));
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS tone VARCHAR(30) DEFAULT 'inspirational' CHECK (tone IN ('educational', 'inspirational', 'professional', 'casual'));
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS length VARCHAR(20) DEFAULT 'medium' CHECK (length IN ('short', 'medium', 'long'));
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS audience VARCHAR(30) DEFAULT 'general' CHECK (audience IN ('general', 'students', 'professionals', 'beginners'));
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS key_points JSONB DEFAULT '[]';
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS estimated_read_time INTEGER DEFAULT 5;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS image_alt VARCHAR(500);
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS image_caption TEXT;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS image_attribution JSONB;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- Generate slugs for existing stories
UPDATE success_stories 
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9 -]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL;

-- Make slug unique after populating
CREATE UNIQUE INDEX IF NOT EXISTS idx_success_stories_slug ON success_stories(slug);

-- ============================================================================
-- FIX LEARNING_PATHS TABLE
-- ============================================================================
ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';
ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS tone VARCHAR(30) DEFAULT 'educational' CHECK (tone IN ('educational', 'inspirational', 'professional', 'casual'));
ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS length VARCHAR(20) DEFAULT 'medium' CHECK (length IN ('short', 'medium', 'long'));
ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS audience VARCHAR(30) DEFAULT 'general' CHECK (audience IN ('general', 'students', 'professionals', 'beginners'));
ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS key_points JSONB DEFAULT '[]';
ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS estimated_read_time INTEGER DEFAULT 30;
ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);
ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS image_alt VARCHAR(500);
ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS image_caption TEXT;
ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS image_attribution JSONB;
ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- Generate slugs for existing learning paths
UPDATE learning_paths 
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(title, '[^a-zA-Z0-9 -]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL;

-- Make slug unique after populating
CREATE UNIQUE INDEX IF NOT EXISTS idx_learning_paths_slug ON learning_paths(slug);

-- Rename level to difficulty for consistency (if level exists)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'learning_paths' AND column_name = 'level'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'learning_paths' AND column_name = 'difficulty'
    ) THEN
        ALTER TABLE learning_paths RENAME COLUMN level TO difficulty;
    END IF;
END $$;

-- ============================================================================
-- CREATE QUIZZES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  summary TEXT,
  description TEXT,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  tags JSONB DEFAULT '[]',
  difficulty VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  tone VARCHAR(30) DEFAULT 'educational' CHECK (tone IN ('educational', 'inspirational', 'professional', 'casual')),
  length VARCHAR(20) DEFAULT 'short' CHECK (length IN ('short', 'medium', 'long')),
  audience VARCHAR(30) DEFAULT 'general' CHECK (audience IN ('general', 'students', 'professionals', 'beginners')),
  key_points JSONB DEFAULT '[]',
  estimated_read_time INTEGER DEFAULT 10,
  image_url VARCHAR(500),
  image_alt VARCHAR(500),
  image_caption TEXT,
  image_attribution JSONB,
  questions JSONB DEFAULT '[]',
  passing_score INTEGER DEFAULT 70,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_quizzes_author_id ON quizzes(author_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_status ON quizzes(status);
CREATE INDEX IF NOT EXISTS idx_quizzes_is_published ON quizzes(is_published);

-- ============================================================================
-- STANDARDIZE STATUS VALUES
-- ============================================================================
-- Update any 'pending_approval' to 'pending' in content tables for consistency
UPDATE articles SET status = 'pending' WHERE status = 'pending_approval';
UPDATE success_stories SET status = 'pending' WHERE status = 'pending_approval';
UPDATE learning_paths SET status = 'pending' WHERE status = 'pending_approval';

-- Set published_at for already published content
UPDATE articles SET published_at = updated_at WHERE is_published = true AND published_at IS NULL;
UPDATE success_stories SET published_at = updated_at WHERE is_published = true AND published_at IS NULL;
UPDATE learning_paths SET published_at = updated_at WHERE is_published = true AND published_at IS NULL;

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_is_published ON articles(is_published);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at);

CREATE INDEX IF NOT EXISTS idx_success_stories_author_id ON success_stories(author_id);
CREATE INDEX IF NOT EXISTS idx_success_stories_status ON success_stories(status);
CREATE INDEX IF NOT EXISTS idx_success_stories_is_published ON success_stories(is_published);
CREATE INDEX IF NOT EXISTS idx_success_stories_published_at ON success_stories(published_at);

CREATE INDEX IF NOT EXISTS idx_learning_paths_author_id ON learning_paths(author_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_status ON learning_paths(status);
CREATE INDEX IF NOT EXISTS idx_learning_paths_is_published ON learning_paths(is_published);
CREATE INDEX IF NOT EXISTS idx_learning_paths_published_at ON learning_paths(published_at);

-- ============================================================================
-- UPDATE TRIGGERS FOR UPDATED_AT
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at 
    BEFORE UPDATE ON articles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_success_stories_updated_at ON success_stories;
CREATE TRIGGER update_success_stories_updated_at 
    BEFORE UPDATE ON success_stories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_learning_paths_updated_at ON learning_paths;
CREATE TRIGGER update_learning_paths_updated_at 
    BEFORE UPDATE ON learning_paths 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_quizzes_updated_at ON quizzes;
CREATE TRIGGER update_quizzes_updated_at 
    BEFORE UPDATE ON quizzes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
