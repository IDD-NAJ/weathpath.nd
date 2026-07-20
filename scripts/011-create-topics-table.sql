-- Create topics table
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  category VARCHAR(50),
  image_url VARCHAR(500),
  image_alt VARCHAR(255),
  image_caption TEXT,
  image_attribution JSONB,
  difficulty VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  tone VARCHAR(30) DEFAULT 'educational',
  audience VARCHAR(30) DEFAULT 'general',
  estimated_read_time INTEGER,
  key_points JSONB DEFAULT '[]',
  tags JSONB DEFAULT '[]',
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ
);

-- Create indexes for topics
CREATE INDEX IF NOT EXISTS idx_topics_slug ON topics(slug);
CREATE INDEX IF NOT EXISTS idx_topics_category ON topics(category);
CREATE INDEX IF NOT EXISTS idx_topics_status ON topics(status);
CREATE INDEX IF NOT EXISTS idx_topics_is_published ON topics(is_published);
CREATE INDEX IF NOT EXISTS idx_topics_author_id ON topics(author_id);

-- Create junction table for articles-topics relationship
CREATE TABLE IF NOT EXISTS article_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(article_id, topic_id)
);

-- Create indexes for article_topics
CREATE INDEX IF NOT EXISTS idx_article_topics_article_id ON article_topics(article_id);
CREATE INDEX IF NOT EXISTS idx_article_topics_topic_id ON article_topics(topic_id);
