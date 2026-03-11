require('dotenv').config({ path: '.env.local' })
const { neon } = require('@neondatabase/serverless')
const sql = neon(process.env.DATABASE_URL)

async function runMigration(filename, queries) {
  try {
    console.log(`🔄 Running migration: ${filename}`)
    for (const query of queries) {
      await sql(query)
    }
    console.log(`✅ Migration completed: ${filename}`)
  } catch (error) {
    console.error(`❌ Migration failed: ${filename}`, error.message)
    throw error
  }
}

async function runAllMigrations() {
  console.log('🚀 Starting complete database migration...')
  
  try {
    // 1. Basic tables
    await runMigration('001-create-tables.sql', [
      'CREATE EXTENSION IF NOT EXISTS "uuid-ossp"',
      `
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now()
        )
      `,
      `
        CREATE TABLE IF NOT EXISTS sessions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          expires_at TIMESTAMPTZ NOT NULL,
          created_at TIMESTAMPTZ DEFAULT now()
        )
      `,
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)',
      'CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)'
    ])

    // 2. Learning paths
    await runMigration('002-create-learning-paths.sql', [
      `
        CREATE TABLE IF NOT EXISTS learning_paths (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          title TEXT NOT NULL,
          description TEXT,
          level TEXT DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
          duration INTEGER DEFAULT 0,
          module_count INTEGER DEFAULT 0,
          is_published BOOLEAN DEFAULT false,
          status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published')),
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now()
        )
      `,
      `
        CREATE TABLE IF NOT EXISTS learning_path_modules (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          learning_path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          description TEXT,
          content TEXT,
          order_index INTEGER NOT NULL,
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now()
        )
      `,
      'CREATE INDEX IF NOT EXISTS idx_learning_paths_published ON learning_paths(is_published)',
      'CREATE INDEX IF NOT EXISTS idx_learning_paths_level ON learning_paths(level)',
      'CREATE INDEX IF NOT EXISTS idx_learning_path_modules_path_id ON learning_path_modules(learning_path_id)',
      'CREATE INDEX IF NOT EXISTS idx_learning_path_modules_order ON learning_path_modules(learning_path_id, order_index)'
    ])

    // 3. Articles and stories
    await runMigration('003-create-content.sql', `
      -- Create articles table
      CREATE TABLE IF NOT EXISTS articles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        content TEXT,
        excerpt TEXT,
        author_id UUID REFERENCES users(id),
        status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published')),
        is_featured BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),
        published_at TIMESTAMPTZ
      );

      -- Create success stories table
      CREATE TABLE IF NOT EXISTS success_stories (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        email TEXT,
        story TEXT NOT NULL,
        category TEXT,
        is_published BOOLEAN DEFAULT false,
        status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published')),
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),
        published_at TIMESTAMPTZ
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
      CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
      CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at);
      CREATE INDEX IF NOT EXISTS idx_stories_status ON success_stories(status);
      CREATE INDEX IF NOT EXISTS idx_stories_published ON success_stories(published_at);
    `)

    // 4. User progress and activity
    await runMigration('004-create-user-tracking.sql', `
      -- Create user progress table
      CREATE TABLE IF NOT EXISTS user_progress (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        learning_path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
        progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
        current_module_id UUID REFERENCES learning_path_modules(id),
        completed_modules TEXT[], -- array of completed module IDs
        last_accessed TIMESTAMPTZ DEFAULT now(),
        started_at TIMESTAMPTZ DEFAULT now(),
        completed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE(user_id, learning_path_id)
      );

      -- Create user activity table
      CREATE TABLE IF NOT EXISTS user_activity (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        activity_type TEXT NOT NULL CHECK (activity_type IN ('login', 'module_completed', 'path_completed', 'quiz_completed', 'bookmark_added')),
        activity_data JSONB,
        created_at TIMESTAMPTZ DEFAULT now()
      );

      -- Create user bookmarks
      CREATE TABLE IF NOT EXISTS user_bookmarks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        item_type TEXT NOT NULL CHECK (item_type IN ('article', 'learning_path', 'success_story')),
        item_id UUID NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE(user_id, item_type, item_id)
      );

      -- Create user quiz results
      CREATE TABLE IF NOT EXISTS user_quiz_results (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        quiz_type TEXT NOT NULL,
        score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
        answers JSONB,
        completed_at TIMESTAMPTZ DEFAULT now()
      );

      -- Create user notifications
      CREATE TABLE IF NOT EXISTS user_notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
        action_url TEXT,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now()
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_progress_path_id ON user_progress(learning_path_id);
      CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity(created_at);
      CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_id ON user_bookmarks(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_notifications_read ON user_notifications(is_read);
    `)

    // 5. Profile photos and enhanced features
    await runMigration('005-add-profile-photos.sql', `
      -- Add profile photo support to users table
      ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo_public_id TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

      -- Create index for profile photo queries
      CREATE INDEX IF NOT EXISTS idx_users_profile_photo ON users(profile_photo_url) WHERE profile_photo_url IS NOT NULL;

      -- Update existing users to have updated_at timestamps
      UPDATE users SET updated_at = created_at WHERE updated_at IS NULL;
    `)

    // 6. Content ratings and feedback
    await runMigration('006-add-content-ratings.sql', `
      -- Create content ratings table
      CREATE TABLE IF NOT EXISTS content_ratings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content_type TEXT NOT NULL CHECK (content_type IN ('article', 'learning_path', 'success_story')),
        content_id UUID NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review TEXT,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE(user_id, content_type, content_id)
      );

      -- Create content feedback table
      CREATE TABLE IF NOT EXISTS content_feedback (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content_type TEXT NOT NULL CHECK (content_type IN ('article', 'learning_path', 'success_story')),
        content_id UUID NOT NULL,
        feedback_type TEXT NOT NULL CHECK (feedback_type IN ('bug', 'suggestion', 'complaint', 'praise')),
        feedback_text TEXT NOT NULL,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
        created_at TIMESTAMPTZ DEFAULT now()
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_content_ratings_content ON content_ratings(content_type, content_id);
      CREATE INDEX IF NOT EXISTS idx_content_ratings_user ON content_ratings(user_id);
      CREATE INDEX IF NOT EXISTS idx_content_feedback_content ON content_feedback(content_type, content_id);
      CREATE INDEX IF NOT EXISTS idx_content_feedback_status ON content_feedback(status);
    `)

    console.log('🎉 All migrations completed successfully!')
    console.log('📊 Database schema is now complete and ready for use.')

  } catch (error) {
    console.error('💥 Migration failed:', error)
    process.exit(1)
  }
}

// Run migrations
runAllMigrations()
