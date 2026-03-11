require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

const sql = neon(process.env.DATABASE_URL);

async function createAdminUser() {
  console.log('👑 Creating admin user...');
  
  try {
    // Check if admin user already exists
    const existingAdmin = await sql`
      SELECT id, email FROM users WHERE email = 'admin@wealthpath.com'
    `;
    
    if (existingAdmin.length > 0) {
      console.log('✅ Admin user already exists');
      return;
    }
    
    // Hash the password
    const password = 'admin123';
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Create admin user
    const adminId = crypto.randomUUID();
    
    await sql`
      INSERT INTO users (id, name, email, password_hash, role, is_active)
      VALUES (${adminId}, 'Admin User', 'admin@wealthpath.com', ${passwordHash}, 'admin', true)
    `;
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@wealthpath.com');
    console.log('🔑 Password: admin123');
    console.log('⚠️  Please change the password after first login!');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
}

createAdminUser();
