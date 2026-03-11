"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { logoutAction } from "@/app/actions/auth"
import { Loader2 } from "lucide-react"

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await logoutAction()
        router.push("/")
      } catch (error) {
        console.error("Logout error:", error)
        router.push("/")
      }
    }

    handleLogout()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Signing out...</p>
      </div>
    </div>
  )
}
