"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, Plane, Code2, Bitcoin, ShoppingBag, BarChart3, Zap } from "lucide-react"
import { AnimatedCounter } from "./animated-counter"

const topics = [
  { label: "Travel", href: "/topics/travel", icon: Plane },
  { label: "Coding", href: "/topics/coding", icon: Code2 },
  { label: "Bitcoin", href: "/topics/bitcoin", icon: Bitcoin },
  { label: "Dropshipping", href: "/topics/dropshipping", icon: ShoppingBag },
  { label: "Investing", href: "/topics/investing", icon: BarChart3 },
  { label: "Side Hustles", href: "/topics/side-hustles", icon: Zap },
]

const stats = [
  { value: "6", label: "Topic Hubs" },
  { value: "50+", label: "Articles" },
  { value: "2,400+", label: "Members" },
]

export function HeroSection() {
  const router = useRouter()
  const [query, setQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    router.push(q ? `/articles?q=${encodeURIComponent(q)}` : "/articles")
  }

  return (
    <section className="relative overflow-hidden border-b border-border bg-surface-1">
      <div className="mx-auto max-w-4xl px-6 pb-16 pt-16 md:pb-24 md:pt-24">
        {/* Eyebrow */}
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-primary animate-fade-up">
          Financial Education Library
        </p>

        {/* Headline */}
        <h1 className="mx-auto mt-5 max-w-3xl text-center font-serif text-4xl font-normal leading-[1.1] tracking-tight text-foreground text-balance animate-fade-up-delay-1 md:text-6xl">
          Explore practical guides on building lasting wealth
        </h1>

        {/* Sub-copy */}
        <p className="mx-auto mt-6 max-w-2xl text-center text-base leading-relaxed text-muted-foreground text-pretty animate-fade-up-delay-2 md:text-lg">
          A trusted library of honest, jargon-free articles, methods, and courses — from
          travel content and coding to crypto, investing, and dropshipping.
        </p>

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className="mx-auto mt-9 flex max-w-2xl items-stretch overflow-hidden rounded-sm border-2 border-foreground bg-card animate-fade-up-delay-3"
          role="search"
        >
          <label htmlFor="hero-search" className="sr-only">
            Search articles and courses
          </label>
          <div className="flex flex-1 items-center gap-3 px-4">
            <Search className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <input
              id="hero-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles, methods, and courses"
              className="w-full bg-transparent py-3.5 text-base text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button
            type="submit"
            className="shrink-0 bg-primary px-6 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Search
          </button>
        </form>

        {/* Topic links */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 animate-fade-up-delay-4">
          <span className="text-sm text-muted-foreground">Browse:</span>
          {topics.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="flex items-center gap-1.5 rounded-sm border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </Link>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-12 border-t border-border pt-10 animate-fade-up-delay-4">
          {stats.map((s, index) => (
            <div key={s.label} className="text-center stagger-item">
              <p className="font-serif text-4xl font-normal text-foreground">
                {s.value.includes("+") ? (
                  <>
                    <AnimatedCounter value={Number.parseInt(s.value)} duration={1.5} delay={0.2 + index * 0.1} />+
                  </>
                ) : (
                  s.value
                )}
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
