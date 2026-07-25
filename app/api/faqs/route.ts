import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    let query = `SELECT id, question, answer, category, order_index 
                 FROM faqs WHERE is_active = true`
    const params: any[] = []

    if (category) {
      query += ` AND category = $1`
      params.push(category)
    }

    query += ` ORDER BY order_index ASC, category ASC`

    const faqs = await sql(query, params)

    // Group by category
    const grouped: Record<string, any[]> = {}
    faqs.forEach((faq: any) => {
      if (!grouped[faq.category]) {
        grouped[faq.category] = []
      }
      grouped[faq.category].push(faq)
    })

    return NextResponse.json({ faqs, grouped })
  } catch (error: any) {
    console.error("[v0] Failed to fetch FAQs:", error.message)
    return NextResponse.json({ error: "Failed to fetch FAQs" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { question, answer, category, order_index } = await request.json()

    if (!question || !answer) {
      return NextResponse.json({ error: "Question and answer are required" }, { status: 400 })
    }

    const result = await sql(
      `INSERT INTO faqs (question, answer, category, order_index, is_active)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id, created_at`,
      [question, answer, category || "General", order_index || 0]
    )

    return NextResponse.json(
      { success: true, faqId: result[0].id },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("[v0] Failed to create FAQ:", error.message)
    return NextResponse.json({ error: "Failed to create FAQ" }, { status: 500 })
  }
}
