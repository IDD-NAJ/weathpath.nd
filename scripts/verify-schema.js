require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkSchema() {
  console.log('🔍 Checking database schema...\n');
  
  try {
    // Check all tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log('📋 Tables found:');
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
    console.log('\n🔍 Checking table structures...\n');
    
    // Check articles table
    try {
      const articlesColumns = await sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'articles' AND table_schema = 'public'
        ORDER BY ordinal_position
      `;
      
      console.log('📄 Articles table columns:');
      articlesColumns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    } catch (err) {
      console.log('❌ Articles table not found');
    }
    
    // Check users table
    try {
      const usersColumns = await sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'users' AND table_schema = 'public'
        ORDER BY ordinal_position
      `;
      
      console.log('\n👥 Users table columns:');
      usersColumns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    } catch (err) {
      console.log('❌ Users table not found');
    }
    
    // Check learning_paths table
    try {
      const learningPathsColumns = await sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'learning_paths' AND table_schema = 'public'
        ORDER BY ordinal_position
      `;
      
      console.log('\n🎯 Learning Paths table columns:');
      learningPathsColumns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    } catch (err) {
      console.log('❌ Learning Paths table not found');
    }
    
  } catch (error) {
    console.error('❌ Error checking schema:', error.message);
  }
}

checkSchema();
