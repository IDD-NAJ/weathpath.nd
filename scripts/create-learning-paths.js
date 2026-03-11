require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function createLearningPathsTable() {
  console.log('🔧 Creating learning_paths table...');
  
  try {
    await sql`
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
      )
    `;
    
    console.log('✅ learning_paths table created successfully');
    
    // Add status column
    await sql`
      ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected'))
    `;
    
    console.log('✅ status column added to learning_paths');
    
    // Add author_id column
    await sql`
      ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS author_id UUID
    `;
    
    console.log('✅ author_id column added to learning_paths');
    
    // Add author_id column to articles if it doesn't exist
    await sql`
      ALTER TABLE articles ADD COLUMN IF NOT EXISTS author_id UUID
    `;
    
    console.log('✅ author_id column added to articles');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createLearningPathsTable();
