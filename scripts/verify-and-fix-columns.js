import { neon } from '@neondatabase/serverless'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env.local') })

const sql = neon(process.env.DATABASE_URL)

async function verifyAndFix() {
  console.log('🔍 Checking learning_paths table...\n')

  try {
    // Check current columns
    const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'learning_paths'
      ORDER BY ordinal_position
    `
    
    console.log('Current columns in learning_paths:')
    columns.forEach(col => console.log(`  - ${col.column_name}`))
    
    const hasLevel = columns.some(c => c.column_name === 'level')
    const hasDifficulty = columns.some(c => c.column_name === 'difficulty')
    
    console.log(`\n📊 Status:`)
    console.log(`  level column: ${hasLevel ? '✅ EXISTS' : '❌ MISSING'}`)
    console.log(`  difficulty column: ${hasDifficulty ? '✅ EXISTS' : '❌ MISSING'}`)
    
    // If has level but not difficulty, rename it
    if (hasLevel && !hasDifficulty) {
      console.log('\n🔧 Renaming level to difficulty...')
      await sql`ALTER TABLE learning_paths RENAME COLUMN level TO difficulty`
      console.log('✅ Renamed level → difficulty')
    }
    // If has neither, add difficulty
    else if (!hasLevel && !hasDifficulty) {
      console.log('\n🔧 Adding difficulty column...')
      await sql`ALTER TABLE learning_paths ADD COLUMN difficulty VARCHAR(20) DEFAULT 'beginner'`
      console.log('✅ Added difficulty column')
    }
    // If has both, drop level
    else if (hasLevel && hasDifficulty) {
      console.log('\n🔧 Both columns exist, dropping level...')
      await sql`ALTER TABLE learning_paths DROP COLUMN level`
      console.log('✅ Dropped level column')
    }
    
    // Verify final state
    console.log('\n🔍 Final verification...')
    const finalCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'learning_paths' AND column_name = 'difficulty'
    `
    
    if (finalCheck.length > 0) {
      console.log('✅ learning_paths.difficulty EXISTS')
      console.log('\n🎉 Fix applied successfully!')
      console.log('\n📝 Next: Restart your dev server and try again')
    } else {
      console.log('❌ difficulty column still missing')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

verifyAndFix()
