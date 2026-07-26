import { getSql } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, ShoppingCart, Users, Star, Clock, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SimpleLayoutWrapper } from "@/components/layout-wrapper"
import { CourseCheckout } from "@/components/course-checkout"
import { SaveButton } from "@/components/save-button"
import { CourseModules } from "@/components/course-modules"
import { verifyPurchaseAccess } from "@/lib/purchase-service"
import { headers } from "next/headers"
import { ViewTracker } from "@/components/view-tracker"
import { ReviewsSection } from "@/components/reviews-section"

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  const sql = getSql()
  const result = await sql(
    "SELECT title, description FROM courses WHERE slug = $1",
    [resolvedParams.slug]
  )
  const course = result[0]

  if (!course) return {}

  return {
    title: `${course.title} | WealthPath`,
    description: course.description,
  }
}

export default async function CourseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ email?: string }>
}) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  let course = null
  let lessons: any[] = []
  let lessonCount = 0
  let totalMinutes = 0
  let relatedCourses: any[] = []

  try {
    const sql = getSql()
    const result = await sql(
      "SELECT * FROM courses WHERE slug = $1",
      [resolvedParams.slug]
    )
    console.log('[v0] Course query result:', result.length, 'for slug:', resolvedParams.slug)
    course = result[0]

    if (course) {
      // Fetch lessons to get actual count and duration
      const lessonsResult = await sql(
        "SELECT id, duration_minutes FROM lessons WHERE course_id = $1 AND is_published = true ORDER BY order_index ASC",
        [course.id]
      )
      lessons = lessonsResult
      lessonCount = lessons.length
      totalMinutes = lessons.reduce((sum: number, l: any) => sum + (l.duration_minutes || 0), 0)

      // Related courses (same category first)
      relatedCourses = await sql(
        `SELECT id, slug, title, description, price_cents, cover_image, category
         FROM courses
         WHERE id != $1
         ORDER BY (category = $2) DESC, created_at DESC
         LIMIT 3`,
        [course.id, course.category]
      )
    }
  } catch (error: any) {
    console.error('[v0] Failed to fetch course:', error.message)
  }

  if (!course) {
    console.log('[v0] Course not found for slug:', resolvedParams.slug)
    notFound()
  }

  // Check if user has already purchased this course
  const email = resolvedSearchParams.email
  const hasPurchased = email ? await verifyPurchaseAccess(course.id, email) : false

  const benefits = course.what_you_get?.items || [
    "Lifetime access to course materials",
    "Delivered directly to your email",
    "Expert-written methods and strategies",
    "Instant download after purchase",
    "7-day money-back guarantee",
    "Join our exclusive community",
  ]

  return (
    <SimpleLayoutWrapper>
      <main className="min-h-screen bg-background">
        {/* Navigation */}
        <div className="border-b border-border">
          <div className="mx-auto max-w-7xl px-6 py-4">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="gap-2 rounded-sm"
            >
              <Link href="/courses">
                <ArrowLeft className="h-4 w-4" />
                Back to Courses
              </Link>
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left: Course Info */}
            <div className="space-y-8 animate-fade-up">
              {/* Image */}
              <div className="rounded-sm overflow-hidden border border-border shadow-lg">
                <img
                  src={course.cover_image}
                  alt={course.title}
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* Title & Description */}
              <div className="space-y-4">
                <h1 className="font-serif text-4xl font-bold text-foreground">
                  {course.title}
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {course.description}
                </p>
                <ViewTracker contentType="course" contentId={String(course.id)} />
                <p className="font-serif text-3xl font-bold text-primary">
                  ${(course.price_cents / 100).toFixed(2)}
                </p>
                <div className="flex items-center gap-2">
                  <SaveButton
                    itemType="course"
                    itemId={course.id}
                    itemTitle={course.title}
                    itemSlug={course.slug}
                    listType="favorite"
                    showLabel
                  />
                  <SaveButton
                    itemType="course"
                    itemId={course.id}
                    itemTitle={course.title}
                    itemSlug={course.slug}
                    listType="wishlist"
                    showLabel
                  />
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="font-semibold text-foreground">{course.duration || '4-8 weeks'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Play className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Lessons</p>
                      <p className="font-semibold text-foreground">{lessonCount || course.lessons || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Total Time</p>
                      <p className="font-semibold text-foreground">{totalMinutes} min</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructor */}
              <div className="rounded-sm border border-border bg-card p-6">
                <h3 className="font-semibold text-foreground mb-3">Meet Your Instructor</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Expert Instructor</p>
                    <p className="text-sm text-muted-foreground">10+ years experience in this field</p>
                  </div>
                </div>
              </div>

              {/* Modules */}
              <CourseModules slug={course.slug} isLocked={false} />

              {/* Benefits */}
              <div className="space-y-4 pt-8 border-t border-border">
                <h3 className="font-serif text-xl font-bold text-foreground">
                  What You Get
                </h3>
                <ul className="space-y-3">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Guarantee */}
              <div className="rounded-sm border border-primary/30 bg-primary/5 p-6">
                <p className="text-sm text-foreground">
                  <strong>Money-Back Guarantee:</strong> Not satisfied? Get a full refund within 7 days. No questions asked.
                </p>
              </div>

              {/* Reviews */}
              <div className="pt-8 border-t border-border">
                <ReviewsSection contentType="course" contentId={String(course.id)} title="Student Reviews" />
              </div>
            </div>

            {/* Right: Checkout or Access */}
            <div className="animate-fade-up lg:sticky lg:top-24 lg:h-fit">
              {hasPurchased ? (
                <div className="rounded-sm border border-border bg-card p-8 space-y-6">
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="rounded-full bg-green-500/20 p-3">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-foreground">
                      You Own This Course!
                    </h3>
                    <p className="text-muted-foreground">
                      You have full access to all materials and lessons.
                    </p>
                  </div>
                  <Button asChild className="w-full gap-2 py-6 rounded-sm font-semibold text-base bg-green-600 hover:bg-green-700">
                    <Link href={`/courses/${course.slug}/learn?email=${encodeURIComponent(email!)}`}>
                      <Play className="h-5 w-5" />
                      Start Learning
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full rounded-sm">
                    <Link href="/courses">Browse Other Courses</Link>
                  </Button>
                </div>
              ) : (
                <CourseCheckout course={course} />
              )}
            </div>
          </div>

          {/* Related courses */}
          {relatedCourses.length > 0 && (
            <div className="mt-20 border-t border-border pt-12">
              <h2 className="mb-8 font-serif text-2xl font-bold text-foreground">You Might Also Like</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {relatedCourses.map((rc: any) => (
                  <Link
                    key={rc.id}
                    href={`/courses/${rc.slug}`}
                    className="group flex flex-col overflow-hidden rounded-sm border border-border bg-card transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="relative h-40 overflow-hidden bg-muted">
                      <img
                        src={rc.cover_image || "/placeholder.svg"}
                        alt={rc.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="line-clamp-2 font-serif text-lg font-bold text-foreground transition-colors group-hover:text-primary">
                        {rc.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">{rc.description}</p>
                      <p className="mt-4 font-serif text-xl font-bold text-primary">
                        ${(rc.price_cents / 100).toFixed(2)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </SimpleLayoutWrapper>
  )
}
