require('dotenv').config({ path: '.env.local' })

async function testRealAPI() {
  console.log('🔍 Testing Real API Connection...')
  
  // Test Pixabay API (should work)
  console.log('\n🖼️  Testing Pixabay API...')
  try {
    const baseUrl = 'https://pixabay.com/api/'
    const params = new URLSearchParams({
      key: process.env.PIXABAY_API_KEY,
      q: 'finance business',
      per_page: '3',
      safesearch: 'true',
      image_type: 'photo'
    })
    
    const response = await fetch(`${baseUrl}?${params}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Pixabay API working!')
      console.log(`   Found ${data.total} total images`)
      console.log(`   Retrieved ${data.hits.length} sample images`)
    } else {
      console.log('❌ Pixabay API failed:', response.status)
    }
  } catch (error) {
    console.log('❌ Pixabay API error:', error.message)
  }
  
  // Test OpenAI API (quota issue)
  console.log('\n🤖 Testing OpenAI API...')
  try {
    const OpenAI = require('openai')
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
    
    const completion = await openai.chat.completions.create({
      model: "gpt-5.3-chat-latest",
      messages: [
        {
          role: "user",
          content: "Say 'API test successful' in one sentence."
        }
      ],
      max_tokens: 10,
    })
    
    console.log('✅ OpenAI API working!')
    console.log(`   Response: ${completion.choices[0]?.message?.content}`)
    
  } catch (error) {
    console.log('❌ OpenAI API error:', error.message)
    
    if (error.message.includes('quota')) {
      console.log('   💡 Solution: Check OpenAI billing or add payment method')
      console.log('   💡 Alternative: Use a different OpenAI API key')
    }
  }
  
  // Test the actual AI API endpoint
  console.log('\n🔌 Testing AI API Endpoint...')
  try {
    const response = await fetch('http://localhost:3000/api/admin/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'session=test' // Add a test session
      },
      body: JSON.stringify({
        action: 'ideas',
        topic: 'personal budgeting',
        count: 3
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ AI API endpoint working!')
      console.log(`   Generated ${data.data?.length || 0} ideas`)
    } else {
      const error = await response.text()
      console.log('❌ AI API endpoint failed:', response.status)
      console.log('   Error:', error)
    }
  } catch (error) {
    console.log('❌ AI API endpoint error:', error.message)
  }
}

testRealAPI()
