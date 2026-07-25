import { NextResponse, type NextRequest } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

// GET /api/favorites?list=favorite|wishlist (omit for both)
export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const list = request.nextUrl.searchParams.get("list")

  try {
    const rows = list
      ? await sql`
          SELECT id, item_type, item_id, list_type, item_title, item_slug, created_at
          FROM user_favorites
          WHERE user_id = ${user.id} AND list_type = ${list}
          ORDER BY created_at DESC
        `
      : await sql`
          SELECT id, item_type, item_id, list_type, item_title, item_slug, created_at
          FROM user_favorites
          WHERE user_id = ${user.id}
          ORDER BY created_at DESC
        `
    return NextResponse.json({ items: rows })
  } catch (error) {
    console.error("[v0] Favorites GET error:", error)
    return NextResponse.json({ error: "Failed to load favorites" }, { status: 500 })
  }
}

// POST /api/favorites — toggle an item on/off a list
// body: { itemType, itemId, listType, itemTitle?, itemSlug? }
export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { itemType, itemId, listType, itemTitle, itemSlug } = await request.json()

    const validTypes = ["article", "learning_path", "success_story", "course"]
    const validLists = ["favorite", "wishlist"]
    if (!validTypes.includes(itemType) || !validLists.includes(listType) || !itemId) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const existing = await sql`
      SELECT id FROM user_favorites
      WHERE user_id = ${user.id} AND item_type = ${itemType}
        AND item_id = ${String(itemId)} AND list_type = ${listType}
    `

    if (existing.length > 0) {
      await sql`DELETE FROM user_favorites WHERE id = ${existing[0].id}`
      return NextResponse.json({ saved: false })
    }

    await sql`
      INSERT INTO user_favorites (user_id, item_type, item_id, list_type, item_title, item_slug)
      VALUES (${user.id}, ${itemType}, ${String(itemId)}, ${listType}, ${itemTitle || null}, ${itemSlug || null})
    `
    return NextResponse.json({ saved: true })
  } catch (error) {
    console.error("[v0] Favorites POST error:", error)
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }
}
