"use client"

import type React from "react"
import { useState } from "react"
import { Loader2, Mail, Ticket, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Course {
  id: number
  slug: string
  title: string
  price_cents: number
}

export function CourseCheckout({ course }: { course: Course }) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [couponCode, setCouponCode] = useState("")
  const [couponStatus, setCouponStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle")
  const [couponError, setCouponError] = useState("")
  const [percentOff, setPercentOff] = useState(0)

  const discountedCents =
    couponStatus === "valid" ? Math.max(50, Math.round(course.price_cents * (1 - percentOff / 100))) : course.price_cents
  const priceInDollars = (course.price_cents / 100).toFixed(2)
  const finalPriceInDollars = (discountedCents / 100).toFixed(2)

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponStatus("checking")
    setCouponError("")
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode }),
      })
      const json = await res.json()
      if (res.ok && json.valid) {
        setCouponStatus("valid")
        setPercentOff(json.percent_off)
      } else {
        setCouponStatus("invalid")
        setCouponError(json.error || "Invalid coupon code")
      }
    } catch {
      setCouponStatus("invalid")
      setCouponError("Unable to validate coupon")
    }
  }

  const removeCoupon = () => {
    setCouponCode("")
    setCouponStatus("idle")
    setCouponError("")
    setPercentOff(0)
  }

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
          couponCode: couponStatus === "valid" ? couponCode : undefined,
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
        <h3 className="font-serif text-2xl font-bold text-foreground">Enroll in Course</h3>
        <p className="text-sm text-muted-foreground mt-1">Secure payment powered by Stripe</p>
      </div>

      {error && (
        <div className="rounded-sm border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
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
            We&apos;ll send your course access to this email. Purchase as a guest or{" "}
            <a href="/signup" className="text-primary hover:underline">
              create an account
            </a>{" "}
            to save your progress.
          </p>
        </div>

        {/* Coupon Code */}
        <div className="space-y-2">
          <Label htmlFor="coupon" className="text-sm font-medium">
            Coupon Code (optional)
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Ticket className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="coupon"
                type="text"
                placeholder="Enter code"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value.toUpperCase())
                  if (couponStatus !== "idle") {
                    setCouponStatus("idle")
                    setCouponError("")
                    setPercentOff(0)
                  }
                }}
                disabled={loading || couponStatus === "valid"}
                className="rounded-sm pl-9 uppercase placeholder:normal-case"
              />
            </div>
            {couponStatus === "valid" ? (
              <Button type="button" variant="outline" onClick={removeCoupon} className="gap-1 rounded-sm bg-transparent">
                <X className="h-4 w-4" />
                Remove
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={applyCoupon}
                disabled={loading || couponStatus === "checking" || !couponCode.trim()}
                className="rounded-sm bg-transparent"
              >
                {couponStatus === "checking" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
              </Button>
            )}
          </div>
          {couponStatus === "valid" && (
            <p className="flex items-center gap-1 text-xs font-medium text-primary">
              <Check className="h-3.5 w-3.5" />
              {percentOff}% discount applied
            </p>
          )}
          {couponStatus === "invalid" && couponError && (
            <p className="text-xs text-destructive" role="alert">
              {couponError}
            </p>
          )}
        </div>

        {/* Order Summary */}
        <div className="rounded-sm bg-muted/50 p-4 space-y-2 border border-border">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Course</span>
            <span className="font-medium text-foreground">{course.title}</span>
          </div>
          {couponStatus === "valid" && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Original price</span>
                <span className="text-muted-foreground line-through">${priceInDollars}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount ({percentOff}%)</span>
                <span className="font-medium text-primary">
                  -${((course.price_cents - discountedCents) / 100).toFixed(2)}
                </span>
              </div>
            </>
          )}
          <div className="flex justify-between text-sm pt-2 border-t border-border">
            <span className="font-semibold text-foreground">Total</span>
            <span className="font-serif text-lg font-bold text-primary">${finalPriceInDollars}</span>
          </div>
        </div>

        {/* Submit Button */}
        <Button type="submit" disabled={loading} className="w-full gap-2 py-6 rounded-sm font-semibold text-base">
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
          You&apos;ll be redirected to Stripe for secure payment.
        </p>
      </form>
    </div>
  )
}
