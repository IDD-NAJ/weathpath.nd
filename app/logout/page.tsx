"use client"

import { useEffect, useRef } from "react"
import { useClerk } from "@clerk/nextjs"
import { Loader2 } from "lucide-react"

export default function LogoutPage() {
  const { signOut, loaded } = useClerk()
  const hasSignedOut = useRef(false)

  useEffect(() => {
    if (!loaded || hasSignedOut.current) return
    hasSignedOut.current = true

    signOut({ redirectUrl: "/" }).catch((error) => {
      console.error("Logout error:", error)
      window.location.href = "/"
    })
  }, [loaded, signOut])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Signing out...</p>
      </div>
    </div>
  )
}
