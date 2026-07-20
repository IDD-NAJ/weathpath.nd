"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Download, Mail, CheckCircle2, Home, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SimpleLayoutWrapper } from "@/components/layout-wrapper"
import { useParams } from "next/navigation"

interface Order {
  id: string
  email: string
  name: string
  course_title: string
  course_slug?: string
  status: string
  created_at: string
}

export default function SuccessPage() {
  const params = useParams() as { slug: string }
  const searchParams = useSearchParams()
  const orderId = searchParams.get("order")
  const sessionId = searchParams.get("session_id")
  const email = searchParams.get("email")
  const courseSlug = params.slug
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // For Stripe sessions, we create a minimal order object
    if (sessionId && email) {
      setOrder({
        id: sessionId,
        email,
        name: 'Valued Customer',
        course_title: '',
        course_slug: courseSlug,
        status: 'completed',
        created_at: new Date().toISOString(),
      })
      setLoading(false)
    } else if (orderId) {
      fetch(`/api/orders?id=${orderId}`)
        .then((res) => res.json())
        .then((data) => {
          setOrder({ ...data.order, course_slug: courseSlug })
          setLoading(false)
        })
        .catch((err) => {
          console.error("[v0] Failed to fetch order:", err)
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [orderId, sessionId, email, courseSlug])

  return (
    <SimpleLayoutWrapper>
      <main className="min-h-screen bg-background py-20">
        <div className="mx-auto max-w-2xl px-6">
          <div className="text-center space-y-8 animate-fade-up">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="rounded-full bg-green-500/20 p-4">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
            </div>

            {/* Heading */}
            <div className="space-y-3">
              <h1 className="font-serif text-5xl font-bold text-foreground">
                Order Confirmed!
              </h1>
              <p className="text-xl text-muted-foreground">
                Thank you for your purchase. Your course is on the way.
              </p>
            </div>

            {/* Order Details */}
            {!loading && order && (
              <div className="rounded-sm border border-border bg-card p-8 text-left space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Order ID */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Order Number
                    </p>
                    <p className="font-mono font-bold text-foreground break-all">
                      {order.id}
                    </p>
                  </div>

                  {/* Email */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Delivery Email
                    </p>
                    <p className="font-semibold text-foreground">
                      {order.email}
                    </p>
                  </div>

                  {/* Course */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Course
                    </p>
                    <p className="font-semibold text-foreground">
                      {order.course_title}
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Status
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="font-semibold text-foreground capitalize">
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="rounded-sm border border-primary/30 bg-primary/5 p-6 text-left space-y-4">
              <h3 className="font-serif text-lg font-bold text-foreground">
                Next Steps
              </h3>
              <ol className="space-y-3 list-decimal list-inside">
                <li className="text-muted-foreground">
                  Check your email (and spam folder) for your course access
                </li>
                <li className="text-muted-foreground">
                  Click the download link to access all course materials
                </li>
                <li className="text-muted-foreground">
                  Start learning at your own pace with lifetime access
                </li>
              </ol>
            </div>

            {/* Info Box */}
            <div className="rounded-sm bg-muted/50 p-6 space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="font-semibold text-foreground">
                    Email Not Received?
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Check your spam folder or contact support at support@wealthpath.com
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {order && (
                <Button asChild className="gap-2 rounded-sm bg-green-600 hover:bg-green-700">
                  <Link href={`/courses/${order.course_slug}/learn?email=${encodeURIComponent(order.email)}`}>
                    <Play className="h-5 w-5" />
                    Start Learning Now
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline" className="gap-2 rounded-sm">
                <Link href="/courses">
                  <Download className="h-5 w-5" />
                  Browse More Courses
                </Link>
              </Button>
              <Button asChild className="gap-2 rounded-sm">
                <Link href="/">
                  <Home className="h-5 w-5" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </SimpleLayoutWrapper>
  )
}
