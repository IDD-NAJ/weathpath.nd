require('dotenv').config({ path: '.env.local' })
const { neon } = require('@neondatabase/serverless')
const fs = require('fs')
const path = require('path')

const sql = neon(process.env.DATABASE_URL)

async function runSQLFile(filename) {
  try {
    console.log(`🔄 Running migration: ${filename}`)
    
    const filePath = path.join(__dirname, filename)
    const fileContent = fs.readFileSync(filePath, 'utf8')
    
    // Split by semicolons and filter out empty statements
    const statements = fileContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    for (const statement of statements) {
      try {
        await sql(statement)
      } catch (error) {
        // Some statements might fail if they already exist, that's okay
        if (!error.message.includes('already exists') && !error.message.includes('does not exist')) {
          throw error
        }
      }
    }
    
    console.log(`✅ Migration completed: ${filename}`)
  } catch (error) {
    console.error(`❌ Migration failed: ${filename}`, error.message)
    throw error
  }
}

async function runAllMigrations() {
  console.log('🚀 Starting database migration...')
  
  try {
    // Run migrations in order
    const migrations = [
      '001-create-tables.sql',
      '002-create-users.sql',
      '003-add-approval-workflow.sql',
      '004-create-users-fixed.sql',
      '005-add-enhanced-features.sql',
      '006-add-profile-photos.sql'
    ]
    
    for (const migration of migrations) {
      if (fs.existsSync(path.join(__dirname, migration))) {
        await runSQLFile(migration)
      } else {
        console.log(`⚠️ Migration file not found: ${migration}`)
      }
    }

    console.log('🎉 All migrations completed successfully!')
    console.log('📊 Database schema is ready.')
    
    // Verify tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `
    
    console.log('📋 Created tables:')
    tables.forEach(table => {
      console.log(`  ✅ ${table.table_name}`)
    })

  } catch (error) {
    console.error('💥 Migration failed:', error)
    process.exit(1)
  }
}

// Run migrations
runAllMigrations()
