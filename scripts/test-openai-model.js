require('dotenv').config({ path: '.env.local' })

async function testOpenAIModel() {
  console.log('🔧 Testing OpenAI Model Fix...')
  
  if (!process.env.OPENAI_API_KEY) {
    console.log('❌ OpenAI API key not found')
    return false
  }
  
  try {
    const OpenAI = require('openai')
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
    
    console.log('🔍 Testing available models...')
    
    // List available models
    const models = await openai.models.list()
    const chatModels = models.data.filter(model => 
      model.id.includes('gpt') && model.id.includes('chat')
    )
    
    console.log(`✅ Found ${chatModels.length} chat models:`)
    chatModels.slice(0, 5).forEach(model => {
      console.log(`   - ${model.id}`)
    })
    
    // Test with gpt-3.5-turbo (most commonly available)
    console.log('\n🔍 Testing gpt-3.5-turbo model...')
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: "Say 'Model test successful' in one sentence."
        }
      ],
      max_tokens: 10,
    })
    
    const response = completion.choices[0]?.message?.content
    console.log('✅ gpt-3.5-turbo model working!')
    console.log(`   Response: ${response}`)
    
    return { success: true, model: "gpt-3.5-turbo" }
    
  } catch (error) {
    console.error('❌ OpenAI model test failed:', error.message)
    
    if (error.message.includes('model_not_found')) {
      console.log('   The model name is incorrect or not available')
    }
    
    return { success: false, error: error.message }
  }
}

async function main() {
  const result = await testOpenAIModel()
  
  if (result.success) {
    console.log(`\n🎉 Working model found: ${result.model}`)
    console.log('Now updating the OpenAI library to use this model...')
    
    // Update the model in the openai.ts file
    const fs = require('fs')
    const path = require('path')
    
    const openaiFile = path.join(__dirname, '..', 'lib', 'openai.ts')
    let content = fs.readFileSync(openaiFile, 'utf8')
    
    // Replace all instances of gpt-4-turbo with gpt-3.5-turbo
    content = content.replace(/gpt-4-turbo/g, 'gpt-3.5-turbo')
    
    fs.writeFileSync(openaiFile, content)
    console.log('✅ Updated openai.ts to use gpt-3.5-turbo')
    
  } else {
    console.log('\n❌ No working model found. Check your OpenAI API access.')
    console.log('Error:', result.error)
  }
}

main()
