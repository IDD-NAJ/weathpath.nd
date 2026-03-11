"use client"

import {
  BookOpen,
  Headphones,
  FileText,
  Video,
  ExternalLink,
} from "lucide-react"
import { AnimatedSection, StaggerChildren } from "@/components/animated-section"

const categories = [
  {
    icon: BookOpen,
    title: "Books",
    items: [
      { name: "The Psychology of Money", author: "Morgan Housel", description: "A thoughtful exploration of how people think about money, risk, and wealth-building over a lifetime." },
      { name: "The Simple Path to Wealth", author: "JL Collins", description: "A clear, opinionated guide to investing in index funds and achieving financial independence." },
      { name: "Your Money or Your Life", author: "Vicki Robin", description: "Reframes money as a tool for living well, with practical steps for tracking, saving, and investing." },
    ],
  },
  {
    icon: Headphones,
    title: "Podcasts",
    items: [
      { name: "The Bigger Pockets Podcast", author: "BiggerPockets", description: "Long-running show covering real estate investing, from first-time landlords to experienced operators." },
      { name: "ChooseFI", author: "Jonathan Mendonsa & Brad Barrett", description: "Conversations about financial independence with actionable strategies for everyday life." },
      { name: "The Money Guy Show", author: "Brian Preston & Bo Hanson", description: "Approachable financial guidance focusing on building wealth at every stage of life." },
    ],
  },
  {
    icon: Video,
    title: "Video Channels",
    items: [
      { name: "Two Cents (PBS)", author: "PBS Digital Studios", description: "Short, animated explainers on personal finance topics made for beginners." },
      { name: "The Plain Bagel", author: "Richard Coffin", description: "Clear, no-nonsense breakdowns of investing concepts and financial news." },
      { name: "Andrei Jikh", author: "Andrei Jikh", description: "Investing education with a focus on dividends, crypto basics, and building passive income." },
    ],
  },
  {
    icon: FileText,
    title: "Articles & Guides",
    items: [
      { name: "Investopedia: Passive Income Guide", author: "Investopedia", description: "A comprehensive reference for understanding different passive income strategies and terms." },
      { name: "Mr. Money Mustache Blog", author: "Pete Adeney", description: "An influential blog on frugality, investing, and early retirement through simple living." },
      { name: "NerdWallet: Investing 101", author: "NerdWallet", description: "Beginner-friendly comparisons of brokerage accounts, funds, and investment vehicles." },
    ],
  },
]

export function ResourcesSection() {
  return (
    <section id="resources" className="scroll-mt-20 border-y border-border bg-card px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <AnimatedSection className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            Curated Resources
          </p>
          <h2 className="mx-auto max-w-xl font-serif text-3xl leading-tight text-foreground md:text-4xl">
            Keep learning beyond WealthPath
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Hand-picked books, podcasts, videos, and articles from trusted
            voices in personal finance and wealth-building.
          </p>
        </AnimatedSection>

        <StaggerChildren
          className="grid gap-8 md:grid-cols-2"
          staggerMs={150}
        >
          {categories.map((cat) => (
            <div
              key={cat.title}
              className="rounded-xl border border-border bg-background p-6"
            >
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <cat.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{cat.title}</h3>
              </div>
              <ul className="flex flex-col gap-4" role="list">
                {cat.items.map((item) => (
                  <li key={item.name} className="group flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50">
                    <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.author}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </StaggerChildren>
      </div>
    </section>
  )
}
