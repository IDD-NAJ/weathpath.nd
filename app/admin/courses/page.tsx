import { AdminCourses } from "@/components/admin-courses"
import { SimpleLayoutWrapper } from "@/components/layout-wrapper"

export const metadata = {
  title: "Manage Courses | Admin",
}

export default function AdminCoursesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Course Management
        </h1>
        <p className="text-sm text-muted-foreground">
          Create, edit, delete, and manage course visibility and pricing.
        </p>
      </div>
      <AdminCourses />
    </div>
  )
}
