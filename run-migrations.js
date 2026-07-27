const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')

const DB_URL = 'postgresql://neondb_owner:npg_7cFPNAnKpt9T@ep-red-frog-aikrsekr-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

const pool = new Pool({
  connectionString: DB_URL,
})

async function runMigrations() {
  const client = await pool.connect()
  
  try {
    const scriptsDir = path.join(__dirname, 'scripts')
    const files = fs.readdirSync(scriptsDir).filter(f => f.endsWith('.sql')).sort()

    // Filter for the important migrations
    const importantMigrations = [
      '001-create-tables.sql',
      '002-create-users.sql',
      '003-add-approval-workflow.sql',
      '005-add-enhanced-features.sql',
      '006-add-profile-photos.sql',
      '007-create-content-drafts.sql',
      '008-fix-complete-schema.sql',
      '009-fix-remaining-schema.sql',
      '010-create-course-store.sql',
      '011-create-topics-table.sql',
      '012-create-community-tables.sql',
      '013-seed-comprehensive-courses.sql',
      '014-new-features.sql',
      '015-reviews-views-coupons.sql',
    ]

    for (const migration of importantMigrations) {
      const filePath = path.join(scriptsDir, migration)
      if (fs.existsSync(filePath)) {
        console.log(`\n📦 Running ${migration}...`)
        try {
          const sql = fs.readFileSync(filePath, 'utf8')
          await client.query(sql)
          console.log(`✅ ${migration} completed`)
        } catch (error) {
          console.log(`⚠️  ${migration} - ${error.message.split('\n')[0]}`)
        }
      }
    }

    // Verify tables exist
    console.log('\n📋 Verifying tables...')
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)
    console.log('Tables created:', result.rows.map(r => r.table_name).join(', '))

  } finally {
    client.release()
    await pool.end()
  }
}

runMigrations().catch(console.error)
