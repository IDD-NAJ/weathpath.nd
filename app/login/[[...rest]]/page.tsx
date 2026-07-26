import type { Metadata } from "next"
import Link from "next/link"
import { SignIn } from "@clerk/nextjs"
import { Lock } from "lucide-react"
import { clerkAppearance } from "@/components/auth/clerk-appearance"

export const metadata: Metadata = {
  title: "Sign In | WealthPath",
  description: "Sign in to your WealthPath account to continue your passive income learning path.",
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="font-serif text-3xl text-primary">
            WealthPath
          </Link>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed text-pretty">
            Welcome back. Sign in to pick up where you left off.
          </p>
        </div>

        <SignIn
          appearance={clerkAppearance}
          routing="path"
          path="/login"
          signUpUrl="/signup"
          fallbackRedirectUrl="/dashboard"
        />

        <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5" aria-hidden="true" />
          Your credentials are encrypted and never stored on our servers.
        </p>
      </div>
    </main>
  )
}
