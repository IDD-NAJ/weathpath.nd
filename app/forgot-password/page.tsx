"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import Link from "next/link"
import { useSignIn } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Mail, TrendingUp, ArrowLeft, Eye, EyeOff,
  Lock, CheckCircle2, AlertCircle, Loader2,
  Check, X, RotateCcw
} from "lucide-react"

// ---------------------------------------------------------------------------
// Password rules (same as signup for consistency)
// ---------------------------------------------------------------------------
const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Uppercase letter (A-Z)", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Lowercase letter (a-z)", test: (p: string) => /[a-z]/.test(p) },
  { label: "Number (0-9)", test: (p: string) => /\d/.test(p) },
  { label: "Special character (!@#…)", test: (p: string) => /[^a-zA-Z\d]/.test(p) },
]

function passwordScore(pwd: string) {
  return PASSWORD_RULES.filter((r) => r.test(pwd)).length
}

function strengthLabel(score: number): { label: string; color: string } {
  if (score <= 1) return { label: "Very weak", color: "bg-red-500" }
  if (score === 2) return { label: "Weak", color: "bg-orange-500" }
  if (score === 3) return { label: "Fair", color: "bg-yellow-500" }
  if (score === 4) return { label: "Strong", color: "bg-green-400" }
  return { label: "Very strong", color: "bg-green-500" }
}

function mapClerkError(err: any): string {
  const code = err?.errors?.[0]?.code ?? ""
  const msg = err?.errors?.[0]?.message ?? ""
  if (code === "form_identifier_not_found") return "No account found with that email address."
  if (code === "form_code_incorrect") return "Incorrect code. Please try again."
  if (code === "verification_expired") return "Code expired. Click 'Resend code' to get a new one."
  if (code === "too_many_requests") return "Too many attempts. Please wait a moment."
  if (code === "form_password_pwned") return "This password has appeared in a data breach. Please choose a different one."
  return msg || "Something went wrong. Please try again."
}

// ---------------------------------------------------------------------------
// OTP input (6 boxes)
// ---------------------------------------------------------------------------
function OtpInput({
  onSubmit,
  loading,
}: {
  onSubmit: (code: string) => void
  loading: boolean
}) {
  const [digits, setDigits] = useState(Array(6).fill(""))
  const refs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1)
    const next = [...digits]
    next[i] = digit
    setDigits(next)
    if (digit && i < 5) refs.current[i + 1]?.focus()
    if (next.every((d) => d)) setTimeout(() => onSubmit(next.join("")), 100)
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus()
    if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus()
    if (e.key === "ArrowRight" && i < 5) refs.current[i + 1]?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    const next = [...digits]
    pasted.split("").forEach((ch, i) => { next[i] = ch })
    setDigits(next)
    refs.current[Math.min(pasted.length, 5)]?.focus()
    if (pasted.length === 6) setTimeout(() => onSubmit(pasted), 100)
  }

  const code = digits.join("")

  return (
    <div className="space-y-4">
      <div className="flex gap-2 justify-center">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            className={`w-11 h-14 rounded-xl border text-center text-xl font-semibold bg-card transition-all outline-none
              focus:border-primary focus:ring-2 focus:ring-primary/20
              ${digit ? "border-primary text-foreground" : "border-border text-muted-foreground"}
            `}
            disabled={loading}
            aria-label={`Digit ${i + 1}`}
          />
        ))}
      </div>
      <Button
        onClick={() => onSubmit(code)}
        className="w-full h-11 rounded-lg font-semibold"
        disabled={code.length !== 6 || loading}
      >
        {loading ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Verifying...</span> : "Verify Code"}
      </Button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page — 3-step flow: request → code → new password
// ---------------------------------------------------------------------------
type FPStep = "email" | "code" | "password" | "done"

export default function ForgotPasswordPage() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()

  const [step, setStep] = useState<FPStep>("email")
  const [email, setEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  // Step 1: request reset code
  const handleRequestCode = useCallback(async () => {
    if (!email.trim()) return setError("Email is required")
    setLoading(true)
    setError("")
    try {
      await signIn?.create({
        strategy: "reset_password_email_code",
        identifier: email,
      })
      setResendCooldown(60)
      setStep("code")
    } catch (err: any) {
      setError(mapClerkError(err))
    } finally {
      setLoading(false)
    }
  }, [email, signIn])

  // Step 2: verify code
  const handleVerifyCode = useCallback(async (code: string) => {
    setLoading(true)
    setError("")
    try {
      const result = await signIn?.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
      })
      if (result?.status === "needs_new_password") {
        setStep("password")
      } else {
        setError("Unexpected response. Please try again.")
      }
    } catch (err: any) {
      setError(mapClerkError(err))
    } finally {
      setLoading(false)
    }
  }, [signIn])

  // Step 3: set new password
  const handleSetPassword = useCallback(async () => {
    if (passwordScore(newPassword) < 3) return setError("Password is too weak. Please meet at least 3 requirements.")
    if (newPassword !== confirmPassword) return setError("Passwords do not match.")
    setLoading(true)
    setError("")
    try {
      const result = await signIn?.resetPassword({ password: newPassword })
      if (result?.status === "complete") {
        await setActive({ session: result.createdSessionId })
        setStep("done")
        setTimeout(() => router.push("/dashboard"), 2000)
      } else {
        setError("Password reset failed. Please try again.")
      }
    } catch (err: any) {
      setError(mapClerkError(err))
    } finally {
      setLoading(false)
    }
  }, [newPassword, confirmPassword, signIn, setActive, router])

  const handleResend = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      await signIn?.create({
        strategy: "reset_password_email_code",
        identifier: email,
      })
      setResendCooldown(60)
    } catch (err: any) {
      setError(mapClerkError(err))
    } finally {
      setLoading(false)
    }
  }, [email, signIn])

  const score = passwordScore(newPassword)
  const { label: strengthText, color: strengthColor } = strengthLabel(score)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 w-fit mx-auto mb-10">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <TrendingUp className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">WealthPath</span>
        </Link>

        <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
          {/* ---- Done state ---- */}
          {step === "done" && (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <h1 className="font-serif text-2xl text-foreground">Password updated</h1>
              <p className="text-sm text-muted-foreground">
                Your password has been changed successfully. Redirecting to your dashboard...
              </p>
              <Button asChild className="w-full h-11 rounded-lg">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          )}

          {/* ---- Step: email ---- */}
          {step === "email" && (
            <>
              <div className="mb-6">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1 font-medium">Account recovery</p>
                <h1 className="font-serif text-2xl text-foreground">Reset your password</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Enter the email linked to your account and we&apos;ll send a reset code.
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 flex gap-2.5">
                  <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-widest font-medium text-muted-foreground">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent.isComposing) handleRequestCode() }}
                      className="pl-10 h-11 bg-background border-border rounded-lg"
                      autoComplete="email"
                      disabled={loading}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleRequestCode}
                  className="w-full h-11 rounded-lg font-semibold"
                  disabled={loading || !isLoaded}
                >
                  {loading
                    ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Sending...</span>
                    : "Send Reset Code"}
                </Button>

                <Button asChild variant="ghost" className="w-full h-11 rounded-lg">
                  <Link href="/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to sign in
                  </Link>
                </Button>
              </div>
            </>
          )}

          {/* ---- Step: code ---- */}
          {step === "code" && (
            <>
              <div className="mb-6 text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-7 w-7 text-primary" />
                </div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1 font-medium">Check your inbox</p>
                <h1 className="font-serif text-2xl text-foreground">Enter reset code</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  We sent a 6-digit code to{" "}
                  <span className="font-medium text-foreground">{email}</span>
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 flex gap-2.5">
                  <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <OtpInput onSubmit={handleVerifyCode} loading={loading} />

              <div className="mt-4 text-center">
                {resendCooldown > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Resend in <span className="tabular-nums font-medium text-foreground">{resendCooldown}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5 mx-auto"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Resend code
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => { setStep("email"); setError("") }}
                className="flex items-center gap-1.5 mx-auto mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Use a different email
              </button>
            </>
          )}

          {/* ---- Step: new password ---- */}
          {step === "password" && (
            <>
              <div className="mb-6">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1 font-medium">Almost done</p>
                <h1 className="font-serif text-2xl text-foreground">Set new password</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Choose a strong password for your account.
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 flex gap-2.5">
                  <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-widest font-medium text-muted-foreground">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10 pr-10 h-11 bg-background border-border rounded-lg"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Strength meter */}
                {newPassword && (
                  <div className="space-y-2">
                    <div className="flex gap-1 h-1.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className={`flex-1 rounded-full transition-all duration-300 ${i < score ? strengthColor : "bg-muted"}`} />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${score <= 2 ? "text-red-500" : score === 3 ? "text-yellow-500" : "text-green-500"}`}>
                      {strengthText}
                    </p>
                    <div className="grid grid-cols-1 gap-1">
                      {PASSWORD_RULES.map((rule) => {
                        const passed = rule.test(newPassword)
                        return (
                          <div key={rule.label} className="flex items-center gap-2">
                            {passed
                              ? <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                              : <X className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />}
                            <span className={`text-xs ${passed ? "text-foreground" : "text-muted-foreground"}`}>
                              {rule.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-widest font-medium text-muted-foreground">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent.isComposing) handleSetPassword() }}
                      className={`pl-10 h-11 bg-background rounded-lg transition-colors ${
                        confirmPassword && confirmPassword !== newPassword ? "border-destructive" : "border-border"
                      }`}
                      autoComplete="new-password"
                    />
                    {confirmPassword && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {confirmPassword === newPassword
                          ? <Check className="h-4 w-4 text-green-500" />
                          : <X className="h-4 w-4 text-destructive" />}
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleSetPassword}
                  className="w-full h-11 rounded-lg font-semibold"
                  disabled={loading || score < 3 || newPassword !== confirmPassword}
                >
                  {loading
                    ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Updating...</span>
                    : "Update Password"}
                </Button>
              </div>
            </>
          )}
        </div>

        {step !== "done" && (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link href="/login" className="text-primary font-medium hover:text-primary/80 transition-colors">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
