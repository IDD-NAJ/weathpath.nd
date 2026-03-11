import { sql } from "@/lib/db"
import { StoriesManager } from "@/components/admin/stories-manager"

export default async function StoriesPage() {
  const stories = await sql`SELECT * FROM success_stories ORDER BY display_order ASC, created_at DESC`

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Success Stories
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage testimonials and success stories displayed on the website
        </p>
      </div>
      <StoriesManager stories={stories} />
    </div>
  )
}
