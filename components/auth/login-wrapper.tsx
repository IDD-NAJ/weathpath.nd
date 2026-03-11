"use client"

import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import LoginPage from "@/app/login/page"

export default function LoginWrapper() {
  return (
    <Suspense 
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-lg">Loading...</span>
          </div>
        </div>
      }
    >
      <LoginPage />
    </Suspense>
  )
}
