"use client"

import { Search, Route, Wrench, TrendingUp, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnimatedSection, StaggerChildren } from "@/components/animated-section"

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Discover Where You Stand",
    description:
      "Take our quick assessment to understand your current knowledge, goals, and comfort level. No sign-ups required — just honest answers.",
    action: "Take the Quiz",
    href: "#quiz",
  },
  {
    number: "02",
    icon: Route,
    title: "Follow a Learning Path",
    description:
      "Choose one of six structured paths, each built around a specific type of passive income. Learn concepts, see examples, and build understanding gradually.",
    action: "Browse Paths",
    href: "#learn",
  },
  {
    number: "03",
    icon: Wrench,
    title: "Use the Tools",
    description:
      "Model your potential growth with our calculator. Explore scenarios, adjust variables, and see how small changes today can compound over the years.",
    action: "Open Calculator",
    href: "#tools",
  },
  {
    number: "04",
    icon: TrendingUp,
    title: "Take Your First Step",
    description:
      "Every path ends with a clear, actionable first step you can take today. Start small, stay consistent, and let time do the heavy lifting.",
    action: "Get Started",
    href: "#quiz",
  },
]

export function StepGuide() {
  return (
    <section id="guide" className="scroll-mt-20 px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <AnimatedSection className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            Your Roadmap
          </p>
          <h2 className="mx-auto max-w-xl font-serif text-3xl leading-tight text-foreground md:text-4xl">
            Four steps from curious to confident
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Building passive wealth is a process, not an event. Here is a simple
            framework to guide you from exploration to action.
          </p>
        </AnimatedSection>

        <div className="relative">
          <div className="absolute left-8 top-0 hidden h-full w-px bg-border md:block" />

          <StaggerChildren
            className="flex flex-col gap-12 md:gap-16"
            staggerMs={150}
            direction="left"
          >
            {steps.map((step) => (
              <div key={step.number} className="relative flex gap-6 md:gap-10">
                <div className="relative z-10 flex shrink-0 flex-col items-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
                    <step.icon className="h-7 w-7 text-primary" />
                  </div>
                </div>
                <div className="flex-1 pb-2 pt-1">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-primary">
                    Step {step.number}
                  </span>
                  <h3 className="mb-2 text-xl font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mb-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                  <Button variant="outline" size="sm" asChild className="gap-1">
                    <a href={step.href}>
                      {step.action}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </div>
    </section>
  )
}
