import { sql, getSql } from "@/lib/db"
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email')
    const courseId = request.nextUrl.searchParams.get('courseId')

    if (!email || !courseId) {
      return NextResponse.json(
        { error: 'Email and courseId parameters are required' },
        { status: 400 }
      )
    }

    
    // Get user's progress for this course
    const progress = await sql(`
      SELECT 
        COALESCE(SUM(CASE WHEN completed_lessons @> ARRAY[l.id]::integer[] THEN 1 ELSE 0 END), 0)::integer as completed_lessons,
        COUNT(l.id)::integer as total_lessons,
        ROUND(
          COALESCE(SUM(CASE WHEN completed_lessons @> ARRAY[l.id]::integer[] THEN 1 ELSE 0 END), 0)::numeric / 
          NULLIF(COUNT(l.id), 0) * 100, 0
        )::integer as progress_percentage
      FROM lessons l
      LEFT JOIN (
        SELECT 
          id,
          CAST(
            STRING_TO_ARRAY(
              COALESCE(SUBSTRING(activity_data::text FROM '"completed_lessons":\[(.*?)\]'), ''),
              ','
            ) AS integer[]
          ) as completed_lessons
        FROM user_activity
        WHERE user_id = (SELECT id FROM users WHERE email = $1)
          AND activity_type = 'lesson_completed'
      ) ua ON true
      WHERE l.course_id = $2
    `, [email, courseId])

    const result = progress[0] || {
      completed_lessons: 0,
      total_lessons: 0,
      progress_percentage: 0,
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('[v0] Error fetching course progress:', error)
    return NextResponse.json(
      { 
        completed_lessons: 0,
        total_lessons: 0,
        progress_percentage: 0,
        error: 'Failed to fetch progress'
      },
      { status: 200 } // Return 200 with default values on error
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, courseId, lessonId } = body

    if (!email || !courseId || !lessonId) {
      return NextResponse.json(
        { error: 'Email, courseId, and lessonId are required' },
        { status: 400 }
      )
    }

    const sql = getSql()

    // Record lesson completion
    const user = await sql('SELECT id FROM users WHERE email = $1', [email])

    if (user.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const userId = user[0].id

    // Insert or update activity
    await sql(`
      INSERT INTO user_activity (user_id, activity_type, activity_data, created_at)
      VALUES ($1, 'lesson_completed', jsonb_build_object('course_id', $2, 'lesson_id', $3), NOW())
      ON CONFLICT DO NOTHING
    `, [userId, courseId, lessonId])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[v0] Error recording progress:', error)
    return NextResponse.json(
      { error: 'Failed to record progress' },
      { status: 500 }
    )
  }
}
