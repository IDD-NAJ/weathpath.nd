require('dotenv').config({ path: '.env.local' })

async function testAISetup() {
  console.log('🤖 Testing OpenAI Setup...')
  
  // Check if OpenAI package is installed
  try {
    require('openai')
    console.log('✅ OpenAI package is installed')
  } catch (error) {
    console.log('❌ OpenAI package not found')
    console.log('   Run: npm install openai')
    return false
  }
  
  // Check if API key is configured
  if (!process.env.OPENAI_API_KEY) {
    console.log('❌ OpenAI API key not found in environment variables')
    console.log('   Please add OPENAI_API_KEY to your .env.local file')
    console.log('   Get your API key from: https://platform.openai.com/api-keys')
    return false
  }
  
  console.log('✅ OpenAI API key found')
  
  // Check if API key format is valid (starts with sk-)
  if (!process.env.OPENAI_API_KEY.startsWith('sk-')) {
    console.log('⚠️  Warning: OpenAI API key format seems incorrect')
    console.log('   API keys should start with "sk-"')
  } else {
    console.log('✅ OpenAI API key format is correct')
  }
  
  // Test API connection (simple test)
  try {
    const OpenAI = require('openai')
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
    
    // Test with a simple API call to list models
    console.log('🔍 Testing OpenAI API connection...')
    const models = await openai.models.list()
    console.log('✅ OpenAI API connection successful!')
    console.log(`   Found ${models.data.length} available models`)
    
    // Check if GPT-4 Turbo is available
    const gpt4Turbo = models.data.find(model => model.id.includes('gpt-4-turbo'))
    if (gpt4Turbo) {
      console.log('✅ GPT-4 Turbo model is available for content generation')
    } else {
      console.log('⚠️  GPT-4 Turbo model not found, but other models are available')
    }
    
  } catch (error) {
    console.error('❌ OpenAI API connection failed:', error.message)
    
    if (error.message.includes('401')) {
      console.log('   This might be due to an invalid OpenAI API key')
      console.log('   Please check your OPENAI_API_KEY in .env.local')
    } else if (error.message.includes('quota')) {
      console.log('   This might be due to insufficient OpenAI API quota')
      console.log('   Please check your OpenAI account billing')
    } else if (error.message.includes('network')) {
      console.log('   This might be due to network connectivity issues')
      console.log('   Please check your internet connection')
    }
    
    return false
  }
  
  // Check if AI components exist
  const fs = require('fs')
  const path = require('path')
  
  const filesToCheck = [
    { path: '../lib/openai.ts', name: 'OpenAI library' },
    { path: '../app/api/admin/ai/generate/route.ts', name: 'AI API route' },
    { path: '../components/admin/ai-content-generator.tsx', name: 'AI content generator component' },
    { path: '../app/admin/ai/page.tsx', name: 'AI admin page' }
  ]
  
  console.log('\n📁 Checking AI components...')
  let allFilesExist = true
  
  for (const file of filesToCheck) {
    const fullPath = path.join(__dirname, file.path)
    if (fs.existsSync(fullPath)) {
      console.log(`✅ ${file.name} exists`)
    } else {
      console.log(`❌ ${file.name} missing`)
      allFilesExist = false
    }
  }
  
  if (!allFilesExist) {
    return false
  }
  
  console.log('\n🎉 All AI setup tests passed!')
  console.log('\n📋 AI Features Ready:')
  console.log('  🤖 Content generation (articles, stories, learning paths, quizzes)')
  console.log('  💡 Content ideas and suggestions')
  console.log('  🎯 Customizable parameters (difficulty, tone, length, audience)')
  console.log('  📊 Structured output with titles, summaries, and key points')
  console.log('  🏷️  Automatic tag generation and read time estimation')
  console.log('\n🔗 Access the AI content generator at: /admin/ai')
  console.log('\n⚠️  Important:')
  console.log('   1. Monitor your OpenAI API usage and costs')
  console.log('   2. Set up billing alerts in your OpenAI dashboard')
  console.log('   3. Review AI-generated content before publishing')
  
  return true
}

async function main() {
  const success = await testAISetup()
  
  if (!success) {
    console.log('\n❌ AI setup incomplete. Please fix the issues above.')
    process.exit(1)
  }
}

main()
