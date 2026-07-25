"use client"

import { useEffect, useState, useRef } from "react"
import { useSearchParams, useParams } from "next/navigation"
import Link from "next/link"
import { Download, Mail, CheckCircle2, Home, Play, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SimpleLayoutWrapper } from "@/components/layout-wrapper"

interface Order {
  id: string
  reference?: string
  email: string
  buyer_name?: string
  name?: string
  course_title?: string
  course_slug?: string
  status: string
  created_at: string
}

interface CourseDocument {
  id: string
  file_name: string
  file_type: string
  file_size: number
}

export default function SuccessPage() {
  const params = useParams() as { slug: string }
  const searchParams = useSearchParams()
  const orderId = searchParams.get("order")
  const sessionId = searchParams.get("session_id")
  const email = searchParams.get("email")
  const courseSlug = params.slug
  const [order, setOrder] = useState<Order | null>(null)
  const [documents, setDocuments] = useState<CourseDocument[]>([])
  const [courseId, setCourseId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(false)
  const verified = useRef(false)

  useEffect(() => {
    async function confirmAndLoad() {
      if (sessionId && !verified.current) {
        verified.current = true
        setConfirming(true)
        try {
          // Auto-confirm the order by verifying payment with Stripe
          const res = await fetch("/api/stripe/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
          })
          const data = await res.json()

          if (data.confirmed && data.order) {
            setOrder({ ...data.order, course_slug: courseSlug })
          } else if (email) {
            setOrder({
              id: sessionId,
              email,
              status: data.confirmed ? "completed" : "processing",
              created_at: new Date().toISOString(),
              course_slug: courseSlug,
            })
          }
        } catch (error) {
          console.error("[v0] Order confirmation failed:", error)
          if (email) {
            setOrder({
              id: sessionId,
              email,
              status: "completed",
              created_at: new Date().toISOString(),
              course_slug: courseSlug,
            })
          }
        } finally {
          setConfirming(false)
          setLoading(false)
        }
      } else if (orderId && !verified.current) {
        verified.current = true
        try {
          const res = await fetch(`/api/orders?id=${orderId}`)
          const data = await res.json()
          setOrder({ ...data.order, course_slug: courseSlug })
        } catch (error) {
          console.error("[v0] Failed to fetch order:", error)
        } finally {
          setLoading(false)
        }
      } else if (!sessionId && !orderId) {
        setLoading(false)
      }
    }
    confirmAndLoad()
  }, [orderId, sessionId, email, courseSlug])

  // Load the course id, then any downloadable documents for it
  useEffect(() => {
    async function loadDocuments() {
      const buyerEmail = order?.email || email
      if (!buyerEmail || !courseSlug) return
      try {
        const coursesRes = await fetch("/api/courses")
        const coursesData = await coursesRes.json()
        const course = (coursesData.courses || []).find((c: any) => c.slug === courseSlug)
        if (!course) return
        setCourseId(course.id)

        const docsRes = await fetch(
          `/api/courses/documents?courseId=${course.id}&email=${encodeURIComponent(buyerEmail)}`
        )
        if (docsRes.ok) {
          const docsData = await docsRes.json()
          setDocuments(docsData.documents || [])
        }
      } catch (error) {
        console.error("[v0] Failed to load documents:", error)
      }
    }
    if (order) loadDocuments()
  }, [order, email, courseSlug])

  const buyerEmail = order?.email || email || ""

  function formatSize(bytes: number) {
    if (!bytes) return ""
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <SimpleLayoutWrapper>
      <main className="min-h-screen bg-background py-20">
        <div className="mx-auto max-w-2xl px-6">
          <div className="text-center space-y-8 animate-fade-up">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/15 p-4">
                {confirming ? (
                  <Loader2 className="h-12 w-12 text-primary animate-spin" />
                ) : (
                  <CheckCircle2 className="h-12 w-12 text-primary" />
                )}
              </div>
            </div>

            {/* Heading */}
            <div className="space-y-3">
              <h1 className="font-serif text-5xl font-bold text-foreground text-balance">
                {confirming ? "Confirming Your Order..." : "Order Confirmed!"}
              </h1>
              <p className="text-xl text-muted-foreground">
                {confirming
                  ? "Verifying your payment with Stripe."
                  : "Thank you for your purchase. Your course access is ready."}
              </p>
            </div>

            {/* Order Details */}
            {!loading && order && (
              <div className="rounded-sm border border-border bg-card p-8 text-left space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Order Number</p>
                    <p className="font-mono font-bold text-foreground break-all text-sm">
                      {order.reference || order.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Delivery Email</p>
                    <p className="font-semibold text-foreground">{order.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Buyer</p>
                    <p className="font-semibold text-foreground">
                      {order.buyer_name || order.name || "Valued Customer"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                      <span className="font-semibold text-foreground capitalize">{order.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Course Documents */}
            {documents.length > 0 && courseId && (
              <div className="rounded-sm border border-primary/30 bg-primary/5 p-6 text-left space-y-4">
                <h3 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Your Course Materials
                </h3>
                <div className="flex flex-col gap-2">
                  {documents.map((doc) => (
                    <a
                      key={doc.id}
                      href={`/api/courses/documents?courseId=${courseId}&documentId=${doc.id}&email=${encodeURIComponent(buyerEmail)}`}
                      className="flex items-center justify-between rounded-sm border border-border bg-card p-3 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm font-medium text-foreground truncate">
                          {doc.file_name}
                        </span>
                        {doc.file_size > 0 && (
                          <span className="text-xs text-muted-foreground shrink-0">
                            {formatSize(doc.file_size)}
                          </span>
                        )}
                      </div>
                      <Download className="h-4 w-4 text-muted-foreground shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="rounded-sm border border-border bg-card p-6 text-left space-y-4">
              <h3 className="font-serif text-lg font-bold text-foreground">Next Steps</h3>
              <ol className="space-y-3 list-decimal list-inside">
                <li className="text-muted-foreground">
                  Download your course materials above, or start learning online
                </li>
                <li className="text-muted-foreground">
                  Access your purchases anytime from your dashboard
                </li>
                <li className="text-muted-foreground">
                  Learn at your own pace with lifetime access
                </li>
              </ol>
            </div>

            {/* Info Box */}
            <div className="rounded-sm bg-muted/50 p-6 space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="font-semibold text-foreground">Need Help?</p>
                  <p className="text-sm text-muted-foreground">
                    Contact support at support@wealthpath.com with your order number
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {order && (
                <Button asChild className="gap-2 rounded-sm">
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
              <Button asChild variant="outline" className="gap-2 rounded-sm">
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
