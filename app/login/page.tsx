"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2, Mail, Lock, ArrowRight, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { AuthLayout } from "@/components/auth/auth-layout"
import { FormField } from "@/components/auth/form-field"
import { SimpleLayoutWrapper } from "@/components/layout-wrapper"



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
      <AuthLayout title="Welcome Back" subtitle="Sign in to your WealthPath account">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div
              className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 animate-fade-up"
              role="alert"
            >
              {error}
            </div>
          )}

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

          <div className="animate-fade-up">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <FormField
              name="password"
              type="password"
              placeholder="Enter your password"
              icon={<Lock size={18} />}
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              required
            />
          </div>

          <div className="flex items-center gap-3 animate-fade-up">
            <Checkbox id="remember" name="remember" className="rounded" />
            <label
              htmlFor="remember"
              className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
            >
              Keep me signed in for 30 days
            </label>
          </div>

          <Button
            type="submit"
            className="w-full gap-2 py-6 text-base font-semibold animate-fade-up"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-border/50 text-center animate-fade-up">
          <p className="text-sm text-muted-foreground">
            {"Don't have an account? "}
            <Link href="/signup" className="font-semibold text-primary hover:text-primary/80 transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </AuthLayout>
    </SimpleLayoutWrapper>
  )
}
