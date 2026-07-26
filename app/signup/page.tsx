"use client"

import { useState } from "react"
import Link from "next/link"
import { useSignUp } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { OAuthButtons } from "@/components/oauth-buttons"
import { Eye, EyeOff, Mail, Lock, User, CheckCircle2, AlertCircle } from "lucide-react"

type SignupStep = "email" | "password" | "profile" | "interests" | "verify"

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
  const [passwordStrength, setPasswordStrength] = useState(0)

  const interests = [
    "Passive Income",
    "Investing",
    "Real Estate",
    "Digital Products",
    "Freelancing",
    "Dropshipping",
    "Affiliate Marketing",
    "Stock Market",
  ]

  const calculatePasswordStrength = (pwd: string) => {
    let strength = 0
    if (pwd.length >= 8) strength++
    if (pwd.length >= 12) strength++
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++
    if (/\d/.test(pwd)) strength++
    if (/[^a-zA-Z\d]/.test(pwd)) strength++
    return strength
  }

  const handlePasswordChange = (pwd: string) => {
    setPassword(pwd)
    setPasswordStrength(calculatePasswordStrength(pwd))
  }

  const handleStepEmail = async () => {
    if (!email) return setError("Email is required")
    setLoading(true)
    setError("")

    try {
      await signUp?.create({ emailAddress: email })
      setStep("password")
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Failed to proceed")
    } finally {
      setLoading(false)
    }
  }

  const handleStepPassword = () => {
    if (!password) return setError("Password is required")
    if (password.length < 8) return setError("Password must be at least 8 characters")
    if (password !== confirmPassword) return setError("Passwords do not match")
    if (passwordStrength < 3) return setError("Password is too weak. Add uppercase, numbers, or symbols")
    
    setError("")
    setStep("profile")
  }

  const handleStepProfile = () => {
    if (!firstName || !lastName) return setError("Name is required")
    setError("")
    setStep("interests")
  }

  const handleStepInterests = async () => {
    if (selectedInterests.length === 0) return setError("Select at least one interest")
    
    setLoading(true)
    setError("")

    try {
      await signUp?.update({
        firstName,
        lastName,
        password,
      })
      setStep("verify")
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Failed to create account")
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (code: string) => {
    setLoading(true)
    setError("")

    try {
      const res = await signUp?.attemptEmailAddressVerification({ code })
      if (res?.status === "complete") {
        router.push("/dashboard")
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Verification failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="font-serif text-3xl font-bold text-foreground">Start Your Journey</h1>
          <p className="mt-2 text-muted-foreground">Create your WealthPath account</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 flex justify-between">
          {(["email", "password", "profile", "interests", "verify"] as SignupStep[]).map((s, i) => (
            <div key={s} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                step === s ? "bg-primary text-primary-foreground" : 
                ["email", "password", "profile", "interests", "verify"].indexOf(step) > i ? "bg-green-500 text-white" :
                "bg-muted text-muted-foreground"
              }`}>
                {["email", "password", "profile", "interests", "verify"].indexOf(step) > i ? "✓" : i + 1}
              </div>
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border bg-card p-8 shadow-lg">
          {error && (
            <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-4 flex gap-3">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Step: Email */}
          {step === "email" && (
            <div className="space-y-4">
              <OAuthButtons />
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 rounded-lg"
                  />
                </div>
              </div>
              <Button onClick={handleStepEmail} className="w-full h-11 rounded-lg" disabled={loading}>
                {loading ? "Continuing..." : "Continue"}
              </Button>
            </div>
          )}

          {/* Step: Password */}
          {step === "password" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    className="pl-10 pr-10 h-11 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {password && (
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          i < passwordStrength ? "bg-green-500" : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 h-11 rounded-lg"
                  />
                </div>
              </div>

              <Button onClick={handleStepPassword} className="w-full h-11 rounded-lg">
                Continue
              </Button>
            </div>
          )}

          {/* Step: Profile */}
          {step === "profile" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="pl-10 h-11 rounded-lg"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Last Name</label>
                  <Input
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-11 rounded-lg"
                  />
                </div>
              </div>

              <Button onClick={handleStepProfile} className="w-full h-11 rounded-lg">
                Continue
              </Button>
            </div>
          )}

          {/* Step: Interests */}
          {step === "interests" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">What interests you? (Select at least one)</p>
              <div className="grid grid-cols-2 gap-2">
                {interests.map((interest) => (
                  <button
                    key={interest}
                    onClick={() =>
                      setSelectedInterests(
                        selectedInterests.includes(interest)
                          ? selectedInterests.filter((i) => i !== interest)
                          : [...selectedInterests, interest]
                      )
                    }
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                      selectedInterests.includes(interest)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>

              <Button onClick={handleStepInterests} className="w-full h-11 rounded-lg" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </div>
          )}

          {/* Step: Verify */}
          {step === "verify" && (
            <div className="space-y-4 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
              <p className="text-sm text-muted-foreground">
                We&apos;ve sent a verification code to {email}
              </p>
              <VerificationInput onVerify={handleVerify} loading={loading} />
            </div>
          )}

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-medium hover:text-primary/80">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function VerificationInput({ onVerify, loading }: { onVerify: (code: string) => void; loading: boolean }) {
  const [code, setCode] = useState("")

  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="000000"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        maxLength={6}
        className="h-12 text-center text-2xl tracking-widest font-mono rounded-lg"
      />
      <Button
        onClick={() => onVerify(code)}
        className="w-full h-11 rounded-lg"
        disabled={code.length !== 6 || loading}
      >
        {loading ? "Verifying..." : "Verify Email"}
      </Button>
    </div>
  )
}
