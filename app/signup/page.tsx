"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import Link from "next/link"
import { useSignUp } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { OAuthButtons } from "@/components/oauth-buttons"
import {
  Eye, EyeOff, Mail, Lock, User, TrendingUp,
  CheckCircle2, AlertCircle, Loader2, Check, X,
  RotateCcw, ArrowLeft
} from "lucide-react"

// ---------------------------------------------------------------------------
// Constants & types
// ---------------------------------------------------------------------------
type SignupStep = "email" | "password" | "profile" | "interests" | "verify"

const STEP_ORDER: SignupStep[] = ["email", "password", "profile", "interests", "verify"]
const STEP_LABELS = ["Email", "Password", "Profile", "Interests", "Verify"]

const PASSWORD_RULES = [
  { label: "At least 8 characters",       test: (p: string) => p.length >= 8 },
  { label: "Uppercase letter (A-Z)",       test: (p: string) => /[A-Z]/.test(p) },
  { label: "Lowercase letter (a-z)",       test: (p: string) => /[a-z]/.test(p) },
  { label: "Number (0-9)",                 test: (p: string) => /\d/.test(p) },
  { label: "Special character (!@#…)",     test: (p: string) => /[^a-zA-Z\d]/.test(p) },
]

const INTERESTS = [
  "Passive Income", "Investing", "Real Estate", "Digital Products",
  "Freelancing", "Dropshipping", "Affiliate Marketing", "Stock Market",
]

const RESEND_COOLDOWN = 60

function passwordStrength(pwd: string) {
  return PASSWORD_RULES.filter((r) => r.test(pwd)).length
}

function strengthLabel(score: number): { label: string; color: string } {
  if (score <= 1) return { label: "Very weak",    color: "bg-red-500" }
  if (score === 2) return { label: "Weak",         color: "bg-orange-500" }
  if (score === 3) return { label: "Fair",         color: "bg-yellow-500" }
  if (score === 4) return { label: "Strong",       color: "bg-green-400" }
  return               { label: "Very strong",    color: "bg-green-500" }
}

function mapClerkError(err: unknown): string {
  const e = err as { errors?: { code?: string; message?: string }[] }
  const code = e?.errors?.[0]?.code ?? ""
  const msg  = e?.errors?.[0]?.message ?? ""
  if (code === "form_identifier_exists")  return "An account with this email already exists."
  if (code === "too_many_requests")       return "Too many attempts. Please wait a moment."
  if (code === "form_code_incorrect")     return "Incorrect code. Please try again."
  if (code === "verification_expired")    return "The code has expired. Click 'Resend code' to get a new one."
  return msg || "Something went wrong. Please try again."
}

// ---------------------------------------------------------------------------
// StepIndicator
// ---------------------------------------------------------------------------
function StepIndicator({ current }: { current: SignupStep }) {
  const currentIdx = STEP_ORDER.indexOf(current)
  return (
    <div className="flex items-center w-full mb-8" role="list" aria-label="Sign-up progress">
      {STEP_ORDER.map((step, i) => {
        const done   = i < currentIdx
        const active = i === currentIdx
        return (
          <div key={step} className="flex items-center flex-1" role="listitem">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200 ${
                  done   ? "bg-primary text-primary-foreground"
                  : active ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                  :          "bg-muted text-muted-foreground"
                }`}
                aria-current={active ? "step" : undefined}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={`text-[10px] uppercase tracking-wider hidden sm:block ${
                active ? "text-foreground font-medium" : "text-muted-foreground"
              }`}>
                {STEP_LABELS[i]}
              </span>
            </div>
            {i < STEP_ORDER.length - 1 && (
              <div className={`flex-1 h-px mx-1 transition-all duration-300 ${i < currentIdx ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// PasswordStrengthMeter
// ---------------------------------------------------------------------------
function PasswordStrengthMeter({ password }: { password: string }) {
  const score = passwordStrength(password)
  const { label, color } = strengthLabel(score)
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <div className="flex gap-1 h-1.5" role="meter" aria-valuenow={score} aria-valuemin={0} aria-valuemax={5} aria-label="Password strength">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`flex-1 rounded-full transition-all duration-300 ${i < score ? color : "bg-muted"}`} />
          ))}
        </div>
        <p className={`text-xs font-medium ${score <= 2 ? "text-red-500" : score === 3 ? "text-yellow-500" : "text-green-500"}`}>
          {label}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-1.5">
        {PASSWORD_RULES.map((rule) => {
          const passed = rule.test(password)
          return (
            <div key={rule.label} className="flex items-center gap-2">
              {passed
                ? <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                : <X     className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />}
              <span className={`text-xs ${passed ? "text-foreground" : "text-muted-foreground"}`}>{rule.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// OtpInput
// ---------------------------------------------------------------------------
function OtpInput({
  onVerify, loading, onResend, resendCooldown,
}: {
  onVerify: (code: string) => void
  loading: boolean
  onResend: () => void
  resendCooldown: number
}) {
  const [digits, setDigits] = useState(Array(6).fill(""))
  const refs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1)
    const next = [...digits]; next[i] = digit; setDigits(next)
    if (digit && i < 5) refs.current[i + 1]?.focus()
    if (next.every((d) => d)) setTimeout(() => onVerify(next.join("")), 100)
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace"  && !digits[i] && i > 0) refs.current[i - 1]?.focus()
    if (e.key === "ArrowLeft"  && i > 0)               refs.current[i - 1]?.focus()
    if (e.key === "ArrowRight" && i < 5)               refs.current[i + 1]?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    const next = [...digits]; pasted.split("").forEach((ch, i) => { next[i] = ch })
    setDigits(next)
    refs.current[Math.min(pasted.length, 5)]?.focus()
    if (pasted.length === 6) setTimeout(() => onVerify(pasted), 100)
  }

  const code = digits.join("")

  return (
    <div className="space-y-5">
      <div className="flex gap-2 justify-center" role="group" aria-label="6-digit verification code">
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
              ${digit ? "border-primary text-foreground" : "border-border text-muted-foreground"}`}
            disabled={loading}
            aria-label={`Digit ${i + 1}`}
          />
        ))}
      </div>
      <Button
        onClick={() => onVerify(code)}
        className="w-full h-11 rounded-lg font-semibold"
        disabled={code.length !== 6 || loading}
      >
        {loading
          ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Verifying...</span>
          : "Verify Email"}
      </Button>
      <div className="text-center">
        {resendCooldown > 0 ? (
          <p className="text-sm text-muted-foreground">
            Resend in <span className="tabular-nums font-medium text-foreground">{resendCooldown}s</span>
          </p>
        ) : (
          <button
            type="button"
            onClick={onResend}
            className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5 mx-auto"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Resend code
          </button>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function SignupPage() {
  // Clerk v7: useSignUp() returns { signUp, errors, fetchStatus }
  const { signUp } = useSignUp()
  const router = useRouter()

  const [step, setStep]                         = useState<SignupStep>("email")
  const [email, setEmail]                       = useState("")
  const [password, setPassword]                 = useState("")
  const [confirmPassword, setConfirmPassword]   = useState("")
  const [showPassword, setShowPassword]         = useState(false)
  const [firstName, setFirstName]               = useState("")
  const [lastName, setLastName]                 = useState("")
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [loading, setLoading]                   = useState(false)
  const [error, setError]                       = useState("")
  const [resendCooldown, setResendCooldown]     = useState(0)

  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  const goBack = useCallback(() => {
    setError("")
    const idx = STEP_ORDER.indexOf(step)
    if (idx > 0) setStep(STEP_ORDER[idx - 1])
  }, [step])

  // Step 1 — capture email, create the sign-up attempt with Clerk
  const handleStepEmail = useCallback(async () => {
    if (!email.trim()) return setError("Email is required")
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Please enter a valid email address")
    setLoading(true); setError("")
    try {
      // v7: signUp.create() returns { data, error }
      const { error: err } = await signUp!.create({ emailAddress: email })
      if (err) throw err
      setStep("password")
    } catch (err: unknown) { setError(mapClerkError(err)) }
    finally { setLoading(false) }
  }, [email, signUp])

  // Step 2 — validate password client-side only
  const handleStepPassword = useCallback(() => {
    if (!password) return setError("Password is required")
    if (passwordStrength(password) < 3) return setError("Password is too weak. Please meet at least 3 requirements.")
    if (password !== confirmPassword)   return setError("Passwords do not match")
    setError(""); setStep("profile")
  }, [password, confirmPassword])

  // Step 3 — validate name client-side only
  const handleStepProfile = useCallback(() => {
    if (!firstName.trim() || !lastName.trim()) return setError("Both first and last name are required")
    setError(""); setStep("interests")
  }, [firstName, lastName])

  // Step 4 — update Clerk with full profile + password, then send verification email
  const handleStepInterests = useCallback(async () => {
    if (selectedInterests.length === 0) return setError("Select at least one interest")
    setLoading(true); setError("")
    try {
      // v7: update() for name fields (no password field in update params)
      const { error: updateErr } = await signUp!.update({ firstName, lastName })
      if (updateErr) throw updateErr

      // v7: password() is a separate method
      const { error: pwErr } = await signUp!.password({ emailAddress: email, password })
      if (pwErr) throw pwErr

      // v7: verifications.sendEmailCode() triggers the OTP email
      const { error: codeErr } = await signUp!.verifications.sendEmailCode()
      if (codeErr) throw codeErr

      setResendCooldown(RESEND_COOLDOWN)
      setStep("verify")
    } catch (err: unknown) { setError(mapClerkError(err)) }
    finally { setLoading(false) }
  }, [selectedInterests, firstName, lastName, email, password, signUp])

  // Step 5 — verify OTP
  const handleVerify = useCallback(async (code: string) => {
    setLoading(true); setError("")
    try {
      // v7: verifications.verifyEmailCode() validates the OTP
      const { error: verifyErr } = await signUp!.verifications.verifyEmailCode({ code })
      if (verifyErr) throw verifyErr

      // Finalize to activate the session once status is complete
      if (signUp!.status === "complete") {
        const { error: finalErr } = await signUp!.finalize()
        if (finalErr) throw finalErr
      }

      // Persist interests (non-blocking — the sync webhook may not have fired yet)
      if (selectedInterests.length > 0) {
        fetch("/api/user/interests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ interests: selectedInterests }),
        }).catch(() => {/* non-blocking */})
      }

      router.push("/dashboard")
    } catch (err: unknown) { setError(mapClerkError(err)) }
    finally { setLoading(false) }
  }, [signUp, selectedInterests, router])

  const handleResend = useCallback(async () => {
    setLoading(true); setError("")
    try {
      // v7: verifications.sendEmailCode() to resend the OTP
      const { error: err } = await signUp!.verifications.sendEmailCode()
      if (err) throw err
      setResendCooldown(RESEND_COOLDOWN)
    } catch (err: unknown) { setError(mapClerkError(err)) }
    finally { setLoading(false) }
  }, [signUp])

  const toggleInterest = useCallback((interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    )
  }, [])

  const score = passwordStrength(password)

  return (
    <div className="min-h-screen bg-background flex">
      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between p-12 bg-card border-r border-border relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,transparent,transparent 59px,hsl(var(--border)) 59px,hsl(var(--border)) 60px),repeating-linear-gradient(90deg,transparent,transparent 59px,hsl(var(--border)) 59px,hsl(var(--border)) 60px)",
          }}
        />
        <Link href="/" className="relative flex items-center gap-2.5 w-fit">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <TrendingUp className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight font-sans text-foreground">WealthPath</span>
        </Link>

        <div className="relative space-y-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Start your journey</p>
          <h2 className="font-serif text-4xl xl:text-5xl font-normal text-foreground leading-tight text-balance">
            Your financial<br />future starts<br />here.
          </h2>
          <p className="text-muted-foreground leading-relaxed max-w-xs text-sm">
            Join thousands learning to build passive income, invest wisely, and achieve lasting financial freedom.
          </p>
          <div className="space-y-3">
            {[
              "Step-by-step wealth building courses",
              "Interactive financial calculators",
              "Real success stories from members",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                <p className="text-sm text-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-muted-foreground">Free to join · No credit card required</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 overflow-y-auto">
        <div className="w-full max-w-[440px] py-8">
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight font-sans text-foreground">WealthPath</span>
          </Link>

          <div className="mb-2">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1 font-medium">Create account</p>
            <h1 className="font-serif text-3xl font-normal text-foreground">Get started</h1>
          </div>

          <StepIndicator current={step} />

          {/* Error banner */}
          {error && (
            <div className="mb-5 rounded-lg border border-destructive/30 bg-destructive/10 p-4 flex gap-3">
              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* ── Step: Email ── */}
          {step === "email" && (
            <div className="space-y-4">
              <OAuthButtons mode="signup" />
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-3 text-xs uppercase tracking-widest text-muted-foreground">or with email</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs uppercase tracking-widest font-medium text-muted-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent.isComposing) handleStepEmail() }}
                    className="pl-10 h-11 bg-card border-border rounded-lg"
                    autoComplete="email"
                    disabled={loading}
                  />
                </div>
              </div>
              <Button onClick={handleStepEmail} className="w-full h-11 rounded-lg font-semibold" disabled={loading || !signUp}>
                {loading ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Continuing...</span> : "Continue"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary font-medium hover:text-primary/80 transition-colors">Sign in</Link>
              </p>
            </div>
          )}

          {/* ── Step: Password ── */}
          {step === "password" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-xs uppercase tracking-widest font-medium text-muted-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 bg-card border-border rounded-lg"
                    autoComplete="new-password"
                    disabled={loading}
                  />
                  <button type="button" onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1} aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {password && <PasswordStrengthMeter password={password} />}

              <div className="space-y-1.5">
                <label htmlFor="confirm-password" className="text-xs uppercase tracking-widest font-medium text-muted-foreground">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent.isComposing) handleStepPassword() }}
                    className={`pl-10 pr-10 h-11 bg-card rounded-lg transition-colors ${
                      confirmPassword && confirmPassword !== password ? "border-destructive" : "border-border"
                    }`}
                    autoComplete="new-password"
                    disabled={loading}
                  />
                  {confirmPassword && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {confirmPassword === password
                        ? <Check className="h-4 w-4 text-green-500" />
                        : <X     className="h-4 w-4 text-destructive" />}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <Button variant="outline" onClick={goBack} className="flex-1 h-11 rounded-lg gap-2">
                  <ArrowLeft className="h-4 w-4" />Back
                </Button>
                <Button onClick={handleStepPassword} className="flex-1 h-11 rounded-lg font-semibold"
                  disabled={score < 3 || (confirmPassword.length > 0 && confirmPassword !== password)}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* ── Step: Profile ── */}
          {step === "profile" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="first-name" className="text-xs uppercase tracking-widest font-medium text-muted-foreground">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input id="first-name" placeholder="Alex" value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="pl-10 h-11 bg-card border-border rounded-lg" disabled={loading} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="last-name" className="text-xs uppercase tracking-widest font-medium text-muted-foreground">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input id="last-name" placeholder="Smith" value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent.isComposing) handleStepProfile() }}
                      className="pl-10 h-11 bg-card border-border rounded-lg" disabled={loading} />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <Button variant="outline" onClick={goBack} className="flex-1 h-11 rounded-lg gap-2">
                  <ArrowLeft className="h-4 w-4" />Back
                </Button>
                <Button onClick={handleStepProfile} className="flex-1 h-11 rounded-lg font-semibold" disabled={loading}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* ── Step: Interests ── */}
          {step === "interests" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Select the topics you want to explore. We&apos;ll personalise your learning path.</p>
              <div className="grid grid-cols-2 gap-2">
                {INTERESTS.map((interest) => {
                  const selected = selectedInterests.includes(interest)
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`relative h-11 rounded-lg border text-sm font-medium transition-all duration-150 text-left px-3 ${
                        selected
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      }`}
                    >
                      {selected && (
                        <span className="absolute top-1.5 right-1.5">
                          <Check className="h-3 w-3 text-primary" />
                        </span>
                      )}
                      {interest}
                    </button>
                  )
                })}
              </div>
              <div className="flex gap-3 pt-1">
                <Button variant="outline" onClick={goBack} className="flex-1 h-11 rounded-lg gap-2">
                  <ArrowLeft className="h-4 w-4" />Back
                </Button>
                <Button onClick={handleStepInterests} className="flex-1 h-11 rounded-lg font-semibold"
                  disabled={loading || selectedInterests.length === 0 || !signUp}>
                  {loading
                    ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Sending...</span>
                    : "Continue"}
                </Button>
              </div>
            </div>
          )}

          {/* ── Step: Verify ── */}
          {step === "verify" && (
            <div className="space-y-4">
              <div className="text-center mb-2">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-7 w-7 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  We sent a 6-digit code to{" "}
                  <span className="font-medium text-foreground">{email}</span>
                </p>
              </div>
              <OtpInput
                onVerify={handleVerify}
                loading={loading}
                onResend={handleResend}
                resendCooldown={resendCooldown}
              />
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-1.5 mx-auto text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Use a different email
              </button>
            </div>
          )}

          {step !== "verify" && step !== "email" && (
            <p className="mt-6 text-center text-xs text-muted-foreground">
              By creating an account you agree to our{" "}
              <Link href="/terms" className="underline underline-offset-2 hover:text-foreground transition-colors">Terms</Link>
              {" "}and{" "}
              <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground transition-colors">Privacy Policy</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
