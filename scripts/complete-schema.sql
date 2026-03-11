-- Create learning_paths table if it doesn't exist
CREATE TABLE IF NOT EXISTS learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  level TEXT NOT NULL DEFAULT 'beginner',
  duration TEXT,
  module_count INTEGER DEFAULT 0,
  topics TEXT[],
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add missing columns to articles table
ALTER TABLE articles ADD COLUMN IF NOT EXISTS author_id UUID;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected'));

-- Add status columns to other tables
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected'));

-- Add status column to learning_paths (after creating it)
ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected'));

-- Note: Foreign key constraint for author_id will be added later when users table is fully set up

-- Update existing published records to 'approved' status
UPDATE articles SET status = 'approved' WHERE is_published = true AND status = 'draft';
UPDATE success_stories SET status = 'approved' WHERE is_published = true AND status = 'draft';

-- Update learning_paths only if it has records
UPDATE learning_paths SET status = 'approved' WHERE is_published = true AND status = 'draft';
