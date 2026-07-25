const fs = require('fs')
const { Pool } = require('pg')

const DB_URL = 'postgresql://neondb_owner:npg_CdErv90DWHzP@ep-divine-frog-ahe05se1-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

const pool = new Pool({
  connectionString: DB_URL,
})

async function verify() {
  const client = await pool.connect()
  
  try {
    console.log('🔍 Database Verification Report\n')
    console.log('=' .repeat(50))

    // 1. Check tables
    console.log('\n📊 Tables Status:')
    const tables = await client.query(`
      SELECT table_name, 
             (SELECT count(*) FROM information_schema.columns WHERE table_name=t.table_name) as column_count,
             (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_name=t.table_name) as constraint_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'courses', 'view_counts', 'reviews', 'coupons', 'certificates', 'recently_viewed')
      ORDER BY table_name
    `)
    
    tables.rows.forEach(t => {
      console.log(`  ✅ ${t.table_name.padEnd(20)} | ${t.column_count} columns | ${t.constraint_count} constraints`)
    })

    // 2. Check indexes
    console.log('\n🔑 Indexes:')
    const indexes = await client.query(`
      SELECT indexname FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND tablename IN ('view_counts', 'reviews', 'recently_viewed', 'certificates', 'coupons')
      ORDER BY tablename, indexname
    `)
    
    if (indexes.rows.length > 0) {
      indexes.rows.forEach(idx => {
        console.log(`  ✅ ${idx.indexname}`)
      })
    } else {
      console.log('  ⚠️  No indexes found')
    }

    // 3. Check sample data
    console.log('\n🌱 Sample Data:')
    
    const users = await client.query(`SELECT COUNT(*) as count FROM public.users`)
    console.log(`  Users: ${users.rows[0].count}`)

    const courses = await client.query(`SELECT COUNT(*) as count FROM public.courses`)
    console.log(`  Courses: ${courses.rows[0].count}`)

    const coupons = await client.query(`SELECT COUNT(*) as count FROM public.coupons`)
    console.log(`  Coupons: ${coupons.rows[0].count}`)

    const reviews = await client.query(`SELECT COUNT(*) as count FROM public.reviews`)
    console.log(`  Reviews: ${reviews.rows[0].count}`)

    const views = await client.query(`SELECT COUNT(*) as count FROM public.view_counts`)
    console.log(`  View Counts: ${views.rows[0].count}`)

    // 4. Check API files
    console.log('\n📁 API Files Created:')
    const apiFiles = [
      'app/api/views/route.ts',
      'app/api/reviews/route.ts',
      'app/api/search/route.ts',
      'app/api/admin/coupons/route.ts',
      'app/api/admin/reviews/route.ts',
      'app/api/certificates/[id]/route.ts',
      'app/api/dashboard/route.ts',
      'app/api/admin/analytics/revenue/route.ts',
      'app/api/content/recently-viewed/route.ts',
      'app/api/coupons/validate/route.ts',
    ]

    apiFiles.forEach(file => {
      const exists = fs.existsSync(`/vercel/share/v0-project/${file}`)
      console.log(`  ${exists ? '✅' : '❌'} ${file}`)
    })

    // 5. Check component files
    console.log('\n🎨 Component Files Created:')
    const componentFiles = [
      'components/view-tracker.tsx',
      'components/reviews-section.tsx',
      'components/global-search.tsx',
    ]

    componentFiles.forEach(file => {
      const exists = fs.existsSync(`/vercel/share/v0-project/${file}`)
      console.log(`  ${exists ? '✅' : '❌'} ${file}`)
    })

    // 6. Check page files
    console.log('\n📄 Updated Page Files:')
    const pageFiles = [
      'app/courses/page.tsx',
      'app/admin/coupons/page.tsx',
      'app/admin/reviews/page.tsx',
      'app/dashboard/page.tsx',
    ]

    pageFiles.forEach(file => {
      const exists = fs.existsSync(`/vercel/share/v0-project/${file}`)
      console.log(`  ${exists ? '✅' : '❌'} ${file}`)
    })

    console.log('\n' + '='.repeat(50))
    console.log('✨ Setup verification complete!')
    console.log('\n📝 Next steps:')
    console.log('  1. Set DATABASE_URL env var in Vercel project settings')
    console.log('  2. Set STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY')
    console.log('  3. Deploy to Vercel')
    console.log('  4. Test all features in preview')

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    client.release()
    await pool.end()
  }
}

verify()
