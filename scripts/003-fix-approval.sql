-- Add status columns to tables for approval workflow
ALTER TABLE articles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected'));
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected'));
ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected'));

-- Update existing published records to 'approved' status
UPDATE articles SET status = 'approved' WHERE is_published = true AND status = 'draft';
UPDATE success_stories SET status = 'approved' WHERE is_published = true AND status = 'draft';
UPDATE learning_paths SET status = 'approved' WHERE is_published = true AND status = 'draft';
