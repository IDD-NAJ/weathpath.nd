"use client"

/**
 * SSO Callback page
 *
 * Clerk redirects here after a social sign-in (Google / GitHub).
 * AuthenticateWithCallback handles the token exchange and then
 * redirects to /dashboard (or wherever redirectUrlComplete points).
 */

import { useEffect } from "react"
import { useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { TrendingUp, Loader2 } from "lucide-react"

export default function SsoCallbackPage() {
  const { handleRedirectCallback } = useClerk()
  const router = useRouter()

  useEffect(() => {
    handleRedirectCallback({
      afterSignInUrl: "/dashboard",
      afterSignUpUrl: "/dashboard",
    }).catch(() => {
      // If the callback fails (e.g. popup closed), fall back to login
      router.push("/login")
    })
  }, [handleRedirectCallback, router])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
        <TrendingUp className="h-6 w-6 text-primary-foreground" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  )
}
