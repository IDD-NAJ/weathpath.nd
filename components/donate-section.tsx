"use client"

import { useState } from "react"
import { Copy, Check, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface DonateSectionProps {
  cryptoOptions: Array<{
    name: string
    symbol: string
    address: string
    icon: string
    color: string
  }>
}

export function DonateSection({ cryptoOptions }: DonateSectionProps) {
  if (!cryptoOptions || cryptoOptions.length === 0) {
    return null
  }

  return (
    <section className="py-16 lg:py-24 px-6 bg-gradient-to-br from-surface-1 to-background">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
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

        {/* Donation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cryptoOptions.map((option) => (
            <DonationCard key={option.symbol} {...option} />
          ))}
        </div>

        {/* Note */}
        <p className="text-sm text-muted-foreground text-center">
          All donations go directly to supporting WealthPath&apos;s mission of democratizing financial education. We are independent and ad-free.
        </p>
      </div>
    </section>
  )
}

function DonationCard({
  name,
  symbol,
  address,
  icon,
  color,
}: {
  name: string
  symbol: string
  address: string
  icon: string
  color: string
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="border-border hover:border-primary/30 transition-colors">
      <CardHeader className={`bg-gradient-to-br ${color} bg-opacity-10`}>
        <div className="flex items-center gap-3">
          <div className={`text-3xl font-bold bg-gradient-to-br ${color} bg-clip-text text-transparent`}>
            {icon}
          </div>
          <div>
            <CardTitle className="text-base">{name}</CardTitle>
            <CardDescription className="text-xs">{symbol}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 flex flex-col gap-3">
        {/* Address Preview */}
        <div className="p-3 rounded-lg bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground mb-1 font-medium">Wallet Address</p>
          <p className="font-mono text-xs break-all text-foreground leading-relaxed">
            {address.slice(0, 16)}...{address.slice(-16)}
          </p>
        </div>

        {/* Copy Button */}
        <Button
          onClick={handleCopy}
          variant="outline"
          size="sm"
          className="w-full gap-1.5 hover:bg-primary/10"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy Address
            </>
          )}
        </Button>

        {/* Full Address (hidden on mobile) */}
        <details className="group">
          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors">
            Show full address
          </summary>
          <div className="mt-2 p-2 rounded bg-muted/30 border border-border">
            <p className="font-mono text-xs break-all text-foreground leading-relaxed">
              {address}
            </p>
          </div>
        </details>
      </CardContent>
    </Card>
  )
}
