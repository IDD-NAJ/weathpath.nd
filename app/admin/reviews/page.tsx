"use client"

import { useState } from "react"
import useSWR from "swr"
import { MessageSquare, Star, Check, X, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const STATUS_TABS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
]

export default function AdminReviewsPage() {
  const [status, setStatus] = useState("pending")
  const { data, mutate, isLoading } = useSWR(`/api/admin/reviews?status=${status}`, fetcher)

  const reviews = data?.reviews || []
  const counts = data?.counts || {}

  const setReviewStatus = async (id: string, newStatus: string) => {
    await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    })
    mutate()
  }

  const deleteReview = async (id: string) => {
    if (!confirm("Permanently delete this review?")) return
    await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" })
    mutate()
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
          <MessageSquare className="h-7 w-7 text-primary" />
          Review Moderation
        </h2>
        <p className="text-sm text-muted-foreground">
          Approve or reject user reviews before they appear on the site
        </p>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter reviews by status">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={status === tab.value}
            onClick={() => setStatus(tab.value)}
            className={`rounded-sm border px-4 py-2 text-sm font-medium transition-colors ${
              status === tab.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.value !== "all" && counts[tab.value] != null && (
              <span className="ml-2 rounded-full bg-background/20 px-2 py-0.5 text-xs">{counts[tab.value]}</span>
            )}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base capitalize">{status === "all" ? "All Reviews" : `${status} Reviews`}</CardTitle>
          <CardDescription>{reviews.length} shown</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : reviews.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No {status !== "all" ? status : ""} reviews.</p>
          ) : (
            <ul className="space-y-4">
              {reviews.map((review: any) => (
                <li key={review.id} className="rounded-sm border border-border bg-card/50 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-foreground">{review.author_name}</span>
                        <span className="text-xs text-muted-foreground">{review.author_email}</span>
                        <Badge variant="outline" className="capitalize">
                          {review.content_type}
                        </Badge>
                        <Badge
                          variant={
                            review.status === "approved"
                              ? "secondary"
                              : review.status === "rejected"
                                ? "destructive"
                                : "default"
                          }
                          className="capitalize"
                        >
                          {review.status}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-1" aria-label={`${review.rating} out of 5 stars`}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-4 w-4 ${
                              s <= review.rating ? "fill-primary text-primary" : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-xs text-muted-foreground">
                          {new Date(review.created_at).toLocaleString()}
                        </span>
                      </div>
                      {review.title && <p className="mt-2 font-medium text-foreground">{review.title}</p>}
                      {review.body && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{review.body}</p>}
                    </div>
                    <div className="flex shrink-0 gap-2">
                      {review.status !== "approved" && (
                        <Button
                          size="sm"
                          className="gap-1 rounded-sm"
                          onClick={() => setReviewStatus(review.id, "approved")}
                        >
                          <Check className="h-3.5 w-3.5" />
                          Approve
                        </Button>
                      )}
                      {review.status !== "rejected" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 rounded-sm bg-transparent"
                          onClick={() => setReviewStatus(review.id, "rejected")}
                        >
                          <X className="h-3.5 w-3.5" />
                          Reject
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-sm text-destructive hover:text-destructive bg-transparent"
                        onClick={() => deleteReview(review.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
