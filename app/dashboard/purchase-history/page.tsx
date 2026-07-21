'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Download, Eye, Calendar, DollarSign, CheckCircle2 } from 'lucide-react'
import useSWR from 'swr'

interface Purchase {
  id: number
  course_id: number
  user_email: string
  payment_status: string
  created_at: string
  amount_cents: number
  order_id: string
  course?: {
    title: string
    slug: string
    cover_image: string
  }
}

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Failed to fetch')
  return response.json()
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

const formatPrice = (cents: number) => {
  return `$${(cents / 100).toFixed(2)}`
}

export default function PurchaseHistoryPage() {
  const [email, setEmail] = useState<string | null>(null)
  const { data: purchases, isLoading, error } = useSWR(
    email ? `/api/user/purchases?email=${encodeURIComponent(email)}` : null,
    fetcher
  )

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail')
    setEmail(storedEmail)
  }, [])

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm" className="gap-2 rounded-lg">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">Purchase History</h1>
          <p className="text-muted-foreground">View all your course purchases and receipts</p>
        </div>
      </div>

      {!email ? (
        <Card className="border-border/60 bg-card">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">Sign in to see your purchase history</p>
            <Button asChild className="rounded-lg">
              <Link href="/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted/30 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : error || !purchases || purchases.length === 0 ? (
        <Card className="border-border/60 bg-card">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">No purchases yet</h3>
            <p className="text-muted-foreground mb-6">You haven&apos;t purchased any courses yet. Explore our collection to get started.</p>
            <Button asChild className="rounded-lg">
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/60 bg-card">
          <CardHeader>
            <CardTitle>Your Purchases</CardTitle>
            <CardDescription>{purchases.length} {purchases.length === 1 ? 'purchase' : 'purchases'} total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {purchases.map((purchase: Purchase) => (
                <div
                  key={purchase.id}
                  className="rounded-lg border border-border/40 bg-muted/30 hover:bg-muted/50 transition-colors p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h4 className="font-semibold text-foreground line-clamp-2">
                            {purchase.course?.title || 'Course'}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Order: {purchase.order_id}
                          </p>
                        </div>
                        <Badge
                          variant={purchase.payment_status === 'paid' ? 'default' : 'secondary'}
                          className="flex-shrink-0 rounded-md flex items-center gap-1"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          {purchase.payment_status === 'paid' ? 'Paid' : 'Pending'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 text-xs text-muted-foreground mt-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(purchase.created_at)}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {formatPrice(purchase.amount_cents)}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      {purchase.course?.slug && (
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="rounded-lg gap-1"
                        >
                          <Link href={`/courses/${purchase.course.slug}/learn?email=${encodeURIComponent(email)}`}>
                            <Eye className="h-4 w-4" />
                            <span className="hidden sm:inline">View Course</span>
                          </Link>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg gap-1"
                      >
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Receipt</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Card */}
      {purchases && purchases.length > 0 && (
        <Card className="border-border/60 bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {formatPrice(purchases.reduce((sum: number, p: Purchase) => sum + p.amount_cents, 0))}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Courses Purchased</p>
                <p className="text-2xl font-bold text-foreground mt-1">{purchases.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="text-2xl font-bold text-green-500 mt-1">
                  {purchases.filter((p: Purchase) => p.payment_status === 'paid').length}/{purchases.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
