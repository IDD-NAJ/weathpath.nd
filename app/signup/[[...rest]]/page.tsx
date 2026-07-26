import type { Metadata } from "next"
import Link from "next/link"
import { SignUp } from "@clerk/nextjs"
import { Lock } from "lucide-react"
import { clerkAppearance } from "@/components/auth/clerk-appearance"

export const metadata: Metadata = {
  title: "Create Account | WealthPath",
  description: "Create a free WealthPath account to track courses, save articles, and build passive income.",
}

export default function SignupPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="font-serif text-3xl text-primary">
            WealthPath
          </Link>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed text-pretty">
            Create your free account and start building passive income today.
          </p>
        </div>

        <SignUp
          appearance={clerkAppearance}
          routing="path"
          path="/signup"
          signInUrl="/login"
          fallbackRedirectUrl="/dashboard"
        />

        <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5" aria-hidden="true" />
          Free forever. No credit card required.
        </p>
      </div>
    </main>
  )
}
