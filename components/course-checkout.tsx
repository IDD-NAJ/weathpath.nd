"use client"

import { useEffect, useState } from "react"
import { Loader2, Mail, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loadStripe } from "@stripe/js"

interface Course {
  id: number
  slug: string
  title: string
  price_cents: number
}

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

export function CourseCheckout({ course }: { course: Course }) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const priceInDollars = (course.price_cents / 100).toFixed(2)

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (!email) {
        throw new Error("Please enter your email")
      }

      // Create checkout session
      const response = await fetch("/api/stripe/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course.id,
          email,
          priceInCents: course.price_cents,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create checkout session")
      }

      const { sessionUrl } = await response.json()

      if (sessionUrl) {
        // Redirect to Stripe Checkout
        window.location.href = sessionUrl
      }
    } catch (err: any) {
      setError(err.message || "Checkout failed. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="rounded-sm border border-border bg-card p-8 space-y-6" id="checkout">
      <div>
        <h3 className="font-serif text-2xl font-bold text-foreground">
          Enroll in Course
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Secure payment powered by Stripe
        </p>
      </div>

      {error && (
        <div className="rounded-sm border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleCheckout} className="space-y-4">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="rounded-sm"
          />
          <p className="text-xs text-muted-foreground">
            We'll send your course access to this email
          </p>
        </div>

        {/* Order Summary */}
        <div className="rounded-sm bg-muted/50 p-4 space-y-2 border border-border">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Course</span>
            <span className="font-medium text-foreground">{course.title}</span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t border-border">
            <span className="font-semibold text-foreground">Total</span>
            <span className="font-serif text-lg font-bold text-primary">
              ${priceInDollars}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full gap-2 py-6 rounded-sm font-semibold text-base"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Redirecting to Stripe...
            </>
          ) : (
            <>
              <Mail className="h-5 w-5" />
              Proceed to Payment
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          You&apos;ll be redirected to Stripe for secure payment. Test card: 4242 4242 4242 4242
        </p>
      </form>
    </div>
  )
}
