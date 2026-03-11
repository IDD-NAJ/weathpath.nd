-- Create content_drafts table for AI-generated content approval workflow
CREATE TABLE IF NOT EXISTS content_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  summary TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('article', 'story', 'learning_path', 'quiz')),
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  tone VARCHAR(30) NOT NULL CHECK (tone IN ('educational', 'inspirational', 'professional', 'casual')),
  length VARCHAR(20) NOT NULL CHECK (length IN ('short', 'medium', 'long')),
  audience VARCHAR(30) NOT NULL CHECK (audience IN ('general', 'students', 'professionals', 'beginners')),
  tags JSONB NOT NULL DEFAULT '[]',
  key_points JSONB NOT NULL DEFAULT '[]',
  estimated_read_time INTEGER NOT NULL DEFAULT 0,
  image_url VARCHAR(500),
  image_alt VARCHAR(500),
  image_caption TEXT,
  image_attribution JSONB,
  status VARCHAR(30) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected')),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_content_drafts_author_id ON content_drafts(author_id);
CREATE INDEX IF NOT EXISTS idx_content_drafts_status ON content_drafts(status);
CREATE INDEX IF NOT EXISTS idx_content_drafts_type ON content_drafts(type);
CREATE INDEX IF NOT EXISTS idx_content_drafts_created_at ON content_drafts(created_at);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_content_drafts_updated_at 
    BEFORE UPDATE ON content_drafts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
