"use client"

import { useEffect, useState } from "react"
import { Eye } from "lucide-react"

interface ViewTrackerProps {
  contentType: "course" | "article" | "story"
  contentId: string
  /** Show the live view count next to an eye icon */
  showCount?: boolean
  className?: string
}

export function ViewTracker({ contentType, contentId, showCount = true, className }: ViewTrackerProps) {
  const [views, setViews] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content_type: contentType, content_id: contentId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && typeof data.views === "number") setViews(data.views)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [contentType, contentId])

  if (!showCount || views === null) return null

  return (
    <span className={`inline-flex items-center gap-1.5 text-sm text-muted-foreground ${className || ""}`}>
      <Eye className="h-4 w-4" aria-hidden="true" />
      <span>
        {views.toLocaleString()} {views === 1 ? "view" : "views"}
      </span>
    </span>
  )
}
