import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const discussionId = parseInt(params.id)
    
    const replies = await sql(
      `SELECT r.id, r.content, r.author_id, r.likes, r.created_at,
              m.name as author_name, m.email as author_email
       FROM community_replies r
       LEFT JOIN community_members m ON r.author_id = m.id
       WHERE r.discussion_id = $1
       ORDER BY r.created_at ASC`,
      [discussionId]
    )

    return NextResponse.json({ replies })
  } catch (error: any) {
    console.error("[v0] Failed to fetch replies:", error.message)
    return NextResponse.json(
      { error: "Failed to fetch replies" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const discussionId = parseInt(params.id)
    const { content, authorEmail } = await request.json()

    if (!content || !authorEmail) {
      return NextResponse.json(
        { error: "Content and author email are required" },
        { status: 400 }
      )
    }

    const sql = neon(process.env.DATABASE_URL!)

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

    // Create reply
    const result = await sql(
      `INSERT INTO community_replies (discussion_id, author_id, content) 
       VALUES ($1, $2, $3) 
       RETURNING id, content, author_id, likes, created_at`,
      [discussionId, authorId, content]
    )

    return NextResponse.json({ reply: result[0] }, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Failed to create reply:", error.message)
    return NextResponse.json(
      { error: "Failed to create reply" },
      { status: 500 }
    )
  }
}
