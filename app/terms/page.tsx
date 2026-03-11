import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Terms of Service - WealthPath",
}

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <Button asChild variant="ghost" size="sm" className="mb-8">
        <Link href="/signup">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
      </Button>

      <h1 className="mb-6 font-serif text-3xl text-foreground">
        Terms of Service
      </h1>

      <div className="flex flex-col gap-6 text-sm leading-relaxed text-muted-foreground">
        <p>
          Welcome to WealthPath. By creating an account or using our services,
          you agree to the following terms.
        </p>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">
            1. Educational Purpose
          </h2>
          <p>
            All content on WealthPath is provided for educational purposes only
            and should not be interpreted as financial, legal, or investment
            advice. You are solely responsible for your own financial decisions.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">
            2. Account Responsibility
          </h2>
          <p>
            You are responsible for maintaining the security of your account
            credentials and for all activity that occurs under your account.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">
            3. Acceptable Use
          </h2>
          <p>
            You agree not to misuse our services, including but not limited to
            attempting to access unauthorized areas of the platform, scraping
            content, or distributing harmful material.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">
            4. Changes to Terms
          </h2>
          <p>
            We may update these terms from time to time. Continued use of the
            platform after changes constitutes acceptance of the new terms.
          </p>
        </section>
      </div>
    </main>
  )
}
