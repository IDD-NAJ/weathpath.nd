require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function createEnhancedFeatures() {
  console.log('🚀 Creating enhanced features tables...');
  
  const tables = [
    {
      name: 'user_progress',
      sql: `
        CREATE TABLE IF NOT EXISTS user_progress (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          learning_path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
          progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
          modules_completed TEXT[] DEFAULT '{}',
          started_at TIMESTAMPTZ DEFAULT now(),
          last_accessed TIMESTAMPTZ DEFAULT now(),
          completed_at TIMESTAMPTZ,
          UNIQUE(user_id, learning_path_id)
        )
      `
    },
    {
      name: 'user_activity',
      sql: `
        CREATE TABLE IF NOT EXISTS user_activity (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          activity_type TEXT NOT NULL CHECK (activity_type IN ('login', 'module_completed', 'quiz_completed', 'article_viewed', 'calculator_used')),
          activity_data JSONB,
          ip_address INET,
          user_agent TEXT,
          created_at TIMESTAMPTZ DEFAULT now()
        )
      `
    },
    {
      name: 'user_bookmarks',
      sql: `
        CREATE TABLE IF NOT EXISTS user_bookmarks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          item_type TEXT NOT NULL CHECK (item_type IN ('article', 'learning_path', 'success_story')),
          item_id UUID NOT NULL,
          created_at TIMESTAMPTZ DEFAULT now(),
          UNIQUE(user_id, item_type, item_id)
        )
      `
    },
    {
      name: 'user_quiz_results',
      sql: `
        CREATE TABLE IF NOT EXISTS user_quiz_results (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          quiz_type TEXT NOT NULL,
          answers JSONB NOT NULL,
          result_data JSONB NOT NULL,
          score INTEGER,
          completed_at TIMESTAMPTZ DEFAULT now()
        )
      `
    },
    {
      name: 'analytics_events',
      sql: `
        CREATE TABLE IF NOT EXISTS analytics_events (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          event_type TEXT NOT NULL,
          event_data JSONB,
          user_id UUID REFERENCES users(id) ON DELETE SET NULL,
          session_id UUID,
          ip_address INET,
          user_agent TEXT,
          created_at TIMESTAMPTZ DEFAULT now()
        )
      `
    },
    {
      name: 'user_notifications',
      sql: `
        CREATE TABLE IF NOT EXISTS user_notifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
          is_read BOOLEAN DEFAULT false,
          action_url TEXT,
          created_at TIMESTAMPTZ DEFAULT now(),
          read_at TIMESTAMPTZ
        )
      `
    },
    {
      name: 'content_ratings',
      sql: `
        CREATE TABLE IF NOT EXISTS content_ratings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          item_type TEXT NOT NULL CHECK (item_type IN ('article', 'learning_path', 'success_story')),
          item_id UUID NOT NULL,
          rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
          review TEXT,
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now(),
          UNIQUE(user_id, item_type, item_id)
        )
      `
    }
  ];

  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_user_progress_learning_path_id ON user_progress(learning_path_id)',
    'CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity(created_at)',
    'CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_id ON user_bookmarks(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_user_quiz_results_user_id ON user_quiz_results(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type)',
    'CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at)',
    'CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON user_notifications(is_read)',
    'CREATE INDEX IF NOT EXISTS idx_content_ratings_item ON content_ratings(item_type, item_id)'
  ];

  try {
    // Create tables
    for (const table of tables) {
      console.log(`Creating table: ${table.name}`);
      await sql(table.sql);
      console.log(`✅ Created ${table.name}`);
    }

    // Create indexes
    for (const indexSql of indexes) {
      console.log(`Creating index...`);
      await sql(indexSql);
    }
    console.log(`✅ All indexes created`);

    console.log('\n🎉 Enhanced features tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating enhanced features:', error);
  }
}

createEnhancedFeatures();
