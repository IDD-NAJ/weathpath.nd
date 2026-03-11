"use server"

import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function createNotification(data: {
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  action_url?: string
  send_to_all: boolean
  user_ids?: string[]
}) {
  const currentUser = await getCurrentUser()
  
  if (!currentUser || currentUser.role !== "admin") {
    throw new Error("Unauthorized")
  }

  const { title, message, type, action_url, send_to_all, user_ids } = data

  if (!title || !message || !type) {
    throw new Error("Missing required fields")
  }

  if (!send_to_all && (!user_ids || user_ids.length === 0)) {
    throw new Error("Must specify users when not sending to all")
  }

  try {
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
      throw new Error("No active users found")
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

    return {
      success: true,
      message: `Notification sent to ${targetUsers.length} users`,
      user_count: targetUsers.length
    }

  } catch (error) {
    console.error("Error creating notification:", error)
    throw error
  }
}

export async function getNotifications(filters?: {
  type?: string
  limit?: number
  offset?: number
}) {
  const currentUser = await getCurrentUser()
  
  if (!currentUser || currentUser.role !== "admin") {
    throw new Error("Unauthorized")
  }

  const { type, limit = 50, offset = 0 } = filters || {}

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

  return notifications
}

export async function getNotificationStats() {
  const currentUser = await getCurrentUser()
  
  if (!currentUser || currentUser.role !== "admin") {
    throw new Error("Unauthorized")
  }

  const [total, unread, recent, typeStats] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM user_notifications`,
    sql`SELECT COUNT(*) as count FROM user_notifications WHERE is_read = false`,
    sql`
      SELECT COUNT(*) as count 
      FROM user_notifications 
      WHERE created_at > NOW() - INTERVAL '7 days'
    `,
    sql`
      SELECT type, COUNT(*) as count 
      FROM user_notifications 
      GROUP BY type
    `
  ])

  return {
    total: Number(total[0].count),
    unread: Number(unread[0].count),
    recent: Number(recent[0].count),
    byType: typeStats.reduce((acc, row) => {
      acc[row.type] = Number(row.count)
      return acc
    }, {} as Record<string, number>)
  }
}
