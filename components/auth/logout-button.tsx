"use client"

import { useState } from "react"
import { useClerk } from "@clerk/nextjs"
import { LogOut, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export function LogoutButton({
  variant = "ghost",
  size = "sm",
}: {
  variant?: "ghost" | "outline" | "default"
  size?: "sm" | "default"
}) {
  const [isLoading, setIsLoading] = useState(false)
  const { signOut } = useClerk()
  const { toast } = useToast()

  const handleLogout = async () => {
    setIsLoading(true)

    try {
      await signOut({ redirectUrl: "/" })
    } catch (error) {
      console.error("Logout error:", error)
      setIsLoading(false)
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Button
      type="button"
      onClick={handleLogout}
      variant={variant}
      size={size}
      disabled={isLoading}
      className="gap-1.5"
    >
      {isLoading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <LogOut className="h-3.5 w-3.5" />
      )}
      <span className="sr-only sm:not-sr-only">Sign Out</span>
    </Button>
  )
}
