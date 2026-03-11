import { sql } from "@/lib/db"
import { NotificationsManager } from "@/components/admin/notifications-manager"

export default async function NotificationsPage() {
  const [notifications, users] = await Promise.all([
    sql`
      SELECT 
        n.*,
        u.name as sender_name,
        COUNT(CASE WHEN un.is_read = false THEN 1 END) as unread_count
      FROM user_notifications n
      LEFT JOIN users u ON n.user_id = u.id
      LEFT JOIN user_notifications un ON n.type = un.type AND n.message = un.message
      GROUP BY n.id, u.name
      ORDER BY n.created_at DESC
      LIMIT 50
    `,
    sql`
      SELECT id, name, email, role, is_active, created_at
      FROM users 
      WHERE is_active = true
      ORDER BY role DESC, name ASC
    `
  ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Notifications
        </h2>
        <p className="text-sm text-muted-foreground">
          Create and manage user notifications and announcements
        </p>
      </div>
      <NotificationsManager 
        notifications={notifications} 
        users={users}
      />
    </div>
  )
}
