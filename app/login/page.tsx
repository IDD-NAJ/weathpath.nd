import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { TrendingUp } from "lucide-react";

export const metadata = {
  title: "Sign In - WealthPath",
  description: "Sign in to your WealthPath account to access your learning dashboard.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-card via-card to-card/80 border-r border-border/50 relative overflow-hidden">
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,transparent,transparent 59px,hsl(var(--border)) 59px,hsl(var(--border)) 60px),repeating-linear-gradient(90deg,transparent,transparent 59px,hsl(var(--border)) 59px,hsl(var(--border)) 60px)",
          }}
        />

        <Link href="/" className="relative flex items-center gap-2.5 w-fit group z-10">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/90 group-hover:bg-primary transition-colors duration-300 shadow-sm group-hover:shadow-md">
            <TrendingUp className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight font-sans bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            WealthPath
          </span>
        </Link>

        {/* Brand message */}
        <div className="relative z-10 space-y-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-serif font-bold text-foreground leading-editorial">
              Build Lasting Passive Income
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sign in to access your personalized learning journey. Master wealth-building strategies designed for real life.
            </p>
          </div>

          <div className="space-y-3 pt-4">
            {["Clear, jargon-free education", "Interactive tools & guides", "Real success stories"].map((item) => (
              <div key={item} className="flex items-center gap-2.5">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 flex-shrink-0">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
                <span className="text-sm text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer brand info */}
        <p className="relative z-10 text-xs text-muted-foreground">
          © 2024 WealthPath. All rights reserved.
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-gradient-to-b from-background to-background/50">
        <div className="w-full max-w-[420px] animate-fade-in">
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-serif font-bold text-foreground">Welcome Back</h1>
              <p className="text-sm text-muted-foreground">
                Sign in to continue your wealth-building journey
              </p>
            </div>

            {/* Clerk SignIn Component */}
            <div className="flex justify-center">
              <SignIn
                path="/login"
                routing="path"
                signUpUrl="/signup"
                redirectUrl="/dashboard"
                fallbackRedirectUrl="/dashboard"
                appearance={{
                  baseTheme: undefined,
                  elements: {
                    rootBox: "w-full",
                    card: "bg-transparent border-0 shadow-none",
                    cardBox: "w-full",
                    form: "space-y-4",
                    formFieldInput:
                      "h-11 bg-card/50 border-border rounded-lg focus:bg-card focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 pl-4 text-foreground placeholder:text-muted-foreground",
                    formField: "space-y-1.5",
                    formFieldLabel: "text-xs uppercase tracking-widest font-medium text-muted-foreground",
                    submitButton:
                      "w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50",
                    footerActionLink: "text-primary hover:text-primary/80 font-medium",
                    identifierMobileMenuButton: "text-primary",
                    socialButtonsBlockButton:
                      "h-11 bg-card/50 border-border hover:bg-card hover:border-primary/50 hover:shadow-md transition-all duration-200 rounded-lg",
                    socialButtonsBlockButtonText: "font-medium text-sm",
                    dividerLine: "bg-border/30",
                    dividerText: "text-xs text-muted-foreground",
                    alternativeMethodsBlockButton:
                      "text-primary hover:text-primary/80 text-sm font-medium",
                    alternativeMethodsBlockButtonText: "text-sm",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    header: "hidden",
                  },
                  variables: {
                    colorPrimary: "hsl(var(--primary))",
                    colorText: "hsl(var(--foreground))",
                    colorTextSecondary: "hsl(var(--muted-foreground))",
                    colorBackground: "hsl(var(--background))",
                    colorInputBackground: "hsl(var(--card))",
                    colorInputText: "hsl(var(--foreground))",
                    colorTextOnPrimaryBackground: "hsl(var(--primary-foreground))",
                    colorBorder: "hsl(var(--border))",
                    colorShimmer: "hsl(var(--muted))",
                  },
                }}
              />
            </div>

            {/* Sign up link */}
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-medium text-primary hover:text-primary/80 transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
