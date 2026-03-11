import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { Navigation } from "@/components/navigation"
import { AnimatedSection } from "@/components/animated-section"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Quote, TrendingUp, CalendarDays, Target } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const rows = await sql`
    SELECT name, title, quote FROM success_stories
    WHERE id = ${id} AND is_published = true AND status = 'approved'
  `
  if (rows.length === 0) {
    return { title: "Story Not Found - WealthPath" }
  }
  const story = rows[0]
  return {
    title: `${story.name}'s Story - WealthPath`,
    description: story.quote?.slice(0, 160),
  }
}

export default async function StoryDetailPage({ params }: Props) {
  const { id } = await params
  const user = await getCurrentUser()

  const rows = await sql`
    SELECT * FROM success_stories
    WHERE id = ${id} AND is_published = true AND status = 'approved'
  `

  if (rows.length === 0) {
    notFound()
  }

  const story = rows[0]

  // Get other published stories for "more stories" section
  const moreStories = await sql`
    SELECT id, name, title, quote, income, strategy FROM success_stories
    WHERE id != ${id} AND is_published = true AND status = 'approved'
    ORDER BY display_order ASC, created_at DESC
    LIMIT 3
  `

  const createdAt = story.created_at
    ? new Date(story.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />

      <main className="px-6 pt-28 pb-20">
        <div className="mx-auto max-w-3xl">
          {/* Back link */}
          <AnimatedSection>
            <Link
              href="/stories"
              className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              All Stories
            </Link>
          </AnimatedSection>

          {/* Story header */}
          <AnimatedSection delay={100} className="mb-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <span className="text-2xl font-bold text-primary">
                  {story.name?.charAt(0) || "?"}
                </span>
              </div>
              <div>
                <h1 className="font-serif text-3xl text-foreground md:text-4xl">
                  {story.name}
                </h1>
                <p className="mt-1 text-muted-foreground">{story.title}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {story.income && (
                <Badge variant="secondary" className="gap-1.5 px-3 py-1">
                  <TrendingUp className="h-3 w-3" />
                  {story.income}
                </Badge>
              )}
              {story.strategy && (
                <Badge variant="outline" className="gap-1.5 px-3 py-1">
                  <Target className="h-3 w-3" />
                  {story.strategy}
                </Badge>
              )}
              {createdAt && (
                <Badge variant="outline" className="gap-1.5 px-3 py-1 text-muted-foreground">
                  <CalendarDays className="h-3 w-3" />
                  {createdAt}
                </Badge>
              )}
            </div>
          </AnimatedSection>

          {/* Story body */}
          <AnimatedSection delay={200}>
            <Card className="border-border/60 bg-card">
              <CardContent className="p-8 md:p-10">
                <Quote className="mb-4 h-8 w-8 text-primary/30" />
                <blockquote className="text-lg leading-relaxed text-foreground md:text-xl">
                  {story.quote}
                </blockquote>
                <p className="mt-6 text-right text-sm font-medium text-muted-foreground">
                  {"- "}{story.name}
                </p>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Call to action */}
          <AnimatedSection delay={300} className="mt-10 text-center">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-8">
                <h2 className="font-serif text-xl text-foreground md:text-2xl text-balance">
                  Inspired by {story.name}{"'"}s journey?
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Discover which path is right for you with our free quiz.
                </p>
                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                  <Button asChild>
                    <Link href="/#quiz">Take the Free Quiz</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/#learn">Explore Learning Paths</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* More stories */}
          {moreStories.length > 0 && (
            <AnimatedSection delay={400} className="mt-16">
              <h2 className="mb-6 font-serif text-2xl text-foreground">
                More Stories
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {moreStories.map((s: Record<string, string>) => (
                  <Link key={s.id} href={`/stories/${s.id}`} className="group block">
                    <Card className="h-full border-border/60 transition-all duration-300 hover:border-primary/30 hover:shadow-md">
                      <CardContent className="p-5">
                        <div className="mb-3 flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            <span className="text-sm font-bold text-primary">
                              {s.name?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{s.name}</p>
                            <p className="text-xs text-muted-foreground">{s.title}</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {s.quote}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </AnimatedSection>
          )}
        </div>
      </main>

      <footer className="border-t border-border bg-card px-6 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label="WealthPath home">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <TrendingUp className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold text-foreground">WealthPath</span>
          </Link>
          <p className="text-xs text-muted-foreground">
            2026 WealthPath. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
