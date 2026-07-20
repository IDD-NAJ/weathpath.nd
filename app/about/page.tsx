import Link from "next/link"
import {
  TrendingUp,
  BookOpen,
  Zap,
  Shield,
  Heart,
  Target,
  Users,
  Globe,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  Star,
  Quote,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { getCurrentUser } from "@/lib/auth"

const values = [
  {
    icon: BookOpen,
    title: "Education First",
    description:
      "We believe every person deserves access to honest, jargon-free financial education — not expensive courses or gatekept secrets.",
    color: "text-topic-invest bg-topic-invest/10",
  },
  {
    icon: Shield,
    title: "No Hidden Agendas",
    description:
      "We never push products to earn commissions. Every recommendation is driven by what actually works, backed by real research and experience.",
    color: "text-topic-coding bg-topic-coding/10",
  },
  {
    icon: Heart,
    title: "Community Driven",
    description:
      "WealthPath grows with its readers. Your questions, stories, and feedback shape what we write about and how we improve the platform.",
    color: "text-topic-hustle bg-topic-hustle/10",
  },
  {
    icon: Lightbulb,
    title: "Practical Wisdom",
    description:
      "Theory is useless without application. Every guide on WealthPath comes with clear steps, real numbers, and actionable next moves.",
    color: "text-topic-bitcoin bg-topic-bitcoin/10",
  },
]

const stats = [
  { label: "Monthly Readers", value: "120K+" },
  { label: "Articles Published", value: "350+" },
  { label: "Topics Covered", value: "6" },
  { label: "Member Communities", value: "15K+" },
]

const teamMembers = [
  {
    initials: "MR",
    name: "Marcus Reed",
    role: "Founder & Editor",
    bio: "Former software engineer who built three passive income streams before 35. Writes about coding, SaaS, and building digital assets.",
    topics: ["Coding & Tech", "Side Hustles"],
  },
  {
    initials: "SL",
    name: "Sofia Liang",
    role: "Investing Editor",
    bio: "CFA charterholder with 10 years at a global asset manager. Translates complex investment concepts into plain English for everyday investors.",
    topics: ["Investing", "Bitcoin & Crypto"],
  },
  {
    initials: "JO",
    name: "Jamie Okafor",
    role: "Entrepreneur Lead",
    bio: "Built and sold a 7-figure dropshipping business. Now coaches first-time entrepreneurs on product selection and scaling supply chains.",
    topics: ["Dropshipping", "Side Hustles"],
  },
  {
    initials: "AK",
    name: "Aisha Khan",
    role: "Travel & Lifestyle",
    bio: "Full-time traveler and content creator earning through affiliate partnerships and digital products. Expert in location-independent income.",
    topics: ["Travel Content", "Side Hustles"],
  },
]

const milestones = [
  { year: "2020", event: "WealthPath launches with a single guide on index fund investing" },
  { year: "2021", event: "Expanded to cover side hustles and dropshipping; hit 10K monthly readers" },
  { year: "2022", event: "Launched Bitcoin & Crypto and Travel Content verticals" },
  { year: "2023", event: "Introduced interactive tools: compound calculator, income quiz, learning paths" },
  { year: "2024", event: "Reached 100K monthly readers; opened free community membership" },
  { year: "2025", event: "Launched AI-assisted content tools and personalized dashboard" },
]

const testimonials = [
  {
    quote:
      "WealthPath's dropshipping guide is the only resource I needed to launch my first store. Clear, honest, no fluff.",
    name: "Diego M.",
    tag: "Dropshipping",
  },
  {
    quote:
      "I finally understand my investment portfolio thanks to the investing articles here. No jargon, no fear-mongering.",
    name: "Rachel T.",
    tag: "Investing",
  },
  {
    quote:
      "The side hustle topic hub helped me pick my first freelance niche and land clients within a month.",
    name: "Kofi A.",
    tag: "Side Hustles",
  },
]

export default async function AboutPage() {
  const user = await getCurrentUser()

  return (
    <LayoutWrapper user={user}>
      {/* Hero */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-5 gap-1.5 rounded-full px-3 py-1">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              About WealthPath
            </Badge>
            <h1 className="font-serif text-4xl leading-tight text-foreground md:text-5xl text-balance">
              Honest education for people building{" "}
              <span className="text-primary">real financial freedom</span>
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground text-balance">
              WealthPath started as a simple question: why is financial education so
              complicated, so expensive, and so often tied to someone selling you something?
              We set out to answer it differently.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="rounded-xl">
                <Link href="/articles">
                  Explore Articles
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-xl">
                <Link href="/signup">Join Free</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b border-border bg-secondary/50">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1 text-center">
                <span className="text-3xl font-bold text-foreground">{s.value}</span>
                <span className="text-sm text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <Badge variant="secondary" className="mb-4 rounded-full">Our Mission</Badge>
            <h2 className="font-serif text-3xl leading-tight text-foreground md:text-4xl text-balance">
              Demystify wealth-building for anyone willing to learn
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              The finance industry profits from confusion. Complex jargon, intimidating charts,
              and paywalled knowledge keep most people stuck. WealthPath exists to break that barrier.
            </p>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              We cover six proven paths to passive income — investing, dropshipping, crypto,
              travel content, tech and coding, and side hustles — with depth, honesty, and zero
              hype. Whether you have $500 or $50,000 to start, there&apos;s a path here for you.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              {[
                "Free forever — no paywalled basics",
                "Written by practitioners, not influencers",
                "Updated regularly with current information",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Visual accent */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 rounded-2xl bg-primary p-8">
              <Quote className="h-8 w-8 text-primary-foreground/30 mb-3" />
              <p className="font-serif text-xl leading-relaxed text-primary-foreground">
                &ldquo;Financial freedom isn&apos;t a personality trait. It&apos;s a skill set — and skills can be learned.&rdquo;
              </p>
            </div>
            <div className="rounded-2xl bg-muted p-6 flex flex-col gap-2">
              <Target className="h-6 w-6 text-primary mb-1" />
              <p className="text-sm font-semibold text-foreground">Goal-Oriented</p>
              <p className="text-xs text-muted-foreground">
                Every article is anchored to a concrete financial outcome
              </p>
            </div>
            <div className="rounded-2xl bg-muted p-6 flex flex-col gap-2">
              <Globe className="h-6 w-6 text-topic-travel mb-1" />
              <p className="text-sm font-semibold text-foreground">Accessible</p>
              <p className="text-xs text-muted-foreground">
                Written for people anywhere in the world, at any income level
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <Badge variant="secondary" className="mb-4 rounded-full">Our Values</Badge>
            <h2 className="font-serif text-3xl text-foreground md:text-4xl text-balance">
              What makes WealthPath different
            </h2>
            <p className="mt-3 text-muted-foreground">
              These aren&apos;t marketing words. They&apos;re the rules we hold ourselves to in every piece of content we publish.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
              >
                <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${v.color}`}>
                  <v.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{v.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <Badge variant="secondary" className="mb-4 rounded-full">
            <Users className="h-3.5 w-3.5 mr-1" />
            The Team
          </Badge>
          <h2 className="font-serif text-3xl text-foreground md:text-4xl text-balance">
            Written by people who&apos;ve done it
          </h2>
          <p className="mt-3 text-muted-foreground">
            Every author on WealthPath has personal experience with what they write about. No ghostwriters. No theory-only takes.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {teamMembers.map((member) => (
            <div
              key={member.name}
              className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-4"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary">
                {member.initials}
              </div>
              <div>
                <p className="font-semibold text-foreground">{member.name}</p>
                <p className="text-xs text-muted-foreground">{member.role}</p>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground flex-1">{member.bio}</p>
              <div className="flex flex-wrap gap-1.5">
                {member.topics.map((t) => (
                  <Badge key={t} variant="secondary" className="text-[11px] rounded-full">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <Badge variant="secondary" className="mb-4 rounded-full">Our Story</Badge>
            <h2 className="font-serif text-3xl text-foreground md:text-4xl">
              How we got here
            </h2>
          </div>
          <div className="mx-auto max-w-2xl">
            <div className="relative flex flex-col gap-0">
              {milestones.map((m, i) => (
                <div key={m.year} className="flex gap-6 group">
                  <div className="flex flex-col items-center">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-xs font-bold text-primary">
                      {m.year.slice(2)}
                    </div>
                    {i < milestones.length - 1 && (
                      <div className="w-px flex-1 bg-border my-1" />
                    )}
                  </div>
                  <div className="pb-8 pt-1.5">
                    <span className="text-xs font-semibold text-primary">{m.year}</span>
                    <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{m.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <Badge variant="secondary" className="mb-4 rounded-full">
              <Star className="h-3.5 w-3.5 mr-1 text-topic-bitcoin" />
              Reader Stories
            </Badge>
            <h2 className="font-serif text-3xl text-foreground md:text-4xl text-balance">
              What our readers say
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-4"
              >
                <Quote className="h-5 w-5 text-primary/40" />
                <p className="text-sm leading-relaxed text-foreground flex-1">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{t.name}</span>
                  <Badge variant="secondary" className="text-[11px] rounded-full">{t.tag}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-primary">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <Zap className="mx-auto mb-5 h-10 w-10 text-primary-foreground/60" />
          <h2 className="font-serif text-3xl text-primary-foreground md:text-4xl text-balance">
            Ready to start your own path?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-primary-foreground/70">
            Join over 15,000 members getting honest weekly insights on building passive income — completely free.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="rounded-xl bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              <Link href="/signup">
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-xl border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link href="/articles">Browse Articles</Link>
            </Button>
          </div>
        </div>
      </section>
    </LayoutWrapper>
  )
}
