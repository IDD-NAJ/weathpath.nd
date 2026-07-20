import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
export const dynamic = 'force-dynamic'


export async function GET() {
  try {
    await requireAdmin()

    const [
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      totalProgress,
      completedPaths,
      averageProgress,
      recentActivity,
      popularContent,
      quizResults,
      notifications,
      contentDrafts,
      publishedContent,
      weeklyActivityData,
      contentStatsData,
      recentUsersData
    ] = await Promise.all([
      // Total users
      sql`SELECT COUNT(*) as count FROM users`,
      
      // Active users (last 30 days)
      sql`
        SELECT COUNT(DISTINCT user_id) as count 
        FROM user_activity 
        WHERE created_at > NOW() - INTERVAL '30 days'
      `,
      
      // New users this month
      sql`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE created_at > DATE_TRUNC('month', CURRENT_DATE)
      `,
      
      // Total progress records
      sql`SELECT COUNT(*) as count FROM user_progress`,
      
      // Completed learning paths
      sql`
        SELECT COUNT(*) as count 
        FROM user_progress 
        WHERE progress_percentage = 100
      `,
      
      // Average progress
      sql`
        SELECT AVG(progress_percentage) as avg 
        FROM user_progress
      `,
      
      // Recent activity (last 10)
      sql`
        SELECT ua.activity_type, ua.created_at, u.name, u.email
        FROM user_activity ua
        JOIN users u ON ua.user_id = u.id
        ORDER BY ua.created_at DESC
        LIMIT 10
      `,
      
      // Popular content (most bookmarks)
      sql`
        SELECT ub.item_type, COUNT(*) as count
        FROM user_bookmarks ub
        GROUP BY ub.item_type
        ORDER BY count DESC
      `,
      
      // Quiz statistics
      sql`
        SELECT 
          AVG(score) as avg_score,
          COUNT(*) as total_taken,
          quiz_type
        FROM user_quiz_results
        GROUP BY quiz_type
      `,
      
      // Unread notifications count
      sql`
        SELECT COUNT(*) as count
        FROM user_notifications
        WHERE is_read = false
      `,
      
      // Content drafts statistics
      sql`
        SELECT 
          COUNT(*) as total_drafts,
          COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_count,
          COUNT(CASE WHEN status = 'pending_approval' THEN 1 END) as pending_count,
          COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
          COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count
        FROM content_drafts
      `,
      
      // Published content statistics
      sql`
        SELECT 
          (SELECT COUNT(*) FROM articles WHERE is_published = true AND status = 'approved') as articles,
          (SELECT COUNT(*) FROM success_stories WHERE is_published = true AND status = 'approved') as stories,
          (SELECT COUNT(*) FROM learning_paths WHERE is_published = true AND status = 'approved') as learning_paths
      `,
      
      // Weekly activity data (last 7 days)
      sql`
        SELECT 
          DATE(created_at) as date,
          COUNT(DISTINCT user_id) as users,
          COUNT(*) as sessions,
          COUNT(*) as engagement
        FROM user_activity
        WHERE created_at > NOW() - INTERVAL '7 days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
      
      // Content performance stats
      sql`
        SELECT 
          'Articles' as name,
          COUNT(*) as value,
          'up' as trend
        FROM articles WHERE is_published = true
        UNION ALL
        SELECT 
          'Stories' as name,
          COUNT(*) as value,
          'up' as trend
        FROM success_stories WHERE is_published = true
        UNION ALL
        SELECT 
          'Learning Paths' as name,
          COUNT(*) as value,
          'stable' as trend
        FROM learning_paths WHERE is_published = true
      `,
      
      // Recent users (last 5)
      sql`
        SELECT id, name, email, role, created_at
        FROM users
        ORDER BY created_at DESC
        LIMIT 5
      `
    ])

    const weeklyActivity = weeklyActivityData.map((row: any) => ({
      date: row.date,
      users: Number(row.users),
      sessions: Number(row.sessions),
      engagement: Number(row.engagement)
    }))

    const contentStats = contentStatsData.map((row: any) => ({
      name: row.name,
      value: Number(row.value),
      trend: row.trend as "up" | "down" | "stable"
    }))

    const analytics = {
      users: {
        total: Number(totalUsers[0].count),
        active: Number(activeUsers[0].count),
        newThisMonth: Number(newUsersThisMonth[0].count)
      },
      engagement: {
        totalProgress: Number(totalProgress[0].count),
        completedPaths: Number(completedPaths[0].count),
        averageProgress: Number(averageProgress[0].avg) || 0
      },
      recentActivity: recentActivity,
      popularContent: popularContent,
      quizStats: quizResults,
      notifications: {
        unread: Number(notifications[0].count)
      },
      content: {
        drafts: {
          total: Number(contentDrafts[0].total_drafts),
          draft: Number(contentDrafts[0].draft_count),
          pending: Number(contentDrafts[0].pending_count),
          approved: Number(contentDrafts[0].approved_count),
          rejected: Number(contentDrafts[0].rejected_count)
        },
        published: {
          articles: Number(publishedContent[0].articles),
          stories: Number(publishedContent[0].stories),
          learningPaths: Number(publishedContent[0].learning_paths)
        }
      },
      weeklyActivity,
      contentStats,
      recentUsers: recentUsersData
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
