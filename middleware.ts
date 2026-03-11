import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { sql } from "@/lib/db"

const protectedRoutes = ["/dashboard"]
const adminRoutes = ["/admin"]
const authRoutes = ["/login", "/signup"]

async function getUserFromSession(sessionId: string) {
  try {
    const rows = await sql`
      SELECT u.id, u.email, u.name, u.role, u.is_active
      FROM users u
      INNER JOIN sessions s ON s.user_id = u.id
      WHERE s.id = ${sessionId}
        AND s.expires_at > NOW()
        AND u.is_active = true
    `
    return rows.length > 0 ? rows[0] : null
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("wp_session")?.value
  const { pathname } = request.nextUrl

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )
  const isAdminRoute = adminRoutes.some((route) =>
    pathname.startsWith(route)
  )
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // If accessing protected routes without session, redirect to login
  if ((isProtected || isAdminRoute) && !sessionCookie) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  // If accessing auth routes with session, redirect to dashboard
  if (isAuthRoute && sessionCookie) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  // Check admin routes for proper role
  if (isAdminRoute && sessionCookie) {
    const user = await getUserFromSession(sessionCookie)
    
    if (!user || user.role !== "admin") {
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard"
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/signup"],
}
