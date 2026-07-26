"use client"

/**
 * SSO Callback page — Clerk v7
 *
 * Clerk redirects here after Google / GitHub OAuth.
 * useClerk().handleRedirectCallback() exchanges the token and
 * redirects to /dashboard on success.
 */

import { useEffect } from "react"
import { useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { TrendingUp, Loader2 } from "lucide-react"
import Link from "next/link"

export default function SsoCallbackPage() {
  const clerk = useClerk()
  const router = useRouter()

  useEffect(() => {
    // handleRedirectCallback is the v5–v7 compatible method available on the
    // Clerk client object — it handles the token exchange automatically.
    clerk.handleRedirectCallback({
      afterSignInUrl: "/dashboard",
      afterSignUpUrl: "/dashboard",
    }).catch(() => {
      router.push("/login?error=oauth_failed")
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
      <Link href="/" className="flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
          <TrendingUp className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold tracking-tight font-sans text-foreground">WealthPath</span>
      </Link>

      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  )
}
