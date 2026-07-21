'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BookOpen, Play, Clock, CheckCircle2, Zap } from 'lucide-react'
import useSWR from 'swr'

interface Course {
  id: number
  slug: string
  title: string
  subtitle: string
  cover_image: string
  level: string
  category: string
  duration: string
  lessons: number
  price_cents: number
}

interface UserPurchase {
  id: number
  course_id: number
  user_email: string
  payment_status: string
  created_at: string
  course?: Course
}

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Failed to fetch')
  return response.json()
}

export function MyCoursesSection() {
  const [email, setEmail] = useState<string | null>(null)
  const { data: purchases, isLoading, error } = useSWR(
    email ? `/api/user/purchases?email=${encodeURIComponent(email)}` : null,
    fetcher
  )

  useEffect(() => {
    // Get email from localStorage or session
    const storedEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail')
    setEmail(storedEmail)
  }, [])

  if (!email) {
    return (
      <Card className="border-border/60 bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            My Courses
          </CardTitle>
          <CardDescription>Your enrolled courses and learning progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Sign in to see your purchased courses</p>
            <Button asChild className="rounded-lg">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="border-border/60 bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            My Courses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted/30 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !purchases || purchases.length === 0) {
    return (
      <Card className="border-border/60 bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            My Courses
          </CardTitle>
          <CardDescription>Your enrolled courses and learning progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold text-foreground mb-2">No courses yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Explore our course catalog and start learning today
            </p>
            <Button asChild className="rounded-lg">
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/60 bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          My Courses ({purchases.length})
        </CardTitle>
        <CardDescription>Your enrolled courses and learning progress</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {purchases.map((purchase: UserPurchase) => (
            <div
              key={purchase.id}
              className="group rounded-lg border border-border/40 bg-muted/30 hover:bg-muted/50 transition-colors overflow-hidden"
            >
              <Link href={`/courses/${purchase.course_id}/learn?email=${encodeURIComponent(email)}`}>
                <div className="flex items-start gap-4 p-4">
                  {/* Course Image */}
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {purchase.course?.cover_image ? (
                      <img
                        src={purchase.course.cover_image}
                        alt={purchase.course?.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <BookOpen className="h-8 w-8 text-primary" />
                      </div>
                    )}
                  </div>

                  {/* Course Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h4 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                          {purchase.course?.title || 'Course'}
                        </h4>
                        {purchase.course?.subtitle && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                            {purchase.course.subtitle}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="flex-shrink-0 rounded-md">
                        {purchase.course?.level || 'Beginner'}
                      </Badge>
                    </div>

                    {/* Course Metadata */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      {purchase.course?.lessons && (
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {purchase.course.lessons} lessons
                        </div>
                      )}
                      {purchase.course?.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {purchase.course.duration}
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium text-foreground">35%</span>
                      </div>
                      <Progress value={35} className="h-1.5" />
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg gap-2"
                    >
                      <Play className="h-4 w-4" />
                      <span className="hidden sm:inline">Continue</span>
                    </Button>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Browse More Courses CTA */}
        <div className="mt-6 pt-6 border-t border-border/40">
          <Button asChild variant="outline" className="w-full rounded-lg" size="sm">
            <Link href="/courses" className="flex items-center justify-center gap-2">
              <Zap className="h-4 w-4" />
              Explore More Courses
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
