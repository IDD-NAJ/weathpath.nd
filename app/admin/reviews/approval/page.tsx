'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, Check, X, Loader2 } from 'lucide-react'

interface Review {
  id: number
  rating: number
  comment: string
  status: string
  created_at: string
  content_type: string
  content_id: string
  email: string
  name: string
}

export default function ReviewApprovalPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState<number | null>(null)
  const [selectedStatus, setSelectedStatus] = useState('pending')
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchReviews()
  }, [selectedStatus])

  async function fetchReviews() {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/reviews/approval?status=${selectedStatus}`)
      const data = await res.json()
      setReviews(data.reviews || [])
      setTotal(data.total || 0)
    } catch (err) {
      console.error('[v0] Failed to fetch reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(reviewId: number) {
    try {
      setApproving(reviewId)
      const res = await fetch('/api/admin/reviews/approval', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, status: 'approved' }),
      })

      if (res.ok) {
        await fetchReviews()
      } else {
        alert('Failed to approve review')
      }
    } catch (err) {
      console.error('[v0] Failed to approve review:', err)
      alert('Error approving review')
    } finally {
      setApproving(null)
    }
  }

  async function handleReject(reviewId: number) {
    try {
      setApproving(reviewId)
      const reason = prompt('Reason for rejection (optional):')
      const res = await fetch('/api/admin/reviews/approval', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, status: 'rejected', reason }),
      })

      if (res.ok) {
        await fetchReviews()
      } else {
        alert('Failed to reject review')
      }
    } catch (err) {
      console.error('[v0] Failed to reject review:', err)
      alert('Error rejecting review')
    } finally {
      setApproving(null)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <CardHeader className="mb-6 px-0">
          <CardTitle className="text-3xl">Review Approval Queue</CardTitle>
          <CardDescription>Moderate and approve user reviews before publishing</CardDescription>
        </CardHeader>

        {/* Status tabs */}
        <div className="mb-6 flex gap-2 border-b border-border">
          {['pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                selectedStatus === status
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} ({total})
            </button>
          ))}
        </div>

        {/* Reviews list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : reviews.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No reviews found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* User info */}
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{review.name || 'Anonymous'}</p>
                          <p className="text-sm text-muted-foreground">{review.email}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {review.content_type}
                        </Badge>
                      </div>

                      {/* Rating */}
                      <div className="mb-3 flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground/30'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Comment */}
                      <p className="text-sm leading-relaxed text-foreground">{review.comment}</p>
                    </div>

                    {/* Actions */}
                    {selectedStatus === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(review.id)}
                          disabled={approving === review.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {approving === review.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                          <span className="ml-1 hidden sm:inline">Approve</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(review.id)}
                          disabled={approving === review.id}
                        >
                          {approving === review.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                          <span className="ml-1 hidden sm:inline">Reject</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
