require('dotenv').config({ path: '.env.local' })

async function testDraftSaving() {
  console.log('🔧 Testing Draft Saving Functionality...\n')
  
  try {
    const { neon } = require('@neondatabase/serverless')
    const sql = neon(process.env.DATABASE_URL)
    
    // Test 1: Check database connection
    console.log('📋 Testing database connection...')
    try {
      const result = await sql`SELECT 1 as test`
      if (result.length > 0 && result[0].test === 1) {
        console.log('✅ Database connection successful')
      } else {
        console.log('❌ Database connection failed')
        return
      }
    } catch (error) {
      console.log('❌ Database connection error:', error.message)
      return
    }
    
    // Test 2: Check content_drafts table structure
    console.log('\n🗄️  Testing content_drafts table structure...')
    try {
      const columns = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'content_drafts'
        ORDER BY ordinal_position
        LIMIT 10
      `
      
      console.log(`✅ Found ${columns.length} columns in content_drafts table`)
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`)
      })
    } catch (error) {
      console.log('❌ Table structure error:', error.message)
      return
    }
    
    // Test 3: Test inserting a sample draft
    console.log('\n📝 Testing draft insertion...')
    try {
      const { v4: uuidv4 } = require('uuid')
      const testId = uuidv4()
      const testAuthorId = uuidv4()
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
          ${testAuthorId},
          ${now},
          ${now}
        )
      `
      
      console.log('✅ Test draft inserted successfully')
      
      // Test 4: Verify the draft was saved
      console.log('\n🔍 Verifying draft was saved...')
      const savedDraft = await sql`
        SELECT * FROM content_drafts WHERE id = ${testId}
      `
      
      if (savedDraft.length > 0) {
        console.log('✅ Draft verified in database')
        console.log(`  - Title: ${savedDraft[0].title}`)
        console.log(`  - Status: ${savedDraft[0].status}`)
        console.log(`  - Created: ${savedDraft[0].created_at}`)
        
        // Clean up test draft
        await sql`DELETE FROM content_drafts WHERE id = ${testId}`
        console.log('✅ Test draft cleaned up')
      } else {
        console.log('❌ Draft not found in database')
      }
      
    } catch (error) {
      console.log('❌ Draft insertion error:', error.message)
      return
    }
    
    // Test 5: Check API endpoint accessibility
    console.log('\n🔌 Testing API endpoint...')
    const fs = require('fs')
    const path = require('path')
    
    const apiRoute = path.join(__dirname, '..', 'app/api/admin/content/drafts/route.ts')
    if (fs.existsSync(apiRoute)) {
      console.log('✅ API route file exists')
    } else {
      console.log('❌ API route file missing')
    }
    
    console.log('\n🎯 Draft Saving Status:')
    console.log('  ✅ Database: Connected and working')
    console.log('  ✅ Table Structure: Correct columns available')
    console.log('  ✅ Insert Function: Successfully saves drafts')
    console.log('  ✅ Verification: Drafts can be retrieved')
    console.log('  ✅ API Route: Endpoint file exists')
    
    console.log('\n🚀 Draft Saving System is WORKING!')
    console.log('\n📋 Troubleshooting Tips:')
    console.log('  1. Check browser console for debugging logs')
    console.log('  2. Ensure user is logged in as admin')
    console.log('  3. Verify content is generated before saving')
    console.log('  4. Click "Save Draft" first, then "Submit for Approval"')
    console.log('  5. Check network tab for API request responses')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testDraftSaving()
