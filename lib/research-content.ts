import OpenAI from 'openai'

let _openai: OpenAI | null = null

function getOpenAI() {
  if (!_openai) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set')
    }
    _openai = new OpenAI({ apiKey })
  }
  return _openai
}

export interface ResearchedContent {
  title: string
  content: string
  summary: string
  keyTakeaways: string[]
  sources: Array<{
    title: string
    url?: string
    type: 'research' | 'study' | 'data' | 'expert' | 'case_study'
  }>
  statistics: Array<{
    stat: string
    source: string
  }>
  tags: string[]
  estimatedReadTime: number
}

/**
 * Generate deeply researched articles with citations and data
 */
export async function generateResearchedArticle(topic: string, options: {
  subtopics?: string[]
  includeStatistics?: boolean
  includeExpertInsights?: boolean
  wordCount?: number
} = {}): Promise<ResearchedContent> {
  try {
    const {
      subtopics = [],
      includeStatistics = true,
      includeExpertInsights = true,
      wordCount = 2500
    } = options

    const subtopicsList = subtopics.length > 0 
      ? `\n\nCover these specific subtopics:\n${subtopics.map(s => `- ${s}`).join('\n')}`
      : ''

    const prompt = `
You are a thorough research journalist. Create an EXTENSIVELY RESEARCHED article about: ${topic}${subtopicsList}

CRITICAL REQUIREMENTS:

1. DEPTH & RESEARCH:
   - Cite specific studies, research, data points, and expert insights
   - Include at least 5-7 credible sources
   - Reference statistics and percentages with context
   - Mention relevant industry experts or thought leaders
   - Include real-world case studies or examples

2. STRUCTURE:
   - Compelling introduction with context
   - 4-5 major sections with subsections
   - Each section should include:
     * Key concepts explained clearly
     * Supporting data or statistics
     * Real-world applications
     * Expert perspective or quote (attributed)
     * Actionable insights
   - Conclusion with takeaways and future implications

3. STATISTICS & DATA:
   - Include at least 3-5 specific statistics with attributed sources
   - Use percentages, numbers, growth rates
   - Provide context for each statistic
   - Example: "According to XYZ Study 2024: X% of professionals..."

4. CITATIONS:
   - Provide at least 6-8 specific sources
   - Include report names, research institutions, years
   - Mention author names when available
   - Example: "As documented in the MIT 2024 Tech Trends Report by Dr. Jane Smith..."

5. EXPERT INSIGHTS:
   - Include perspective from recognized experts
   - Quote them or reference their published work
   - Provide context for why their perspective matters
   - Example: "Industry expert Dr. John Doe from Stanford University notes that..."

6. TONE: Professional, authoritative, data-driven, yet accessible
   - Complex concepts explained simply
   - Balanced perspective
   - Evidence-based claims
   - Practical relevance maintained

7. LENGTH: Aim for ${wordCount} words
   - Detailed exploration with substance
   - No fluff, every section adds value
   - Include "Further Reading" section with 5+ resources

FORMAT YOUR RESPONSE EXACTLY AS:
TITLE: [Compelling, specific title]
SUMMARY: [2-3 paragraph executive summary with key findings]
KEY_TAKEAWAYS: [8-10 actionable bullets from the research]
SOURCES: [List in format: TITLE | TYPE (research/study/data/expert/case_study) | CONTEXT]
STATISTICS: [List as: STAT | SOURCE | YEAR]
TAGS: [8-10 relevant tags]
CONTENT: [Full researched article with sections clearly marked]
READING_TIME: [Estimated minutes]
`

    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `You are a meticulous research journalist with expertise in creating comprehensive, well-sourced articles. You cite specific studies, data, and expert insights. You structure information clearly with multiple layers of detail. You provide context for all statistics and claims. You include real-world applications and actionable insights. Your goal is to create articles that are both deeply researched and highly readable.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 5000,
    })

    const response = completion.choices[0]?.message?.content || ''
    return parseResearchedContent(response, topic)
  } catch (error: any) {
    console.error('Research article generation error:', error)
    throw new Error('Failed to generate researched article')
  }
}

/**
 * Generate data-driven educational content
 */
export async function generateDataDrivenLearningPath(topic: string, targetAudience: string): Promise<ResearchedContent> {
  try {
    const prompt = `
Create a DEEPLY DETAILED, DATA-DRIVEN learning path about: ${topic}
Target audience: ${targetAudience}

REQUIREMENTS:
1. Structure as 6-8 progressive modules
2. Each module must include:
   - Clear learning objectives
   - Key concepts with explanations
   - Supported by research/data where applicable
   - Practical exercises with real scenarios
   - Resources and further reading
   - Assessment/reflection questions

3. Include statistics and research:
   - Current market data
   - Industry trends
   - Success metrics
   - Case studies showing outcomes

4. Real-world applications:
   - How professionals use this knowledge
   - Industry examples
   - Success stories with metrics
   - Common challenges and solutions

5. Expert insights:
   - Reference thought leaders
   - Include recommended resources from experts
   - Best practices backed by research

FORMAT:
TITLE: [Clear, descriptive title]
SUMMARY: [What learners will achieve]
KEY_TAKEAWAYS: [Main learning objectives]
MODULES: [Detailed module breakdowns]
RESOURCES: [Recommended readings/tools]
CONTENT: [Full learning path]
`

    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert learning designer who creates comprehensive, research-backed educational content. You structure information progressively, include real data and case studies, and always provide actionable learning outcomes."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4500,
    })

    const response = completion.choices[0]?.message?.content || ''
    return parseResearchedContent(response, topic)
  } catch (error: any) {
    console.error('Learning path generation error:', error)
    throw new Error('Failed to generate learning path')
  }
}

/**
 * Generate comprehensive case studies with data and results
 */
export async function generateDataDrivenCaseStudy(topic: string, context: string): Promise<ResearchedContent> {
  try {
    const prompt = `
Create a COMPREHENSIVE CASE STUDY about: ${topic}
Context: ${context}

STRUCTURE:
1. EXECUTIVE SUMMARY: Headline results and impact with metrics

2. BACKGROUND:
   - Industry context with market data
   - Challenge specifics with quantified problems
   - Market research supporting the problem

3. SOLUTION APPROACH:
   - Specific strategies implemented
   - Resources allocated
   - Timeline
   - Research/best practices informing the approach

4. IMPLEMENTATION:
   - Phase-by-phase breakdown with metrics
   - Month-by-month progression
   - Challenges encountered with solutions
   - Specific tactical decisions

5. RESULTS:
   - Quantified outcomes with before/after comparisons
   - ROI calculations
   - Performance metrics
   - Unexpected benefits

6. LESSONS LEARNED:
   - Key insights with supporting data
   - What worked and why
   - What didn't work and why
   - Replicable principles

7. INDUSTRY IMPACT:
   - How results compare to industry benchmarks
   - Unique advantages achieved
   - Competitive positioning

INCLUDE:
- Specific numbers and percentages throughout
- Industry benchmarks for comparison
- Expert validation where applicable
- Research supporting each claim
- Actionable principles others can apply

FORMAT:
TITLE: [Specific case study title]
SUMMARY: [Key results in metrics]
KEY_TAKEAWAYS: [Replicable principles]
METRICS: [Quantified before/after results]
SOURCES: [Research and benchmarks used]
CONTENT: [Full case study narrative]
`

    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "You are a business analyst who creates detailed case studies with specific metrics, data, and measurable outcomes. You include before/after comparisons, ROI analysis, and industry benchmarks. Every claim is supported by specific numbers and research."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4500,
    })

    const response = completion.choices[0]?.message?.content || ''
    return parseResearchedContent(response, topic)
  } catch (error: any) {
    console.error('Case study generation error:', error)
    throw new Error('Failed to generate case study')
  }
}

/**
 * Parse generated content into structured format
 */
function parseResearchedContent(content: string, topic: string): ResearchedContent {
  const lines = content.split('\n')
  let title = ''
  let summary = ''
  let keyTakeaways: string[] = []
  let sources: any[] = []
  let statistics: any[] = []
  let tags: string[] = []
  let fullContent = ''
  let readTime = 8

  let currentSection = ''
  let currentContent = ''

  for (const line of lines) {
    if (line.startsWith('TITLE:')) {
      title = line.replace('TITLE:', '').trim()
    } else if (line.startsWith('SUMMARY:')) {
      currentSection = 'summary'
      summary = line.replace('SUMMARY:', '').trim()
    } else if (line.startsWith('KEY_TAKEAWAYS:')) {
      currentSection = 'takeaways'
    } else if (line.startsWith('SOURCES:')) {
      currentSection = 'sources'
    } else if (line.startsWith('STATISTICS:')) {
      currentSection = 'statistics'
    } else if (line.startsWith('TAGS:')) {
      currentSection = 'tags'
      const tagLine = line.replace('TAGS:', '').trim()
      tags = tagLine.split(',').map(t => t.trim()).filter(t => t)
    } else if (line.startsWith('READING_TIME:')) {
      const timeStr = line.replace('READING_TIME:', '').trim()
      readTime = parseInt(timeStr) || 8
    } else if (line.startsWith('CONTENT:')) {
      currentSection = 'content'
    } else if (line.trim()) {
      if (currentSection === 'takeaways' && line.trim().startsWith('-')) {
        keyTakeaways.push(line.trim().substring(1).trim())
      } else if (currentSection === 'sources' && line.trim().startsWith('-')) {
        const sourceLine = line.trim().substring(1).trim()
        const parts = sourceLine.split('|').map(p => p.trim())
        if (parts.length >= 2) {
          sources.push({
            title: parts[0],
            type: parts[1] || 'research',
            url: parts[2] || undefined
          })
        }
      } else if (currentSection === 'statistics' && line.trim().startsWith('-')) {
        const statLine = line.trim().substring(1).trim()
        const parts = statLine.split('|').map(p => p.trim())
        if (parts.length >= 2) {
          statistics.push({
            stat: parts[0],
            source: parts[1]
          })
        }
      } else if (currentSection === 'content') {
        currentContent += line + '\n'
      } else if (currentSection === 'summary') {
        summary += '\n' + line
      }
    }
  }

  fullContent = currentContent.trim() || content

  return {
    title: title || `Comprehensive Guide to ${topic}`,
    content: fullContent,
    summary: summary.trim(),
    keyTakeaways,
    sources,
    statistics,
    tags: tags.length > 0 ? tags : [topic.toLowerCase(), 'research', 'detailed'],
    estimatedReadTime: readTime
  }
}
