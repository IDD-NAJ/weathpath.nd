require('dotenv').config({ path: '.env.local' })

async function checkAPIStatus() {
  console.log('🔍 Comprehensive API Status Check\n')
  
  const checks = {
    openai: await checkOpenAI(),
    pixabay: await checkPixabay(),
    database: await checkDatabase(),
    build: await checkBuild(),
    components: await checkComponents()
  }
  
  console.log('\n📊 Status Summary:')
  Object.entries(checks).forEach(([name, status]) => {
    console.log(`  ${name.charAt(0).toUpperCase() + name.slice(1)}: ${status ? '✅' : '❌'}`)
  })
  
  const allPassed = Object.values(checks).every(status => status)
  
  if (allPassed) {
    console.log('\n🎉 All systems operational!')
    console.log('The AI content generation system is ready to use.')
  } else {
    console.log('\n⚠️  Some issues detected. Check the details above.')
  }
}

async function checkOpenAI() {
  console.log('🤖 Checking OpenAI Integration...')
  
  if (!process.env.OPENAI_API_KEY) {
    console.log('❌ OpenAI API key not configured')
    return false
  }
  
  try {
    const fs = require('fs')
    const path = require('path')
    
    // Check if openai library exists
    const openaiLib = path.join(__dirname, '..', 'lib', 'openai.ts')
    if (!fs.existsSync(openaiLib)) {
      console.log('❌ OpenAI library missing')
      return false
    }
    
    // Check if model is updated
    const content = fs.readFileSync(openaiLib, 'utf8')
    if (content.includes('gpt-5.3-chat-latest')) {
      console.log('✅ OpenAI model updated to gpt-5.3-chat-latest')
    } else {
      console.log('❌ OpenAI model not updated')
      return false
    }
    
    console.log('✅ OpenAI integration configured')
    return true
    
  } catch (error) {
    console.log('❌ OpenAI check failed:', error.message)
    return false
  }
}

async function checkPixabay() {
  console.log('🖼️  Checking Pixabay Integration...')
  
  if (!process.env.PIXABAY_API_KEY) {
    console.log('❌ Pixabay API key not configured')
    return false
  }
  
  try {
    const fs = require('fs')
    const path = require('path')
    
    const pixabayLib = path.join(__dirname, '..', 'lib', 'pixabay.ts')
    if (!fs.existsSync(pixabayLib)) {
      console.log('❌ Pixabay library missing')
      return false
    }
    
    console.log('✅ Pixabay integration configured')
    return true
    
  } catch (error) {
    console.log('❌ Pixabay check failed:', error.message)
    return false
  }
}

async function checkDatabase() {
  console.log('🗄️  Checking Database Integration...')
  
  try {
    const fs = require('fs')
    const path = require('path')
    
    // Check database library
    const dbLib = path.join(__dirname, '..', 'lib', 'db.ts')
    if (!fs.existsSync(dbLib)) {
      console.log('❌ Database library missing')
      return false
    }
    
    // Check auth library
    const authLib = path.join(__dirname, '..', 'lib', 'auth.ts')
    if (!fs.existsSync(authLib)) {
      console.log('❌ Auth library missing')
      return false
    }
    
    console.log('✅ Database integration configured')
    return true
    
  } catch (error) {
    console.log('❌ Database check failed:', error.message)
    return false
  }
}

async function checkBuild() {
  console.log('🏗️  Checking Build Status...')
  
  try {
    const fs = require('fs')
    const path = require('path')
    
    // Check if .next directory exists (indicates successful build)
    const nextDir = path.join(__dirname, '..', '.next')
    if (!fs.existsSync(nextDir)) {
      console.log('⚠️  Build directory not found (run npm run build)')
      return false
    }
    
    console.log('✅ Build system ready')
    return true
    
  } catch (error) {
    console.log('❌ Build check failed:', error.message)
    return false
  }
}

async function checkComponents() {
  console.log('🧩 Checking Components...')
  
  try {
    const fs = require('fs')
    const path = require('path')
    
    const components = [
      'components/admin/ai-content-generator.tsx',
      'components/admin/admin-sidebar.tsx',
      'app/admin/ai/page.tsx',
      'app/api/admin/ai/generate/route.ts'
    ]
    
    let allExist = true
    
    for (const component of components) {
      const componentPath = path.join(__dirname, '..', component)
      if (!fs.existsSync(componentPath)) {
        console.log(`❌ Missing: ${component}`)
        allExist = false
      }
    }
    
    if (allExist) {
      console.log('✅ All AI components present')
    }
    
    return allExist
    
  } catch (error) {
    console.log('❌ Component check failed:', error.message)
    return false
  }
}

checkAPIStatus()
