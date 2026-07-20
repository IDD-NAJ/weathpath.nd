import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { generateContent, generateContentIdeas, improveContent, generateQuizQuestions, generateDetailedStory } from "@/lib/openai"
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, ...params } = body

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      )
    }

    let result

    switch (action) {
      case 'generate':
        // Use specialized story generator for stories
        if (params.type === 'story') {
          result = await generateDetailedStory(params)
        } else {
          result = await generateContent(params)
        }
        break
      
      case 'ideas':
        result = await generateContentIdeas(params.topic, params.count)
        break
      
      case 'improve':
        result = await improveContent(params.content, params.focus)
        break
      
      case 'quiz':
        result = await generateQuizQuestions(params.topic, params.difficulty, params.count)
        break
      
      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error("AI generation error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate content" },
      { status: 500 }
    )
  }
}
