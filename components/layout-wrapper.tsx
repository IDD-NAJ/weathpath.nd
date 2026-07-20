import { Navigation } from "@/components/navigation"
import { CtaFooter } from "@/components/cta-footer"
import { TrendingUp } from "lucide-react"
import Link from "next/link"

interface UserShape {
  name: string
  email: string
  role: string
}

interface LayoutWrapperProps {
  children: React.ReactNode
  showFooter?: boolean
  showNavigation?: boolean
  className?: string
  user?: UserShape | null
}

export function LayoutWrapper({ 
  children, 
  showFooter = true, 
  showNavigation = true,
  className = "",
  user = null,
}: LayoutWrapperProps) {
  return (
    <div className={`min-h-screen bg-background ${className}`}>
      {showNavigation && <Navigation user={user} />}
      <main>{children}</main>
      {showFooter && <CtaFooter />}
    </div>
  )
}

// Simple footer for pages that don't need the full CTA footer
export function SimpleFooter() {
  return (
    <footer className="border-t border-border bg-card px-6 py-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2" aria-label="WealthPath home">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <TrendingUp className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="text-sm font-bold text-foreground">WealthPath</span>
        </Link>
        <p className="text-xs text-muted-foreground">
          2026 WealthPath. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

// Layout wrapper for pages that need simple footer
export function SimpleLayoutWrapper({ 
  children, 
  showNavigation = true,
  className = "",
  user = null,
}: { 
  children: React.ReactNode
  showNavigation?: boolean
  className?: string
  user?: UserShape | null
}) {
  return (
    <div className={`min-h-screen bg-background ${className}`}>
      {showNavigation && <Navigation user={user} />}
      <main>{children}</main>
      <SimpleFooter />
    </div>
  )
}
