import { sql, getSql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")

    
    let query = `
      SELECT d.id, d.title, d.content, d.author_id, d.category, d.views, d.likes, d.created_at,
             m.name as author_name, m.email as author_email
      FROM community_discussions d
      LEFT JOIN community_members m ON d.author_id = m.id
    `

    const params: any[] = []
    if (category) {
      query += " WHERE d.category = $1"
      params.push(category)
    }

    query += " ORDER BY d.created_at DESC LIMIT $" + (params.length + 1) + " OFFSET $" + (params.length + 2)
    params.push(limit, offset)

    const discussions = await sql(query, params)
    const countResult = await sql("SELECT COUNT(*) as count FROM community_discussions")
    const total = countResult[0]?.count || 0

    return NextResponse.json({ discussions, total, limit, offset })
  } catch (error: any) {
    console.error("[v0] Failed to fetch discussions:", error.message)
    return NextResponse.json(
      { error: "Failed to fetch discussions" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { title, content, authorEmail, category } = await request.json()

    if (!title || !content || !authorEmail) {
      return NextResponse.json(
        { error: "Title, content, and author email are required" },
        { status: 400 }
      )
    }

    const sql = getSql()

    // Get or create author
    const members = await sql(
      "SELECT id FROM community_members WHERE email = $1",
      [authorEmail]
    )

    let authorId: number
    if (members.length > 0) {
      authorId = members[0].id
    } else {
      const newMember = await sql(
        "INSERT INTO community_members (email, name) VALUES ($1, $2) RETURNING id",
        [authorEmail, authorEmail.split("@")[0]]
      )
      authorId = newMember[0].id
    }

    // Create discussion
    const result = await sql(
      `INSERT INTO community_discussions (title, content, author_id, category) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, title, content, author_id, category, views, likes, created_at`,
      [title, content, authorId, category || "general"]
    )

    return NextResponse.json({ discussion: result[0] }, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Failed to create discussion:", error.message)
    return NextResponse.json(
      { error: "Failed to create discussion" },
      { status: 500 }
    )
  }
}
