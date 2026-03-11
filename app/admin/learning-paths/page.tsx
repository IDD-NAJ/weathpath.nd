import { sql } from "@/lib/db"
import { LearningPathsManager } from "@/components/admin/learning-paths-manager"

export default async function LearningPathsPage() {
  const paths = await sql`SELECT * FROM learning_paths ORDER BY created_at DESC`

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Learning Paths
        </h2>
        <p className="text-sm text-muted-foreground">
          Create and manage educational learning paths for your users
        </p>
      </div>
      <LearningPathsManager paths={paths} />
    </div>
  )
}
