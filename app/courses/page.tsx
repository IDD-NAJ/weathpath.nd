import Link from "next/link"
import { ShoppingCart, BookOpen, Search, Star, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SimpleLayoutWrapper } from "@/components/layout-wrapper"
import { Footer } from "@/components/footer"
import { neon } from "@neondatabase/serverless"

export const metadata = {
  title: "Premium Courses | WealthPath",
  description: "Master wealth-building with expert-led courses delivered to your email.",
}

export const dynamic = "force-dynamic"

const PAGE_SIZE = 9

interface CoursesSearchParams {
  q?: string
  page?: string
  category?: string
  level?: string
}

function buildQueryString(params: CoursesSearchParams, overrides: Record<string, string | undefined>) {
  const merged: Record<string, string | undefined> = {
    q: params.q,
    category: params.category,
    level: params.level,
    page: params.page,
    ...overrides,
  }
  const sp = new URLSearchParams()
  for (const [key, value] of Object.entries(merged)) {
    if (value && value !== "" && !(key === "page" && value === "1")) {
      sp.set(key, value)
    }
  }
  const str = sp.toString()
  return str ? `?${str}` : ""
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<CoursesSearchParams>
}) {
  const params = await searchParams
  const q = params.q?.trim() || ""
  const category = params.category?.trim() || ""
  const level = params.level?.trim() || ""
  const page = Math.max(1, Number.parseInt(params.page || "1", 10) || 1)

  let courses: any[] = []
  let totalCount = 0
  let categories: string[] = []
  let levels: string[] = []
  const ratings: Record<string, { avg: number; count: number }> = {}
  const viewCounts: Record<string, number> = {}

  try {
    const sql = neon(process.env.DATABASE_URL!)

    const conditions: string[] = []
    const values: any[] = []
    if (q) {
      values.push(`%${q}%`)
      conditions.push(
        `(title ILIKE $${values.length} OR description ILIKE $${values.length} OR category ILIKE $${values.length})`
      )
    }
    if (category) {
      values.push(category)
      conditions.push(`category = $${values.length}`)
    }
    if (level) {
      values.push(level)
      conditions.push(`level = $${values.length}`)
    }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

    const countResult = await sql(`SELECT COUNT(*)::int AS count FROM courses ${where}`, values)
    totalCount = countResult[0]?.count || 0

    const offset = (page - 1) * PAGE_SIZE
    courses = await sql(
      `SELECT id, slug, title, description, price_cents, cover_image, category, level, lessons, duration
       FROM courses ${where}
       ORDER BY created_at DESC
       LIMIT ${PAGE_SIZE} OFFSET ${offset}`,
      values
    )

    const filterRows = await sql(
      `SELECT DISTINCT category, level FROM courses WHERE category IS NOT NULL OR level IS NOT NULL`
    )
    categories = [...new Set(filterRows.map((r: any) => r.category).filter(Boolean))].sort() as string[]
    levels = [...new Set(filterRows.map((r: any) => r.level).filter(Boolean))].sort() as string[]

    // Ratings + view counts are optional enhancements — tables may not exist yet
    if (courses.length > 0) {
      const ids = courses.map((c: any) => String(c.id))
      try {
        const ratingRows = await sql(
          `SELECT content_id, AVG(rating)::numeric(3,2) AS avg_rating, COUNT(*)::int AS review_count
           FROM reviews
           WHERE content_type = 'course' AND status = 'approved' AND content_id = ANY($1)
           GROUP BY content_id`,
          [ids]
        )
        for (const row of ratingRows) {
          ratings[row.content_id] = { avg: Number(row.avg_rating), count: row.review_count }
        }
      } catch {
        // reviews table not created yet
      }
      try {
        const viewRows = await sql(
          `SELECT content_id, COUNT(*)::int AS views
           FROM content_views
           WHERE content_type = 'course' AND content_id = ANY($1)
           GROUP BY content_id`,
          [ids]
        )
        for (const row of viewRows) {
          viewCounts[row.content_id] = row.views
        }
      } catch {
        // content_views table not created yet
      }
    }
  } catch (error) {
    console.error("[v0] Failed to fetch courses:", error)
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const hasFilters = Boolean(q || category || level)

  return (
    <SimpleLayoutWrapper>
      <main className="min-h-screen bg-background py-16">
        <div className="mx-auto max-w-7xl px-6">
          {/* Header */}
          <div className="mb-10 space-y-4 animate-fade-up">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="font-serif text-5xl font-bold text-foreground text-balance">Premium Courses</h1>
            </div>
            <p className="max-w-2xl text-xl text-muted-foreground text-pretty">
              Comprehensive guides, proven strategies, and expert-led methods for building wealth. All courses are
              delivered directly to your email with lifetime access.
            </p>
          </div>

          {/* Search + Filters */}
          <div className="mb-12 space-y-4 animate-fade-up" style={{ animationDelay: "100ms" }}>
            <form action="/courses" method="GET" className="flex w-full max-w-xl gap-2" role="search">
              {category && <input type="hidden" name="category" value={category} />}
              {level && <input type="hidden" name="level" value={level} />}
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  name="q"
                  defaultValue={q}
                  placeholder="Search courses by title, topic, or category..."
                  aria-label="Search courses"
                  className="h-11 w-full rounded-sm border border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button type="submit" className="h-11 gap-2 rounded-sm px-6">
                <Search className="h-4 w-4" />
                Search
              </Button>
            </form>

            {(categories.length > 0 || levels.length > 0) && (
              <div className="flex flex-wrap items-center gap-2">
                {categories.map((c) => (
                  <Link
                    key={c}
                    href={`/courses${buildQueryString(params, { category: category === c ? undefined : c, page: undefined })}`}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      category === c
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground"
                    }`}
                  >
                    {c}
                  </Link>
                ))}
                {levels.length > 0 && <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />}
                {levels.map((l) => (
                  <Link
                    key={l}
                    href={`/courses${buildQueryString(params, { level: level === l ? undefined : l, page: undefined })}`}
                    className={`rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors ${
                      level === l
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground"
                    }`}
                  >
                    {l}
                  </Link>
                ))}
                {hasFilters && (
                  <Link href="/courses" className="ml-1 text-xs font-medium text-primary underline-offset-4 hover:underline">
                    Clear all
                  </Link>
                )}
              </div>
            )}

            {hasFilters && (
              <p className="text-sm text-muted-foreground" aria-live="polite">
                {totalCount} {totalCount === 1 ? "course" : "courses"} found
                {q ? ` for "${q}"` : ""}
              </p>
            )}
          </div>

          {/* Courses Grid */}
          {courses.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-lg text-muted-foreground">
                {hasFilters ? "No courses match your search." : "No courses available yet."}
              </p>
              {hasFilters && (
                <Button asChild variant="outline" className="mt-4 rounded-sm bg-transparent">
                  <Link href="/courses">Clear search</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course: any, index: number) => {
                const rating = ratings[String(course.id)]
                const views = viewCounts[String(course.id)]
                return (
                  <div
                    key={course.id}
                    className="group flex flex-col overflow-hidden rounded-sm border border-border bg-card transition-all duration-300 hover:shadow-xl animate-stagger-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Image */}
                    <div className="relative h-56 overflow-hidden bg-muted">
                      <img
                        src={course.cover_image || "/placeholder.svg"}
                        alt={course.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      {course.level && (
                        <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-medium capitalize text-foreground">
                          {course.level}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col p-6">
                      <h2 className="line-clamp-2 font-serif text-xl font-bold text-foreground transition-colors group-hover:text-primary">
                        {course.title}
                      </h2>

                      {(rating || views !== undefined) && (
                        <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                          {rating && (
                            <span className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-primary text-primary" />
                              <span className="font-medium text-foreground">{rating.avg.toFixed(1)}</span>
                              <span>({rating.count})</span>
                            </span>
                          )}
                          {views !== undefined && (
                            <span className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {views.toLocaleString()}
                            </span>
                          )}
                        </div>
                      )}

                      <p className="mt-3 line-clamp-3 flex-1 text-sm text-muted-foreground">{course.description}</p>

                      {/* Footer */}
                      <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-6">
                        <span className="font-serif text-3xl font-bold text-primary">
                          ${(course.price_cents / 100).toFixed(2)}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex gap-2">
                        <Button asChild variant="outline" size="sm" className="flex-1 rounded-sm bg-transparent">
                          <Link href={`/courses/${course.slug}`}>View Details</Link>
                        </Button>
                        <Button asChild size="sm" className="flex-1 gap-2 rounded-sm">
                          <Link href={`/courses/${course.slug}#checkout`}>
                            <ShoppingCart className="h-4 w-4" />
                            Buy
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="mt-16 flex items-center justify-center gap-2" aria-label="Courses pagination">
              <Button
                asChild={page > 1}
                variant="outline"
                size="sm"
                className="gap-1 rounded-sm bg-transparent"
                disabled={page <= 1}
              >
                {page > 1 ? (
                  <Link href={`/courses${buildQueryString(params, { page: String(page - 1) })}`}>
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Link>
                ) : (
                  <span className="flex items-center gap-1">
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </span>
                )}
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                  .map((p, idx, arr) => (
                    <span key={p} className="flex items-center">
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="px-2 text-muted-foreground" aria-hidden="true">
                          …
                        </span>
                      )}
                      <Link
                        href={`/courses${buildQueryString(params, { page: String(p) })}`}
                        aria-current={p === page ? "page" : undefined}
                        className={`flex h-9 w-9 items-center justify-center rounded-sm border text-sm font-medium transition-colors ${
                          p === page
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground"
                        }`}
                      >
                        {p}
                      </Link>
                    </span>
                  ))}
              </div>

              <Button
                asChild={page < totalPages}
                variant="outline"
                size="sm"
                className="gap-1 rounded-sm bg-transparent"
                disabled={page >= totalPages}
              >
                {page < totalPages ? (
                  <Link href={`/courses${buildQueryString(params, { page: String(page + 1) })}`}>
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <span className="flex items-center gap-1">
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </nav>
          )}
        </div>
      </main>
      <Footer />
    </SimpleLayoutWrapper>
  )
}
