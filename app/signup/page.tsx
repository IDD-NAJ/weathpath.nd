"use client"

import { useState } from "react"
import { useFormState, useFormStatus } from "react-dom"
import Link from "next/link"
import {
  Loader2,
  Mail,
  Lock,
  User,
  ArrowRight,
  ChevronLeft,
  Sparkles,
  BookOpen,
  TrendingUp,
  Zap,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { AuthLayout } from "@/components/auth/auth-layout"
import { FormField } from "@/components/auth/form-field"
import { SignupProgress } from "@/components/auth/signup-progress"
import { SimpleLayoutWrapper } from "@/components/layout-wrapper"
import { signupAction, type AuthState } from "@/app/actions/auth"
import { PasswordStrength } from "@/components/password-strength"

const interestOptions = [
  { icon: BookOpen, label: "Learning" },
  { icon: TrendingUp, label: "Investing" },
  { icon: Zap, label: "Side Hustles" },
  { icon: Users, label: "Community" },
]

export default function SignupPage() {
  const [state, formAction] = useFormState<AuthState, FormData>(signupAction, {})
  const { pending } = useFormStatus()
  const [currentStep, setCurrentStep] = useState(1)
  const [password, setPassword] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    interests: [] as string[],
  })
  const [agreed, setAgreed] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleInterestChange = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const handleNextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1)
  }

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  return (
    <SimpleLayoutWrapper showNavigation={false}>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        {/* Left panel -- benefits (hidden on mobile) */}
        <div className="relative hidden w-screen h-screen fixed left-0 top-0 lg:flex lg:w-[45%] flex-col justify-between overflow-hidden bg-primary p-10">
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary-foreground mb-2">
              Build Real Wealth
            </h1>
            <p className="text-primary-foreground/70 text-lg max-w-sm">
              Start your journey to financial independence with a community of learners just like you.
            </p>
          </div>

          <div className="space-y-6">
            {interestOptions.map((option) => (
              <div key={option.label} className="flex gap-3 items-start">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10">
                  <option.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary-foreground">
                    {option.label}
                  </h3>
                  <p className="text-sm text-primary-foreground/60">
                    {option.label === "Learning" && "Master investing & wealth building"}
                    {option.label === "Investing" && "Grow your passive income streams"}
                    {option.label === "Side Hustles" && "Build profitable projects"}
                    {option.label === "Community" && "Learn from thousands of members"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-primary-foreground/50">
            {new Date().getFullYear()} WealthPath. Education, not financial advice.
          </p>
        </div>
      </div>

      {/* Right panel -- signup form */}
      <div className="w-full lg:w-1/2 ml-auto flex flex-col items-center justify-center px-4 py-12 sm:px-8 min-h-screen">
        <div className="w-full max-w-[400px]">
          <AuthLayout showLogo={false}>
            {/* Progress Indicator */}
            <SignupProgress currentStep={currentStep} />

            <form action={formAction}>
              {state.error && (
                <div
                  className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 mb-6 animate-fade-up"
                  role="alert"
                >
                  {state.error}
                </div>
              )}

              {/* Step 1: Email */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fade-up">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Create your account
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Start your wealth-building journey today
                    </p>
                  </div>

                  <FormField
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    icon={<Mail size={18} />}
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />

                  <Button
                    type="button"
                    onClick={handleNextStep}
                    disabled={!formData.email}
                    className="w-full gap-2 py-6 text-base font-semibold"
                  >
                    Continue
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              )}

              {/* Step 2: Details */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fade-up">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Tell us about yourself
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Personalize your learning experience
                    </p>
                  </div>

                  <FormField
                    label="Full Name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    icon={<User size={18} />}
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                  />

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-foreground">
                      Password
                    </label>
                    <FormField
                      name="password"
                      type="password"
                      placeholder="Create a strong password"
                      icon={<Lock size={18} />}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        handleInputChange("password", e.target.value)
                      }}
                      required
                    />
                    <PasswordStrength password={password} />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      onClick={handlePrevStep}
                      variant="outline"
                      className="flex-1 gap-2 py-6"
                    >
                      <ChevronLeft className="h-5 w-5" />
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={handleNextStep}
                      disabled={!formData.name || !password}
                      className="flex-1 gap-2 py-6 text-base font-semibold"
                    >
                      Continue
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Interests */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fade-up">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      What interests you?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      We'll recommend content based on your interests
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {interestOptions.map((option) => (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() => handleInterestChange(option.label)}
                        className={`
                          p-4 rounded-lg border-2 transition-all duration-300 text-left
                          ${
                            formData.interests.includes(option.label)
                              ? 'border-primary bg-primary/10'
                              : 'border-border/50 hover:border-border'
                          }
                        `}
                      >
                        <option.icon className={`h-5 w-5 mb-2 ${formData.interests.includes(option.label) ? 'text-primary' : 'text-muted-foreground'}`} />
                        <p className="text-sm font-medium text-foreground">
                          {option.label}
                        </p>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="terms"
                        checked={agreed}
                        onCheckedChange={(v) => setAgreed(v === true)}
                        className="mt-1"
                      />
                      <label
                        htmlFor="terms"
                        className="text-xs text-muted-foreground cursor-pointer leading-relaxed"
                      >
                        I agree to the{" "}
                        <Link href="/terms" className="font-medium text-primary hover:underline" target="_blank">
                          Terms of Service
                        </Link>
                        {" "}and{" "}
                        <Link href="/privacy" className="font-medium text-primary hover:underline" target="_blank">
                          Privacy Policy
                        </Link>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      onClick={handlePrevStep}
                      variant="outline"
                      className="flex-1 gap-2 py-6"
                    >
                      <ChevronLeft className="h-5 w-5" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={pending || !agreed}
                      className="flex-1 gap-2 py-6 text-base font-semibold"
                    >
                      {pending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </form>

            <div className="mt-6 pt-6 border-t border-border/50 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </AuthLayout>
        </div>
      </div>
    </div>
    </SimpleLayoutWrapper>
  )
}
