import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
export const dynamic = 'force-dynamic'


export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [userProgress, recentActivity, bookmarks, quizResults, notifications] = await Promise.all([
      // User's learning progress
      sql`
        SELECT 
          up.*,
          lp.title,
          lp.description,
          lp.level,
          lp.duration,
          lp.module_count
        FROM user_progress up
        JOIN learning_paths lp ON up.learning_path_id = lp.id
        WHERE up.user_id = ${user.id}
        ORDER BY up.last_accessed DESC
      `,
      
      // Recent activity
      sql`
        SELECT activity_type, activity_data, created_at
        FROM user_activity
        WHERE user_id = ${user.id}
        ORDER BY created_at DESC
        LIMIT 10
      `,
      
      // User bookmarks
      sql`
        SELECT ub.item_type, ub.item_id, ub.created_at,
          CASE 
            WHEN ub.item_type = 'article' THEN a.title
            WHEN ub.item_type = 'learning_path' THEN lp.title
            WHEN ub.item_type = 'success_story' THEN ss.name
          END as title
        FROM user_bookmarks ub
        LEFT JOIN articles a ON ub.item_type = 'article' AND ub.item_id = a.id
        LEFT JOIN learning_paths lp ON ub.item_type = 'learning_path' AND ub.item_id = lp.id
        LEFT JOIN success_stories ss ON ub.item_type = 'success_story' AND ub.item_id = ss.id
        WHERE ub.user_id = ${user.id}
        ORDER BY ub.created_at DESC
        LIMIT 5
      `,
      
      // Quiz results
      sql`
        SELECT quiz_type, score, completed_at
        FROM user_quiz_results
        WHERE user_id = ${user.id}
        ORDER BY completed_at DESC
        LIMIT 3
      `,
      
      // Unread notifications
      sql`
        SELECT id, title, message, type, action_url, created_at
        FROM user_notifications
        WHERE user_id = ${user.id} AND is_read = false
        ORDER BY created_at DESC
        LIMIT 5
      `
    ])

    const stats = {
      totalProgress: userProgress.length,
      completedPaths: userProgress.filter(p => p.progress_percentage === 100).length,
      averageProgress: userProgress.length > 0 
        ? Math.round(userProgress.reduce((sum, p) => sum + p.progress_percentage, 0) / userProgress.length)
        : 0,
      recentActivity: recentActivity.length,
      bookmarks: bookmarks.length,
      quizTaken: quizResults.length,
      unreadNotifications: notifications.length
    }

    return NextResponse.json({
      stats,
      progress: userProgress,
      recentActivity,
      bookmarks,
      quizResults,
      notifications
    })
  } catch (error) {
    console.error('User progress API error:', error)
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 })
  }
}
