import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { ArticlesManager } from "@/components/admin/articles-manager"

export default async function ArticlesPage() {
  const user = await getCurrentUser()
  const articles = await sql`
    SELECT a.*, u.name as author_name
    FROM articles a
    LEFT JOIN users u ON a.author_id = u.id
    ORDER BY a.created_at DESC
  `

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Articles
        </h2>
        <p className="text-sm text-muted-foreground">
          Write and manage educational articles and guides
        </p>
      </div>
      <ArticlesManager articles={articles} authorId={user?.id || ""} />
    </div>
  )
}
