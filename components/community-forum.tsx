"use client"

import { useEffect, useState } from "react"
import { MessageSquare, Heart, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Discussion {
  id: number
  title: string
  content: string
  category: string
  views: number
  likes: number
  created_at: string
  author_name: string
  author_email: string
}

export function CommunityForum() {
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [loading, setLoading] = useState(true)
  const [newTitle, setNewTitle] = useState("")
  const [newContent, setNewContent] = useState("")
  const [newCategory, setNewCategory] = useState("general")
  const [userEmail, setUserEmail] = useState("")
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    fetchDiscussions()
  }, [])

  const fetchDiscussions = async () => {
    try {
      const res = await fetch("/api/community/discussions?limit=20")
      const data = await res.json()
      setDiscussions(data.discussions || [])
    } catch (err) {
      console.error("[v0] Failed to fetch discussions:", err)
    } finally {
      setLoading(false)
    }
  }

  const handlePostDiscussion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle || !newContent || !userEmail) return

    setPosting(true)
    try {
      const res = await fetch("/api/community/discussions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          category: newCategory,
          authorEmail: userEmail,
        }),
      })

      if (res.ok) {
        setNewTitle("")
        setNewContent("")
        setNewCategory("general")
        await fetchDiscussions()
      }
    } catch (err) {
      console.error("[v0] Failed to post:", err)
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h3 className="font-serif text-2xl font-bold text-foreground">
          Community Forum
        </h3>
      </div>

      {/* New Discussion Form */}
      <form onSubmit={handlePostDiscussion} className="rounded-sm border border-border bg-card p-6 space-y-4">
        <h4 className="font-semibold text-foreground">Start a Discussion</h4>
        
        <input
          type="email"
          placeholder="Your email"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          required
          className="w-full rounded-sm border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
        />

        <input
          type="text"
          placeholder="Discussion title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          required
          className="w-full rounded-sm border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
        />

        <select
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="w-full rounded-sm border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none"
        >
          <option value="general">General</option>
          <option value="investing">Investing</option>
          <option value="entrepreneurship">Entrepreneurship</option>
          <option value="passive-income">Passive Income</option>
          <option value="resources">Resources</option>
        </select>

        <textarea
          placeholder="Share your thoughts..."
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          required
          rows={4}
          className="w-full rounded-sm border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none resize-none"
        />

        <Button
          type="submit"
          disabled={posting || !newTitle || !newContent || !userEmail}
          className="rounded-sm"
        >
          {posting ? "Posting..." : "Post Discussion"}
        </Button>
      </form>

      {/* Discussions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-sm animate-pulse" />
            ))}
          </div>
        ) : discussions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No discussions yet. Be the first to start one!
          </p>
        ) : (
          discussions.map((discussion) => (
            <div
              key={discussion.id}
              className="rounded-sm border border-border bg-card p-6 hover:shadow-md transition-shadow"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg text-foreground">
                    {discussion.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    by {discussion.author_name}
                  </p>
                </div>
                <span className="inline-block rounded-sm bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  {discussion.category}
                </span>
              </div>

              <p className="text-foreground mb-4 line-clamp-3">{discussion.content}</p>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span>{discussion.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>View replies</span>
                </div>
                <span>{new Date(discussion.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
