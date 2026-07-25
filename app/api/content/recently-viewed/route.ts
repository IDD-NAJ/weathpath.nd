import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const { contentType, contentId, title } = await request.json()

    if (!contentType || !contentId) {
      return new Response(
        JSON.stringify({ error: "Missing contentType or contentId" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Get user ID
    const userResult = await sql`
      SELECT id FROM users WHERE email = ${user.email}
    `
    const dbUser = userResult.rows[0]

    if (!dbUser) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Insert or update recently viewed
    await sql`
      INSERT INTO recently_viewed (user_id, content_type, content_id, title, viewed_at)
      VALUES (${dbUser.id}, ${contentType}, ${contentId}, ${title}, NOW())
      ON CONFLICT (user_id, content_type, content_id) DO UPDATE
      SET viewed_at = NOW()
    `

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("[v0] Recently viewed error:", error)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "5")

    const userResult = await sql`
      SELECT id FROM users WHERE email = ${user.email}
    `
    const dbUser = userResult.rows[0]

    if (!dbUser) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    const result = await sql`
      SELECT content_type, content_id, title, viewed_at
      FROM recently_viewed
      WHERE user_id = ${dbUser.id}
      ORDER BY viewed_at DESC
      LIMIT ${limit}
    `

    return new Response(JSON.stringify({ items: result.rows }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("[v0] Get recently viewed error:", error)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
