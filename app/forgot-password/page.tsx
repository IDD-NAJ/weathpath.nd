"use client"

import { useState } from "react"
import Link from "next/link"
import { TrendingUp, Mail, ArrowLeft, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false)
  const [email, setEmail] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // In a production app this would trigger a server action that sends a
    // password-reset email.  For now we show the success state.
    setSubmitted(true)
  }

  return (
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
          {submitted ? (
            <>
              <CardHeader className="items-center text-center">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Check your inbox</CardTitle>
                <CardDescription className="mx-auto max-w-xs">
                  If an account exists for{" "}
                  <span className="font-medium text-foreground">{email}</span>,
                  you will receive a password reset link shortly.
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex flex-col gap-3">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to sign in
                  </Link>
                </Button>
              </CardFooter>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle className="text-xl">Reset your password</CardTitle>
                <CardDescription>
                  Enter the email address linked to your account and we will send
                  you a reset link.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="email">Email address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        required
                        autoComplete="email"
                        className="pl-9"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                  <Button type="submit" className="w-full">
                    Send reset link
                  </Button>
                  <Button asChild variant="ghost" className="w-full">
                    <Link href="/login">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to sign in
                    </Link>
                  </Button>
                </CardFooter>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
