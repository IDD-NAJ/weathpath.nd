import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { Navigation } from "@/components/navigation"
import { CtaFooter } from "@/components/cta-footer"
import { AnimatedSection, AnimatedItem } from "@/components/animated-section"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, BookOpen, TrendingUp } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Articles - WealthPath",
  description: "In-depth articles on building passive wealth, from investing basics to advanced income strategies.",
}

export default async function ArticlesPage() {
  const user = await getCurrentUser()
  const articles = await sql`
    SELECT a.*, u.name as author_name FROM articles a
    LEFT JOIN users u ON a.author_id = u.id
    WHERE a.is_published = true AND a.status = 'approved'
    ORDER BY a.created_at DESC
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
              Articles
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-lg leading-relaxed text-muted-foreground">
              In-depth guides and insights on building passive income, written in plain language.
            </p>
          </AnimatedSection>

          {articles.length === 0 ? (
            <AnimatedSection className="py-20 text-center">
              <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
              <p className="text-lg text-muted-foreground">
                No articles published yet. Check back soon.
              </p>
            </AnimatedSection>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article: Record<string, string>, i: number) => (
                <AnimatedItem key={article.id} index={i}>
                  <Link href={`/articles/${article.slug}`} className="group block h-full">
                    <Card className="h-full border-border/60 bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
                      <CardContent className="flex h-full flex-col p-6">
                        {article.category && (
                          <Badge variant="secondary" className="mb-3 w-fit text-xs">
                            {article.category}
                          </Badge>
                        )}
                        <h2 className="mb-2 font-serif text-xl text-foreground transition-colors group-hover:text-primary">
                          {article.title}
                        </h2>
                        {article.excerpt && (
                          <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                            {article.excerpt}
                          </p>
                        )}
                        <div className="flex items-center justify-between border-t border-border pt-4">
                          <div className="flex items-center gap-2">
                            {article.author_name && (
                              <span className="text-xs text-muted-foreground">
                                By {article.author_name}
                              </span>
                            )}
                            {article.created_at && (
                              <span className="text-xs text-muted-foreground">
                                {new Date(article.created_at).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            )}
                          </div>
                          <span className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                            Read
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
