"use client"

/**
 * /logout — Signs the user out via Clerk and redirects home.
 * Any nav bar "Log out" link points here.
 */

import { useEffect } from "react"
import { useClerk } from "@clerk/nextjs"
import { TrendingUp, Loader2 } from "lucide-react"

export default function LogoutPage() {
  const { signOut } = useClerk()

  useEffect(() => {
    signOut({ redirectUrl: "/" })
  }, [signOut])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
        <TrendingUp className="h-6 w-6 text-primary-foreground" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Signing out...</p>
      </div>
    </div>
  )
}
