import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SimpleLayoutWrapper } from "@/components/layout-wrapper"
import { CourseCheckout } from "@/components/course-checkout"
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
    course = result[0]
  } catch (error) {
    console.error('[v0] Failed to fetch course:', error)
  }

  if (!course) {
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
                  src={course.image_url}
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
                  ${course.price}
                </p>
              </div>

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
