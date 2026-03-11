"use client"

import { useState, useEffect } from "react"
import { useFormState, useFormStatus } from "react-dom"
import Link from "next/link"
import {
  TrendingUp,
  Loader2,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Shield,
  BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SimpleLayoutWrapper } from "@/components/layout-wrapper"
import { signupAction, type AuthState } from "@/app/actions/auth"
import { PasswordStrength } from "@/components/password-strength"

function SocialButton({
  icon,
  label,
}: {
  icon: React.ReactNode
  label: string
}) {
  return (
    <Button
      type="button"
      variant="outline"
      className="flex-1 gap-2 py-5"
      disabled
      title="Coming soon"
    >
      {icon}
      <span className="sr-only sm:not-sr-only sm:inline">{label}</span>
    </Button>
  )
}

const benefits = [
  {
    icon: BookOpen,
    title: "Structured learning paths",
    description: "Step-by-step guides tailored to your experience level",
  },
  {
    icon: Sparkles,
    title: "Personalized recommendations",
    description: "Get content matched to your goals and interests",
  },
  {
    icon: Shield,
    title: "Honest, jargon-free education",
    description: "Clear explanations without hype or hidden agendas",
  },
]

export default function SignupPage() {
  const [state, formAction] = useFormState<AuthState, FormData>(signupAction, {})
  const { pending } = useFormStatus()
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [agreed, setAgreed] = useState(false)

  return (
    <SimpleLayoutWrapper showNavigation={false}>
      <div className="flex min-h-screen bg-background">
        {/* Left panel -- benefits (hidden on mobile) */}
        <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden bg-primary p-10 lg:flex">
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground/20 backdrop-blur-sm">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-primary-foreground">
              WealthPath
            </span>
          </Link>
        </div>

        <div className="relative z-10 flex flex-col gap-8">
          <div>
            <h2 className="max-w-sm font-serif text-3xl leading-tight text-primary-foreground">
              Start your wealth-building journey today
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-primary-foreground/70">
              Join a growing community of everyday people learning to create
              reliable passive income streams.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10">
                  <benefit.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-primary-foreground">
                    {benefit.title}
                  </h3>
                  <p className="mt-0.5 text-xs leading-relaxed text-primary-foreground/60">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-3 rounded-lg bg-primary-foreground/5 p-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-primary-foreground/20 text-xs font-medium text-primary-foreground"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <p className="text-xs text-primary-foreground/70">
              <span className="font-semibold text-primary-foreground">
                2,400+
              </span>{" "}
              people joined this month
            </p>
          </div>
        </div>

        <p className="relative z-10 text-xs text-primary-foreground/50">
          WealthPath {new Date().getFullYear()}. Education, not financial advice.
        </p>

        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Right panel -- signup form */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-[440px]">
          {/* Mobile logo */}
          <div className="mb-8 flex flex-col items-center gap-3 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <TrendingUp className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-foreground">
                WealthPath
              </span>
            </Link>
          </div>

          <Card className="border-0 shadow-none sm:border sm:shadow-sm">
            <CardHeader className="px-0 sm:px-6">
              <CardTitle className="text-2xl">Create your account</CardTitle>
              <CardDescription className="text-sm">
                Join thousands learning to build lasting wealth
              </CardDescription>
            </CardHeader>

            {/* Social login buttons */}
            <CardContent className="flex flex-col gap-4 px-0 sm:px-6">
              <div className="flex gap-3">
                <SocialButton
                  icon={
                    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                  }
                  label="Google"
                />
                <SocialButton
                  icon={
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                  }
                  label="GitHub"
                />
              </div>

              <div className="relative flex items-center gap-3 py-1">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">or sign up with email</span>
                <Separator className="flex-1" />
              </div>
            </CardContent>

            <form action={formAction}>
              <CardContent className="flex flex-col gap-4 px-0 pt-0 sm:px-6">
                {state.error && (
                  <div
                    className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                    role="alert"
                  >
                    {state.error}
                  </div>
                )}

                {/* Name */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Full name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Your full name"
                      required
                      autoComplete="name"
                      className="pl-9"
                    />
                  </div>
                  {state.fieldErrors?.name && (
                    <p className="text-xs text-destructive" role="alert">
                      {state.fieldErrors.name[0]}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                      className="pl-9"
                    />
                  </div>
                  {state.fieldErrors?.email && (
                    <p className="text-xs text-destructive" role="alert">
                      {state.fieldErrors.email[0]}
                    </p>
                  )}
                </div>

                {/* Password with strength indicator */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      required
                      autoComplete="new-password"
                      className="pl-9 pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {state.fieldErrors?.password && (
                    <p className="text-xs text-destructive" role="alert">
                      {state.fieldErrors.password[0]}
                    </p>
                  )}
                  <PasswordStrength password={password} />
                </div>

                {/* Terms agreement */}
                <div className="flex items-start gap-2 pt-1">
                  <Checkbox
                    id="terms"
                    checked={agreed}
                    onCheckedChange={(v) => setAgreed(v === true)}
                    className="mt-0.5"
                  />
                  <Label
                    htmlFor="terms"
                    className="text-xs font-normal leading-relaxed text-muted-foreground"
                  >
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="font-medium text-primary hover:underline"
                      target="_blank"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="font-medium text-primary hover:underline"
                      target="_blank"
                    >
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4 px-0 sm:px-6">
                <Button
                  type="submit"
                  className="w-full gap-2 py-5"
                  disabled={pending || !agreed}
                >
                  {pending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                  Create Account
                </Button>

                {/* Benefits micro-copy */}
                <div className="flex flex-col gap-2 rounded-lg bg-muted/50 p-3">
                  {[
                    "Access all learning paths and guides",
                    "Track your progress across topics",
                    "Personalized recommendations",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                      {item}
                    </div>
                  ))}
                </div>
              </CardFooter>
            </form>
          </Card>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
    </SimpleLayoutWrapper>
  )
}
