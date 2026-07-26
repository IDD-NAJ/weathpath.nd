import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"

const VALID_INTERESTS = new Set([
  "Passive Income", "Investing", "Real Estate", "Digital Products",
  "Freelancing", "Dropshipping", "Affiliate Marketing", "Stock Market",
])

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: { interests?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (!Array.isArray(body.interests)) {
    return NextResponse.json({ error: "interests must be an array" }, { status: 400 })
  }

  const interests = (body.interests as string[]).filter(
    (i) => typeof i === "string" && VALID_INTERESTS.has(i)
  )

  await sql`
    UPDATE users
    SET interests = ${interests}::text[],
        updated_at = NOW()
    WHERE id = ${user.id}
  `

  return NextResponse.json({ ok: true, interests })
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rows = (await sql`
    SELECT interests FROM users WHERE id = ${user.id}
  `) as { interests: string[] }[]

  return NextResponse.json({ interests: rows[0]?.interests ?? [] })
}
