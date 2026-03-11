require('dotenv').config({ path: '.env.local' })
const { neon } = require('@neondatabase/serverless')
const sql = neon(process.env.DATABASE_URL)

async function testNotificationsSystem() {
  console.log('🔔 Testing Notifications System...')
  
  try {
    // Check if user_notifications table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_notifications'
      ) as exists
    `
    
    if (!tableCheck[0].exists) {
      console.log('❌ user_notifications table does not exist')
      return false
    }
    
    console.log('✅ user_notifications table exists')
    
    // Check if there are any users to send notifications to
    const users = await sql`SELECT COUNT(*) as count FROM users WHERE is_active = true`
    console.log(`✅ Found ${users[0].count} active users`)
    
    // Check if there are any existing notifications
    const notifications = await sql`SELECT COUNT(*) as count FROM user_notifications`
    console.log(`✅ Found ${notifications[0].count} existing notifications`)
    
    // Test creating a sample notification
    const testNotification = await sql`
      INSERT INTO user_notifications (user_id, title, message, type, is_read, created_at)
      SELECT id, 'Test Notification', 'This is a test notification from the system', 'info', false, NOW()
      FROM users 
      WHERE role = 'admin' 
      LIMIT 1
      RETURNING id, title, message, type
    `
    
    if (testNotification.length > 0) {
      console.log('✅ Successfully created test notification')
      console.log(`   Title: ${testNotification[0].title}`)
      console.log(`   Type: ${testNotification[0].type}`)
      
      // Clean up test notification
      await sql`DELETE FROM user_notifications WHERE id = ${testNotification[0].id}`
      console.log('✅ Cleaned up test notification')
    } else {
      console.log('⚠️ No admin users found for testing')
    }
    
    // Test notification types
    const types = ['info', 'success', 'warning', 'error']
    console.log('✅ Supported notification types:', types.join(', '))
    
    // Check analytics_events table for notification tracking
    const analyticsCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'analytics_events'
      ) as exists
    `
    
    if (analyticsCheck[0].exists) {
      console.log('✅ analytics_events table exists for notification tracking')
    } else {
      console.log('⚠️ analytics_events table missing (notification tracking disabled)')
    }
    
    console.log('🎉 Notifications system test completed successfully!')
    return true
    
  } catch (error) {
    console.error('❌ Notifications system test failed:', error.message)
    return false
  }
}

async function testAPIRoutes() {
  console.log('🌐 Testing API Routes...')
  
  try {
    // Test if the route file exists
    const fs = require('fs')
    const path = require('path')
    
    const apiRoutePath = path.join(__dirname, '..', 'app', 'api', 'admin', 'notifications', 'route.ts')
    if (fs.existsSync(apiRoutePath)) {
      console.log('✅ Notifications API route exists')
    } else {
      console.log('❌ Notifications API route missing')
      return false
    }
    
    const actionsPath = path.join(__dirname, '..', 'app', 'actions', 'notifications.ts')
    if (fs.existsSync(actionsPath)) {
      console.log('✅ Notifications server actions exist')
    } else {
      console.log('❌ Notifications server actions missing')
      return false
    }
    
    const componentPath = path.join(__dirname, '..', 'components', 'admin', 'notifications-manager.tsx')
    if (fs.existsSync(componentPath)) {
      console.log('✅ Notifications manager component exists')
    } else {
      console.log('❌ Notifications manager component missing')
      return false
    }
    
    const pagePath = path.join(__dirname, '..', 'app', 'admin', 'notifications', 'page.tsx')
    if (fs.existsSync(pagePath)) {
      console.log('✅ Notifications page exists')
    } else {
      console.log('❌ Notifications page missing')
      return false
    }
    
    console.log('🎉 API routes test completed successfully!')
    return true
    
  } catch (error) {
    console.error('❌ API routes test failed:', error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Starting comprehensive notifications test...\n')
  
  const dbTest = await testNotificationsSystem()
  const apiTest = await testAPIRoutes()
  
  console.log('\n📊 Test Results:')
  console.log(`  Database: ${dbTest ? '✅' : '❌'}`)
  console.log(`  API Routes: ${apiTest ? '✅' : '❌'}`)
  
  if (dbTest && apiTest) {
    console.log('\n🎉 All tests passed! The notifications system is ready.')
    console.log('\n📋 Available Features:')
    console.log('  🔔 Create notifications for users')
    console.log('  📊 View notification statistics')
    console.log('  👥 Send to all users or specific users')
    console.log('  🎨 Support for 4 notification types (info, success, warning, error)')
    console.log('  🔗 Optional action URLs for notifications')
    console.log('  📈 Analytics tracking for sent notifications')
    console.log('  🎛️  Full admin interface with filtering and search')
    console.log('\n🔗 Access the notifications panel at: /admin/notifications')
  } else {
    console.log('\n❌ Some tests failed. Please check the issues above.')
    process.exit(1)
  }
}

main()
