"use client"

import { ArrowRight, BookOpen, Calculator, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnimatedSection, StaggerChildren } from "@/components/animated-section"

const stats = [
  { icon: BookOpen, value: "12", label: "Learning Paths" },
  { icon: Calculator, value: "5", label: "Interactive Tools" },
  { icon: Users, value: "2,400+", label: "Community Members" },
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-16 md:pb-28 md:pt-24">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center">
          <AnimatedSection delay={0} direction="down">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                Your journey to financial freedom starts here
              </span>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={100}>
            <h1 className="max-w-3xl text-balance font-serif text-4xl font-normal leading-tight tracking-tight text-foreground md:text-6xl md:leading-tight">
              Build Lasting Wealth Through Passive Income
            </h1>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
              Clear, honest education on creating income streams that work for you.
              No jargon, no hype — just practical knowledge and the tools to put it
              into action.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={300}>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <a href="#quiz" className="gap-2">
                  Find Your Starting Point
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="#learn">Explore Learning Paths</a>
              </Button>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={450}>
            <div className="mt-16 flex flex-wrap items-center justify-center gap-8 md:gap-16">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
