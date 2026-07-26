"use client"

import { Button } from "@/components/ui/button"
import { Github, Chrome } from "lucide-react"
import { useSignIn } from "@clerk/nextjs"

export function OAuthButtons() {
  const { signIn } = useSignIn()

  const handleOAuth = (strategy: "oauth_google" | "oauth_github" | "oauth_apple") => {
    signIn?.authenticateWithRedirect({
      strategy,
      redirectUrl: "/dashboard",
      redirectUrlComplete: "/dashboard",
    })
  }

  return (
    <div className="space-y-3">
      <Button
        onClick={() => handleOAuth("oauth_google")}
        variant="outline"
        className="w-full h-11 rounded-lg"
      >
        <Chrome className="mr-2 h-4 w-4" />
        Continue with Google
      </Button>
      
      <Button
        onClick={() => handleOAuth("oauth_github")}
        variant="outline"
        className="w-full h-11 rounded-lg"
      >
        <Github className="mr-2 h-4 w-4" />
        Continue with GitHub
      </Button>

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
        </div>
      </div>
    </div>
  )
}
