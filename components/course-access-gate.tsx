"use client"

import { useEffect, useState } from "react"
import { Lock, Unlock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface CourseAccessGateProps {
  courseId: number
  courseTitle: string
  courseSlug: string
  children: React.ReactNode
}

export function CourseAccessGate({
  courseId,
  courseTitle,
  courseSlug,
  children,
}: CourseAccessGateProps) {
  const [hasPurchase, setHasPurchase] = useState<boolean | null>(null)
  const [userEmail, setUserEmail] = useState("")
  const [checkingEmail, setCheckingEmail] = useState("")

  useEffect(() => {
    // Get email from localStorage or prompt user
    const stored = localStorage.getItem("userEmail")
    if (stored) {
      setCheckingEmail(stored)
      checkPurchase(stored)
    }
  }, [])

  const checkPurchase = async (email: string) => {
    try {
      const res = await fetch(
        `/api/purchases/check?email=${encodeURIComponent(email)}&courseId=${courseId}`
      )
      const data = await res.json()
      setHasPurchase(data.hasPurchase)
    } catch (err) {
      console.error("[v0] Failed to check purchase:", err)
      setHasPurchase(false)
    }
  }

  const handleCheckAccess = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userEmail) return
    setCheckingEmail(userEmail)
    localStorage.setItem("userEmail", userEmail)
    await checkPurchase(userEmail)
  }

  if (hasPurchase === null && !checkingEmail) {
    return (
      <div className="rounded-sm border border-border bg-card p-8 space-y-6">
        <div className="text-center space-y-2">
          <Unlock className="h-12 w-12 text-primary mx-auto" />
          <h3 className="font-serif text-xl font-bold text-foreground">
            Verify Your Access
          </h3>
          <p className="text-muted-foreground">
            Enter your email to check if you have access to this course.
          </p>
        </div>

        <form onSubmit={handleCheckAccess} className="space-y-4">
          <input
            type="email"
            placeholder="your@email.com"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            required
            className="w-full rounded-sm border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
          />
          <Button
            type="submit"
            disabled={!userEmail}
            className="w-full rounded-sm"
          >
            Check Access
          </Button>
        </form>
      </div>
    )
  }

  if (hasPurchase === false) {
    return (
      <div className="rounded-sm border border-border bg-card p-8 space-y-6">
        <div className="text-center space-y-2">
          <Lock className="h-12 w-12 text-red-600 mx-auto" />
          <h3 className="font-serif text-xl font-bold text-foreground">
            Premium Content Locked
          </h3>
          <p className="text-muted-foreground">
            You haven&apos;t purchased this course yet. Complete your purchase to access all content.
          </p>
        </div>

        <div className="space-y-3">
          <Button asChild className="w-full rounded-sm gap-2 bg-primary">
            <Link href={`/courses/${courseSlug}`}>
              <Lock className="h-4 w-4" />
              Purchase Course
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-sm"
            onClick={() => {
              setUserEmail("")
              setCheckingEmail("")
              setHasPurchase(null)
            }}
          >
            Use Different Email
          </Button>
        </div>
      </div>
    )
  }

  if (hasPurchase === true) {
    return <>{children}</>
  }

  return null
}
