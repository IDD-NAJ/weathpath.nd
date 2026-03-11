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
  console.log('🔧 Starting schema fix migration...\n')

  try {
    const migrationSQL = readFileSync(
      join(__dirname, '008-fix-complete-schema.sql'),
      'utf-8'
    )

    // Split SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    console.log(`📋 Executing ${statements.length} migration statements...\n`)
    
    let successCount = 0
    let skipCount = 0
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      
      // Skip comments and empty statements
      if (!statement || statement.startsWith('--')) {
        continue
      }
      
      try {
        // Show progress for major operations
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
        
        successCount++
      } catch (error) {
        // Ignore "already exists" errors
        if (error.message?.includes('already exists') || 
            error.message?.includes('duplicate') ||
            error.code === '42701' || // duplicate column
            error.code === '42P07' || // duplicate table
            error.code === '42P16') { // duplicate index
          if (statement.includes('ALTER TABLE') || statement.includes('CREATE TABLE') || statement.includes('CREATE INDEX')) {
            console.log('⏭️  (already exists)')
          }
          skipCount++
        } else {
          console.log(`\n❌ Error on statement ${i + 1}:`)
          console.log(statement.substring(0, 100) + '...')
          console.log(error.message)
          // Continue with other statements
        }
      }
    }
    
    console.log(`\n✅ Migration completed!`)
    console.log(`   ${successCount} statements executed successfully`)
    console.log(`   ${skipCount} statements skipped (already applied)`)
    
    console.log('\n🔍 Verifying schema changes...')
    
    // Verify tables and columns
    const articlesColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'articles' 
      ORDER BY ordinal_position
    `
    console.log(`\n📰 Articles table: ${articlesColumns.length} columns`)
    
    const storiesColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'success_stories' 
      ORDER BY ordinal_position
    `
    console.log(`📖 Success stories table: ${storiesColumns.length} columns`)
    
    const pathsColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'learning_paths' 
      ORDER BY ordinal_position
    `
    console.log(`🎯 Learning paths table: ${pathsColumns.length} columns`)
    
    const quizzesExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'quizzes'
      ) as exists
    `
    
    if (quizzesExists[0].exists) {
      const quizzesColumns = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'quizzes' 
        ORDER BY ordinal_position
      `
      console.log(`❓ Quizzes table: ${quizzesColumns.length} columns ✅`)
    } else {
      console.log(`❓ Quizzes table: ❌ NOT CREATED`)
    }
    
    // Check for key new fields
    const keyFields = await sql`
      SELECT 
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'summary') as articles_summary,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'published_at') as articles_published_at,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'success_stories' AND column_name = 'slug') as stories_slug,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'learning_paths' AND column_name = 'slug') as paths_slug
    `
    
    console.log('\n🔑 Key fields verification:')
    console.log(`   articles.summary: ${keyFields[0].articles_summary > 0 ? '✅' : '❌'}`)
    console.log(`   articles.published_at: ${keyFields[0].articles_published_at > 0 ? '✅' : '❌'}`)
    console.log(`   success_stories.slug: ${keyFields[0].stories_slug > 0 ? '✅' : '❌'}`)
    console.log(`   learning_paths.slug: ${keyFields[0].paths_slug > 0 ? '✅' : '❌'}`)
    
    console.log('\n✨ Schema migration completed successfully!')
    console.log('\n📝 Next steps:')
    console.log('   1. Restart your development server')
    console.log('   2. Visit /admin to verify dashboard loads')
    console.log('   3. Test the approval workflow')
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  }
}

runMigration()
