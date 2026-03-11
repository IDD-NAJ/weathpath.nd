require('dotenv').config({ path: '.env.local' })
const { neon } = require('@neondatabase/serverless')
const sql = neon(process.env.DATABASE_URL)

async function verifyDatabase() {
  console.log('🔍 Verifying database structure...')
  
  try {
    // Check all required tables exist
    const requiredTables = [
      'users',
      'sessions',
      'learning_paths',
      'learning_path_modules',
      'articles',
      'success_stories',
      'user_progress',
      'user_activity',
      'user_bookmarks',
      'user_quiz_results',
      'user_notifications',
      'content_ratings',
      'content_feedback',
      'site_settings',
      'analytics_events'
    ]
    
    const existingTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = ANY(${requiredTables})
    `
    
    const existingTableNames = existingTables.map(t => t.table_name)
    const missingTables = requiredTables.filter(table => !existingTableNames.includes(table))
    
    if (missingTables.length > 0) {
      console.log('❌ Missing tables:', missingTables)
      return false
    }
    
    console.log('✅ All required tables exist')
    
    // Check if admin user exists
    const adminUsers = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'admin'`
    if (adminUsers[0].count === 0) {
      console.log('⚠️ No admin users found')
    } else {
      console.log(`✅ Found ${adminUsers[0].count} admin user(s)`)
    }
    
    // Check if sample data exists
    const learningPaths = await sql`SELECT COUNT(*) as count FROM learning_paths`
    const articles = await sql`SELECT COUNT(*) as count FROM articles`
    const stories = await sql`SELECT COUNT(*) as count FROM success_stories`
    
    console.log(`📊 Content counts:`)
    console.log(`  Learning Paths: ${learningPaths[0].count}`)
    console.log(`  Articles: ${articles[0].count}`)
    console.log(`  Success Stories: ${stories[0].count}`)
    
    return true
    
  } catch (error) {
    console.error('❌ Database verification failed:', error.message)
    return false
  }
}

async function verifyRoutes() {
  console.log('🔍 Verifying route files...')
  
  const fs = require('fs')
  const path = require('path')
  
  const requiredRoutes = [
    'app/page.tsx',
    'app/layout.tsx',
    'app/login/page.tsx',
    'app/signup/page.tsx',
    'app/dashboard/page.tsx',
    'app/dashboard/layout.tsx',
    'app/admin/page.tsx',
    'app/admin/layout.tsx',
    'app/admin/approvals/page.tsx',
    'app/admin/users/page.tsx',
    'app/admin/learning-paths/page.tsx',
    'app/admin/articles/page.tsx',
    'app/admin/stories/page.tsx',
    'app/admin/settings/page.tsx',
    'app/profile/page.tsx',
    'app/logout/page.tsx',
    'app/forgot-password/page.tsx',
    'app/privacy/page.tsx',
    'app/terms/page.tsx',
    'app/articles/page.tsx',
    'app/articles/[slug]/page.tsx',
    'app/stories/page.tsx',
    'app/stories/[id]/page.tsx',
    'app/not-found.tsx',
    'app/error.tsx'
  ]
  
  const requiredApiRoutes = [
    'app/api/auth/login/route.ts',
    'app/api/auth/signup/route.ts',
    'app/api/admin/analytics/route.ts',
    'app/api/user/profile/route.ts',
    'app/api/user/progress/route.ts',
    'app/api/upload/profile/route.ts'
  ]
  
  let missingFiles = []
  
  for (const route of requiredRoutes) {
    if (!fs.existsSync(path.join(__dirname, '..', route))) {
      missingFiles.push(route)
    }
  }
  
  for (const apiRoute of requiredApiRoutes) {
    if (!fs.existsSync(path.join(__dirname, '..', apiRoute))) {
      missingFiles.push(apiRoute)
    }
  }
  
  if (missingFiles.length > 0) {
    console.log('❌ Missing route files:')
    missingFiles.forEach(file => console.log(`  - ${file}`))
    return false
  }
  
  console.log('✅ All required route files exist')
  return true
}

async function verifyComponents() {
  console.log('🔍 Verifying components...')
  
  const fs = require('fs')
  const path = require('path')
  
  const requiredComponents = [
    'components/ui/button.tsx',
    'components/ui/card.tsx',
    'components/ui/input.tsx',
    'components/ui/label.tsx',
    'components/ui/textarea.tsx',
    'components/ui/checkbox.tsx',
    'components/ui/separator.tsx',
    'components/ui/badge.tsx',
    'components/ui/avatar.tsx',
    'components/ui/sidebar.tsx',
    'components/admin/admin-sidebar.tsx',
    'components/admin/admin-header.tsx',
    'components/admin/approvals-manager.tsx',
    'components/admin/articles-manager.tsx',
    'components/admin/learning-paths-manager.tsx',
    'components/admin/stories-manager.tsx',
    'components/admin/settings-manager.tsx',
    'components/admin/users-table.tsx',
    'components/charts/activity-chart.tsx',
    'components/charts/progress-donut.tsx',
    'components/charts/analytics-bar.tsx',
    'components/ui/animated-card.tsx',
    'components/ui/animated-progress.tsx',
    'components/ui/achievement-badge.tsx',
    'components/profile/profile-edit-form.tsx',
    'components/auth/logout-button.tsx'
  ]
  
  let missingFiles = []
  
  for (const component of requiredComponents) {
    if (!fs.existsSync(path.join(__dirname, '..', component))) {
      missingFiles.push(component)
    }
  }
  
  if (missingFiles.length > 0) {
    console.log('❌ Missing component files:')
    missingFiles.forEach(file => console.log(`  - ${file}`))
    return false
  }
  
  console.log('✅ All required components exist')
  return true
}

async function verifyActions() {
  console.log('🔍 Verifying server actions...')
  
  const fs = require('fs')
  const path = require('path')
  
  const requiredActions = [
    'app/actions/auth.ts',
    'app/actions/approval.ts',
    'app/actions/articles.ts',
    'app/actions/learning-paths.ts',
    'app/actions/settings.ts',
    'app/actions/stories.ts',
    'app/actions/users.ts'
  ]
  
  let missingFiles = []
  
  for (const action of requiredActions) {
    if (!fs.existsSync(path.join(__dirname, '..', action))) {
      missingFiles.push(action)
    }
  }
  
  if (missingFiles.length > 0) {
    console.log('❌ Missing action files:')
    missingFiles.forEach(file => console.log(`  - ${file}`))
    return false
  }
  
  console.log('✅ All required actions exist')
  return true
}

async function main() {
  console.log('🚀 Starting comprehensive route verification...\n')
  
  const dbOk = await verifyDatabase()
  const routesOk = await verifyRoutes()
  const componentsOk = await verifyComponents()
  const actionsOk = await verifyActions()
  
  console.log('\n📊 Verification Summary:')
  console.log(`  Database: ${dbOk ? '✅' : '❌'}`)
  console.log(`  Routes: ${routesOk ? '✅' : '❌'}`)
  console.log(`  Components: ${componentsOk ? '✅' : '❌'}`)
  console.log(`  Actions: ${actionsOk ? '✅' : '❌'}`)
  
  if (dbOk && routesOk && componentsOk && actionsOk) {
    console.log('\n🎉 All verifications passed! The application is ready.')
    console.log('📋 Available routes:')
    console.log('  📄 Public: /, /login, /signup, /forgot-password, /privacy, /terms')
    console.log('  👤 User: /dashboard, /profile, /logout')
    console.log('  📚 Content: /articles/[slug], /stories/[id]')
    console.log('  🛡️  Admin: /admin/* (approvals, users, learning-paths, articles, stories, settings)')
    console.log('  🔌 API: /api/* (auth, admin, user, upload)')
  } else {
    console.log('\n❌ Some verifications failed. Please fix the issues above.')
    process.exit(1)
  }
}

main()
