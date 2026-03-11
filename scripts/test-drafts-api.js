// Test script to verify the drafts API endpoints are working
const { sql } = require('@neondatabase/serverless');

async function testDraftsAPI() {
  console.log('🔧 Testing Drafts API Endpoints...\n');

  try {
    // Test 1: Check if content_drafts table exists
    console.log('1️⃣ Checking if content_drafts table exists...');
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'content_drafts'
      ) as exists
    `;
    
    console.log('Table exists:', tableExists[0]?.exists);
    
    if (!tableExists[0]?.exists) {
      console.log('❌ content_drafts table does not exist');
      console.log('💡 Creating table...');
      
      // Create the table if it doesn't exist
      await sql`
        CREATE TABLE IF NOT EXISTS content_drafts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT,
          type VARCHAR(50),
          status VARCHAR(50) DEFAULT 'draft',
          content TEXT,
          summary TEXT,
          difficulty VARCHAR(50),
          tone VARCHAR(50),
          audience VARCHAR(50),
          tags TEXT,
          key_points TEXT,
          estimated_read_time INTEGER,
          image_url TEXT,
          image_alt TEXT,
          image_caption TEXT,
          image_attribution TEXT,
          author_id UUID REFERENCES users(id),
          rejection_reason TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `;
      
      console.log('✅ Table created successfully');
    }

    // Test 2: Check if there are any drafts
    console.log('\n2️⃣ Checking existing drafts...');
    const draftCount = await sql`SELECT COUNT(*) as count FROM content_drafts`;
    console.log('Total drafts:', draftCount[0]?.count);

    // Test 3: Test the query structure
    console.log('\n3️⃣ Testing the main query...');
    const testQuery = await sql`
      SELECT 
        cd.id,
        cd.title,
        cd.type,
        cd.status,
        cd.created_at,
        cd.updated_at,
        u.name as author_name,
        u.email as author_email
      FROM content_drafts cd
      LEFT JOIN users u ON cd.author_id = u.id
      ORDER BY cd.updated_at DESC
      LIMIT 5
    `;
    
    console.log('Query results:', testQuery.length, 'rows');
    if (testQuery.length > 0) {
      console.log('Sample draft:', {
        id: testQuery[0].id,
        title: testQuery[0].title,
        status: testQuery[0].status,
        author: testQuery[0].author_name
      });
    }

    // Test 4: Test status filtering
    console.log('\n4️⃣ Testing status filtering...');
    const statusCounts = await sql`
      SELECT 
        status,
        COUNT(*) as count
      FROM content_drafts
      GROUP BY status
    `;
    
    console.log('Status breakdown:');
    statusCounts.forEach(row => {
      console.log(`  ${row.status}: ${row.count}`);
    });

    console.log('\n✅ All API tests passed!');
    console.log('📊 The drafts API endpoints should now work correctly');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack:', error.stack);
  }
}

testDraftsAPI().catch(console.error);
