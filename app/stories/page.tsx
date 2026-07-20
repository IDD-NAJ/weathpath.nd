import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { Navigation } from "@/components/navigation"
import { CtaFooter } from "@/components/cta-footer"
import { AnimatedSection, AnimatedItem } from "@/components/animated-section"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Quote, Users } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export const metadata = {
  title: "Success Stories — WealthPath",
  description: "Real stories from people who built passive income. Read how everyday individuals achieved financial freedom.",
}

export default async function StoriesPage() {
  const user = await getCurrentUser()
  let stories: any[] = []
  try {
    stories = await sql`
      SELECT * FROM success_stories
      WHERE is_published = true AND status = 'approved'
      ORDER BY display_order ASC, created_at DESC
    `
  } catch { stories = [] }

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />

      <main>
        {/* Hero */}
        <section className="border-b border-border bg-surface-1 px-6 py-16 md:py-20">
          <div className="mx-auto max-w-7xl">
            <AnimatedSection>
              <h1 className="font-serif text-4xl leading-tight text-foreground md:text-5xl text-balance max-w-2xl">
                Real Stories, Real Results
              </h1>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
                How everyday people built lasting income through patience,
                learning, and consistent action.
              </p>
            </AnimatedSection>
          </div>
        </section>

        {/* Stories grid */}
        <section className="px-6 py-14 pb-20">
          <div className="mx-auto max-w-7xl">
            {stories.length === 0 ? (
              <AnimatedSection className="py-28 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="font-serif text-2xl text-foreground mb-2">No stories yet</h2>
                <p className="text-muted-foreground mb-6">
                  Stories are added regularly. Check back soon.
                </p>
                <Link href="/" className="text-sm font-medium text-primary hover:underline underline-offset-4">
                  Return to home
                </Link>
              </AnimatedSection>
            ) : (
              <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
                {stories.map((story: any, i: number) => (
                  <AnimatedItem key={story.id} index={i % 9}>
                    <Link
                      href={story.external_url || `/stories/${story.id}`}
                      target={story.external_url ? "_blank" : undefined}
                      rel={story.external_url ? "noopener noreferrer" : undefined}
                      className="group flex h-full flex-col rounded-2xl border border-border bg-card overflow-hidden transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1"
                    >
                      {story.image_url && (
                        <div className="aspect-[16/9] overflow-hidden bg-muted">
                          <img
                            src={story.image_url}
                            alt={story.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      )}
                      <div className="flex flex-1 flex-col p-6">
                        <div className="mb-4 flex items-center gap-3">
                          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <span className="text-base font-bold text-primary">
                              {story.name?.charAt(0) ?? "?"}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-foreground leading-tight">{story.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{story.title}</p>
                          </div>
                        </div>

                        <div className="mb-5 flex-1">
                          <Quote className="mb-2 h-4 w-4 text-primary/30" />
                          <p className="text-sm leading-relaxed text-muted-foreground line-clamp-4 italic">
                            {story.quote}
                          </p>
                        </div>

                        <div className="flex items-center justify-between border-t border-border pt-4">
                          <div className="flex flex-wrap gap-1.5">
                            {story.income && (
                              <Badge variant="secondary" className="text-xs">{story.income}</Badge>
                            )}
                            {story.strategy && (
                              <Badge variant="outline" className="text-xs">{story.strategy}</Badge>
                            )}
                          </div>
                          <span className="flex items-center gap-1 text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                            Read <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </AnimatedItem>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <CtaFooter />
    </div>
  )
}
