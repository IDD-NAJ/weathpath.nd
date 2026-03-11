require('dotenv').config({ path: '.env.local' })

async function checkUsers() {
  console.log('🔧 Checking Users in Database...\n')
  
  try {
    const { neon } = require('@neondatabase/serverless')
    const sql = neon(process.env.DATABASE_URL)
    
    // Check if users table exists and has data
    console.log('👥 Checking users table...')
    try {
      const users = await sql`SELECT id, name, email FROM users LIMIT 5`
      
      if (users.length > 0) {
        console.log(`✅ Found ${users.length} users:`)
        users.forEach(user => {
          console.log(`  - ID: ${user.id}, Name: ${user.name}, Email: ${user.email}`)
        })
        
        // Test with a real user ID
        const testUserId = users[0].id
        console.log(`\n📝 Testing draft with real user ID: ${testUserId}`)
        
        const { v4: uuidv4 } = require('uuid')
        const testId = uuidv4()
        const now = new Date()
        
        await sql`
          INSERT INTO content_drafts (
            id, title, content, summary, type, difficulty, tone, length, audience,
            tags, key_points, estimated_read_time, status, author_id, created_at, updated_at
          ) VALUES (
            ${testId}, 
            'Test Article', 
            'This is a test article content for debugging purposes.', 
            'A test article to verify the draft saving functionality works correctly.',
            'article',
            'beginner',
            'educational',
            'medium',
            'general',
            '["test", "debugging", "draft"]',
            '["Point 1", "Point 2", "Point 3"]',
            5,
            'draft',
            ${testUserId},
            ${now},
            ${now}
          )
        `
        
        console.log('✅ Test draft inserted successfully with real user ID')
        
        // Clean up
        await sql`DELETE FROM content_drafts WHERE id = ${testId}`
        console.log('✅ Test draft cleaned up')
        
      } else {
        console.log('❌ No users found in database')
        console.log('📋 This is the issue - drafts need a valid user ID')
        
        // Create a test user
        console.log('\n👤 Creating a test user...')
        const { v4: uuidv4 } = require('uuid')
        const testUserId = uuidv4()
        
        await sql`
          INSERT INTO users (id, name, email, role) 
          VALUES (${testUserId}, 'Test Admin', 'admin@test.com', 'admin')
        `
        
        console.log('✅ Test user created')
        console.log(`  - ID: ${testUserId}`)
        console.log('  - Name: Test Admin')
        console.log('  - Email: admin@test.com')
        console.log('  - Role: admin')
        
        console.log('\n🔧 Now you can test the draft saving functionality!')
      }
      
    } catch (error) {
      console.log('❌ Users table error:', error.message)
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error.message)
  }
}

checkUsers()
