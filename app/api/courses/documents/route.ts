import { NextResponse, type NextRequest } from "next/server"
import { get } from "@vercel/blob"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { verifyPurchaseAccess } from "@/lib/purchase-service"

async function hasAccess(courseId: number, email?: string | null): Promise<boolean> {
  const user = await getCurrentUser()
  if (user?.role === "admin") return true
  if (user) {
    const byUser = await verifyPurchaseAccess(courseId, user.email, user.id)
    if (byUser) return true
  }
  if (email) {
    return verifyPurchaseAccess(courseId, email)
  }
  return false
}

// GET /api/courses/documents?courseId=1[&email=...]        — list purchased documents
// GET /api/courses/documents?courseId=1&documentId=...[&email=...] — download a document
export async function GET(request: NextRequest) {
  const courseId = Number(request.nextUrl.searchParams.get("courseId"))
  const documentId = request.nextUrl.searchParams.get("documentId")
  const email = request.nextUrl.searchParams.get("email")

  if (!courseId) {
    return NextResponse.json({ error: "Missing courseId" }, { status: 400 })
  }

  const allowed = await hasAccess(courseId, email)
  if (!allowed) {
    return NextResponse.json({ error: "Purchase required" }, { status: 403 })
  }

  try {
    if (documentId) {
      const rows = await sql`
        SELECT file_url, file_name, file_type FROM course_documents
        WHERE id = ${documentId} AND course_id = ${courseId}
      `
      if (rows.length === 0) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 })
      }

      const result = await get(rows[0].file_url, { access: "private" })
      if (!result) {
        return NextResponse.json({ error: "File not found" }, { status: 404 })
      }

      return new NextResponse(result.stream, {
        headers: {
          "Content-Type": rows[0].file_type || "application/octet-stream",
          "Content-Disposition": `attachment; filename="${rows[0].file_name.replace(/"/g, "")}"`,
          "Cache-Control": "private, no-cache",
        },
      })
    }

    const docs = await sql`
      SELECT id, file_name, file_type, file_size, created_at
      FROM course_documents WHERE course_id = ${courseId} ORDER BY created_at DESC
    `
    return NextResponse.json({ documents: docs })
  } catch (error) {
    console.error("[v0] Document delivery error:", error)
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 })
  }
}
