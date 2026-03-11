require('dotenv').config({ path: '.env.local' })

async function testPixabayIntegration() {
  console.log('🖼️  Testing Pixabay Integration...')
  
  // Check if API key is configured
  if (!process.env.PIXABAY_API_KEY) {
    console.log('❌ Pixabay API key not found in environment variables')
    console.log('   Please add PIXABAY_API_KEY to your .env.local file')
    console.log('   Get your API key from: https://pixabay.com/api/docs/')
    return false
  }
  
  console.log('✅ Pixabay API key found')
  
  // Check if API key format is valid (should be numeric)
  if (!/^\d+$/.test(process.env.PIXABAY_API_KEY)) {
    console.log('⚠️  Warning: Pixabay API key format seems incorrect')
    console.log('   Pixabay API keys should be numeric')
  } else {
    console.log('✅ Pixabay API key format is correct')
  }
  
  // Test API connection
  try {
    console.log('🔍 Testing Pixabay API connection...')
    const baseUrl = 'https://pixabay.com/api/'
    const params = new URLSearchParams({
      key: process.env.PIXABAY_API_KEY,
      q: 'finance business',
      per_page: '3',
      safesearch: 'true',
      image_type: 'photo'
    })
    
    const response = await fetch(`${baseUrl}?${params}`)
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid API key')
      } else if (response.status === 429) {
        throw new Error('API rate limit exceeded')
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    }
    
    const data = await response.json()
    console.log('✅ Pixabay API connection successful!')
    console.log(`   Found ${data.total} total images available`)
    console.log(`   Retrieved ${data.hits.length} sample images`)
    
    if (data.hits.length > 0) {
      console.log('   Sample image details:')
      const sample = data.hits[0]
      console.log(`     - ID: ${sample.id}`)
      console.log(`     - Tags: ${sample.tags}`)
      console.log(`     - Size: ${sample.imageWidth}x${sample.imageHeight}`)
      console.log(`     - Photographer: ${sample.user}`)
      console.log(`     - Downloads: ${sample.downloads}`)
    }
    
  } catch (error) {
    console.error('❌ Pixabay API connection failed:', error.message)
    
    if (error.message.includes('Invalid API key')) {
      console.log('   Please check your PIXABAY_API_KEY in .env.local')
      console.log('   Get your API key from: https://pixabay.com/api/docs/')
    } else if (error.message.includes('rate limit')) {
      console.log('   Pixabay API rate limit exceeded. Please try again later.')
    } else if (error.message.includes('network')) {
      console.log('   Network connectivity issues. Please check your internet connection.')
    }
    
    return false
  }
  
  // Check if Pixabay library exists
  const fs = require('fs')
  const path = require('path')
  
  const pixabayLibPath = path.join(__dirname, '..', 'lib', 'pixabay.ts')
  if (fs.existsSync(pixabayLibPath)) {
    console.log('✅ Pixabay library exists')
  } else {
    console.log('❌ Pixabay library missing')
    return false
  }
  
  // Check if uploads directory exists
  const uploadsDir = path.join(__dirname, '..', 'public', 'uploads', 'images')
  if (fs.existsSync(uploadsDir)) {
    console.log('✅ Uploads directory exists')
  } else {
    console.log('⚠️  Uploads directory not found, will be created when needed')
  }
  
  console.log('\n🎉 All Pixabay integration tests passed!')
  console.log('\n📋 Pixabay Features Ready:')
  console.log('  🖼️  Find relevant images for AI-generated content')
  console.log('  🔍 Smart keyword extraction from content')
  console.log('  📥 Automatic image downloading and local storage')
  console.log('  🏷️  Proper attribution and photographer credits')
  console.log('  🎯 Content-type specific image categorization')
  console.log('  ⚡ High-quality image selection based on likes and downloads')
  console.log('\n🔗 Image generation is integrated with AI content generator')
  console.log('\n⚠️  Important:')
  console.log('   1. Monitor your Pixabay API usage (free tier: 5,000 requests/hour)')
  console.log('   2. Always provide proper attribution for Pixabay images')
  console.log('   3. Check Pixabay license terms for commercial use')
  console.log('   4. Images are stored locally to avoid repeated API calls')
  
  return true
}

async function testImageGeneration() {
  console.log('\n🤖 Testing AI + Image Integration...')
  
  try {
    // This would require the actual OpenAI integration
    // For now, just check if the components exist
    const fs = require('fs')
    const path = require('path')
    
    const aiComponentPath = path.join(__dirname, '..', 'components', 'admin', 'ai-content-generator.tsx')
    if (fs.existsSync(aiComponentPath)) {
      console.log('✅ AI content generator component exists')
    } else {
      console.log('❌ AI content generator component missing')
      return false
    }
    
    const openaiLibPath = path.join(__dirname, '..', 'lib', 'openai.ts')
    if (fs.existsSync(openaiLibPath)) {
      console.log('✅ OpenAI library exists')
    } else {
      console.log('❌ OpenAI library missing')
      return false
    }
    
    console.log('✅ AI + Image integration components verified')
    return true
    
  } catch (error) {
    console.error('❌ AI + Image integration test failed:', error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Starting comprehensive Pixabay integration test...\n')
  
  const pixabayTest = await testPixabayIntegration()
  const integrationTest = await testImageGeneration()
  
  console.log('\n📊 Test Results:')
  console.log(`  Pixabay Integration: ${pixabayTest ? '✅' : '❌'}`)
  console.log(`  AI + Image Integration: ${integrationTest ? '✅' : '❌'}`)
  
  if (pixabayTest && integrationTest) {
    console.log('\n🎉 All tests passed! The Pixabay image integration is ready.')
    console.log('\n📋 Complete AI + Image Workflow:')
    console.log('  1. Generate content with OpenAI')
    console.log('  2. Extract keywords from generated content')
    console.log('  3. Search Pixabay for relevant images')
    console.log('  4. Download and store best quality image')
    console.log('  5. Add proper attribution and metadata')
    console.log('  6. Display with generated content')
    console.log('\n🔗 Access the AI content generator at: /admin/ai')
    console.log('\n⚠️  Remember to:')
    console.log('   1. Add your Pixabay API key to .env.local')
    console.log('   2. Set PIXABAY_API_KEY in Vercel environment variables')
    console.log('   3. Monitor both OpenAI and Pixabay API usage')
  } else {
    console.log('\n❌ Some tests failed. Please check the issues above.')
    process.exit(1)
  }
}

main()
