"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Mail, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Course {
  id: string
  slug: string
  title: string
  price: number
}

export function CourseCheckout({ course }: { course: Course }) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Simulated checkout - in production, this would use Stripe
      if (!email || !name || !cardNumber) {
        throw new Error("Please fill in all fields")
      }

      if (cardNumber.replace(/\s/g, "").length !== 16) {
        throw new Error("Invalid card number")
      }

      // Create order with simulated payment
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_id: course.id,
          email,
          name,
          amount: course.price * 100, // in cents
          status: "completed", // simulated as already paid
        }),
      })

      if (!response.ok) {
        throw new Error("Order creation failed")
      }

      const { order } = await response.json()
      setSuccess(true)

      // Redirect to success page
      setTimeout(() => {
        router.push(`/courses/${course.slug}/success?order=${order.id}`)
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Checkout failed. Please try again.")
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-sm border border-border bg-card p-8 text-center space-y-4 animate-fade-up">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-500/20 p-3">
            <Check className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <h3 className="font-serif text-2xl font-bold text-foreground">
          Order Confirmed!
        </h3>
        <p className="text-muted-foreground">
          Check your email at <strong>{email}</strong> for your course access.
        </p>
        <p className="text-sm text-muted-foreground">
          Redirecting...
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-sm border border-border bg-card p-8 space-y-6" id="checkout">
      <div>
        <h3 className="font-serif text-2xl font-bold text-foreground">
          Secure Checkout
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Your payment is encrypted and secure
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
            We'll send your course to this email
          </p>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Full Name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
            className="rounded-sm"
          />
        </div>

        {/* Card Number (simulated) */}
        <div className="space-y-2">
          <Label htmlFor="card" className="text-sm font-medium">
            Card Number
          </Label>
          <Input
            id="card"
            type="text"
            placeholder="4242 4242 4242 4242"
            value={cardNumber}
            onChange={(e) => {
              let val = e.target.value.replace(/\s/g, "").slice(0, 16)
              val = val.replace(/(\d{4})/g, "$1 ").trim()
              setCardNumber(val)
            }}
            required
            disabled={loading}
            maxLength={19}
            className="rounded-sm font-mono"
          />
          <p className="text-xs text-muted-foreground">
            Test: 4242 4242 4242 4242
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
              ${course.price.toFixed(2)}
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
              Processing...
            </>
          ) : (
            <>
              <Mail className="h-5 w-5" />
              Buy Course ${course.price.toFixed(2)}
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Your course will be delivered instantly to your email.
        </p>
      </form>
    </div>
  )
}
