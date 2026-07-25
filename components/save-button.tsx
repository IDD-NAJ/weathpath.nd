"use client"

import useSWR from "swr"
import { useRouter } from "next/navigation"
import { Heart, BookmarkPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SaveButtonProps {
  itemType: "article" | "learning_path" | "success_story" | "course"
  itemId: string | number
  itemTitle?: string
  itemSlug?: string
  listType?: "favorite" | "wishlist"
  size?: "sm" | "default"
  showLabel?: boolean
  className?: string
}

const fetcher = (url: string) => fetch(url).then((r) => (r.ok ? r.json() : Promise.reject(r)))

export function SaveButton({
  itemType,
  itemId,
  itemTitle,
  itemSlug,
  listType = "favorite",
  size = "sm",
  showLabel = false,
  className,
}: SaveButtonProps) {
  const router = useRouter()
  const { data, mutate } = useSWR<{ items: Array<any> }>("/api/favorites", fetcher, {
    shouldRetryOnError: false,
  })

  const isSaved = Boolean(
    data?.items?.some(
      (i) =>
        i.item_type === itemType &&
        i.item_id === String(itemId) &&
        i.list_type === listType
    )
  )

  const Icon = listType === "favorite" ? Heart : BookmarkPlus
  const label = listType === "favorite" ? (isSaved ? "Favorited" : "Favorite") : isSaved ? "In Wishlist" : "Wishlist"

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    // Optimistic update
    const optimistic = data
      ? {
          items: isSaved
            ? data.items.filter(
                (i) =>
                  !(
                    i.item_type === itemType &&
                    i.item_id === String(itemId) &&
                    i.list_type === listType
                  )
              )
            : [
                ...data.items,
                {
                  item_type: itemType,
                  item_id: String(itemId),
                  list_type: listType,
                  item_title: itemTitle,
                  item_slug: itemSlug,
                },
              ],
        }
      : data

    try {
      await mutate(
        async () => {
          const res = await fetch("/api/favorites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ itemType, itemId, listType, itemTitle, itemSlug }),
          })
          if (res.status === 401) {
            router.push("/login")
            return data
          }
          if (!res.ok) throw new Error("Failed")
          const fresh = await fetch("/api/favorites").then((r) => r.json())
          return fresh
        },
        { optimisticData: optimistic, rollbackOnError: true, revalidate: false }
      )
    } catch (error) {
      console.error("[v0] Save toggle failed:", error)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      onClick={handleToggle}
      aria-pressed={isSaved}
      aria-label={label}
      className={cn(
        "gap-1.5 rounded-xl",
        isSaved && listType === "favorite" && "border-accent/50 text-accent hover:text-accent",
        isSaved && listType === "wishlist" && "border-primary/50 text-primary hover:text-primary",
        className
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4",
          isSaved && listType === "favorite" && "fill-current"
        )}
      />
      {showLabel && <span className="text-xs">{label}</span>}
    </Button>
  )
}
