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

    console.log('📋 Executing migration...')
    await sql(migrationSQL)
    
    console.log('✅ Schema migration completed successfully!\n')
    
    console.log('🔍 Verifying schema changes...')
    
    const articlesColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'articles' 
      ORDER BY ordinal_position
    `
    console.log(`\n📰 Articles table has ${articlesColumns.length} columns`)
    
    const storiesColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'success_stories' 
      ORDER BY ordinal_position
    `
    console.log(`📖 Success stories table has ${storiesColumns.length} columns`)
    
    const pathsColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'learning_paths' 
      ORDER BY ordinal_position
    `
    console.log(`🎯 Learning paths table has ${pathsColumns.length} columns`)
    
    const quizzesExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'quizzes'
      ) as exists
    `
    console.log(`❓ Quizzes table exists: ${quizzesExists[0].exists ? '✅ YES' : '❌ NO'}`)
    
    if (quizzesExists[0].exists) {
      const quizzesColumns = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'quizzes' 
        ORDER BY ordinal_position
      `
      console.log(`   Quizzes table has ${quizzesColumns.length} columns`)
    }
    
    console.log('\n✨ Schema fix completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

runMigration()
