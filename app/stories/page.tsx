import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { Navigation } from "@/components/navigation"
import { CtaFooter } from "@/components/cta-footer"
import { AnimatedSection, AnimatedItem } from "@/components/animated-section"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, Quote, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export const metadata = {
  title: "Success Stories - WealthPath",
  description: "Real stories from people who built passive income. Read how everyday individuals achieved financial freedom through smart strategies.",
}

export default async function StoriesPage() {
  const user = await getCurrentUser()
  const stories = await sql`
    SELECT * FROM success_stories
    WHERE is_published = true AND status = 'approved'
    ORDER BY display_order ASC, created_at DESC
  `

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />

      <main className="px-6 pt-28 pb-20">
        <div className="mx-auto max-w-6xl">
          <AnimatedSection className="mb-16 text-center">
            <Link
              href="/"
              className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <h1 className="font-serif text-4xl leading-tight text-foreground md:text-5xl text-balance">
              Real Stories, Real Results
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-lg leading-relaxed text-muted-foreground">
              Read how everyday people built lasting passive income through
              patience, learning, and consistent action.
            </p>
          </AnimatedSection>

          {stories.length === 0 ? (
            <AnimatedSection className="py-20 text-center">
              <p className="text-lg text-muted-foreground">
                No stories published yet. Check back soon.
              </p>
            </AnimatedSection>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {stories.map((story: Record<string, string>, i: number) => (
                <AnimatedItem key={story.id} index={i}>
                  <Link href={`/stories/${story.id}`} className="group block h-full">
                    <Card className="h-full border-border/60 bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
                      <CardContent className="flex h-full flex-col p-6">
                        <div className="mb-4 flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <span className="text-lg font-bold text-primary">
                              {story.name?.charAt(0) || "?"}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              {story.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {story.title}
                            </p>
                          </div>
                        </div>

                        <div className="mb-4 flex-1">
                          <Quote className="mb-2 h-5 w-5 text-primary/40" />
                          <p className="text-sm leading-relaxed text-muted-foreground line-clamp-4">
                            {story.quote}
                          </p>
                        </div>

                        <div className="flex items-center justify-between border-t border-border pt-4">
                          <div className="flex flex-wrap gap-2">
                            {story.income && (
                              <Badge variant="secondary" className="text-xs">
                                {story.income}
                              </Badge>
                            )}
                            {story.strategy && (
                              <Badge variant="outline" className="text-xs">
                                {story.strategy}
                              </Badge>
                            )}
                          </div>
                          <span className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                            Read more
                            <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </AnimatedItem>
              ))}
            </div>
          )}
        </div>
      </main>

      <CtaFooter />
    </div>
  )
}
