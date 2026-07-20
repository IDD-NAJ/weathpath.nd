"use client"

import Link from "next/link"
import { ArrowRight, Plane, Code2, Bitcoin, ShoppingBag, BarChart3, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

const topics = [
  { label: "Travel", href: "/topics/travel", icon: Plane, color: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
  { label: "Coding", href: "/topics/coding", icon: Code2, color: "bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400" },
  { label: "Bitcoin", href: "/topics/bitcoin", icon: Bitcoin, color: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" },
  { label: "Dropshipping", href: "/topics/dropshipping", icon: ShoppingBag, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" },
  { label: "Investing", href: "/topics/investing", icon: BarChart3, color: "bg-primary/10 text-primary" },
  { label: "Side Hustles", href: "/topics/side-hustles", icon: Zap, color: "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
]

const stats = [
  { value: "6", label: "Topic Hubs" },
  { value: "50+", label: "Articles" },
  { value: "2,400+", label: "Members" },
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-14 md:pb-28 md:pt-20">
      {/* Subtle grid background */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />
      {/* Soft radial glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-primary/6 blur-3xl" />

      <div className="mx-auto max-w-5xl">
        {/* Headline */}
        <h1 className="mt-6 text-center font-serif text-4xl font-normal leading-editorial tracking-tight text-foreground text-balance animate-fade-up-delay-1 md:text-6xl md:leading-[1.15]">
          Build Real Wealth
          <br />
          <span className="text-primary">One Income Stream</span>
          <br />
          at a Time
        </h1>

        {/* Sub-copy */}
        <p className="mx-auto mt-6 max-w-2xl text-center text-base leading-relaxed text-muted-foreground text-pretty animate-fade-up-delay-2 md:text-lg">
          From travel content and coding to crypto and dropshipping — explore honest,
          practical guides on building income that works for you.
        </p>

        {/* CTAs */}
        <div className="mt-9 flex flex-col items-center justify-center gap-3 animate-fade-up-delay-3 sm:flex-row">
          <Button size="lg" className="rounded-xl px-6 gap-2" asChild>
            <Link href="/articles">
              Start Exploring
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="rounded-xl px-6" asChild>
            <Link href="/signup">Join Free</Link>
          </Button>
        </div>

        {/* Topic pills */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-2.5 animate-fade-up-delay-4">
          {topics.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-sm ${t.color}`}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </Link>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-10 border-t border-border pt-10 animate-fade-up-delay-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold text-foreground">{s.value}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
