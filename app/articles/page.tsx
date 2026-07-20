import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { Navigation } from "@/components/navigation"
import { CtaFooter } from "@/components/cta-footer"
import { AnimatedSection, AnimatedItem } from "@/components/animated-section"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, BookOpen, CalendarDays, User } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export const metadata = {
  title: "Articles — WealthPath",
  description: "In-depth guides on travel content, coding, bitcoin, dropshipping, investing, and side hustles.",
}

export default async function ArticlesPage() {
  const user = await getCurrentUser()
  let articles: any[] = []
  try {
    articles = await sql`
      SELECT a.*, u.name as author_name FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      WHERE a.is_published = true AND a.status = 'approved'
      ORDER BY a.created_at DESC
    `
  } catch { articles = [] }

  const categories = [...new Set(articles.map((a: any) => a.category).filter(Boolean))]

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />

      <main>
        {/* Page hero */}
        <section className="border-b border-border bg-surface-1 px-6 py-16 md:py-20">
          <div className="mx-auto max-w-7xl">
            <AnimatedSection>
              <h1 className="font-serif text-4xl leading-tight text-foreground md:text-5xl text-balance max-w-2xl">
                Articles & Guides
              </h1>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
                Honest, practical writing on travel content, coding, Bitcoin, dropshipping,
                investing, and side hustles — no hype, just real information.
              </p>
            </AnimatedSection>
          </div>
        </section>

        {/* Category filters (display only) */}
        {categories.length > 0 && (
          <section className="border-b border-border px-6 py-4">
            <div className="mx-auto max-w-7xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground mr-1">Filter:</span>
                {categories.map((cat) => (
                  <Badge key={cat as string} variant="secondary" className="cursor-pointer text-xs hover:bg-primary/10 transition-colors">
                    {cat as string}
                  </Badge>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Articles grid */}
        <section className="px-6 py-14 pb-20">
          <div className="mx-auto max-w-7xl">
            {articles.length === 0 ? (
              <AnimatedSection className="py-28 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="font-serif text-2xl text-foreground mb-2">No articles yet</h2>
                <p className="text-muted-foreground mb-6">
                  Check back soon — new articles are published regularly.
                </p>
                <Link href="/" className="text-sm font-medium text-primary hover:underline underline-offset-4">
                  Return to home
                </Link>
              </AnimatedSection>
            ) : (
              <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
                {articles.map((article: any, i: number) => (
                  <AnimatedItem key={article.id} index={i % 9}>
                    <Link
                      href={article.external_url || `/articles/${article.slug}`}
                      target={article.external_url ? "_blank" : undefined}
                      rel={article.external_url ? "noopener noreferrer" : undefined}
                      className="group flex h-full flex-col rounded-2xl border border-border bg-card overflow-hidden transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1"
                    >
                      {article.image_url && (
                        <div className="aspect-[16/9] overflow-hidden bg-muted">
                          <img
                            src={article.image_url}
                            alt={article.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      )}
                      <div className="flex flex-1 flex-col p-6">
                        {article.category && (
                          <Badge variant="secondary" className="mb-3 w-fit text-xs font-medium">
                            {article.category}
                          </Badge>
                        )}
                        <h2 className="mb-2 font-serif text-xl leading-snug text-foreground transition-colors group-hover:text-primary text-balance">
                          {article.title}
                        </h2>
                        {article.excerpt && (
                          <p className="mb-5 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                            {article.excerpt}
                          </p>
                        )}
                        <div className="flex items-center justify-between border-t border-border pt-4 mt-auto">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {article.author_name && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" /> {article.author_name}
                              </span>
                            )}
                            {article.created_at && (
                              <span className="flex items-center gap-1">
                                <CalendarDays className="h-3 w-3" />
                                {new Date(article.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </span>
                            )}
                          </div>
                          <span className="flex items-center gap-1 text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                            Read <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
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
