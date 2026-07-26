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
// Types
// ---------------------------------------------------------------------------
type SignupStep = "email" | "password" | "profile" | "interests" | "verify"

interface PasswordRule {
  label: string
  test: (p: string) => boolean
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "Uppercase letter (A-Z)", test: (p) => /[A-Z]/.test(p) },
  { label: "Lowercase letter (a-z)", test: (p) => /[a-z]/.test(p) },
  { label: "Number (0-9)", test: (p) => /\d/.test(p) },
  { label: "Special character (!@#…)", test: (p) => /[^a-zA-Z\d]/.test(p) },
]

const INTERESTS = [
  "Passive Income", "Investing", "Real Estate", "Digital Products",
  "Freelancing", "Dropshipping", "Affiliate Marketing", "Stock Market",
]

const STEP_ORDER: SignupStep[] = ["email", "password", "profile", "interests", "verify"]
const STEP_LABELS = ["Email", "Password", "Profile", "Interests", "Verify"]

const RESEND_COOLDOWN = 60 // seconds

function passwordStrength(pwd: string): number {
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
  if (code === "form_identifier_exists") return "An account with this email already exists."
  if (code === "too_many_requests") return "Too many attempts. Please wait a moment before trying again."
  if (code === "form_code_incorrect") return "Incorrect verification code. Please try again."
  if (code === "verification_expired") return "The code has expired. Click 'Resend code' to get a new one."
  return msg || "Something went wrong. Please try again."
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StepIndicator({ current }: { current: SignupStep }) {
  const currentIdx = STEP_ORDER.indexOf(current)
  return (
    <div className="flex items-center justify-between w-full mb-8">
      {STEP_ORDER.map((step, i) => {
        const done = i < currentIdx
        const active = i === currentIdx
        return (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200 ${
                done ? "bg-primary text-primary-foreground" :
                active ? "bg-primary text-primary-foreground ring-4 ring-primary/20" :
                "bg-muted text-muted-foreground"
              }`}>
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={`text-[10px] uppercase tracking-wider hidden sm:block ${
                active ? "text-foreground font-medium" : "text-muted-foreground"
              }`}>
                {STEP_LABELS[i]}
              </span>
            </div>
            {i < STEP_ORDER.length - 1 && (
              <div className={`flex-1 h-px mx-1 transition-all duration-300 ${
                i < currentIdx ? "bg-primary" : "bg-border"
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function PasswordStrengthMeter({ password }: { password: string }) {
  const score = passwordStrength(password)
  const { label, color } = strengthLabel(score)

  return (
    <div className="space-y-3">
      {/* Bar */}
      <div className="space-y-1.5">
        <div className="flex gap-1 h-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 rounded-full transition-all duration-300 ${
                i < score ? color : "bg-muted"
              }`}
            />
          ))}
        </div>
        <p className={`text-xs font-medium ${score <= 2 ? "text-red-500" : score === 3 ? "text-yellow-500" : "text-green-500"}`}>
          {label}
        </p>
      </div>

      {/* Rules checklist */}
      <div className="grid grid-cols-1 gap-1.5">
        {PASSWORD_RULES.map((rule) => {
          const passed = rule.test(password)
          return (
            <div key={rule.label} className="flex items-center gap-2">
              {passed ? (
                <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
              ) : (
                <X className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              )}
              <span className={`text-xs ${passed ? "text-foreground" : "text-muted-foreground"}`}>
                {rule.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function OtpInput({
  onVerify,
  loading,
  onResend,
  resendCooldown,
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
    const next = [...digits]
    next[i] = digit
    setDigits(next)
    if (digit && i < 5) refs.current[i + 1]?.focus()
    if (next.every((d) => d)) {
      setTimeout(() => onVerify(next.join("")), 100)
    }
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus()
    }
    if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus()
    if (e.key === "ArrowRight" && i < 5) refs.current[i + 1]?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    const next = [...digits]
    pasted.split("").forEach((ch, i) => { next[i] = ch })
    setDigits(next)
    const lastFilled = Math.min(pasted.length, 5)
    refs.current[lastFilled]?.focus()
    if (pasted.length === 6) setTimeout(() => onVerify(pasted), 100)
  }

  const code = digits.join("")

  return (
    <div className="space-y-5">
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
        onClick={() => onVerify(code)}
        className="w-full h-11 rounded-lg font-semibold"
        disabled={code.length !== 6 || loading}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Verifying...
          </span>
        ) : "Verify Email"}
      </Button>

      <div className="text-center">
        {resendCooldown > 0 ? (
          <p className="text-sm text-muted-foreground">
            Resend in{" "}
            <span className="tabular-nums font-medium text-foreground">{resendCooldown}s</span>
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
  const { signUp, isLoaded } = useSignUp()
  const router = useRouter()

  const [step, setStep] = useState<SignupStep>("email")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [resendCooldown, setResendCooldown] = useState(0)

  // Countdown timer for resend
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

  // Step 1: email
  const handleStepEmail = useCallback(async () => {
    if (!email.trim()) return setError("Email is required")
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRe.test(email)) return setError("Please enter a valid email address")

    setLoading(true)
    setError("")
    try {
      await signUp?.create({ emailAddress: email })
      setStep("password")
    } catch (err: any) {
      setError(mapClerkError(err))
    } finally {
      setLoading(false)
    }
  }, [email, signUp])

  // Step 2: password (client-side only)
  const handleStepPassword = useCallback(() => {
    if (!password) return setError("Password is required")
    if (passwordStrength(password) < 3) return setError("Password is too weak. Meet at least 3 of the 5 requirements.")
    if (password !== confirmPassword) return setError("Passwords do not match")
    setError("")
    setStep("profile")
  }, [password, confirmPassword])

  // Step 3: profile (client-side only)
  const handleStepProfile = useCallback(() => {
    if (!firstName.trim() || !lastName.trim()) return setError("Both first and last name are required")
    setError("")
    setStep("interests")
  }, [firstName, lastName])

  // Step 4: interests — update Clerk + send verification email
  const handleStepInterests = useCallback(async () => {
    if (selectedInterests.length === 0) return setError("Select at least one interest")
    setLoading(true)
    setError("")
    try {
      await signUp?.update({ firstName, lastName, password })
      // Trigger the verification email NOW (this was the original bug)
      await signUp?.prepareEmailAddressVerification({ strategy: "email_code" })
      setResendCooldown(RESEND_COOLDOWN)
      setStep("verify")
    } catch (err: any) {
      setError(mapClerkError(err))
    } finally {
      setLoading(false)
    }
  }, [selectedInterests, firstName, lastName, password, signUp])

  // Step 5: verify OTP
  const handleVerify = useCallback(async (code: string) => {
    setLoading(true)
    setError("")
    try {
      const res = await signUp?.attemptEmailAddressVerification({ code })
      if (res?.status === "complete") {
        // Persist interests to the DB. The webhook / resolveClerkUser will
        // have created the row; we update interests in a background call.
        if (selectedInterests.length > 0 && signUp?.createdUserId) {
          await fetch("/api/user/interests", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ interests: selectedInterests }),
          }).catch(() => {/* non-blocking */})
        }
        router.push("/dashboard")
      } else {
        setError("Verification not complete. Please try again.")
      }
    } catch (err: any) {
      setError(mapClerkError(err))
    } finally {
      setLoading(false)
    }
  }, [signUp, selectedInterests, router])

  const handleResend = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      await signUp?.prepareEmailAddressVerification({ strategy: "email_code" })
      setResendCooldown(RESEND_COOLDOWN)
    } catch (err: any) {
      setError(mapClerkError(err))
    } finally {
      setLoading(false)
    }
  }, [signUp])

  const toggleInterest = useCallback((interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    )
  }, [])

  const score = passwordStrength(password)

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

        <div className="relative space-y-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Start your journey</p>
          <h2 className="font-serif text-4xl xl:text-5xl font-normal text-foreground leading-tight">
            Your financial<br />future starts<br />here.
          </h2>
          <p className="text-muted-foreground leading-relaxed max-w-xs">
            Join thousands learning to build passive income, invest wisely, and achieve lasting financial freedom.
          </p>

          {/* Value props */}
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

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 overflow-y-auto">
        <div className="w-full max-w-[440px] py-8">
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">WealthPath</span>
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

          {/* ---- Step: Email ---- */}
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
                <label className="text-xs uppercase tracking-widest font-medium text-muted-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
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
              <Button
                onClick={handleStepEmail}
                className="w-full h-11 rounded-lg font-semibold"
                disabled={loading || !isLoaded}
              >
                {loading ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Continuing...</span> : "Continue"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary font-medium hover:text-primary/80 transition-colors">Sign in</Link>
              </p>
            </div>
          )}

          {/* ---- Step: Password ---- */}
          {step === "password" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-widest font-medium text-muted-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 bg-card border-border rounded-lg"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {password && <PasswordStrengthMeter password={password} />}

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-widest font-medium text-muted-foreground">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent.isComposing) handleStepPassword() }}
                    className={`pl-10 h-11 bg-card rounded-lg transition-colors ${
                      confirmPassword && confirmPassword !== password ? "border-destructive" : "border-border"
                    }`}
                    autoComplete="new-password"
                  />
                  {confirmPassword && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {confirmPassword === password
                        ? <Check className="h-4 w-4 text-green-500" />
                        : <X className="h-4 w-4 text-destructive" />}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Button variant="outline" onClick={goBack} className="h-11 px-4 rounded-lg">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleStepPassword}
                  className="flex-1 h-11 rounded-lg font-semibold"
                  disabled={score < 3 || password !== confirmPassword}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* ---- Step: Profile ---- */}
          {step === "profile" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-widest font-medium text-muted-foreground">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="pl-10 h-11 bg-card border-border rounded-lg"
                      autoComplete="given-name"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-widest font-medium text-muted-foreground">Last Name</label>
                  <Input
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent.isComposing) handleStepProfile() }}
                    className="h-11 bg-card border-border rounded-lg"
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={goBack} className="h-11 px-4 rounded-lg">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleStepProfile}
                  className="flex-1 h-11 rounded-lg font-semibold"
                  disabled={!firstName.trim() || !lastName.trim()}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* ---- Step: Interests ---- */}
          {step === "interests" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">What topics interest you? Select at least one.</p>
              <div className="grid grid-cols-2 gap-2">
                {INTERESTS.map((interest) => {
                  const selected = selectedInterests.includes(interest)
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`p-3 rounded-lg border text-sm font-medium text-left transition-all duration-150 ${
                        selected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {selected && <Check className="h-3.5 w-3.5 flex-shrink-0" />}
                        {interest}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="flex gap-2 pt-1">
                <Button variant="outline" onClick={goBack} className="h-11 px-4 rounded-lg">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleStepInterests}
                  className="flex-1 h-11 rounded-lg font-semibold"
                  disabled={loading || selectedInterests.length === 0}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account...
                    </span>
                  ) : "Create Account"}
                </Button>
              </div>
            </div>
          )}

          {/* ---- Step: Verify ---- */}
          {step === "verify" && (
            <div className="space-y-5">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Mail className="h-7 w-7 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We sent a 6-digit code to<br />
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
                Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
