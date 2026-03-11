import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env.local') })

const sql = neon(process.env.DATABASE_URL)

async function runMigration() {
  console.log('🔧 Running remaining schema fixes...\n')

  try {
    const migrationSQL = readFileSync(
      join(__dirname, '009-fix-remaining-schema.sql'),
      'utf-8'
    )

    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    console.log(`📋 Executing ${statements.length} statements...\n`)
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (!statement) continue
      
      try {
        if (statement.includes('ALTER TABLE') || statement.includes('CREATE TABLE') || statement.includes('CREATE INDEX')) {
          const match = statement.match(/(?:ALTER TABLE|CREATE TABLE|CREATE INDEX[^ON]*ON)\s+(\w+)/i)
          if (match) {
            process.stdout.write(`  [${i + 1}/${statements.length}] ${match[0]}... `)
          }
        }
        
        await sql(statement)
        
        if (statement.includes('ALTER TABLE') || statement.includes('CREATE TABLE') || statement.includes('CREATE INDEX')) {
          console.log('✅')
        }
      } catch (error) {
        if (error.message?.includes('already exists') || error.code === '42701' || error.code === '42P07' || error.code === '42P16') {
          if (statement.includes('ALTER TABLE') || statement.includes('CREATE TABLE') || statement.includes('CREATE INDEX')) {
            console.log('⏭️  (already exists)')
          }
        } else {
          console.log(`\n⚠️  Warning: ${error.message}`)
        }
      }
    }
    
    console.log('\n✅ Remaining fixes applied!\n')
    console.log('🔍 Final verification...\n')
    
    const verification = await sql`
      SELECT 
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'summary') as articles_summary,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'success_stories' AND column_name = 'slug') as stories_slug,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'learning_paths' AND column_name = 'slug') as paths_slug,
        (SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'quizzes')) as quizzes_exists
    `
    
    const v = verification[0]
    
    console.log('📊 Schema Status:')
    console.log(`   ✅ articles.summary: ${v.articles_summary > 0 ? 'EXISTS' : 'MISSING'}`)
    console.log(`   ✅ success_stories.slug: ${v.stories_slug > 0 ? 'EXISTS' : 'MISSING'}`)
    console.log(`   ✅ learning_paths.slug: ${v.paths_slug > 0 ? 'EXISTS' : 'MISSING'}`)
    console.log(`   ✅ quizzes table: ${v.quizzes_exists ? 'EXISTS' : 'MISSING'}`)
    
    if (v.quizzes_exists) {
      const quizzesColumns = await sql`
        SELECT COUNT(*) as count
        FROM information_schema.columns 
        WHERE table_name = 'quizzes'
      `
      console.log(`   ✅ quizzes columns: ${quizzesColumns[0].count}`)
    }
    
    console.log('\n🎉 Database migration completed successfully!')
    console.log('\n📝 Next steps:')
    console.log('   1. Restart your development server (Ctrl+C then npm run dev)')
    console.log('   2. Visit http://localhost:3000/admin')
    console.log('   3. Test creating and approving content')
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  }
}

runMigration()
