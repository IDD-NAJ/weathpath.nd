import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { Navigation } from "@/components/navigation"
import { AnimatedSection } from "@/components/animated-section"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CalendarDays, User, TrendingUp } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const rows = await sql`
    SELECT title, excerpt FROM articles
    WHERE slug = ${slug} AND is_published = true AND status = 'approved'
  `
  if (rows.length === 0) {
    return { title: "Article Not Found - WealthPath" }
  }
  return {
    title: `${rows[0].title} - WealthPath`,
    description: rows[0].excerpt?.slice(0, 160) || "",
  }
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params
  const user = await getCurrentUser()

  const rows = await sql`
    SELECT a.*, u.name as author_name FROM articles a
    LEFT JOIN users u ON a.author_id = u.id
    WHERE a.slug = ${slug} AND a.is_published = true AND a.status = 'approved'
  `

  if (rows.length === 0) {
    notFound()
  }

  const article = rows[0]

  const createdAt = article.created_at
    ? new Date(article.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null

  // Get related articles in the same category
  const related = await sql`
    SELECT id, title, slug, excerpt, category FROM articles
    WHERE slug != ${slug} AND is_published = true AND status = 'approved'
    ORDER BY created_at DESC
    LIMIT 3
  `

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />

      <main className="px-6 pt-28 pb-20">
        <article className="mx-auto max-w-3xl">
          <AnimatedSection>
            <Link
              href="/articles"
              className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              All Articles
            </Link>
          </AnimatedSection>

          {/* Article header */}
          <AnimatedSection delay={100} className="mb-8">
            {article.category && (
              <Badge variant="secondary" className="mb-4">
                {article.category}
              </Badge>
            )}
            <h1 className="font-serif text-3xl leading-tight text-foreground md:text-4xl lg:text-5xl text-balance">
              {article.title}
            </h1>
            {article.excerpt && (
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                {article.excerpt}
              </p>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {article.author_name && (
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {article.author_name}
                </span>
              )}
              {createdAt && (
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" />
                  {createdAt}
                </span>
              )}
            </div>
          </AnimatedSection>

          {/* Article content */}
          <AnimatedSection delay={200}>
            <Card className="border-border/60 bg-card">
              <CardContent className="p-8 md:p-10">
                <div className="prose prose-lg max-w-none text-foreground">
                  {article.content ? (
                    article.content.split("\n\n").map((paragraph: string, i: number) => (
                      <p key={i} className="mb-4 leading-relaxed text-foreground">
                        {paragraph}
                      </p>
                    ))
                  ) : (
                    <p className="text-muted-foreground">
                      This article is coming soon. Stay tuned for the full content.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* CTA */}
          <AnimatedSection delay={300} className="mt-10 text-center">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-8">
                <h2 className="font-serif text-xl text-foreground md:text-2xl text-balance">
                  Ready to put this into practice?
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Take our quiz to find the passive income path best suited to you.
                </p>
                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                  <Button asChild>
                    <Link href="/#quiz">Take the Free Quiz</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/stories">Read Success Stories</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Related articles */}
          {related.length > 0 && (
            <AnimatedSection delay={400} className="mt-16">
              <h2 className="mb-6 font-serif text-2xl text-foreground">
                More Articles
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((a: Record<string, string>) => (
                  <Link key={a.id} href={`/articles/${a.slug}`} className="group block">
                    <Card className="h-full border-border/60 transition-all duration-300 hover:border-primary/30 hover:shadow-md">
                      <CardContent className="p-5">
                        {a.category && (
                          <Badge variant="secondary" className="mb-2 text-xs">
                            {a.category}
                          </Badge>
                        )}
                        <h3 className="mb-2 font-semibold text-foreground transition-colors group-hover:text-primary">
                          {a.title}
                        </h3>
                        {a.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {a.excerpt}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </AnimatedSection>
          )}
        </article>
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
