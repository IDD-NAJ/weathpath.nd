import type { ComponentProps } from "react"
import type { SignIn } from "@clerk/nextjs"

type Appearance = NonNullable<ComponentProps<typeof SignIn>["appearance"]>

/**
 * Maps Clerk's prebuilt <SignIn /> / <SignUp /> UI onto the WealthPath design
 * tokens so it inherits the brand red, serif headings, and light/dark themes.
 */
export const clerkAppearance: Appearance = {
  layout: {
    socialButtonsPlacement: "top",
    socialButtonsVariant: "blockButton",
    termsPageUrl: "/terms",
    privacyPageUrl: "/privacy",
    helpPageUrl: "/contact",
  },
  variables: {
    borderRadius: "0.25rem",
    fontFamily: "var(--font-sans)",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-lg border border-border rounded-sm",
    card: "bg-card px-8 py-8 gap-6 shadow-none",
    header: "gap-1",
    headerTitle: "font-serif text-2xl text-foreground",
    headerSubtitle: "text-sm text-muted-foreground leading-relaxed",
    socialButtonsBlockButton:
      "h-11 border border-border bg-background text-foreground hover:bg-muted rounded-sm transition-colors",
    socialButtonsBlockButtonText: "text-sm font-medium text-foreground",
    dividerLine: "bg-border",
    dividerText: "text-xs uppercase tracking-widest text-muted-foreground",
    formFieldLabel: "text-sm font-medium text-foreground",
    formFieldInput:
      "h-11 bg-background border border-input text-foreground rounded-sm focus:border-ring",
    formFieldInputShowPasswordButton:
      "text-muted-foreground hover:text-foreground",
    formButtonPrimary:
      "h-11 bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm text-sm font-medium normal-case shadow-none",
    formFieldAction: "text-primary hover:text-primary/80 font-medium",
    identityPreviewEditButton: "text-primary hover:text-primary/80",
    // The dev-mode badge renders inside the footer, so give the stack room to
    // breathe instead of letting the two overlap.
    footer: "bg-transparent gap-3",
    footerAction: "bg-transparent",
    footerPages: "mt-1",
    footerActionText: "text-sm text-muted-foreground",
    footerActionLink: "text-primary font-medium hover:text-primary/80",
    formFieldSuccessText: "text-accent",
    formFieldErrorText: "text-destructive",
    alertText: "text-sm text-foreground",
    otpCodeFieldInput: "border border-input text-foreground rounded-sm",
    userPreviewMainIdentifier: "text-foreground",
    userPreviewSecondaryIdentifier: "text-muted-foreground",
    badge: "bg-primary/10 text-primary",
    logoBox: "hidden",
  },
}
