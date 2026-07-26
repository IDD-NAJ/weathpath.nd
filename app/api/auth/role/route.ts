import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

/**
 * GET /api/auth/role
 * Returns the authenticated user's role so the client can route accordingly.
 * Called by the login page and SSO callback after sign-in completes.
 */
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ role: null }, { status: 401 })
    }
    return NextResponse.json({ role: user.role })
  } catch {
    return NextResponse.json({ role: null }, { status: 500 })
  }
}
