"use client"

import { Lightbulb, Target, Repeat, ShieldCheck } from "lucide-react"
import { AnimatedSection, AnimatedItem } from "@/components/animated-section"

const features = [
  {
    icon: Lightbulb,
    title: "Plain-Language Education",
    description:
      "Every concept explained clearly, without jargon. You will understand what you are learning and exactly how to apply it.",
  },
  {
    icon: Target,
    title: "Personalized Roadmaps",
    description:
      "A short quiz matches you with a custom plan based on your knowledge, situation, and financial goals.",
  },
  {
    icon: Repeat,
    title: "Learn by Doing",
    description:
      "Interactive calculators, quizzes, and scenario builders turn abstract ideas into concrete steps you can act on today.",
  },
  {
    icon: ShieldCheck,
    title: "Honest & Balanced",
    description:
      "Real trade-offs, not just the upside. Every strategy includes a candid look at the risks, time, and effort involved.",
  },
]

export function FeaturesSection() {
  return (
    <section className="px-6 py-20 md:py-24 bg-surface-1">
      <div className="mx-auto max-w-7xl">
        <AnimatedSection className="mb-14 text-center">
          <h2 className="mx-auto max-w-xl font-serif text-3xl leading-tight text-foreground md:text-4xl text-balance">
            Education you can trust and actually use
          </h2>
        </AnimatedSection>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <AnimatedItem key={feature.title} index={i} className="group">
              <div className="flex flex-col h-full rounded-2xl border border-border bg-card p-7 transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:-translate-y-1">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/8 transition-colors group-hover:bg-primary/15">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2.5 text-[15px] font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </AnimatedItem>
          ))}
        </div>
      </div>
    </section>
  )
}
