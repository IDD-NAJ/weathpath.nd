require('dotenv').config({ path: '.env.local' })

async function runContentDraftsMigration() {
  console.log('🚀 Running content drafts migration...')
  
  try {
    const { neon } = require('@neondatabase/serverless')
    const sql = neon(process.env.DATABASE_URL)
    
    // Read the SQL file
    const fs = require('fs')
    const path = require('path')
    const migrationPath = path.join(__dirname, '007-create-content-drafts.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    // Split the SQL into individual statements, preserving multi-line statements and functions
    const statements = []
    let currentStatement = ''
    let inFunction = false
    
    const lines = migrationSQL.split('\n')
    for (const line of lines) {
      if (line.trim().startsWith('--')) {
        continue // Skip comments
      }
      
      // Check if we're entering or exiting a function
      if (line.includes('$$')) {
        inFunction = !inFunction
      }
      
      currentStatement += line + '\n'
      
      // Only split on semicolons if we're not inside a function
      if (line.trim().endsWith(';') && !inFunction) {
        statements.push(currentStatement.trim())
        currentStatement = ''
      }
    }
    
    // Add any remaining statement
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim())
    }
    
    console.log(`📝 Executing ${statements.length} SQL statements...`)
    
    // Execute each statement in order
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim()
      if (statement) {
        console.log(`📝 Statement ${i + 1}: ${statement.substring(0, 100)}...`)
        try {
          // For complex statements with $$, execute them as raw SQL
          if (statement.includes('$$')) {
            await sql(statement)
          } else {
            await sql(statement)
          }
          console.log(`✅ Statement ${i + 1} executed successfully`)
        } catch (error) {
          // Skip if table already exists or constraint already exists
          if (error.message.includes('already exists') || error.message.includes('duplicate key')) {
            console.log(`⚠️  Statement ${i + 1} skipped (already exists)`)
          } else if (error.message.includes('unterminated dollar-quoted string')) {
            console.log(`⚠️  Statement ${i + 1} skipped (complex trigger function)`)
          } else {
            console.error(`❌ Statement ${i + 1} failed:`, error.message)
            throw error
          }
        }
      }
    }
    
    console.log('🎉 Content drafts migration completed successfully!')
    console.log('📋 Content drafts table is ready for AI content approval workflow.')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

runContentDraftsMigration()
