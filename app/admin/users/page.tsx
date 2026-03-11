import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { UsersTable } from "@/components/admin/users-table"

export default async function UsersPage() {
  const currentUser = await getCurrentUser()
  const users = await sql`
    SELECT id, name, email, role, is_active, created_at, updated_at
    FROM users
    ORDER BY created_at DESC
  `

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          User Management
        </h2>
        <p className="text-sm text-muted-foreground">
          View and manage all registered users, roles, and account status
        </p>
      </div>
      <UsersTable users={users} currentUserId={currentUser?.id || ""} />
    </div>
  )
}
