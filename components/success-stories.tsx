"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Quote, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnimatedSection } from "@/components/animated-section"
import useSWR from "swr"

interface Story {
  id: string
  name: string
  title: string
  quote: string
  income?: string
  strategy?: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const fallbackStories: Story[] = [
  {
    id: "fallback-1",
    name: "Maria T.",
    title: "Teacher, started 2 years ago",
    quote:
      "I knew nothing about investing when I found WealthPath. The Dividend Investing path walked me through everything step by step. Today, my portfolio generates enough each quarter to cover my car payment.",
    strategy: "Dividend Investing",
    income: "$800/quarter",
  },
  {
    id: "fallback-2",
    name: "James K.",
    title: "Freelance designer, started 18 months ago",
    quote:
      "I created an icon pack using what I learned in the Digital Products path. After the initial work, it earns a few hundred dollars a month without me doing anything.",
    strategy: "Digital Products",
    income: "$350/month",
  },
  {
    id: "fallback-3",
    name: "Priya S.",
    title: "Software engineer, started 3 years ago",
    quote:
      "The compound calculator opened my eyes. I increased my monthly contributions and picked a diversified index fund from the Dividend Investing path.",
    strategy: "Index Fund Investing",
    income: "$1,200/month",
  },
  {
    id: "fallback-4",
    name: "Carlos R.",
    title: "Small business owner, started 1 year ago",
    quote:
      "Real Estate Income was the path for me. I started with a REIT, which let me invest in property without buying a whole building.",
    strategy: "Real Estate",
    income: "$500/month",
  },
]

export function SuccessStories() {
  const { data } = useSWR<{ stories: Story[] }>("/api/stories", fetcher)
  const stories = data?.stories?.length ? data.stories : fallbackStories

  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState<"left" | "right">("right")
  const [animating, setAnimating] = useState(false)

  const goTo = useCallback(
    (index: number, dir: "left" | "right") => {
      if (animating) return
      setDirection(dir)
      setAnimating(true)
      setTimeout(() => {
        setCurrent(index)
        setAnimating(false)
      }, 200)
    },
    [animating]
  )

  function next() {
    goTo((current + 1) % stories.length, "right")
  }
  function prev() {
    goTo((current - 1 + stories.length) % stories.length, "left")
  }

  // Auto-advance every 7s
  useEffect(() => {
    const timer = setInterval(next, 7000)
    return () => clearInterval(timer)
  })

  const story = stories[current]

  return (
    <section id="stories" className="scroll-mt-20 px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <AnimatedSection className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            Real Stories
          </p>
          <h2 className="mx-auto max-w-xl font-serif text-3xl leading-tight text-foreground md:text-4xl">
            People building wealth at their own pace
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg leading-relaxed text-muted-foreground">
            These are everyday individuals who started with curiosity and built
            real income streams using the same paths and tools available to you.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={150}>
          <div className="mx-auto max-w-3xl">
            <div className="overflow-hidden rounded-xl border border-border bg-card p-8 md:p-10">
              <div
                className={`transition-all duration-200 ${
                  animating
                    ? `opacity-0 ${direction === "right" ? "-translate-x-4" : "translate-x-4"}`
                    : "translate-x-0 opacity-100"
                }`}
              >
                <div className="mb-6 flex justify-center">
                  <Quote className="h-8 w-8 text-primary/30" />
                </div>
                <blockquote className="mb-8 text-center text-lg leading-relaxed text-foreground md:text-xl">
                  {story.quote}
                </blockquote>

                <div className="mb-6 flex flex-col items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {story.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-foreground">{story.name}</p>
                    <p className="text-sm text-muted-foreground">{story.title}</p>
                  </div>
                </div>

                {(story.strategy || story.income) && (
                  <div className="mb-4 flex flex-wrap justify-center gap-3">
                    {story.strategy && (
                      <span className="inline-block rounded-full bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
                        {story.strategy}
                      </span>
                    )}
                    {story.income && (
                      <span className="inline-block rounded-full bg-accent/10 px-4 py-1.5 text-xs font-medium text-accent-foreground">
                        {story.income}
                      </span>
                    )}
                  </div>
                )}

                {story.id && !story.id.startsWith("fallback") && (
                  <div className="flex justify-center">
                    <Button variant="link" size="sm" asChild className="gap-1">
                      <Link href={`/stories/${story.id}`}>
                        Read full story
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={prev}
                aria-label="Previous story"
                className="h-10 w-10 rounded-full"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex gap-2">
                {stories.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i, i > current ? "right" : "left")}
                    aria-label={`Go to story ${i + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === current ? "w-8 bg-primary" : "w-2 bg-border hover:bg-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={next}
                aria-label="Next story"
                className="h-10 w-10 rounded-full"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
