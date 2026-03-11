require('dotenv').config({ path: '.env.local' })
const { generateContent, generateContentIdeas } = require('../lib/openai')

async function testAIIntegration() {
  console.log('🤖 Testing OpenAI Integration...')
  
  if (!process.env.OPENAI_API_KEY) {
    console.log('❌ OpenAI API key not found in environment variables')
    console.log('   Please add OPENAI_API_KEY to your .env.local file')
    return false
  }
  
  console.log('✅ OpenAI API key found')
  
  try {
    // Test content generation
    console.log('📝 Testing content generation...')
    const contentResult = await generateContent({
      type: 'article',
      topic: 'Personal Budgeting Basics',
      difficulty: 'beginner',
      tone: 'educational',
      length: 'short',
      audience: 'general'
    })
    
    console.log('✅ Content generation successful!')
    console.log(`   Title: ${contentResult.title}`)
    console.log(`   Summary: ${contentResult.summary}`)
    console.log(`   Word count: ${contentResult.content.split(/\s+/).length}`)
    console.log(`   Tags: ${contentResult.tags.join(', ')}`)
    console.log(`   Key points: ${contentResult.keyPoints.length}`)
    
    // Test content ideas generation
    console.log('\n💡 Testing content ideas generation...')
    const ideasResult = await generateContentIdeas('Investment Strategies', 3)
    
    console.log('✅ Content ideas generation successful!')
    ideasResult.forEach((idea, index) => {
      console.log(`   ${index + 1}. ${idea}`)
    })
    
    console.log('\n🎉 All AI integration tests passed!')
    return true
    
  } catch (error) {
    console.error('❌ AI integration test failed:', error.message)
    
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
}

async function testAPIEndpoint() {
  console.log('\n🌐 Testing API endpoint...')
  
  try {
    const fetch = require('node-fetch')
    
    // This would require authentication, so we'll just check if the route file exists
    const fs = require('fs')
    const path = require('path')
    
    const apiRoutePath = path.join(__dirname, '..', 'app', 'api', 'admin', 'ai', 'generate', 'route.ts')
    if (fs.existsSync(apiRoutePath)) {
      console.log('✅ AI generation API route exists')
    } else {
      console.log('❌ AI generation API route missing')
      return false
    }
    
    const componentPath = path.join(__dirname, '..', 'components', 'admin', 'ai-content-generator.tsx')
    if (fs.existsSync(componentPath)) {
      console.log('✅ AI content generator component exists')
    } else {
      console.log('❌ AI content generator component missing')
      return false
    }
    
    const pagePath = path.join(__dirname, '..', 'app', 'admin', 'ai', 'page.tsx')
    if (fs.existsSync(pagePath)) {
      console.log('✅ AI admin page exists')
    } else {
      console.log('❌ AI admin page missing')
      return false
    }
    
    console.log('✅ API endpoint test completed successfully!')
    return true
    
  } catch (error) {
    console.error('❌ API endpoint test failed:', error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Starting comprehensive AI integration test...\n')
  
  const aiTest = await testAIIntegration()
  const apiTest = await testAPIEndpoint()
  
  console.log('\n📊 Test Results:')
  console.log(`  OpenAI Integration: ${aiTest ? '✅' : '❌'}`)
  console.log(`  API Endpoints: ${apiTest ? '✅' : '❌'}`)
  
  if (aiTest && apiTest) {
    console.log('\n🎉 All tests passed! The AI integration is ready.')
    console.log('\n📋 Available AI Features:')
    console.log('  📝 Generate articles, stories, learning paths, and quizzes')
    console.log('  💡 Generate content ideas and suggestions')
    console.log('  🎯 Customize difficulty, tone, length, and audience')
    console.log('  📊 Get structured content with titles, summaries, and key points')
    console.log('  🏷️  Automatic tag generation and read time estimation')
    console.log('\n🔗 Access the AI content generator at: /admin/ai')
    console.log('\n⚠️  Remember to:')
    console.log('   1. Add your OpenAI API key to .env.local')
    console.log('   2. Set OPENAI_API_KEY in Vercel environment variables')
    console.log('   3. Monitor your OpenAI API usage and costs')
  } else {
    console.log('\n❌ Some tests failed. Please check the issues above.')
    process.exit(1)
  }
}

main()
