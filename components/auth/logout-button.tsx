"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logoutAction } from "@/app/actions/auth"
import { useToast } from "@/hooks/use-toast"

export function LogoutButton({ variant = "ghost", size = "sm" }: { variant?: "ghost" | "outline" | "default"; size?: "sm" | "default" }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async (formData: FormData) => {
    setIsLoading(true)
    
    try {
      await logoutAction()
      router.push("/")
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      })
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form action={handleLogout}>
      <Button 
        type="submit" 
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
    </form>
  )
}
