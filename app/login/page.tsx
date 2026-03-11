"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { TrendingUp, Loader2, Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react"
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

function SocialButton({
  icon,
  label,
}: {
  icon: React.ReactNode
  label: string
}) {
  return (
    <Button
      variant="outline"
      className="w-full gap-2 py-5"
      disabled
      title="Coming soon"
    >
      {icon}
      <span className="sr-only sm:not-sr-only sm:inline">{label}</span>
    </Button>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        if (data.redirectTo) {
          router.push(data.redirectTo)
        } else {
          router.push("/dashboard")
        }
      } else {
        setError(data.error || "Login failed")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <SimpleLayoutWrapper showNavigation={false}>
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 flex flex-col items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <TrendingUp className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-foreground">
                WealthPath
              </span>
            </Link>
          </div>

          <Card>
            <CardHeader className="items-center text-center pb-4">
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                Sign In
              </CardTitle>
              <CardDescription>
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-6 px-0 pt-0 sm:px-6">
              <div className="flex flex-col gap-3">
                <SocialButton icon={<div className="h-5 w-5 rounded-sm bg-current" />} label="Continue with Google" />
                <SocialButton icon={<div className="h-5 w-5 rounded-sm bg-current" />} label="Continue with GitHub" />
              </div>

              <div className="relative flex items-center gap-3 py-1">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">or continue with email</span>
                <Separator className="flex-1" />
              </div>

              <form onSubmit={handleSubmit}>
                {error && (
                  <div
                    className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive mb-4"
                    role="alert"
                  >
                    {error}
                  </div>
                )}
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
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="/forgot-password"
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      required
                      autoComplete="current-password"
                      className="pl-9 pr-10"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
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
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox id="remember" name="remember" />
                  <Label
                    htmlFor="remember"
                    className="text-sm font-normal text-muted-foreground"
                  >
                    Keep me signed in for 30 days
                  </Label>
                </div>

                <Button type="submit" className="w-full gap-2 py-5" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                  Sign In
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 px-0 sm:px-6 pt-0">
              <p className="text-center text-sm text-muted-foreground">
                {"Don't have an account? "}
                <Link
                  href="/signup"
                  className="font-medium text-primary hover:underline"
                >
                  Create one free
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </SimpleLayoutWrapper>
  )
}
