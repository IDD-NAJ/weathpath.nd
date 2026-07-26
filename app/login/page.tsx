"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { useSignIn } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { OAuthButtons } from "@/components/oauth-buttons"
import { Eye, EyeOff, Mail, Lock, TrendingUp, ShieldCheck, AlertCircle, Loader2 } from "lucide-react"

const MAX_ATTEMPTS = 5
const LOCKOUT_MINUTES = 15
const LOCKOUT_MS = LOCKOUT_MINUTES * 60 * 1000

function mapClerkError(err: any): string {
  const code = (err?.errors?.[0]?.code ?? err?.code ?? "") as string
  const message = (err?.errors?.[0]?.message ?? err?.message ?? "") as string

  if (code === "form_password_incorrect" || code === "form_identifier_not_found") {
    return "Invalid email or password. Please check your credentials."
  }
  if (code === "too_many_requests" || code === "lockout") {
    return `Too many failed attempts. Please wait ${LOCKOUT_MINUTES} minutes before trying again.`
  }
  if (code === "session_exists") {
    return "You are already signed in."
  }
  return message || "Something went wrong. Please try again."
}

export default function LoginPage() {
  // useSignIn() returns { signIn, errors, fetchStatus } in Clerk v7
  const { signIn } = useSignIn()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [lockedUntil, setLockedUntil] = useState<number | null>(null)

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil

  const handleSignIn = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signIn || isLocked) return

    if (attempts >= MAX_ATTEMPTS) {
      const until = Date.now() + LOCKOUT_MS
      setLockedUntil(until)
      setError(`Too many failed attempts. Please wait ${LOCKOUT_MINUTES} minutes.`)
      return
    }

    setLoading(true)
    setError("")

    try {
      // v7 API: signIn.password() then signIn.finalize()
      const pwResult = await signIn.password({ emailAddress: email, password })
      if (pwResult.error) {
        throw pwResult.error
      }

      if (signIn.status === "complete") {
        const finalResult = await signIn.finalize()
        if (finalResult.error) throw finalResult.error
        setSuccess(true)
        setAttempts(0)
        setTimeout(() => router.push("/dashboard"), 800)
      } else {
        setError("Additional verification required. Please check your email.")
      }
    } catch (err: any) {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)

      if (newAttempts >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_MS
        setLockedUntil(until)
        setError(`Account temporarily locked after ${MAX_ATTEMPTS} failed attempts. Try again in ${LOCKOUT_MINUTES} minutes.`)
      } else {
        const remaining = MAX_ATTEMPTS - newAttempts
        const baseMsg = mapClerkError(err)
        setError(remaining <= 2
          ? `${baseMsg} (${remaining} attempt${remaining === 1 ? "" : "s"} remaining)`
          : baseMsg)
      }
    } finally {
      setLoading(false)
    }
  }, [signIn, email, password, attempts, isLocked, router])

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between p-12 bg-card border-r border-border relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 59px, hsl(var(--border)) 59px, hsl(var(--border)) 60px), repeating-linear-gradient(90deg, transparent, transparent 59px, hsl(var(--border)) 59px, hsl(var(--border)) 60px)"
        }} />
        <Link href="/" className="relative flex items-center gap-2.5 w-fit">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <TrendingUp className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">WealthPath</span>
        </Link>

        <div className="relative space-y-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4 font-medium">Trusted by thousands</p>
            <h2 className="font-serif text-4xl xl:text-5xl font-normal text-foreground leading-tight">
              Build wealth<br />with clarity.
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed max-w-xs">
              Structured courses, real-world tools, and a community that takes financial freedom seriously.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-background/50 p-5 backdrop-blur-sm">
            <p className="text-sm text-foreground leading-relaxed">
              &ldquo;WealthPath gave me the framework I needed to finally start investing with confidence.&rdquo;
            </p>
            <div className="mt-3 flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-semibold text-primary">MJ</span>
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">Marcus J.</p>
                <p className="text-xs text-muted-foreground">Member since 2023</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">256-bit encrypted · SOC 2 compliant</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">WealthPath</span>
          </Link>

          <div className="mb-8">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1 font-medium">Welcome back</p>
            <h1 className="font-serif text-3xl font-normal text-foreground">Sign in</h1>
          </div>

          <OAuthButtons />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-3 text-xs uppercase tracking-widest text-muted-foreground">
                or with email
              </span>
            </div>
          </div>

          {isLocked && (
            <div className="mb-5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 flex gap-3">
              <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Account temporarily locked. Please wait {LOCKOUT_MINUTES} minutes before trying again.
              </p>
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-lg border border-green-500/30 bg-green-500/10 p-4">
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                Signed in successfully — redirecting...
              </p>
            </div>
          )}

          {error && !isLocked && (
            <div className="mb-5 rounded-lg border border-destructive/30 bg-destructive/10 p-4 flex gap-3">
              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-widest font-medium text-muted-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 bg-card border-border focus:border-primary rounded-lg"
                  required
                  autoComplete="email"
                  disabled={loading || success || isLocked}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-widest font-medium text-muted-foreground">Password</label>
                <Link href="/forgot-password" className="text-xs text-primary hover:text-primary/80 transition-colors font-medium" tabIndex={-1}>
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 bg-card border-border focus:border-primary rounded-lg"
                  required
                  autoComplete="current-password"
                  disabled={loading || success || isLocked}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  disabled={loading || success}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(c) => setRememberMe(c as boolean)}
                disabled={loading || success}
                className="rounded"
              />
              <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer select-none">
                Keep me signed in
              </label>
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-lg font-semibold tracking-wide mt-2"
              disabled={loading || success || isLocked || !signIn}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </span>
              ) : "Sign In"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary font-medium hover:text-primary/80 transition-colors">
              Create one
            </Link>
          </p>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            By signing in you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-2 hover:text-foreground transition-colors">Terms</Link>
            {" "}and{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground transition-colors">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
