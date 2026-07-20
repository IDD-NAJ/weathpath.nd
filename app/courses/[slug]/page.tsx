import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, ShoppingCart, Users, Star, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SimpleLayoutWrapper } from "@/components/layout-wrapper"
import { CourseCheckout } from "@/components/course-checkout"
import { CourseModules } from "@/components/course-modules"
import { neon } from "@neondatabase/serverless"

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const sql = neon(process.env.DATABASE_URL!)
  const result = await sql(
    "SELECT title, description FROM courses WHERE slug = $1",
    [params.slug]
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
}: {
  params: { slug: string }
}) {
  let course = null
  try {
    const sql = neon(process.env.DATABASE_URL!)
    const result = await sql(
      "SELECT * FROM courses WHERE slug = $1",
      [params.slug]
    )
    console.log('[v0] Course query result:', result.length, 'for slug:', params.slug)
    course = result[0]
  } catch (error: any) {
    console.error('[v0] Failed to fetch course:', error.message)
  }

  if (!course) {
    console.log('[v0] Course not found for slug:', params.slug)
    notFound()
  }

  const benefits = [
    "Lifetime access to course materials",
    "Delivered directly to your email",
    "Expert-written methods and strategies",
    "Instant download after purchase",
    "30-day money-back guarantee",
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
                <p className="font-serif text-3xl font-bold text-primary">
                  ${(course.price_cents / 100).toFixed(2)}
                </p>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="font-semibold text-foreground">4-8 weeks</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Students</p>
                      <p className="font-semibold text-foreground">2,500+</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Rating</p>
                      <p className="font-semibold text-foreground">4.9/5</p>
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
                  <strong>Money-Back Guarantee:</strong> Not satisfied? Get a full refund within 30 days. No questions asked.
                </p>
              </div>
            </div>

            {/* Right: Checkout */}
            <div className="animate-fade-up lg:sticky lg:top-24 lg:h-fit">
              <CourseCheckout course={course} />
            </div>
          </div>
        </div>
      </main>
    </SimpleLayoutWrapper>
  )
}
