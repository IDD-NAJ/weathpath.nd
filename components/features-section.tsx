"use client"

import {
  Lightbulb,
  Target,
  Repeat,
  ShieldCheck,
} from "lucide-react"
import { AnimatedSection, StaggerChildren } from "@/components/animated-section"

const features = [
  {
    icon: Lightbulb,
    title: "Plain-Language Education",
    description:
      "Every concept is explained clearly, without jargon. You will understand what you are learning, why it matters, and how to apply it to your own situation.",
  },
  {
    icon: Target,
    title: "Personalized Roadmaps",
    description:
      "After a short assessment, receive a custom plan that matches your current knowledge, financial situation, and personal goals.",
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
      "We present the real trade-offs, not just the upside. Every strategy includes a candid look at the risks, time, and effort involved.",
  },
]

export function FeaturesSection() {
  return (
    <section className="border-y border-border bg-card px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <AnimatedSection className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            Why WealthPath
          </p>
          <h2 className="mx-auto max-w-xl font-serif text-3xl leading-tight text-foreground md:text-4xl">
            Education you can trust and actually use
          </h2>
        </AnimatedSection>

        <StaggerChildren
          className="grid gap-10 md:grid-cols-2 lg:grid-cols-4"
          staggerMs={120}
        >
          {features.map((feature) => (
            <div key={feature.title} className="flex flex-col items-start">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-base font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </StaggerChildren>
      </div>
    </section>
  )
}
