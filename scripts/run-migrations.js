require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Database connection
const sql = neon(process.env.DATABASE_URL);

async function runMigration(filePath, description) {
  console.log(`\n🔄 Running: ${description}`);
  console.log(`📁 File: ${filePath}`);
  
  try {
    const migrationSQL = fs.readFileSync(filePath, 'utf8');
    
    // Split the SQL file by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        await sql(statement);
      }
    }
    
    console.log(`✅ Completed: ${description}`);
    return true;
  } catch (error) {
    console.error(`❌ Error in ${description}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting database migrations...');
  
  const migrations = [
    { file: 'complete-schema.sql', desc: 'Complete database schema setup' },
    { file: '002-seed-admin.sql', desc: 'Seed admin user' },
  ];
  
  let successCount = 0;
  
  for (const migration of migrations) {
    const filePath = path.join(__dirname, migration.file);
    
    if (fs.existsSync(filePath)) {
      const success = await runMigration(filePath, migration.desc);
      if (success) successCount++;
    } else {
      console.log(`⚠️  Migration file not found: ${migration.file}`);
    }
  }
  
  console.log(`\n📊 Migration Summary:`);
  console.log(`✅ Successful: ${successCount}/${migrations.length}`);
  console.log(`❌ Failed: ${migrations.length - successCount}/${migrations.length}`);
  
  if (successCount === migrations.length) {
    console.log('\n🎉 All migrations completed successfully!');
  } else {
    console.log('\n⚠️  Some migrations failed. Please check the errors above.');
  }
  
  process.exit(successCount === migrations.length ? 0 : 1);
}

main().catch(console.error);
