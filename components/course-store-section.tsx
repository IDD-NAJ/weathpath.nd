"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ShoppingCart, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollReveal } from "@/components/scroll-reveal"

interface Course {
  id: number
  slug: string
  title: string
  description: string
  price_cents: number
  cover_image: string
  category?: string
  level?: string
  lessons?: number
}

export function CourseStoreSection() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetch("/api/courses?limit=3")
      .then((res) => res.json())
      .then((data) => {
        setCourses(data.courses || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error("[v0] Failed to fetch courses:", err)
        setCourses([])
        setLoading(false)
      })
  }, [])

  return (
    <section className="py-24 bg-background">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-16 space-y-4 animate-fade-up">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <h2 className="font-serif text-4xl font-bold text-foreground">
              Premium Courses
            </h2>
          </div>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Master wealth-building strategies with our expert-led courses. Get delivered straight to your email.
          </p>
        </div>

        {/* Course Grid */}
        {!mounted || loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-muted/50 rounded-sm animate-pulse" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No courses available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.map((course, index) => (
              <ScrollReveal
                key={course.id}
                animation="scale-in"
                delay={index * 0.1}
              >
                <Link href={`/courses/${course.slug}`}>
                  <div className="group h-full flex flex-col rounded-sm border border-border bg-card hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden bg-muted">
                      <img
                        src={course.cover_image}
                        alt={course.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="font-serif text-lg font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {course.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2 flex-1">
                        {course.description}
                      </p>
                      <div className="mt-6 flex items-center justify-between pt-6 border-t border-border/50">
                        <span className="font-serif text-2xl font-bold text-primary">
                          ${(course.price_cents / 100).toFixed(2)}
                        </span>
                        <Button
                          size="sm"
                          className="gap-2 rounded-sm"
                          onClick={(e) => {
                            e.preventDefault()
                          }}
                        >
                          <ShoppingCart className="h-4 w-4" />
                          <span className="hidden sm:inline">Buy Now</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 text-center animate-fade-up">
          <Button asChild size="lg" className="gap-2 rounded-sm">
            <Link href="/courses">
              View All Courses
              <ShoppingCart className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
