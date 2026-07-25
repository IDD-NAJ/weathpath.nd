import { NextResponse, type NextRequest } from "next/server"
import { put, del } from "@vercel/blob"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

async function requireAdminApi() {
  const user = await getCurrentUser()
  if (!user || user.role !== "admin") return null
  return user
}

// GET — list documents for a course
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminApi()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const docs = await sql`
    SELECT id, file_name, file_url, file_type, file_size, created_at
    FROM course_documents WHERE course_id = ${Number(id)} ORDER BY created_at DESC
  `
  return NextResponse.json({ documents: docs })
}

// POST — upload a document (PDF or other file) for a course
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminApi()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const courseId = Number(id)

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 400 })
    }

    const blob = await put(`course-documents/${courseId}/${file.name}`, file, {
      access: "private",
      addRandomSuffix: true,
    })

    const rows = await sql`
      INSERT INTO course_documents (course_id, file_name, file_url, file_type, file_size)
      VALUES (${courseId}, ${file.name}, ${blob.pathname}, ${file.type || "application/octet-stream"}, ${file.size})
      RETURNING id, file_name, file_url, file_type, file_size, created_at
    `

    return NextResponse.json({ document: rows[0] })
  } catch (error) {
    console.error("[v0] Document upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}

// DELETE — remove a document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminApi()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const { documentId } = await request.json()

  try {
    const rows = await sql`
      DELETE FROM course_documents
      WHERE id = ${documentId} AND course_id = ${Number(id)}
      RETURNING file_url
    `
    if (rows.length > 0) {
      try {
        await del(rows[0].file_url)
      } catch {
        // Blob may already be gone; DB row removal is what matters
      }
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Document delete error:", error)
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}
