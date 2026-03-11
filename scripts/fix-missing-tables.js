require('dotenv').config({ path: '.env.local' })
const { neon } = require('@neondatabase/serverless')
const sql = neon(process.env.DATABASE_URL)

async function fixMissingTables() {
  console.log('🔧 Fixing missing database tables...')
  
  try {
    // Enable UUID extension
    await sql('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    console.log('✅ Enabled UUID extension')
    
    // Create learning_path_modules table
    await sql(`
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
    `)
    console.log('✅ Created learning_path_modules table')
    
    // Create content_feedback table
    await sql(`
      CREATE TABLE IF NOT EXISTS content_feedback (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content_type TEXT NOT NULL CHECK (content_type IN ('article', 'learning_path', 'success_story')),
        content_id UUID NOT NULL,
        feedback_type TEXT NOT NULL CHECK (feedback_type IN ('bug', 'suggestion', 'complaint', 'praise')),
        feedback_text TEXT NOT NULL,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `)
    console.log('✅ Created content_feedback table')
    
    // Create indexes for learning_path_modules
    await sql('CREATE INDEX IF NOT EXISTS idx_learning_path_modules_path_id ON learning_path_modules(learning_path_id)')
    await sql('CREATE INDEX IF NOT EXISTS idx_learning_path_modules_order ON learning_path_modules(learning_path_id, order_index)')
    console.log('✅ Created learning_path_modules indexes')
    
    // Create indexes for content_feedback
    await sql('CREATE INDEX IF NOT EXISTS idx_content_feedback_content ON content_feedback(content_type, content_id)')
    await sql('CREATE INDEX IF NOT EXISTS idx_content_feedback_status ON content_feedback(status)')
    console.log('✅ Created content_feedback indexes')
    
    console.log('🎉 All missing tables have been created!')
    
  } catch (error) {
    console.error('❌ Failed to create missing tables:', error.message)
    process.exit(1)
  }
}

fixMissingTables()
