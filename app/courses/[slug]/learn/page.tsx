import { getSql } from "@/lib/db"
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Lock, BookOpen, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LessonViewerWrapper } from '@/components/lesson-viewer-wrapper'
import { SimpleLayoutWrapper } from '@/components/layout-wrapper'
import { neon } from '@neondatabase/serverless'
import { verifyPurchaseAccess } from '@/lib/purchase-service'

export const dynamic = 'force-dynamic'

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
  let lessons: any[] = []

  try {
    const sql = getSql()
    const courseResult = await sql(
      'SELECT id, slug, title, description, cover_image, download_url FROM courses WHERE slug = $1',
      [resolvedParams.slug]
    )
    course = courseResult[0]

    if (course) {
      const lessonsResult = await sql(
        'SELECT id, course_id, title, description, content, order_index, duration_minutes, video_url, lesson_type, is_published FROM lessons WHERE course_id = $1 AND is_published = true ORDER BY order_index ASC',
        [course.id]
      )
      lessons = lessonsResult
    }
  } catch (error) {
    console.error('[v0] Failed to fetch course or lessons:', error)
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

  const initialLessonIndex = selectedLesson 
    ? lessons.findIndex(l => l.id === parseInt(selectedLesson))
    : 0

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
          {/* Header */}
          <div className="space-y-6 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {course.title}
              </h1>
              <p className="text-lg text-muted-foreground">
                {lessons.length} lessons • {lessons.reduce((sum, l) => sum + (l.duration_minutes || 0), 0)} minutes total
              </p>
            </div>

            {/* Access Info */}
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 flex items-center gap-3">
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

          {/* Lessons - Use client-side component for interactivity */}
          {lessons.length > 0 ? (
            <LessonViewerWrapper
              lessons={lessons}
              courseTitle={course.title}
              initialLessonIndex={initialLessonIndex}
              userHasAccess={hasAccess}
            />
          ) : (
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No lessons available</h3>
              <p className="text-muted-foreground">
                The instructor hasn't added lessons to this course yet. Check back soon!
              </p>
            </div>
          )}
        </div>
      </main>
    </SimpleLayoutWrapper>
  )
}
