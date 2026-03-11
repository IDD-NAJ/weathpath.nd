-- Add author_id column to articles if it doesn't exist
ALTER TABLE articles ADD COLUMN IF NOT EXISTS author_id UUID;

-- Add status column to success_stories for approval workflow
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected'));

-- Add status column to articles for approval workflow
ALTER TABLE articles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected'));

-- Add status column to learning_paths for approval workflow
ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected'));

-- Update existing published records to 'approved' status
UPDATE success_stories SET status = 'approved' WHERE is_published = true AND status = 'draft';
UPDATE articles SET status = 'approved' WHERE is_published = true AND status = 'draft';
UPDATE learning_paths SET status = 'approved' WHERE is_published = true AND status = 'draft';
