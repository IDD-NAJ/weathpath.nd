"use client"

import { useState, useEffect } from "react"
import {
  Building2,
  Coins,
  PenTool,
  BarChart3,
  Globe,
  ShieldCheck,
  ArrowRight,
  Clock,
  BookOpen,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { AnimatedSection, StaggerChildren } from "@/components/animated-section"
import useSWR from "swr"

interface LearningPath {
  id: string
  title: string
  description: string
  level: string
  duration: string
  module_count: number
  topics: string[]
  is_published: boolean
  created_at: string
  updated_at: string
}

const iconMap: Record<string, any> = {
  "Real Estate Income": Building2,
  "Dividend Investing": BarChart3,
  "Digital Products": PenTool,
  "Online Business Models": Globe,
  "Interest & Lending": Coins,
  "Risk Management": ShieldCheck,
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const fallbackPaths: LearningPath[] = [
  {
    id: "fallback-1",
    title: "Real Estate Income",
    description: "Understand how property ownership, rental income, and real estate funds can create steady cash flow without daily involvement.",
    level: "Beginner",
    duration: "4 weeks",
    module_count: 8,
    topics: ["Rental properties", "REITs", "Crowdfunding platforms", "Property management"],
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "fallback-2",
    title: "Dividend Investing",
    description: "Learn how owning shares in established companies can provide regular income payments, and how to build a balanced portfolio over time.",
    level: "Beginner",
    duration: "3 weeks",
    module_count: 6,
    topics: ["Dividend stocks", "Index funds", "Reinvestment strategies", "Portfolio balancing"],
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "fallback-3",
    title: "Digital Products",
    description: "Discover how to create valuable content once — like courses, templates, or ebooks — and earn from it repeatedly.",
    level: "Intermediate",
    duration: "5 weeks",
    module_count: 10,
    topics: ["Online courses", "Ebooks", "Templates", "Licensing"],
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "fallback-4",
    title: "Online Business Models",
    description: "Explore business structures designed to generate income with minimal day-to-day management, from affiliate sites to automated services.",
    level: "Intermediate",
    duration: "5 weeks",
    module_count: 9,
    topics: ["Affiliate marketing", "Print on demand", "SaaS basics", "Automation"],
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "fallback-5",
    title: "Interest & Lending",
    description: "Learn about savings vehicles, bonds, and peer-to-peer lending that let your money work for you safely and predictably.",
    level: "Beginner",
    duration: "2 weeks",
    module_count: 5,
    topics: ["High-yield savings", "Bonds", "Peer-to-peer lending", "CDs & money markets"],
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "fallback-6",
    title: "Risk Management",
    description: "Every income stream comes with trade-offs. Learn to evaluate, protect, and diversify so your wealth grows steadily.",
    level: "Advanced",
    duration: "3 weeks",
    module_count: 7,
    topics: ["Diversification", "Tax planning", "Insurance", "Emergency funds"],
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const levelColors: Record<string, string> = {
  Beginner: "bg-primary/10 text-primary",
  Intermediate: "bg-accent/20 text-accent-foreground",
  Advanced: "bg-foreground/10 text-foreground",
}

export function LearningPaths() {
  const [expanded, setExpanded] = useState<number | null>(null)
  const { data } = useSWR<{ learningPaths: LearningPath[] }>("/api/learning-paths", fetcher)
  const paths = data?.learningPaths?.length ? data.learningPaths : fallbackPaths

  return (
    <section id="learn" className="scroll-mt-20 px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <AnimatedSection className="mb-16 max-w-2xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            Learning Paths
          </p>
          <h2 className="font-serif text-3xl leading-tight text-foreground md:text-4xl">
            Choose the path that fits your goals
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Each path is designed as a self-paced journey — start from the
            basics, build real understanding, and move at your own speed.
          </p>
        </AnimatedSection>

        <StaggerChildren
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          staggerMs={100}
        >
          {paths.map((path, index) => {
            const isExpanded = expanded === index
            const Icon = iconMap[path.title] || Building2
            
            return (
              <article
                key={path.id}
                className="group flex flex-col rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-sm"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${levelColors[path.level]}`}
                  >
                    {path.level}
                  </span>
                </div>

                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {path.title}
                </h3>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {path.description}
                </p>

                <div className="mb-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    {path.module_count} modules
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {path.duration}
                  </span>
                </div>

                <button
                  onClick={() => setExpanded(isExpanded ? null : index)}
                  className="flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                  aria-expanded={isExpanded}
                >
                  {isExpanded ? "Hide topics" : "View topics"}
                  <ArrowRight
                    className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                  />
                </button>

                <div
                  className={`grid transition-all duration-300 ease-out ${
                    isExpanded ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="flex flex-wrap gap-2">
                      {path.topics.map((topic) => (
                        <Badge
                          key={topic}
                          variant="secondary"
                          className="text-xs font-normal"
                        >
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </StaggerChildren>
      </div>
    </section>
  )
}
