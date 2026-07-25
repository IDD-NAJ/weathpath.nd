const fs = require('fs')
const { Pool } = require('pg')

const DB_URL = 'postgresql://neondb_owner:npg_CdErv90DWHzP@ep-divine-frog-ahe05se1-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

const pool = new Pool({
  connectionString: DB_URL,
})

async function runFix() {
  const client = await pool.connect()
  
  try {
    const sql = fs.readFileSync('/vercel/share/v0-project/scripts/016-fix-foreign-keys.sql', 'utf8')
    await client.query(sql)
    console.log('✅ Schema fix completed')

    // Verify schema
    const result = await client.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name IN ('reviews', 'view_counts', 'coupons', 'certificates', 'recently_viewed', 'users')
      ORDER BY table_name, ordinal_position
    `)

    console.log('\n📋 Schema verification:')
    result.rows.forEach(row => {
      console.log(`  ${row.table_name}.${row.column_name} (${row.data_type})`)
    })

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    client.release()
    await pool.end()
  }
}

runFix()
