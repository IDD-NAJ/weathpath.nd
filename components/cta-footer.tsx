import { ArrowRight, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnimatedSection, AnimatedItem } from "@/components/animated-section"

const footerLinks = [
  {
    heading: "Learn",
    links: [
      { label: "Real Estate Income", href: "#learn" },
      { label: "Dividend Investing", href: "#learn" },
      { label: "Digital Products", href: "#learn" },
      { label: "Online Business", href: "#learn" },
    ],
  },
  {
    heading: "Tools",
    links: [
      { label: "Income Quiz", href: "#quiz" },
      { label: "Growth Calculator", href: "#tools" },
      { label: "Step-by-Step Guide", href: "#guide" },
    ],
  },
  {
    heading: "Community",
    links: [
      { label: "Success Stories", href: "/stories" },
      { label: "Resources", href: "#resources" },
      { label: "About WealthPath", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
]

export function CtaFooter() {
  return (
    <>
      {/* CTA Banner */}
      <section className="px-6 py-20 md:py-28">
        <AnimatedSection className="mx-auto max-w-4xl rounded-2xl border border-primary/20 bg-primary/5 p-10 text-center md:p-16">
          <h2 className="mx-auto max-w-lg font-serif text-3xl leading-tight text-foreground md:text-4xl text-balance">
            Your future self will thank you for starting today
          </h2>
          <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-muted-foreground">
            Take the first step toward building income that works for you, even
            while you sleep, travel, or spend time with people you love.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="gap-2">
              <a href="#quiz">
                Take the Free Quiz
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="#learn">Explore All Paths</a>
            </Button>
          </div>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-6 py-12 md:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 md:grid-cols-4">
            {/* Brand */}
            <AnimatedItem index={0}>
              <a
                href="/"
                className="mb-4 flex items-center gap-2"
                aria-label="WealthPath home"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <TrendingUp className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-foreground">
                  WealthPath
                </span>
              </a>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Free, honest education on building passive wealth. No jargon, no
                hype, no hidden agenda.
              </p>
            </AnimatedItem>

            {/* Link columns */}
            {footerLinks.map((col, i) => (
              <AnimatedItem key={col.heading} index={i + 1}>
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {col.heading}
                </p>
                <ul className="flex flex-col gap-2.5" role="list">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </AnimatedItem>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
            <p className="text-xs text-muted-foreground">
              WealthPath is an educational resource. Content is for
              informational purposes only and does not constitute financial
              advice.
            </p>
            <p className="text-xs text-muted-foreground">
              2026 WealthPath. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}
