import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { TrendingUp } from "lucide-react";

export const metadata = {
  title: "Sign Up - WealthPath",
  description: "Create your WealthPath account and start learning how to build lasting passive wealth.",
};

export default function SignupPage() {
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
              Start Your Wealth-Building Journey
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Join thousands learning to build lasting passive income through clear, practical education. No jargon. No shortcuts.
            </p>
          </div>

          <div className="space-y-3 pt-4">
            {[
              "Learn at your own pace",
              "Interactive learning tools",
              "Real-world success stories",
            ].map((item) => (
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
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 overflow-y-auto bg-gradient-to-b from-background to-background/50">
        <div className="w-full max-w-[440px] py-8 animate-fade-in">
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-serif font-bold text-foreground">Create Your Account</h1>
              <p className="text-sm text-muted-foreground">
                Join WealthPath and start building your passive wealth empire
              </p>
            </div>

            {/* Clerk SignUp Component */}
            <div className="flex justify-center">
              <SignUp
                routing="hash"
                signInUrl="/login"
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

            {/* Sign in link */}
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
