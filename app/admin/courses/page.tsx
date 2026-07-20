import { AdminCourses } from "@/components/admin-courses"
import { SimpleLayoutWrapper } from "@/components/layout-wrapper"

export const metadata = {
  title: "Manage Courses | Admin",
}

export default function AdminCoursesPage() {
  return (
    <SimpleLayoutWrapper>
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="mb-8">
            <h1 className="font-serif text-4xl font-bold text-foreground mb-2">
              Course Management
            </h1>
            <p className="text-muted-foreground">
              Create, edit, delete, and manage course visibility and pricing.
            </p>
          </div>

          <AdminCourses />
        </div>
      </div>
    </SimpleLayoutWrapper>
  )
}
