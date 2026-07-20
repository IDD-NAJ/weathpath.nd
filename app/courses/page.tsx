import Link from "next/link"
import { ShoppingCart, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SimpleLayoutWrapper } from "@/components/layout-wrapper"
import { neon } from "@neondatabase/serverless"

export const metadata = {
  title: "Premium Courses | WealthPath",
  description: "Master wealth-building with expert-led courses delivered to your email.",
}

export const dynamic = 'force-dynamic'

export default async function CoursesPage() {
  let courses = []
  try {
    const sql = neon(process.env.DATABASE_URL!)
    courses = await sql(
      "SELECT id, slug, title, description, price_cents, cover_image, category, level, lessons, duration FROM courses ORDER BY created_at DESC"
    )
  } catch (error) {
    console.error('[v0] Failed to fetch courses:', error)
  }

  return (
    <SimpleLayoutWrapper>
      <main className="min-h-screen bg-background py-16">
        <div className="mx-auto max-w-7xl px-6">
          {/* Header */}
          <div className="mb-16 space-y-4 animate-fade-up">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="font-serif text-5xl font-bold text-foreground">
                Premium Courses
              </h1>
            </div>
            <p className="max-w-2xl text-xl text-muted-foreground">
              Comprehensive guides, proven strategies, and expert-led methods for building wealth.
              All courses are delivered directly to your email with lifetime access.
            </p>
          </div>

          {/* Courses Grid */}
          {courses.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No courses available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course: any, index: number) => (
                <div
                  key={course.id}
                  className="group flex flex-col rounded-sm border border-border bg-card hover:shadow-xl transition-all duration-300 overflow-hidden animate-stagger-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden bg-muted">
                    <img
                      src={course.cover_image}
                      alt={course.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="font-serif text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {course.title}
                    </h2>
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-3 flex-1">
                      {course.description}
                    </p>

                    {/* Footer */}
                    <div className="mt-6 flex items-center justify-between pt-6 border-t border-border/50">
                      <span className="font-serif text-3xl font-bold text-primary">
                        ${(course.price_cents / 100).toFixed(2)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex gap-2">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-sm"
                      >
                        <Link href={`/courses/${course.slug}`}>View Details</Link>
                      </Button>
                      <Button
                        asChild
                        size="sm"
                        className="flex-1 gap-2 rounded-sm"
                      >
                        <Link href={`/courses/${course.slug}#checkout`}>
                          <ShoppingCart className="h-4 w-4" />
                          Buy
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </SimpleLayoutWrapper>
  )
}
