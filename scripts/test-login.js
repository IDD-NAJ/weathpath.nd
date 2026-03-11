require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function testLogin() {
  console.log('🔐 Testing login functionality...\n');
  
  try {
    // Check if admin user exists
    const adminUsers = await sql`
      SELECT id, name, email, role, is_active, created_at 
      FROM users 
      WHERE role = 'admin'
    `;
    
    console.log('👑 Admin Users:');
    if (adminUsers.length === 0) {
      console.log('  ❌ No admin users found');
    } else {
      adminUsers.forEach(user => {
        console.log(`  ✅ ${user.name} (${user.email}) - Active: ${user.is_active}`);
      });
    }
    
    // Check all users
    const allUsers = await sql`
      SELECT id, name, email, role, is_active, created_at 
      FROM users 
      ORDER BY created_at DESC
    `;
    
    console.log('\n👥 All Users:');
    if (allUsers.length === 0) {
      console.log('  ❌ No users found');
    } else {
      allUsers.forEach(user => {
        console.log(`  - ${user.name} (${user.email}) - Role: ${user.role} - Active: ${user.is_active}`);
      });
    }
    
    // Check sessions
    const sessions = await sql`
      SELECT s.id, s.user_id, s.expires_at, u.name, u.email
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
      LIMIT 5
    `;
    
    console.log('\n🔄 Active Sessions:');
    if (sessions.length === 0) {
      console.log('  ℹ️ No active sessions');
    } else {
      sessions.forEach(session => {
        const expires = new Date(session.expires_at);
        console.log(`  - ${session.name} (${session.email}) - Expires: ${expires.toLocaleString()}`);
      });
    }
    
    // Test learning paths
    const learningPaths = await sql`
      SELECT title, level, is_published, status
      FROM learning_paths
      ORDER BY created_at
    `;
    
    console.log('\n🎯 Learning Paths:');
    if (learningPaths.length === 0) {
      console.log('  ❌ No learning paths found');
    } else {
      learningPaths.forEach(path => {
        console.log(`  - ${path.title} - Level: ${path.level} - Published: ${path.is_published} - Status: ${path.status}`);
      });
    }
    
    // Test success stories
    const stories = await sql`
      SELECT name, title, is_published, status
      FROM success_stories
      ORDER BY display_order ASC, created_at DESC
    `;
    
    console.log('\n📖 Success Stories:');
    if (stories.length === 0) {
      console.log('  ℹ️ No success stories found (using fallback data)');
    } else {
      stories.forEach(story => {
        console.log(`  - ${story.name} - ${story.title} - Published: ${story.is_published} - Status: ${story.status}`);
      });
    }
    
    console.log('\n🎉 Database test completed!');
    
  } catch (error) {
    console.error('❌ Error testing login:', error);
  }
}

testLogin();
