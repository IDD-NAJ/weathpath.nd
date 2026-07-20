-- Community Members Table
CREATE TABLE IF NOT EXISTS community_members (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  bio TEXT,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Community Discussion Topics
CREATE TABLE IF NOT EXISTS community_discussions (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author_id BIGINT REFERENCES community_members(id) ON DELETE CASCADE,
  category VARCHAR(100),
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Discussion Replies
CREATE TABLE IF NOT EXISTS community_replies (
  id BIGSERIAL PRIMARY KEY,
  discussion_id BIGINT REFERENCES community_discussions(id) ON DELETE CASCADE,
  author_id BIGINT REFERENCES community_members(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Course Purchases
CREATE TABLE IF NOT EXISTS user_purchases (
  id BIGSERIAL PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  course_id BIGINT REFERENCES courses(id) ON DELETE CASCADE,
  order_id VARCHAR(255) UNIQUE,
  amount_cents INT,
  payment_status VARCHAR(50) DEFAULT 'pending',
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_email, course_id)
);

-- Add columns to courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT TRUE;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'published';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_community_discussions_author ON community_discussions(author_id);
CREATE INDEX IF NOT EXISTS idx_community_discussions_category ON community_discussions(category);
CREATE INDEX IF NOT EXISTS idx_community_replies_discussion ON community_replies(discussion_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_email ON user_purchases(user_email);
CREATE INDEX IF NOT EXISTS idx_user_purchases_course ON user_purchases(course_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_status ON user_purchases(payment_status);
