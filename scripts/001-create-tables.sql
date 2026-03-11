-- WealthPath application tables
-- These sit in the public schema alongside the neon_auth schema

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

CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  category TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS success_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  quote TEXT NOT NULL,
  income TEXT,
  strategy TEXT,
  avatar_url TEXT,
  is_published BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default site settings
INSERT INTO site_settings (key, value) VALUES
  ('general', '{"siteName": "WealthPath", "tagline": "Your Guide to Building Passive Wealth", "description": "Learn how to create lasting passive income through clear, jargon-free education."}'::jsonb),
  ('features', '{"showQuiz": true, "showCalculator": true, "showStories": true, "showResources": true}'::jsonb),
  ('contact', '{"supportEmail": "support@wealthpath.com", "twitter": "", "youtube": "", "linkedin": ""}'::jsonb)
ON CONFLICT (key) DO NOTHING;
