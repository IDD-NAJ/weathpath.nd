"use client"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { useSignIn } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { OAuthButtons } from "@/components/oauth-buttons"
import {
  Eye, EyeOff, Mail, Lock, TrendingUp,
  ShieldCheck, AlertCircle, Loader2, CheckCircle2
} from "lucide-react"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 15 * 60 * 1000
const LOCKOUT_MINUTES = 15

function mapClerkError(err: unknown): string {
  const e = err as { errors?: { code?: string; message?: string }[]; code?: string; message?: string }
  const code = e?.errors?.[0]?.code ?? e?.code ?? ""
  const msg  = e?.errors?.[0]?.message ?? e?.message ?? ""
  if (code === "form_password_incorrect" || code === "form_identifier_not_found")
    return "Invalid email or password."
  if (code === "too_many_requests" || code === "lockout")
    return `Too many attempts — please wait ${LOCKOUT_MINUTES} minutes.`
  if (code === "session_exists")
    return "You are already signed in."
  return msg || "Something went wrong. Please try again."
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function LoginPage() {
  // Clerk v7: useSignIn() returns { signIn, errors, fetchStatus }
  // signIn is a SignInFutureResource — NOT the old SignInResource
  const { signIn } = useSignIn()
  const router = useRouter()

  const [email, setEmail]               = useState("")
  const [password, setPassword]         = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe]     = useState(false)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState("")
  const [success, setSuccess]           = useState(false)
  const [attempts, setAttempts]         = useState(0)
  const [lockedUntil, setLockedUntil]   = useState<number | null>(null)

  // Countdown display for the lockout timer
  const [remaining, setRemaining] = useState(0)
  useEffect(() => {
    if (!lockedUntil) return
    const tick = () => setRemaining(Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000)))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [lockedUntil])

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil

  const handleSignIn = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signIn || isLocked || loading) return

    if (attempts >= MAX_ATTEMPTS) {
      const until = Date.now() + LOCKOUT_MS
      setLockedUntil(until)
      setError(`Locked — too many failed attempts. Try again in ${LOCKOUT_MINUTES} minutes.`)
      return
    }

    setLoading(true)
    setError("")

    try {
      // Clerk v7: signIn.password() returns { error } — all-in-one password sign-in
      const { error: pwErr } = await signIn.password({
        emailAddress: email,
        password,
      })
      if (pwErr) throw pwErr

      // Only finalize when status is 'complete' (no MFA required)
      if (signIn.status === "complete") {
        const { error: finalErr } = await signIn.finalize({
          navigate: async (decorateUrl) => {
            // decorateUrl may return an external URL for Safari ITP cookie refresh
            const url = await decorateUrl("/dashboard")
            setSuccess(true)
            setAttempts(0)
            if (url.startsWith("https://")) {
              window.location.href = url
            } else {
              router.push(url)
            }
          },
        })
        if (finalErr) throw finalErr
      } else {
        // Should not normally happen for password strategy, but surface any status issues
        throw new Error(`Unexpected sign-in status: ${signIn.status}`)
      }
    } catch (err: unknown) {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      if (newAttempts >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_MS
        setLockedUntil(until)
        setError(`Account locked after ${MAX_ATTEMPTS} failed attempts. Try again in ${LOCKOUT_MINUTES} minutes.`)
      } else {
        const left = MAX_ATTEMPTS - newAttempts
        const base = mapClerkError(err)
        setError(left <= 2 ? `${base} (${left} attempt${left === 1 ? "" : "s"} left)` : base)
      }
    } finally {
      setLoading(false)
    }
  }, [signIn, email, password, attempts, isLocked, loading, router])

  return (
    <div className="min-h-screen bg-background flex">
      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-card via-card to-card/80 border-r border-border/50 relative overflow-hidden">
        {/* Animated gradient background */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,transparent,transparent 59px,hsl(var(--border)) 59px,hsl(var(--border)) 60px),repeating-linear-gradient(90deg,transparent,transparent 59px,hsl(var(--border)) 59px,hsl(var(--border)) 60px)",
          }}
        />

        <Link href="/" className="relative flex items-center gap-2.5 w-fit group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/90 group-hover:bg-primary transition-colors duration-300 shadow-sm group-hover:shadow-md">
            <TrendingUp className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight font-sans bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">WealthPath</span>
        </Link>

        <div className="relative space-y-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 font-medium">Trusted by thousands</p>
            <h2 className="font-serif text-4xl xl:text-5xl font-normal text-foreground leading-tight text-balance">
              Build wealth<br />with clarity.
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed max-w-xs text-sm">
              Structured courses, real-world tools, and a community that takes financial freedom seriously.
            </p>
          </div>

          {/* Testimonial card */}
          <div className="rounded-xl border border-border bg-background/50 p-5">
            <p className="text-sm text-foreground leading-relaxed">
              &ldquo;WealthPath gave me the framework I needed to finally start investing with confidence.&rdquo;
            </p>
            <div className="mt-4 flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
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

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-gradient-to-b from-background to-background/50">
        <div className="w-full max-w-[420px] animate-fade-in">
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight font-sans text-foreground">WealthPath</span>
          </Link>

          <div className="mb-8">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1 font-medium">Welcome back</p>
            <h1 className="font-serif text-3xl font-normal text-foreground">Sign in</h1>
          </div>

          <OAuthButtons mode="signin" />

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

          {/* Lockout banner */}
          {isLocked && (
            <div className="mb-5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 flex gap-3">
              <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Account temporarily locked</p>
                <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-0.5 tabular-nums">
                  {Math.ceil(remaining / 60)}m {remaining % 60}s remaining
                </p>
              </div>
            </div>
          )}

          {/* Success banner */}
          {success && (
            <div className="mb-5 rounded-lg border border-green-500/30 bg-green-500/10 p-4 flex gap-3">
              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                Signed in — redirecting...
              </p>
            </div>
          )}

          {/* Error banner */}
          {error && !isLocked && !success && (
            <div className="mb-5 rounded-lg border border-destructive/30 bg-destructive/10 p-4 flex gap-3">
              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs uppercase tracking-widest font-medium text-muted-foreground">
                Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 bg-card/50 border-border rounded-lg focus:bg-card focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                  required
                  autoComplete="email"
                  disabled={loading || success || isLocked}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs uppercase tracking-widest font-medium text-muted-foreground">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:text-primary/80 transition-colors font-medium hover:underline underline-offset-2"
                  tabIndex={-1}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 bg-card/50 border-border rounded-lg focus:bg-card focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                  required
                  autoComplete="current-password"
                  disabled={loading || success || isLocked}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={loading || success}
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
              />
              <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer select-none">
                Keep me signed in
              </label>
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-lg font-semibold tracking-wide mt-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || success || isLocked || !signIn}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </span>
              ) : success ? (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Signed in
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
