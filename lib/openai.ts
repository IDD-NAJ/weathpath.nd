import OpenAI from 'openai'
import { findRelevantImage, downloadImage, generateImageFilename, PixabayImage } from './pixabay'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface ContentGenerationOptions {
  type: 'article' | 'story' | 'learning_path' | 'quiz'
  topic: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  tone?: 'educational' | 'inspirational' | 'professional' | 'casual'
  length?: 'short' | 'medium' | 'long'
  audience?: 'general' | 'students' | 'professionals' | 'beginners'
  includeImage?: boolean
}

export interface GeneratedContent {
  title: string
  content: string
  summary: string
  tags: string[]
  estimatedReadTime: number
  difficulty: string
  keyPoints: string[]
  image?: {
    url: string
    alt: string
    caption: string
    attribution: {
      photographer: string
      source: string
      photographerUrl: string
    }
  }
}

export async function generateContent(options: ContentGenerationOptions): Promise<GeneratedContent> {
  try {
    const prompt = buildPrompt(options)
    
    const completion = await openai.chat.completions.create({
      model: "gpt-5.3-chat-latest",
      messages: [
        {
          role: "system",
          content: "You are a financial education expert creating high-quality educational content. Always provide accurate, well-structured, and engaging content."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No content generated')
    }

    const baseContent = parseGeneratedContent(response, options)
    
    // Add image if requested
    if (options.includeImage) {
      try {
        const image = await findRelevantImage(baseContent.content, options.type)
        if (image) {
          const filename = generateImageFilename(image.webformatURL, options.type)
          const localPath = await downloadImage(image.webformatURL, filename)
          
          baseContent.image = {
            url: localPath,
            alt: generateImageAlt(baseContent.title, options.topic),
            caption: generateImageCaption(baseContent.title, options.topic),
            attribution: {
              photographer: image.user,
              source: 'Pixabay',
              photographerUrl: `https://pixabay.com/users/${image.user}/`
            }
          }
        }
      } catch (imageError) {
        console.warn('Failed to generate image:', imageError)
        // Continue without image if it fails
      }
    }

    return baseContent
  } catch (error: any) {
    console.error('OpenAI API error:', error)
    
    // Handle quota exceeded gracefully
    if (error.message?.includes('quota') || error.code === 'insufficient_quota') {
      // Return fallback content
      return generateFallbackContent(options)
    }
    
    throw new Error('Failed to generate content')
  }
}

function generateFallbackContent(options: ContentGenerationOptions): GeneratedContent {
  const fallbackContent = {
    article: {
      title: `${options.topic}: A Comprehensive Guide`,
      content: `This article provides a comprehensive overview of ${options.topic}. In today's financial landscape, understanding ${options.topic} is essential for making informed decisions. We'll explore key concepts, practical strategies, and actionable insights to help you navigate this important aspect of financial management.\n\nThroughout this guide, we'll cover fundamental principles, common challenges, and best practices that can help you achieve your financial goals. Whether you're just starting out or looking to enhance your existing knowledge, this content is designed to provide valuable information in an accessible format.\n\nRemember that financial education is an ongoing journey, and taking the time to understand these concepts can significantly impact your financial well-being.`,
      summary: `A comprehensive guide to ${options.topic} covering essential concepts and practical strategies.`,
      keyPoints: [
        `Understanding the fundamentals of ${options.topic}`,
        `Practical strategies for implementation`,
        `Common challenges and how to overcome them`,
        `Best practices for long-term success`
      ]
    },
    story: {
      title: `Success Story: Achieving Financial Freedom Through ${options.topic}`,
      content: `Meet Sarah, a 32-year-old professional who transformed her financial life through disciplined ${options.topic}. Like many people, Sarah struggled with managing her finances until she discovered the power of proper ${options.topic} strategies.\n\nThree years ago, Sarah was living paycheck to paycheck, with minimal savings and growing financial stress. "I knew I needed to make a change," she recalls. "Learning about ${options.topic} completely changed my perspective on money management."\n\nThrough consistent effort and education, Sarah implemented a comprehensive ${options.topic} plan. She started by tracking her expenses, creating a realistic budget, and setting clear financial goals. Within six months, she had built an emergency fund and started investing for the future.\n\nToday, Sarah is debt-free and on track to achieve financial independence by age 45. "The key was consistency and education," she explains. "Understanding ${options.topic} gave me the tools to take control of my financial future."`,
      summary: `How Sarah transformed her financial life through disciplined ${options.topic} and achieved financial freedom.`,
      keyPoints: [
        'Starting point: Living paycheck to paycheck',
        'The turning point: Discovering proper financial education',
        'Implementation: Budgeting and goal setting',
        'Results: Debt-free and on track for early retirement'
      ]
    },
    learning_path: {
      title: `Learning Path: Master ${options.topic}`,
      content: `This comprehensive learning path will guide you through mastering ${options.topic} in a structured, easy-to-follow format. Each module builds upon the previous one, ensuring you develop a solid foundation before advancing to more complex concepts.\n\nModule 1: Foundations\nBegin with the fundamental concepts of ${options.topic}. Understand why it matters and how it impacts your financial well-being.\n\nModule 2: Practical Application\nLearn how to apply ${options.topic} concepts in real-world scenarios. Includes exercises and case studies.\n\nModule 3: Advanced Strategies\nExplore sophisticated techniques and strategies for optimizing your approach to ${options.topic}.\n\nModule 4: Common Pitfalls\nIdentify and avoid common mistakes that people make when learning ${options.topic}.\n\nModule 5: Long-term Success\nDevelop sustainable habits and strategies for maintaining financial health over time.`,
      summary: `A structured 5-module learning path for mastering ${options.topic} from basics to advanced strategies.`,
      keyPoints: [
        'Module 1: Fundamental concepts and foundations',
        'Module 2: Real-world practical applications',
        'Module 3: Advanced optimization strategies',
        'Module 4: Common pitfalls and how to avoid them',
        'Module 5: Long-term sustainable success'
      ]
    },
    quiz: {
      title: `Test Your Knowledge: ${options.topic} Quiz`,
      content: `This comprehensive quiz will test your understanding of ${options.topic} with carefully crafted questions covering all essential aspects. Each question includes detailed explanations to help you learn from both correct and incorrect answers.\n\nThe quiz consists of 15 multiple-choice questions designed to assess your knowledge of ${options.topic} concepts, practical applications, and best practices. Take your time to read each question carefully and select the best answer.\n\nAfter completing the quiz, you'll receive instant feedback on your performance, including detailed explanations for each answer. This will help you identify areas where you may need additional study or review.`,
      summary: `A comprehensive quiz testing knowledge of ${options.topic} with detailed explanations for learning.`,
      keyPoints: [
        '15 comprehensive multiple-choice questions',
        'Covers all essential aspects of the topic',
        'Instant feedback and detailed explanations',
        'Identifies areas for additional study'
      ]
    }
  }
  
  const content = fallbackContent[options.type] || fallbackContent.article
  
  return {
    title: content.title,
    content: content.content,
    summary: content.summary,
    tags: [options.topic, options.type, 'financial education', 'learning'],
    estimatedReadTime: Math.ceil(content.content.split(/\s+/).length / 200),
    difficulty: options.difficulty || 'beginner',
    keyPoints: content.keyPoints
  }
}

function generateImageAlt(title: string, topic: string): string {
  return `Illustration for ${title} - ${topic} concept`
}

function generateImageCaption(title: string, topic: string): string {
  return `Visual representation of ${title} covering ${topic} concepts`
}

function buildPrompt(options: ContentGenerationOptions): string {
  const { type, topic, difficulty = 'beginner', tone = 'educational', length = 'medium', audience = 'general' } = options
  
  const lengthMap = {
    short: '300-500 words',
    medium: '800-1200 words',
    long: '1500-2000 words'
  }

  const typeInstructions = {
    article: `Write an educational article about ${topic}. Include a compelling introduction, 3-4 main sections with clear headings, practical examples, and a conclusion with key takeaways.`,
    story: `Write an inspirational success story about someone who achieved financial success related to ${topic}. Include challenges faced, solutions implemented, and lessons learned. Make it relatable and motivating.`,
    learning_path: `Create a structured learning path about ${topic}. Break it down into 5-6 progressive modules, each with clear objectives, key concepts, and practical exercises.`,
    quiz: `Create a comprehensive quiz about ${topic}. Include 10-15 questions with multiple choice answers, explanations for each answer, and a scoring system.`
  }

  return `
${typeInstructions[type]}

Requirements:
- Length: ${lengthMap[length]}
- Difficulty level: ${difficulty}
- Tone: ${tone}
- Target audience: ${audience}
- Focus on practical, actionable content
- Include real-world examples and case studies
- Ensure all financial information is accurate and up-to-date

Please format your response as follows:
TITLE: [A compelling title]
SUMMARY: [A 2-3 sentence summary]
KEY_POINTS: [3-5 bullet points of main takeaways]
TAGS: [5-7 relevant tags separated by commas]
CONTENT: [The main content with proper formatting and structure]
`
}

function parseGeneratedContent(response: string, options: ContentGenerationOptions): GeneratedContent {
  const lines = response.split('\n')
  let title = ''
  let summary = ''
  let content = ''
  const tags: string[] = []
  const keyPoints: string[] = []

  let currentSection = ''
  let contentLines: string[] = []

  for (const line of lines) {
    const trimmedLine = line.trim()
    
    if (trimmedLine.startsWith('TITLE:')) {
      title = trimmedLine.replace('TITLE:', '').trim()
    } else if (trimmedLine.startsWith('SUMMARY:')) {
      summary = trimmedLine.replace('SUMMARY:', '').trim()
    } else if (trimmedLine.startsWith('KEY_POINTS:')) {
      currentSection = 'key_points'
    } else if (trimmedLine.startsWith('TAGS:')) {
      currentSection = 'tags'
      const tagsLine = trimmedLine.replace('TAGS:', '').trim()
      if (tagsLine) {
        tags.push(...tagsLine.split(',').map(tag => tag.trim()))
      }
    } else if (trimmedLine.startsWith('CONTENT:')) {
      currentSection = 'content'
    } else if (currentSection === 'key_points' && trimmedLine.startsWith('-')) {
      keyPoints.push(trimmedLine.replace('-', '').trim())
    } else if (currentSection === 'content') {
      contentLines.push(line)
    }
  }

  content = contentLines.join('\n').trim()

  // Calculate estimated read time (average reading speed: 200 words per minute)
  const wordCount = content.split(/\s+/).length
  const estimatedReadTime = Math.ceil(wordCount / 200)

  return {
    title: title || `Generated ${options.type} about ${options.topic}`,
    content: content || response,
    summary: summary || 'AI-generated content about ' + options.topic,
    tags: tags.length > 0 ? tags : [options.topic, options.type, 'financial education'],
    estimatedReadTime,
    difficulty: options.difficulty || 'beginner',
    keyPoints: keyPoints.length > 0 ? keyPoints : ['Key points will be generated with content']
  }
}

export async function generateContentIdeas(topic: string, count: number = 5): Promise<string[]> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.3-chat-latest",
      messages: [
        {
          role: "system",
          content: "You are a financial education content strategist. Generate creative and engaging content ideas."
        },
        {
          role: "user",
          content: `Generate ${count} unique content ideas about ${topic}. Each idea should be a catchy title that would appeal to people interested in financial education. Return only the ideas, one per line.`
        }
      ],
      temperature: 0.8,
      max_tokens: 500,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No ideas generated')
    }

    return response.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .slice(0, count)
  } catch (error: any) {
    console.error('OpenAI API error:', error)
    
    // Handle quota exceeded gracefully
    if (error.message?.includes('quota') || error.code === 'insufficient_quota') {
      // Return fallback ideas
      return generateFallbackIdeas(topic, count)
    }
    
    throw new Error('Failed to generate content ideas')
  }
}

function generateFallbackIdeas(topic: string, count: number): string[] {
  const fallbackIdeas = [
    `${topic}: A Beginner's Guide to Success`,
    `5 Common ${topic} Mistakes to Avoid`,
    `How ${topic} Can Transform Your Financial Future`,
    `The Ultimate ${topic} Strategy Guide`,
    `${topic} Myths Debunked: What Really Works`,
    `Master ${topic} in 30 Days: A Step-by-Step Plan`,
    `The Psychology Behind Successful ${topic}`,
    `${topic} for Busy Professionals: Time-Saving Tips`,
    `Building Wealth Through Smart ${topic}`,
    `${topic} Secrets the Experts Won't Tell You`
  ]
  
  return fallbackIdeas
    .filter(idea => idea.toLowerCase().includes(topic.toLowerCase()))
    .slice(0, count)
    .concat(fallbackIdeas.slice(0, count - fallbackIdeas.filter(idea => idea.toLowerCase().includes(topic.toLowerCase())).length))
    .slice(0, count)
}

export async function improveContent(content: string, focus: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.3-chat-latest",
      messages: [
        {
          role: "system",
          content: "You are an expert content editor specializing in financial education. Improve content while maintaining the original meaning and voice."
        },
        {
          role: "user",
          content: `Please improve the following content focusing on ${focus}. Make it more engaging, clear, and impactful while maintaining the core message:\n\n${content}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    return completion.choices[0]?.message?.content || content
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw new Error('Failed to improve content')
  }
}

export async function generateQuizQuestions(topic: string, difficulty: string, count: number = 10): Promise<any[]> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.3-chat-latest",
      messages: [
        {
          role: "system",
          content: "You are an educational assessment expert creating quiz questions for financial education."
        },
        {
          role: "user",
          content: `Create ${count} multiple-choice quiz questions about ${topic} at ${difficulty} level. For each question, provide 4 options (A, B, C, D) with one correct answer. Include a brief explanation for why the correct answer is right. Format as JSON array with structure: [{question, options: {A, B, C, D}, correct_answer, explanation}]`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No quiz questions generated')
    }

    try {
      return JSON.parse(response)
    } catch (parseError) {
      throw new Error('Failed to parse quiz questions')
    }
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw new Error('Failed to generate quiz questions')
  }
}
