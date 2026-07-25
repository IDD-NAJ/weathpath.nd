const fs = require('fs')
const { Pool } = require('pg')

const DB_URL = 'postgresql://neondb_owner:npg_CdErv90DWHzP@ep-divine-frog-ahe05se1-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

const pool = new Pool({
  connectionString: DB_URL,
})

async function setupSchema() {
  const client = await pool.connect()
  
  try {
    console.log('🔨 Setting up core schema...\n')

    // 1. Ensure users table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.users (
        id BIGSERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        password_hash VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user',
        is_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Users table ready')

    // 2. Ensure courses table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.courses (
        id BIGSERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE,
        description TEXT,
        category VARCHAR(100),
        price_cents INTEGER DEFAULT 0,
        cover_image VARCHAR(255),
        is_published BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Courses table ready')

    // 3. Create view_counts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.view_counts (
        id BIGSERIAL PRIMARY KEY,
        content_type VARCHAR(50) NOT NULL,
        content_id BIGINT NOT NULL,
        view_date DATE NOT NULL,
        view_count INTEGER DEFAULT 0,
        unique_viewers INTEGER DEFAULT 0,
        UNIQUE(content_type, content_id, view_date)
      )
    `)
    console.log('✅ View counts table ready')

    // 4. Create reviews table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.reviews (
        id BIGSERIAL PRIMARY KEY,
        content_type VARCHAR(50) NOT NULL,
        content_id BIGINT NOT NULL,
        user_id BIGINT,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        title VARCHAR(255),
        body TEXT,
        is_approved BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, content_type, content_id)
      )
    `)
    console.log('✅ Reviews table ready')

    // 5. Create coupons table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.coupons (
        id BIGSERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        discount_percent INTEGER NOT NULL,
        max_uses INTEGER,
        times_redeemed INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP
      )
    `)
    console.log('✅ Coupons table ready')

    // 6. Create certificates table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.certificates (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL,
        course_id BIGINT NOT NULL,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        certificate_url VARCHAR(255),
        UNIQUE(user_id, course_id)
      )
    `)
    console.log('✅ Certificates table ready')

    // 7. Create recently_viewed table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.recently_viewed (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL,
        content_type VARCHAR(50) NOT NULL,
        content_id BIGINT NOT NULL,
        title VARCHAR(255),
        viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, content_type, content_id)
      )
    `)
    console.log('✅ Recently viewed table ready')

    // 8. Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_view_counts_content ON public.view_counts(content_type, content_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_content ON public.reviews(content_type, content_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_user ON public.reviews(user_id);
      CREATE INDEX IF NOT EXISTS idx_recently_viewed_user ON public.recently_viewed(user_id);
      CREATE INDEX IF NOT EXISTS idx_recently_viewed_viewed_at ON public.recently_viewed(viewed_at);
      CREATE INDEX IF NOT EXISTS idx_certificates_user ON public.certificates(user_id);
      CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code)
    `)
    console.log('✅ Indexes created')

    // 9. Verify all tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'courses', 'view_counts', 'reviews', 'coupons', 'certificates', 'recently_viewed')
      ORDER BY table_name
    `)

    console.log('\n📋 Schema verification:')
    console.log('Tables created:', result.rows.map(r => r.table_name).join(', '))

    // 10. Sample data
    console.log('\n🌱 Adding sample data...')
    
    const userCheck = await client.query(`SELECT COUNT(*) FROM public.users`)
    if (userCheck.rows[0].count === '0') {
      await client.query(`
        INSERT INTO public.users (email, name, role, is_verified) 
        VALUES 
          ('admin@example.com', 'Admin', 'admin', true),
          ('user@example.com', 'User', 'user', true)
        ON CONFLICT DO NOTHING
      `)
      console.log('✅ Sample users added')
    }

    const courseCheck = await client.query(`SELECT COUNT(*) FROM public.courses`)
    if (courseCheck.rows[0].count === '0') {
      await client.query(`
        INSERT INTO public.courses (title, slug, description, category, price_cents, is_published)
        VALUES 
          ('JavaScript Fundamentals', 'js-fundamentals', 'Learn JavaScript basics', 'Programming', 9999, true),
          ('React Advanced', 'react-advanced', 'Master React patterns', 'Programming', 14999, true),
          ('Web Design Basics', 'web-design-basics', 'Design beautiful websites', 'Design', 7999, true)
        ON CONFLICT DO NOTHING
      `)
      console.log('✅ Sample courses added')
    }

    const couponCheck = await client.query(`SELECT COUNT(*) FROM public.coupons`)
    if (couponCheck.rows[0].count === '0') {
      await client.query(`
        INSERT INTO public.coupons (code, discount_percent, max_uses, is_active)
        VALUES 
          ('SAVE20', 20, 100, true),
          ('WELCOME10', 10, 50, true),
          ('SPRING30', 30, 25, true)
        ON CONFLICT DO NOTHING
      `)
      console.log('✅ Sample coupons added')
    }

    console.log('\n✨ Database setup complete!')

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    client.release()
    await pool.end()
  }
}

setupSchema()
