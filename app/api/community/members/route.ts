import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    const members = await sql(
      "SELECT id, email, name, bio, joined_at FROM community_members ORDER BY joined_at DESC LIMIT 50"
    )
    return NextResponse.json({ members })
  } catch (error: any) {
    console.error("[v0] Failed to fetch members:", error.message)
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    const sql = neon(process.env.DATABASE_URL!)
    
    // Check if member exists
    const existing = await sql(
      "SELECT id FROM community_members WHERE email = $1",
      [email]
    )

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Member already exists", memberId: existing[0].id },
        { status: 409 }
      )
    }

    // Create new member
    const result = await sql(
      "INSERT INTO community_members (email, name) VALUES ($1, $2) RETURNING id, email, name, joined_at",
      [email, name || "Community Member"]
    )

    return NextResponse.json({ member: result[0] }, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Failed to create member:", error.message)
    return NextResponse.json(
      { error: "Failed to create member" },
      { status: 500 }
    )
  }
}
