import { ArrowRight, TrendingUp, Twitter, Youtube, Linkedin, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnimatedSection, AnimatedItem } from "@/components/animated-section"
import Link from "next/link"

const footerColumns = [
  {
    heading: "Topics",
    links: [
      { label: "Travel Content", href: "/topics/travel" },
      { label: "Coding & Tech", href: "/topics/coding" },
      { label: "Bitcoin & Crypto", href: "/topics/bitcoin" },
      { label: "Dropshipping", href: "/topics/dropshipping" },
      { label: "Investing", href: "/topics/investing" },
      { label: "Side Hustles", href: "/topics/side-hustles" },
    ],
  },
  {
    heading: "Learn",
    links: [
      { label: "All Articles", href: "/articles" },
      { label: "Success Stories", href: "/stories" },
      { label: "Step-by-Step Guides", href: "/#learn" },
      { label: "Income Quiz", href: "/#quiz" },
      { label: "Growth Calculator", href: "/#tools" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About WealthPath", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
]

const socialLinks = [
  { label: "Twitter / X", href: "#", icon: Twitter },
  { label: "YouTube", href: "#", icon: Youtube },
  { label: "LinkedIn", href: "#", icon: Linkedin },
  { label: "GitHub", href: "#", icon: Github },
]

export function CtaFooter() {
  return (
    <>
      {/* CTA Banner */}
      <section className="px-6 py-20 md:py-28">
        <AnimatedSection className="mx-auto max-w-4xl rounded-3xl bg-primary px-10 py-14 text-center md:px-16 md:py-20">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-foreground/15">
            <TrendingUp className="h-6 w-6 text-primary-foreground" />
          </div>
          <h2 className="mx-auto max-w-xl font-serif text-3xl leading-tight text-primary-foreground md:text-4xl text-balance">
            Your future self will thank you for starting today
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-primary-foreground/75">
            Build income that works for you — whether you&apos;re asleep, traveling, or
            spending time with people you love.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="gap-2 rounded-xl bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              asChild
            >
              <Link href="/signup">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-xl border-primary-foreground/30 text-primary-foreground bg-transparent hover:bg-primary-foreground/10 hover:text-primary-foreground"
              asChild
            >
              <Link href="/articles">Explore Articles</Link>
            </Button>
          </div>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-6 pt-14 pb-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 md:grid-cols-5">
            {/* Brand col */}
            <AnimatedItem index={0} className="md:col-span-2">
              <Link href="/" className="mb-5 flex items-center gap-2.5" aria-label="WealthPath home">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                  <TrendingUp className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">
                  Wealth<span className="text-primary">Path</span>
                </span>
              </Link>
              <p className="text-sm leading-relaxed text-muted-foreground max-w-xs">
                Free, honest education on building passive wealth — no jargon,
                no hype, no hidden agenda.
              </p>
              <div className="mt-6 flex items-center gap-2">
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary hover:bg-primary/5"
                  >
                    <s.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </AnimatedItem>

            {/* Link columns */}
            {footerColumns.map((col, i) => (
              <AnimatedItem key={col.heading} index={i + 1}>
                <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {col.heading}
                </p>
                <ul className="flex flex-col gap-2.5" role="list">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground link-underline"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </AnimatedItem>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-8 md:flex-row">
            <p className="text-xs text-muted-foreground text-center md:text-left">
              WealthPath is an educational resource. Nothing here constitutes financial advice.
            </p>
            <p className="text-xs text-muted-foreground whitespace-nowrap">
              &copy; 2026 WealthPath. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}
