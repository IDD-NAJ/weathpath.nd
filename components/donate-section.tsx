"use client"

import { useState } from "react"
import { Heart, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export function DonateSection() {
  const [isLoading, setIsLoading] = useState(false)
  const [customAmount, setCustomAmount] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [error, setError] = useState('')

  const handleDonate = async (amount: number) => {
    if (amount < 1) {
      setError('Amount must be at least $1')
      return
    }

    setIsLoading(true)
    setError('')
    try {
      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountCents: Math.round(amount * 100) }),
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Failed to start donation')
        return
      }

      if (data.sessionUrl) {
        window.location.href = data.sessionUrl
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCustom = async () => {
    const amount = parseFloat(customAmount)
    if (!amount || amount < 1) {
      setError('Please enter a valid amount')
      return
    }
    await handleDonate(amount)
  }

  return (
    <section className="py-16 lg:py-24 px-6 bg-gradient-to-br from-surface-1 to-background">
      <div className="max-w-2xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <Heart className="h-6 w-6 text-accent fill-accent" />
            <h2 className="text-3xl lg:text-4xl font-bold font-serif text-foreground">Support Our Mission</h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Help us create more free financial education content. Your donation enables us to build tools, write guides, and teach people how to build generational wealth.
          </p>
        </div>

        {/* Donation Card */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Make a Donation</CardTitle>
            <CardDescription>Support our mission with a secure donation</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {!showCustom && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[5, 10, 25, 50].map((amount) => (
                    <Button
                      key={amount}
                      onClick={() => handleDonate(amount)}
                      disabled={isLoading}
                      variant="outline"
                      className="w-full"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        </>
                      ) : (
                        `$${amount}`
                      )}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setShowCustom(true)}
                  disabled={isLoading}
                  className="w-full text-muted-foreground"
                >
                  Other Amount
                </Button>
              </>
            )}

            {showCustom && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="flex items-center rounded-md border border-input bg-background px-3 flex-1">
                    <span className="text-foreground font-medium">$</span>
                    <Input
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="Enter amount"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="border-0 bg-transparent text-foreground focus-visible:ring-0"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCustom}
                    disabled={isLoading || !customAmount}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Donate'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCustom(false)
                      setCustomAmount('')
                      setError('')
                    }}
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Note */}
        <p className="text-sm text-muted-foreground text-center">
          All donations go directly to supporting WealthPath&apos;s mission of democratizing financial education. We are independent and ad-free.
        </p>
      </div>
    </section>
  )
}
