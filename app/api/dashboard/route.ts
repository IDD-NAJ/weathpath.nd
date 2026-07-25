import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const userEmail = user.email

    // Get user basic data
    const userResult = await sql`
      SELECT id, name, email, created_at FROM users WHERE email = ${userEmail}
    `
    const dbUser = userResult.rows[0]

    if (!dbUser) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Get enrolled courses with progress
    const enrolledCoursesResult = await sql`
      SELECT 
        c.id, c.title, c.slug, c.description, c.price_cents, c.cover_image,
        COALESCE(
          ROUND((COUNT(CASE WHEN lc.completed_at IS NOT NULL THEN 1 END)::float / 
          NULLIF(COUNT(l.id), 0) * 100)::numeric, 0), 0
        ) as progress
      FROM user_purchases up
      JOIN courses c ON up.course_id = c.id
      LEFT JOIN lessons l ON c.id = l.course_id
      LEFT JOIN lesson_completions lc ON l.id = lc.lesson_id AND lc.user_id = ${dbUser.id}
      WHERE up.user_email = ${userEmail}
      GROUP BY c.id, c.title, c.slug, c.description, c.price_cents, c.cover_image
      ORDER BY up.created_at DESC
    `

    // Get user reviews
    const reviewsResult = await sql`
      SELECT 
        r.id, r.title, r.rating, r.status, r.created_at,
        r.content_type as "contentType", r.content_id as "contentId",
        COALESCE(c.title, a.title, s.name) as "contentTitle"
      FROM reviews r
      LEFT JOIN courses c ON r.content_type = 'course' AND r.content_id = c.id::text
      LEFT JOIN articles a ON r.content_type = 'article' AND r.content_id = a.id::text
      LEFT JOIN success_stories s ON r.content_type = 'story' AND r.content_id = s.id::text
      WHERE r.user_id = ${dbUser.id}
      ORDER BY r.created_at DESC
      LIMIT 10
    `

    // Get certificates (courses completed with 100% progress)
    const certificatesResult = await sql`
      SELECT 
        c.id, c.title as "courseName", c.slug,
        MAX(lc.completed_at) as "earnedAt"
      FROM user_purchases up
      JOIN courses c ON up.course_id = c.id
      JOIN lessons l ON c.id = l.course_id
      JOIN lesson_completions lc ON l.id = lc.lesson_id AND lc.user_id = ${user.id}
      WHERE up.user_email = ${userEmail}
      GROUP BY c.id, c.title, c.slug
      HAVING COUNT(DISTINCT l.id) = COUNT(DISTINCT lc.id)
      ORDER BY MAX(lc.completed_at) DESC
    `

    return new Response(
      JSON.stringify({
        user: {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          createdAt: dbUser.created_at,
          streak: 0, // Can be calculated from activity logs
        },
        enrolledCourses: enrolledCoursesResult.rows,
        myReviews: reviewsResult.rows,
        certificates: certificatesResult.rows.map((cert: any) => ({
          ...cert,
          downloadUrl: `/api/certificates/${cert.id}`,
        })),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    )
  } catch (error) {
    console.error("[v0] Dashboard API error:", error)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
