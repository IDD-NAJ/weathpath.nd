require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

const sql = neon(process.env.DATABASE_URL);

async function createTestUsers() {
  console.log('👥 Creating test users...');
  
  const testUsers = [
    {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'user123',
      role: 'user'
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com', 
      password: 'user123',
      role: 'user'
    },
    {
      name: 'Test Admin',
      email: 'testadmin@example.com',
      password: 'admin123',
      role: 'admin'
    }
  ];

  try {
    for (const userData of testUsers) {
      // Check if user already exists
      const existing = await sql`
        SELECT id, email FROM users WHERE email = ${userData.email}
      `;
      
      if (existing.length === 0) {
        // Hash the password
        const passwordHash = await bcrypt.hash(userData.password, 12);
        const userId = crypto.randomUUID();
        
        await sql`
          INSERT INTO users (id, name, email, password_hash, role, is_active)
          VALUES (${userId}, ${userData.name}, ${userData.email}, ${passwordHash}, ${userData.role}, true)
        `;
        
        console.log(`✅ Created ${userData.role}: ${userData.name} (${userData.email})`);
      } else {
        console.log(`ℹ️ User already exists: ${userData.email}`);
      }
    }
    
    console.log('\n🎉 Test users created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('👤 Regular Users:');
    console.log('   - john@example.com / user123');
    console.log('   - jane@example.com / user123');
    console.log('👑 Admin Users:');
    console.log('   - admin@wealthpath.com / admin123');
    console.log('   - testadmin@example.com / admin123');
    
  } catch (error) {
    console.error('❌ Error creating test users:', error);
  }
}

createTestUsers();
