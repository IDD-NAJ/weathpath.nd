"use client"

import { useState } from "react"
import { Mail, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CommunitySignup() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/community/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          setError("Already a member with this email")
        } else {
          setError(data.error || "Failed to join community")
        }
        return
      }

      setSuccess(true)
      setEmail("")
      setName("")
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError("Failed to join. Please try again.")
      console.error("[v0] Signup error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-sm border border-border bg-card p-8">
      <h3 className="font-serif text-2xl font-bold text-foreground mb-2">
        Join Our Community
      </h3>
      <p className="text-muted-foreground mb-6">
        Connect with fellow wealth builders, share strategies, and grow together.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
            Your Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-sm border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-sm border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>

        {error && (
          <div className="flex gap-2 rounded-sm bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex gap-2 rounded-sm bg-green-500/10 p-3 text-sm text-green-600">
            <Check className="h-4 w-4 shrink-0" />
            Welcome to the community!
          </div>
        )}

        <Button
          type="submit"
          disabled={loading || !email}
          className="w-full gap-2 rounded-sm"
        >
          <Mail className="h-4 w-4" />
          {loading ? "Joining..." : "Join Community"}
        </Button>
      </form>
    </div>
  )
}
