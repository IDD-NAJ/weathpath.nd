import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
export const dynamic = 'force-dynamic'


export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, message, type, action_url, send_to_all, user_ids } = body

    if (!title || !message || !type) {
      return NextResponse.json(
        { error: "Missing required fields: title, message, type" },
        { status: 400 }
      )
    }

    if (!send_to_all && (!user_ids || user_ids.length === 0)) {
      return NextResponse.json(
        { error: "Must specify users when not sending to all" },
        { status: 400 }
      )
    }

    // Get users to send notifications to
    let targetUsers
    if (send_to_all) {
      targetUsers = await sql`
        SELECT id FROM users WHERE is_active = true
      `
    } else {
      targetUsers = await sql`
        SELECT id FROM users WHERE id = ANY(${user_ids}) AND is_active = true
      `
    }

    if (targetUsers.length === 0) {
      return NextResponse.json(
        { error: "No active users found to send notifications to" },
        { status: 400 }
      )
    }

    // Create notifications for each user
    const notificationPromises = targetUsers.map(user => 
      sql`
        INSERT INTO user_notifications (user_id, title, message, type, action_url, is_read, created_at)
        VALUES (${user.id}, ${title}, ${message}, ${type}, ${action_url || null}, false, NOW())
      `
    )

    await Promise.all(notificationPromises)

    // Log the notification for admin tracking
    await sql`
      INSERT INTO analytics_events (event_type, event_data, user_id, created_at)
      VALUES ('notification_sent', ${JSON.stringify({
        title,
        message,
        type,
        send_to_all,
        user_count: targetUsers.length,
        sent_by: currentUser.name
      })}, ${currentUser.id}, NOW())
    `

    return NextResponse.json({
      success: true,
      message: `Notification sent to ${targetUsers.length} users`,
      user_count: targetUsers.length
    })

  } catch (error) {
    console.error("Error sending notification:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}


export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const type = searchParams.get('type')

    let query = `
      SELECT 
        n.*,
        u.name as sender_name,
        COUNT(CASE WHEN un.is_read = false THEN 1 END) as unread_count
      FROM user_notifications n
      LEFT JOIN users u ON n.user_id = u.id
      LEFT JOIN user_notifications un ON n.title = un.title AND n.message = un.message
    `
    
    const conditions = []
    if (type && type !== 'all') {
      conditions.push(`n.type = '${type}'`)
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }
    
    query += `
      GROUP BY n.id, u.name
      ORDER BY n.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    const notifications = await sql(query)

    return NextResponse.json({
      notifications,
      total: notifications.length
    })

  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
