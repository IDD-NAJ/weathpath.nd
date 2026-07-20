import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Lock, BookOpen, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SimpleLayoutWrapper } from '@/components/layout-wrapper'
import { neon } from '@neondatabase/serverless'
import { verifyPurchaseAccess } from '@/lib/purchase-service'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

interface CourseModuleItem {
  title: string
  lessons: string[]
}

export default async function LessonViewerPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ email?: string; lesson?: string }>
}) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const email = resolvedSearchParams.email
  const selectedLesson = resolvedSearchParams.lesson

  let course = null

  try {
    const sql = neon(process.env.DATABASE_URL!)
    const result = await sql(
      'SELECT id, slug, title, description, cover_image, download_url FROM courses WHERE slug = $1',
      [resolvedParams.slug]
    )
    course = result[0]
  } catch (error) {
    console.error('[v0] Failed to fetch course:', error)
  }

  if (!course) {
    notFound()
  }

  // Check if user has access to this course
  if (!email) {
    return (
      <SimpleLayoutWrapper>
        <main className="min-h-screen bg-background">
          <div className="border-b border-border">
            <div className="mx-auto max-w-7xl px-6 py-4">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="gap-2 rounded-sm"
              >
                <Link href={`/courses/${course.slug}`}>
                  <ArrowLeft className="h-4 w-4" />
                  Back to Course
                </Link>
              </Button>
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-6 py-16">
            <div className="rounded-sm border border-red-500/30 bg-red-500/10 p-8 text-center space-y-4">
              <Lock className="h-12 w-12 text-red-600 mx-auto" />
              <h2 className="font-serif text-2xl font-bold text-foreground">
                Email Required
              </h2>
              <p className="text-muted-foreground">
                Please provide your email address to access the course materials.
              </p>
            </div>
          </div>
        </main>
      </SimpleLayoutWrapper>
    )
  }

  // Verify purchase access
  const hasAccess = await verifyPurchaseAccess(course.id, email)

  if (!hasAccess) {
    return (
      <SimpleLayoutWrapper>
        <main className="min-h-screen bg-background">
          <div className="border-b border-border">
            <div className="mx-auto max-w-7xl px-6 py-4">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="gap-2 rounded-sm"
              >
                <Link href={`/courses/${course.slug}`}>
                  <ArrowLeft className="h-4 w-4" />
                  Back to Course
                </Link>
              </Button>
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-6 py-16">
            <div className="rounded-sm border border-red-500/30 bg-red-500/10 p-8 text-center space-y-4">
              <Lock className="h-12 w-12 text-red-600 mx-auto" />
              <h2 className="font-serif text-2xl font-bold text-foreground">
                Access Denied
              </h2>
              <p className="text-muted-foreground mb-4">
                You don&apos;t have access to this course. Please purchase it to continue.
              </p>
              <Button asChild className="gap-2 bg-primary">
                <Link href={`/courses/${course.slug}`}>
                  Purchase Course
                </Link>
              </Button>
            </div>
          </div>
        </main>
      </SimpleLayoutWrapper>
    )
  }

  // Sample course modules and lessons
  const courseModules: CourseModuleItem[] = [
    {
      title: 'Module 1: Introduction',
      lessons: ['Getting Started', 'Core Concepts', 'Setting Expectations'],
    },
    {
      title: 'Module 2: Fundamentals',
      lessons: ['Part 1: Basics', 'Part 2: Advanced Basics', 'Q&A Session'],
    },
    {
      title: 'Module 3: Implementation',
      lessons: [
        'Step-by-Step Guide',
        'Common Mistakes',
        'Best Practices',
        'Tools & Resources',
      ],
    },
  ]

  return (
    <SimpleLayoutWrapper>
      <main className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border">
          <div className="mx-auto max-w-7xl px-6 py-4">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="gap-2 rounded-sm"
            >
              <Link href={`/courses/${course.slug}`}>
                <ArrowLeft className="h-4 w-4" />
                Back to Course
              </Link>
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-7xl px-6 py-12">
          {/* Hero */}
          <div className="space-y-6 mb-12">
            <div>
              <h1 className="font-serif text-4xl font-bold text-foreground mb-2">
                {course.title}
              </h1>
              <p className="text-lg text-muted-foreground">
                Access all course materials and lessons
              </p>
            </div>

            {/* Access Info */}
            <div className="rounded-sm border border-green-500/30 bg-green-500/10 p-4 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
              <div>
                <p className="font-semibold text-foreground">
                  You have access to this course
                </p>
                <p className="text-sm text-muted-foreground">
                  Purchased with: {email}
                </p>
              </div>
            </div>
          </div>

          {/* Course Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Lesson Viewer */}
            <div className="lg:col-span-2 space-y-6">
              {/* Featured Content */}
              <div className="rounded-sm border border-border bg-card p-8 space-y-6">
                <div className="rounded-sm overflow-hidden border border-border">
                  <img
                    src={course.cover_image}
                    alt={course.title}
                    className="w-full h-64 object-cover"
                  />
                </div>

                <div className="space-y-4">
                  <h2 className="font-serif text-2xl font-bold text-foreground">
                    Welcome to {course.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {course.description}
                  </p>
                </div>

                {course.download_url && (
                  <Button
                    asChild
                    className="w-full gap-2 bg-primary rounded-sm py-6"
                  >
                    <a href={course.download_url} download>
                      <BookOpen className="h-5 w-5" />
                      Download Course Materials
                    </a>
                  </Button>
                )}
              </div>

              {/* Course Overview */}
              <div className="rounded-sm border border-border bg-card p-8 space-y-6">
                <h3 className="font-serif text-xl font-bold text-foreground">
                  What You'll Learn
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      Complete foundations and advanced concepts
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      Real-world implementation strategies
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      Lifetime access to all materials
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      Expert guidance and best practices
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Modules Sidebar */}
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold text-foreground">
                Course Modules
              </h3>
              <div className="space-y-3">
                {courseModules.map((module, idx) => (
                  <div
                    key={idx}
                    className="rounded-sm border border-border bg-card p-4 space-y-3"
                  >
                    <h4 className="font-semibold text-foreground text-sm">
                      {module.title}
                    </h4>
                    <ul className="space-y-2">
                      {module.lessons.map((lesson, lidx) => (
                        <li
                          key={lidx}
                          className="flex items-center gap-2 text-sm"
                        >
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          <span className="text-muted-foreground">
                            {lesson}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Course Features */}
              <div className="rounded-sm border border-border bg-card p-4 space-y-3">
                <h4 className="font-semibold text-foreground text-sm">
                  Course Features
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    Full course access
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Lifetime access
                  </li>
                  <li className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    Expert support
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </SimpleLayoutWrapper>
  )
}
