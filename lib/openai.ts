import OpenAI from 'openai'
import { findRelevantImage, downloadImage, generateImageFilename, PixabayImage } from './pixabay'

let _openai: OpenAI | null = null

function getOpenAI() {
  if (!_openai) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY environment variable is not set. Please ensure it's configured in your deployment environment."
      )
    }
    _openai = new OpenAI({ apiKey })
  }
  return _openai
}

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
    
    const completion = await getOpenAI().chat.completions.create({
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
      title: `From Struggle to Success: How ${options.topic} Changed Everything`,
      content: `# WHO: Meet Michael Chen
Michael is a 34-year-old software engineer living in Portland with his wife Jessica and two young children. Before discovering ${options.topic}, he earned a solid six-figure salary but felt completely disconnected from his money and constantly anxious about the future.

# THE BEFORE: A Crisis of Confidence
Three years ago, Michael was earning $150,000 annually but had less than $10,000 in savings. He was spending every dollar that came in—mortgage, cars, kids' activities, dining out. The wake-up call came when his company announced potential layoffs. "I realized I had zero financial security," Michael recalls. "I could lose my job tomorrow and everything would crumble. That terrified me."

# THE DISCOVERY: A Turning Point
A colleague mentioned ${options.topic} and recommended starting with just one course. "I was skeptical at first," Michael admits. "I thought, 'I already know about money.' But I was wrong. I didn't know HOW to think about money strategically." He committed to learning the fundamentals and spent the first month simply understanding the core concepts.

# THE JOURNEY: Building Momentum Month by Month
**Months 1-2: Foundation** - Michael created a detailed budget for the first time in his life. He was shocked to discover he was spending $2,400/month on restaurants and subscriptions he didn't need. He cut this ruthlessly.

**Months 3-4: Emergency Fund** - Using the money from his cuts, Michael built a 6-month emergency fund ($30,000). "This single action reduced my anxiety by 80%," he says. "I finally felt safe."

**Months 5-8: Strategic Implementation** - Michael learned how to implement ${options.topic} principles properly. He reduced expenses further, negotiated his mortgage, and redirected savings into investments.

**Months 9-18: Acceleration** - By month 9, Michael was saving $4,000/month consistently. His investments started compounding. He and Jessica began planning their next moves.

**Months 18-36: Life Change** - After 18 months of disciplined execution, Michael had accumulated $72,000 in investments and paid off $50,000 of his mortgage principal early. His investment portfolio was generating passive income of $300/month.

# CHALLENGES OVERCOME: It Wasn't Perfect
Michael faced real obstacles:
- **Family resistance**: Jessica was initially skeptical about the aggressive saving. "Communication was key," Michael says. "I had to show her the plan and the results."
- **Temptation to spend**: "When I got a promotion, every instinct told me to upgrade our lifestyle. Instead, I increased savings by 40%."
- **Complexity of investing**: Michael took extra time learning about index funds and diversification. "I attended three webinars before I felt confident pulling the trigger."

# THE RESULTS: Numbers That Matter
After 36 months of focused ${options.topic} implementation:
- Emergency fund: $30,000 (6 months expenses)
- Investment portfolio: $72,000 (growing at 8-10% annually)
- Mortgage principal paid down: $50,000 extra
- Monthly passive income: $300-400
- Career progress: Gained confidence to negotiate 15% raise (now earning $172,500)
- Financial anxiety: Decreased from 10/10 to 2/10

"More importantly," Michael notes, "we're on track to achieve financial independence by age 50. That's only 16 years away instead of never."

# HARD-WON WISDOM: What Michael Would Tell You
1. "Start with ONE thing, not everything. I focused on ${options.topic} for the first 6 months before adding other strategies."
2. "Your financial situation won't change unless your HABITS change. The strategy matters less than the execution."
3. "Tell someone. Share your goals with your spouse, partner, or close friend. Accountability is everything."
4. "Celebrate milestones. When I hit $30,000 in investments, I felt genuinely proud. That feeling fueled the next phase."
5. "This isn't about deprivation. I still enjoy life—I just make intentional choices instead of automatic ones."

# BEYOND THE NUMBERS: What Really Changed
Michael reflects, "The financial improvement is real and measurable, but the psychological shift is bigger. I went from feeling like a victim of circumstances to feeling like the architect of my own future. I sleep better. I have better conversations with Jessica. I'm more present with my kids because I'm not stressed about money."

His advice to anyone considering this journey: "You're probably further behind than you think, but also closer to success than you realize. It took me 36 months to achieve what seemed impossible 3 years ago. Your journey starts the moment you decide to take control."`,
      summary: `Michael Chen transformed from paycheck-to-paycheck to financially secure in 3 years using ${options.topic}. He built a $72,000 investment portfolio, eliminated anxiety, and positioned himself for early retirement—all while maintaining his quality of life.`,
      keyPoints: [
        'Starting point: 6-figure income but zero financial security and constant anxiety',
        'First breakthrough: Building a 6-month emergency fund reduced anxiety by 80%',
        'Systematic execution: Implemented ${options.topic} over 36 months with measurable milestones',
        'Results: $72,000 invested, $50,000 mortgage paid down, $300-400 monthly passive income',
        'Biggest lesson: Behavior change matters more than strategy—results follow execution',
        'Timeline perspective: 36 months from crisis to confidence to financial independence planning'
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
    article: `Write an EXTENSIVELY RESEARCHED AND DETAILED article about ${topic}. 
    CRITICAL: Include specific data, statistics, research citations, and expert insights.
    Structure:
    - Compelling introduction with market context
    - 4-5 detailed sections with subsections
    - Include at least 5-7 specific data points or statistics with sources
    - Reference industry experts or thought leaders
    - Include real-world case studies or examples
    - Each section should have: concept explanation, data support, real applications, expert insight, actionable takeaways
    - Conclusion with future implications and key learnings
    Length: 2000+ words of substantive, research-backed content
    Tone: Professional, authoritative, data-driven yet accessible
    Include specific numbers, percentages, growth rates, and attributed sources throughout.`,
    story: `Write a detailed, inspirational success story about someone who achieved financial success related to ${topic}. Structure it as follows:
    - WHO: Full character details (profession, age range, background, challenges)
    - BEFORE: Specific financial situation before (numbers, struggles, mindset)
    - DISCOVERY: How they discovered ${topic} and what motivated them
    - JOURNEY: Month-by-month or step-by-step progression with specific milestones
    - CHALLENGES: Real obstacles faced and how they overcame them
    - RESULTS: Concrete financial results, income generated, or goals achieved (with numbers)
    - ADVICE: Specific actionable tips they would give others
    - IMPACT: How this changed their life beyond finances
    Make it extremely detailed, specific, relatable, and motivating with real-world scenarios.`,
    learning_path: `Create a COMPREHENSIVE, DATA-DRIVEN learning path about ${topic}. Break it down into 6-8 progressive modules with:
    - Clear, measurable learning objectives
    - Key concepts supported by research and real data
    - Industry statistics and market trends
    - Real-world case studies showing outcomes
    - Practical exercises based on professional scenarios
    - Resources and recommended readings from experts
    - Assessment questions and reflection exercises
    Include specific industry benchmarks, success metrics, and expert-backed best practices throughout.`,
    quiz: `Create a COMPREHENSIVE, RESEARCH-BASED quiz about ${topic}. Include:
    - 12-15 questions of varying difficulty (beginner to advanced)
    - Each question based on real industry data, best practices, or case studies
    - Multiple choice answers with clear correct/incorrect distinctions
    - Detailed explanations for each answer citing relevant concepts
    - Statistical or data context for questions
    - Industry application scenarios
    - Scoring rubric with performance interpretation
    - References to resources for further learning`
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
    const completion = await getOpenAI().chat.completions.create({
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
    const completion = await getOpenAI().chat.completions.create({
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

export async function generateDetailedStory(options: any): Promise<GeneratedContent> {
  try {
    const { topic, difficulty = 'beginner', tone = 'inspirational', audience = 'general', storyFocus = 'transformation', storyIncome = 'moderate', length = 'long' } = options
    
    const incomeDetails = {
      modest: '$500-$2,000/month',
      moderate: '$2,000-$5,000/month',
      high: '$5,000-$10,000/month',
      exceptional: '$10,000+/month'
    }

    const focusDetails = {
      transformation: 'complete financial transformation from paycheck-to-paycheck to financial security',
      career_pivot: 'career change or diversification related to the topic',
      side_hustle: 'building passive or active income alongside main job',
      investment: 'investment growth and compounding wealth'
    }

    const prompt = `
Create an EXTREMELY DETAILED, HIGHLY SPECIFIC success story about someone who achieved ${focusDetails[storyFocus as keyof typeof focusDetails]} through ${topic}.

CRITICAL REQUIREMENTS:
1. PERSONA: Create a realistic, detailed character with:
   - Full name and age
   - Specific job title and industry
   - Location/context that feels real
   - Relatable background challenges
   - Family situation or personal context

2. THE BEFORE STATE: Show the problem vividly:
   - Specific numbers: salary, debt, savings, monthly expenses
   - Emotional state and specific fears
   - What prompted the change
   - Concrete examples of financial struggles

3. THE JOURNEY: Month-by-month or quarter-by-quarter progression:
   - Specific milestones with dates
   - Exact dollar amounts achieved at each stage
   - Real obstacles and how they were overcome
   - Specific decisions and their consequences
   - Small wins that built momentum
   - Timeline should span 12-36 months minimum

4. DETAILED IMPLEMENTATION:
   - Specific strategies used related to ${topic}
   - Tools, apps, or resources they used
   - How much time they invested
   - Key insights or "aha moments"
   - What surprised them about the process

5. REAL RESULTS: Concrete numbers:
   - Income generated or saved: approximately ${incomeDetails[storyIncome as keyof typeof incomeDetails]}/month
   - Assets accumulated (specific amounts)
   - Debts paid off
   - Lifestyle improvements
   - Impact on family/relationships

6. WISDOM SECTION: 5-7 specific actionable tips:
   - What they would tell beginners
   - Common mistakes they almost made
   - Mindset shifts that helped
   - Specific resources they recommend

7. EMOTIONAL IMPACT: Beyond numbers:
   - How it changed their confidence
   - Relationship improvements
   - Life choices now possible
   - Why they share their story

TONE: ${tone}, authentic, specific, inspiring but realistic
AUDIENCE: ${audience}
LENGTH: ${length} (1500-2500 words minimum for detailed stories)

Format your response exactly as:
TITLE: [compelling title]
SUMMARY: [2-3 sentence executive summary]
KEY_POINTS: [8-10 detailed bullet points]
TAGS: [7-10 relevant tags]
CONTENT: [Full detailed story with sections clearly marked with headers and formatting]
`

    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "You are a master storyteller specializing in authentic, detailed, inspirational success stories. Your stories are specific, emotional, and deeply relatable. You include exact numbers, timelines, and personal details that make stories feel real and achievable. You structure stories to show the before, the journey, the obstacles overcome, and the transformation."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 4000,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No story generated')
    }

    return parseGeneratedContent(response, options)
  } catch (error: any) {
    console.error('Story generation error:', error)
    
    if (error.message?.includes('quota') || error.code === 'insufficient_quota') {
      return generateFallbackContent(options)
    }
    
    throw new Error('Failed to generate detailed story')
  }
}

export async function generateQuizQuestions(topic: string, difficulty: string, count: number = 10): Promise<any[]> {
  try {
    const completion = await getOpenAI().chat.completions.create({
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
