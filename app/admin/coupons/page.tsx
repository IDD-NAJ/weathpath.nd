"use client"

import type React from "react"
import { useState } from "react"
import useSWR from "swr"
import { Ticket, Plus, Trash2, Loader2, Power } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AdminCouponsPage() {
  const { data, mutate, isLoading } = useSWR("/api/admin/coupons", fetcher)
  const [code, setCode] = useState("")
  const [percentOff, setPercentOff] = useState("10")
  const [expiresAt, setExpiresAt] = useState("")
  const [maxRedemptions, setMaxRedemptions] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const coupons = data?.coupons || []

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          percent_off: percentOff,
          expires_at: expiresAt || null,
          max_redemptions: maxRedemptions || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || "Failed to create coupon")
      } else {
        setCode("")
        setPercentOff("10")
        setExpiresAt("")
        setMaxRedemptions("")
        mutate()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const toggleActive = async (coupon: any) => {
    await fetch(`/api/admin/coupons/${coupon.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !coupon.active }),
    })
    mutate()
  }

  const deleteCoupon = async (id: string) => {
    if (!confirm("Delete this coupon?")) return
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" })
    mutate()
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
          <Ticket className="h-7 w-7 text-primary" />
          Coupons
        </h2>
        <p className="text-sm text-muted-foreground">Create discount codes applied at checkout</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create Coupon</CardTitle>
          <CardDescription>Percentage discounts applied to any course purchase</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="coupon-code" className="text-sm font-medium text-foreground">
                Code
              </label>
              <input
                id="coupon-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="LAUNCH20"
                required
                className="h-10 rounded-sm border border-border bg-background px-3 text-sm uppercase text-foreground placeholder:normal-case placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="coupon-percent" className="text-sm font-medium text-foreground">
                Percent off
              </label>
              <input
                id="coupon-percent"
                type="number"
                min={1}
                max={100}
                value={percentOff}
                onChange={(e) => setPercentOff(e.target.value)}
                required
                className="h-10 rounded-sm border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="coupon-expiry" className="text-sm font-medium text-foreground">
                Expires (optional)
              </label>
              <input
                id="coupon-expiry"
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="h-10 rounded-sm border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="coupon-max" className="text-sm font-medium text-foreground">
                Max uses (optional)
              </label>
              <input
                id="coupon-max"
                type="number"
                min={1}
                value={maxRedemptions}
                onChange={(e) => setMaxRedemptions(e.target.value)}
                placeholder="Unlimited"
                className="h-10 rounded-sm border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={submitting} className="h-10 w-full gap-2 rounded-sm">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Create
              </Button>
            </div>
          </form>
          {error && (
            <p className="mt-3 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Coupons</CardTitle>
          <CardDescription>{coupons.length} total</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : coupons.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No coupons yet. Create your first discount code above.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-4 py-3 font-semibold text-foreground">Code</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Discount</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Status</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Uses</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Expires</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon: any) => (
                    <tr key={coupon.id} className="border-b border-border hover:bg-muted/50">
                      <td className="px-4 py-3 font-mono font-semibold text-foreground">{coupon.code}</td>
                      <td className="px-4 py-3 text-foreground">{coupon.percent_off}% off</td>
                      <td className="px-4 py-3">
                        <Badge variant={coupon.active ? "secondary" : "outline"}>
                          {coupon.active ? "Active" : "Disabled"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {coupon.times_redeemed}
                        {coupon.max_redemptions ? ` / ${coupon.max_redemptions}` : ""}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : "Never"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-sm bg-transparent"
                            onClick={() => toggleActive(coupon)}
                            title={coupon.active ? "Disable" : "Enable"}
                          >
                            <Power className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-sm text-destructive hover:text-destructive bg-transparent"
                            onClick={() => deleteCoupon(coupon.id)}
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
