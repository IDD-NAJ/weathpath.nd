-- Fix remaining schema issues from previous migration

-- Add missing columns that failed
ALTER TABLE articles ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS slug TEXT;

-- Generate slugs for existing records
UPDATE success_stories 
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(COALESCE(name, id::text), '[^a-zA-Z0-9 -]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL;

UPDATE learning_paths 
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(COALESCE(title, id::text), '[^a-zA-Z0-9 -]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL;

-- Create unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_success_stories_slug ON success_stories(slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_learning_paths_slug ON learning_paths(slug);

-- Create quizzes table
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

-- Create indexes for quizzes
CREATE INDEX IF NOT EXISTS idx_quizzes_author_id ON quizzes(author_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_status ON quizzes(status);
CREATE INDEX IF NOT EXISTS idx_quizzes_is_published ON quizzes(is_published);
