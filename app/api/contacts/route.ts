import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const result = await sql(
      `INSERT INTO contacts (name, email, subject, message, status)
       VALUES ($1, $2, $3, $4, 'new')
       RETURNING id, created_at`,
      [name, email, subject, message]
    )

    return NextResponse.json({
      success: true,
      message: "Thank you for your message. We will get back to you soon!",
      contactId: result[0].id,
    }, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Failed to submit contact form:", error.message)
    return NextResponse.json({ error: "Failed to submit contact form" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    let query = "SELECT id, name, email, subject, created_at, status FROM contacts"
    const params: any[] = []

    if (status) {
      query += " WHERE status = $1"
      params.push(status)
      query += " ORDER BY created_at DESC LIMIT 100"
    } else {
      query += " ORDER BY created_at DESC LIMIT 50"
    }

    const contacts = await sql(query, params)

    return NextResponse.json({ contacts })
  } catch (error: any) {
    console.error("[v0] Failed to fetch contacts:", error.message)
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 })
  }
}
