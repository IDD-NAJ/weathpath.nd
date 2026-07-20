"use client"

import Link from "next/link"
import { Plane, Code2, Bitcoin, ShoppingBag, BarChart3, Zap, ArrowRight } from "lucide-react"
import { AnimatedSection, AnimatedItem } from "@/components/animated-section"

const paths = [
  {
    icon: Plane,
    title: "Travel Content",
    href: "/topics/travel",
    description: "Monetize travel blogs, YouTube channels, and social content while exploring the world.",
    tag: "Creator Economy",
    accent: "bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300",
    iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
  },
  {
    icon: Code2,
    title: "Coding & Tech",
    href: "/topics/coding",
    description: "Build SaaS products, sell dev services, or earn from open source — skills that scale.",
    tag: "High Leverage",
    accent: "bg-violet-50 border-violet-100 text-violet-700 dark:bg-violet-900/20 dark:border-violet-800 dark:text-violet-300",
    iconBg: "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400",
  },
  {
    icon: Bitcoin,
    title: "Bitcoin & Crypto",
    href: "/topics/bitcoin",
    description: "Navigate digital assets, DeFi, and long-term holding strategies with clarity.",
    tag: "Emerging Assets",
    accent: "bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300",
    iconBg: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
  },
  {
    icon: ShoppingBag,
    title: "Dropshipping",
    href: "/topics/dropshipping",
    description: "Launch a product business without holding inventory — lean, testable, and scalable.",
    tag: "E-Commerce",
    accent: "bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300",
    iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
  },
  {
    icon: BarChart3,
    title: "Investing",
    href: "/topics/investing",
    description: "Stocks, index funds, dividends, and real estate — build long-term compounding wealth.",
    tag: "Long-Term Wealth",
    accent: "bg-primary/5 border-primary/15 text-primary",
    iconBg: "bg-primary/10 text-primary",
  },
  {
    icon: Zap,
    title: "Side Hustles",
    href: "/topics/side-hustles",
    description: "Freelancing, consulting, reselling — real ways to earn extra income starting this week.",
    tag: "Quick Wins",
    accent: "bg-purple-50 border-purple-100 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300",
    iconBg: "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400",
  },
]

export function LearningPaths() {
  return (
    <section id="learn" className="scroll-mt-20 px-6 py-20 md:py-28">
      <div className="mx-auto max-w-7xl">
        <AnimatedSection className="mb-14 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-serif text-3xl leading-tight text-foreground md:text-4xl text-balance max-w-lg">
              Pick the income strategy that fits your life
            </h2>
          </div>
          <Link
            href="/articles"
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline underline-offset-4 whitespace-nowrap self-start md:self-end"
          >
            View all articles <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </AnimatedSection>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {paths.map((path, i) => (
            <AnimatedItem key={path.href} index={i}>
              <Link
                href={path.href}
                className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1 card-lift"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${path.iconBg}`}>
                    <path.icon className="h-5 w-5" />
                  </div>
                  <span className={`rounded-full border px-3 py-0.5 text-xs font-medium ${path.accent}`}>
                    {path.tag}
                  </span>
                </div>
                <h3 className="mb-2 text-[17px] font-semibold text-foreground">{path.title}</h3>
                <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{path.description}</p>
                <div className="mt-5 flex items-center gap-1.5 text-sm font-medium text-primary">
                  Explore <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </AnimatedItem>
          ))}
        </div>
      </div>
    </section>
  )
}
