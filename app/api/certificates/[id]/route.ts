import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Get course info
    const courseResult = await sql`
      SELECT title, id FROM courses WHERE id = ${params.id}
    `
    const course = courseResult.rows[0]

    if (!course) {
      return new Response(JSON.stringify({ error: "Course not found" }), {
        status: 404,
      })
    }

    // Verify user completed the course
    const completionResult = await sql`
      SELECT COUNT(*) as total_lessons, COUNT(lc.id) as completed_lessons
      FROM lessons l
      LEFT JOIN lesson_completions lc ON l.id = lc.lesson_id AND lc.user_id = (SELECT id FROM users WHERE email = ${session.user.email})
      WHERE l.course_id = ${params.id}
    `

    const completion = completionResult.rows[0]
    if (!completion || completion.completed_lessons !== completion.total_lessons) {
      return new Response(JSON.stringify({ error: "Course not completed" }), {
        status: 403,
      })
    }

    // Generate certificate as JSON (can be rendered to PDF client-side or via service)
    return new Response(
      JSON.stringify({
        recipient: session.user.name || session.user.email,
        course: course.title,
        completedDate: new Date().toISOString(),
        certificateId: `CERT-${params.id}-${Date.now()}`,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="certificate-${course.title}.json"`,
        },
      }
    )
  } catch (error) {
    console.error("[v0] Certificate API error:", error)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    })
  }
}
