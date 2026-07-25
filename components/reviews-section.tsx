"use client"

import type React from "react"
import { useState } from "react"
import useSWR from "swr"
import Link from "next/link"
import { Star, MessageSquare, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface ReviewsSectionProps {
  contentType: "course" | "article" | "story"
  contentId: string
  title?: string
}

function StarRating({
  value,
  onChange,
  readOnly = false,
  size = "h-5 w-5",
}: {
  value: number
  onChange?: (v: number) => void
  readOnly?: boolean
  size?: string
}) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex items-center gap-1" role={readOnly ? "img" : "radiogroup"} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          className={readOnly ? "cursor-default" : "cursor-pointer transition-transform hover:scale-110"}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
        >
          <Star
            className={`${size} ${
              star <= (hover || value) ? "fill-primary text-primary" : "fill-transparent text-muted-foreground/40"
            }`}
          />
        </button>
      ))}
    </div>
  )
}

export function ReviewsSection({ contentType, contentId, title = "Reviews" }: ReviewsSectionProps) {
  const key = `/api/reviews?content_type=${contentType}&content_id=${encodeURIComponent(contentId)}`
  const { data, mutate, isLoading } = useSWR(key, fetcher)

  const [rating, setRating] = useState(0)
  const [reviewTitle, setReviewTitle] = useState("")
  const [reviewBody, setReviewBody] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      setError("Please select a star rating")
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_type: contentType,
          content_id: contentId,
          rating,
          title: reviewTitle,
          body: reviewBody,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || "Failed to submit review")
      } else {
        setMessage(json.message || "Review submitted")
        setShowForm(false)
        setRating(0)
        setReviewTitle("")
        setReviewBody("")
        mutate()
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const reviews = data?.reviews || []
  const average = data?.average
  const total = data?.total || 0
  const myReview = data?.myReview
  const isLoggedIn = data?.isLoggedIn

  return (
    <section className="space-y-6" aria-labelledby={`reviews-heading-${contentType}-${contentId}`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h2 id={`reviews-heading-${contentType}-${contentId}`} className="font-serif text-2xl font-bold text-foreground">
            {title}
          </h2>
        </div>
        {average != null && total > 0 && (
          <div className="flex items-center gap-2">
            <StarRating value={Math.round(average)} readOnly size="h-4 w-4" />
            <span className="text-sm font-medium text-foreground">{Number(average).toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">
              ({total} {total === 1 ? "review" : "reviews"})
            </span>
          </div>
        )}
      </div>

      {message && (
        <p className="rounded-sm border border-primary/30 bg-primary/5 p-3 text-sm text-foreground" role="status">
          {message}
        </p>
      )}

      {/* Write / edit review */}
      {isLoggedIn ? (
        !showForm ? (
          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-sm bg-transparent" onClick={() => {
              setShowForm(true)
              if (myReview) {
                setRating(myReview.rating)
                setReviewTitle(myReview.title || "")
                setReviewBody(myReview.body || "")
              }
            }}>
              {myReview ? "Edit your review" : "Write a review"}
            </Button>
            {myReview?.status === "pending" && (
              <span className="text-xs text-muted-foreground">Your review is pending approval</span>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 rounded-sm border border-border bg-card p-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Your rating</label>
              <StarRating value={rating} onChange={setRating} size="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <label htmlFor={`review-title-${contentId}`} className="text-sm font-medium text-foreground">
                Title (optional)
              </label>
              <input
                id={`review-title-${contentId}`}
                type="text"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                maxLength={200}
                placeholder="Summarize your experience"
                className="h-10 w-full rounded-sm border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor={`review-body-${contentId}`} className="text-sm font-medium text-foreground">
                Review (optional)
              </label>
              <textarea
                id={`review-body-${contentId}`}
                value={reviewBody}
                onChange={(e) => setReviewBody(e.target.value)}
                maxLength={4000}
                rows={4}
                placeholder="Share what you liked or what could be better"
                className="w-full rounded-sm border border-border bg-background p-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting} className="gap-2 rounded-sm">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Submit review
              </Button>
              <Button type="button" variant="ghost" className="rounded-sm" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )
      ) : (
        <p className="text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Log in
          </Link>{" "}
          to leave a review.
        </p>
      )}

      {/* Review list */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="py-4 text-sm text-muted-foreground">No reviews yet. Be the first to share your experience.</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review: any) => (
            <li key={review.id} className="rounded-sm border border-border bg-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-sm font-semibold text-primary">
                    {review.profile_photo_url ? (
                      <img
                        src={review.profile_photo_url || "/placeholder.svg"}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      (review.author_name || "?").charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{review.author_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <StarRating value={review.rating} readOnly size="h-4 w-4" />
              </div>
              {review.title && <p className="mt-3 font-semibold text-foreground">{review.title}</p>}
              {review.body && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{review.body}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
