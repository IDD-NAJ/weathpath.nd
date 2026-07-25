'use client'

import { useState, useEffect } from 'react'
import { ShoppingBag, Download, Eye } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface PurchasedCourse {
  id: number
  course_id: number
  course_title: string
  course_slug: string
  purchase_date: string
  price_paid: number
  documents: Array<{
    id: number
    filename: string
    file_type: string
    uploaded_date: string
    pathname: string
  }>
}

export function PurchasedCoursesSection() {
  const [courses, setCourses] = useState<PurchasedCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)

  useEffect(() => {
    loadPurchasedCourses()
  }, [])

  const loadPurchasedCourses = async () => {
    try {
      const res = await fetch('/api/courses/purchased')
      if (res.ok) {
        const data = await res.json()
        setCourses(data)
      }
    } catch (error) {
      console.error('[v0] Error loading purchased courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (docId: number, filename: string, pathname: string) => {
    try {
      setDownloadingId(docId)
      const res = await fetch(
        `/api/courses/documents?pathname=${encodeURIComponent(pathname)}`
      )

      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('[v0] Error downloading document:', error)
    } finally {
      setDownloadingId(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            My Purchased Courses
          </CardTitle>
          <CardDescription>Courses you&apos;ve purchased</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          My Purchased Courses
        </CardTitle>
        <CardDescription>Access your purchased courses and materials</CardDescription>
      </CardHeader>
      <CardContent>
        {courses.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-6">
            You haven&apos;t purchased any courses yet. Browse our course store to get started.
          </p>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="rounded-lg border border-border p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{course.course_title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Purchased {new Date(course.purchase_date).toLocaleDateString()} •{' '}
                      ${(course.price_paid / 100).toFixed(2)}
                    </p>
                  </div>
                  <Link href={`/courses/${course.course_slug}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </Link>
                </div>

                {course.documents && course.documents.length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-border/30">
                    <p className="text-xs font-medium text-muted-foreground">Materials:</p>
                    {course.documents.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => handleDownload(doc.id, doc.filename, doc.pathname)}
                        disabled={downloadingId === doc.id}
                        className="w-full flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors text-left"
                      >
                        <span className="text-xs truncate">{doc.filename}</span>
                        <Download
                          className={`h-3 w-3 flex-shrink-0 ml-2 ${
                            downloadingId === doc.id ? 'animate-spin' : ''
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
