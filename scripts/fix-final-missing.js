import { neon } from '@neondatabase/serverless'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env.local') })

const sql = neon(process.env.DATABASE_URL)

async function fixMissing() {
  console.log('🔧 Fixing final missing schema elements...\n')

  try {
    // Fix articles.summary
    console.log('📰 Adding articles.summary column...')
    try {
      await sql`ALTER TABLE articles ADD COLUMN summary TEXT`
      console.log('   ✅ Added articles.summary')
    } catch (e) {
      if (e.code === '42701') {
        console.log('   ⏭️  articles.summary already exists')
      } else {
        throw e
      }
    }

    // Create quizzes table
    console.log('\n❓ Creating quizzes table...')
    try {
      await sql`
        CREATE TABLE quizzes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          content TEXT,
          summary TEXT,
          description TEXT,
          author_id UUID REFERENCES users(id) ON DELETE SET NULL,
          tags JSONB DEFAULT '[]',
          difficulty VARCHAR(20) DEFAULT 'beginner',
          tone VARCHAR(30) DEFAULT 'educational',
          length VARCHAR(20) DEFAULT 'short',
          audience VARCHAR(30) DEFAULT 'general',
          key_points JSONB DEFAULT '[]',
          estimated_read_time INTEGER DEFAULT 10,
          image_url VARCHAR(500),
          image_alt VARCHAR(500),
          image_caption TEXT,
          image_attribution JSONB,
          questions JSONB DEFAULT '[]',
          passing_score INTEGER DEFAULT 70,
          status TEXT DEFAULT 'draft',
          is_published BOOLEAN DEFAULT false,
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now(),
          published_at TIMESTAMPTZ
        )
      `
      console.log('   ✅ Created quizzes table')
    } catch (e) {
      if (e.code === '42P07') {
        console.log('   ⏭️  quizzes table already exists')
      } else {
        throw e
      }
    }

    // Add constraints to quizzes
    console.log('\n🔒 Adding quizzes constraints...')
    const constraints = [
      { name: 'difficulty', sql: `ALTER TABLE quizzes ADD CONSTRAINT quizzes_difficulty_check CHECK (difficulty IN ('beginner', 'intermediate', 'advanced'))` },
      { name: 'tone', sql: `ALTER TABLE quizzes ADD CONSTRAINT quizzes_tone_check CHECK (tone IN ('educational', 'inspirational', 'professional', 'casual'))` },
      { name: 'length', sql: `ALTER TABLE quizzes ADD CONSTRAINT quizzes_length_check CHECK (length IN ('short', 'medium', 'long'))` },
      { name: 'audience', sql: `ALTER TABLE quizzes ADD CONSTRAINT quizzes_audience_check CHECK (audience IN ('general', 'students', 'professionals', 'beginners'))` },
      { name: 'status', sql: `ALTER TABLE quizzes ADD CONSTRAINT quizzes_status_check CHECK (status IN ('draft', 'pending', 'approved', 'rejected'))` }
    ]

    for (const constraint of constraints) {
      try {
        await sql(constraint.sql)
        console.log(`   ✅ Added ${constraint.name} constraint`)
      } catch (e) {
        if (e.code === '42710') {
          console.log(`   ⏭️  ${constraint.name} constraint already exists`)
        } else {
          console.log(`   ⚠️  ${constraint.name} constraint: ${e.message}`)
        }
      }
    }

    // Add indexes
    console.log('\n📇 Adding quizzes indexes...')
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_quizzes_author_id ON quizzes(author_id)',
      'CREATE INDEX IF NOT EXISTS idx_quizzes_status ON quizzes(status)',
      'CREATE INDEX IF NOT EXISTS idx_quizzes_is_published ON quizzes(is_published)'
    ]

    for (const indexSQL of indexes) {
      try {
        await sql(indexSQL)
        console.log('   ✅ Index created')
      } catch (e) {
        console.log(`   ⏭️  Index already exists`)
      }
    }

    // Final verification
    console.log('\n🔍 Final verification...\n')
    
    const check = await sql`
      SELECT 
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'summary') as articles_summary,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'published_at') as articles_published_at,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'success_stories' AND column_name = 'slug') as stories_slug,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'learning_paths' AND column_name = 'slug') as paths_slug,
        (SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'quizzes')) as quizzes_exists
    `
    
    const c = check[0]
    
    console.log('✅ Schema Verification Complete:')
    console.log(`   articles.summary: ${c.articles_summary > 0 ? '✅ EXISTS' : '❌ MISSING'}`)
    console.log(`   articles.published_at: ${c.articles_published_at > 0 ? '✅ EXISTS' : '❌ MISSING'}`)
    console.log(`   success_stories.slug: ${c.stories_slug > 0 ? '✅ EXISTS' : '❌ MISSING'}`)
    console.log(`   learning_paths.slug: ${c.paths_slug > 0 ? '✅ EXISTS' : '❌ MISSING'}`)
    console.log(`   quizzes table: ${c.quizzes_exists ? '✅ EXISTS' : '❌ MISSING'}`)
    
    if (c.quizzes_exists) {
      const quizCols = await sql`SELECT COUNT(*) as count FROM information_schema.columns WHERE table_name = 'quizzes'`
      console.log(`   quizzes columns: ${quizCols[0].count}`)
    }

    const allGood = c.articles_summary > 0 && c.stories_slug > 0 && c.paths_slug > 0 && c.quizzes_exists

    if (allGood) {
      console.log('\n🎉 SUCCESS! All schema fixes applied!')
      console.log('\n📝 You can now:')
      console.log('   1. Restart your dev server: npm run dev')
      console.log('   2. Visit http://localhost:3000/admin')
      console.log('   3. Test the approval workflow')
    } else {
      console.log('\n⚠️  Some schema elements are still missing. Check errors above.')
    }

  } catch (error) {
    console.error('\n❌ Error:', error)
    process.exit(1)
  }
}

fixMissing()
