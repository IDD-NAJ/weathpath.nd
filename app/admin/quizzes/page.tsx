import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { QuizzesManager } from "@/components/admin/quizzes-manager"

export default async function QuizzesPage() {
  const user = await getCurrentUser()
  
  let quizzes: any[] = []
  try {
    quizzes = await sql`
      SELECT q.*, u.name as author_name
      FROM quizzes q
      LEFT JOIN users u ON q.author_id = u.id
      ORDER BY q.created_at DESC
    `
  } catch (error) {
    console.error('Error fetching quizzes:', error)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Quizzes
        </h2>
        <p className="text-sm text-muted-foreground">
          Create and manage interactive quizzes for users
        </p>
      </div>
      <QuizzesManager quizzes={quizzes} authorId={user?.id || ""} />
    </div>
  )
}
