import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Privacy Policy - WealthPath",
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <Button asChild variant="ghost" size="sm" className="mb-8">
        <Link href="/signup">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
      </Button>

      <h1 className="mb-6 font-serif text-3xl text-foreground">
        Privacy Policy
      </h1>

      <div className="flex flex-col gap-6 text-sm leading-relaxed text-muted-foreground">
        <p>
          WealthPath is committed to protecting your privacy. This policy
          explains how we collect, use, and safeguard your personal information.
        </p>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">
            1. Information We Collect
          </h2>
          <p>
            We collect your name, email address, and account preferences when you
            create an account. We also collect usage data such as pages visited
            and learning progress.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">
            2. How We Use Your Data
          </h2>
          <p>
            Your information is used to provide and improve our educational
            services, personalize your learning experience, and communicate
            important updates about your account.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">
            3. Data Security
          </h2>
          <p>
            Passwords are hashed using industry-standard bcrypt encryption.
            Session data is stored securely and transmitted via HTTP-only cookies.
            We never store plaintext passwords.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">
            4. Data Sharing
          </h2>
          <p>
            We do not sell your personal data to third parties. Data may be
            shared only when required by law or with your explicit consent.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">
            5. Contact
          </h2>
          <p>
            If you have questions about this policy, please reach out through the
            contact information provided on our website.
          </p>
        </section>
      </div>
    </main>
  )
}
