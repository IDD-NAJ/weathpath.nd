import { notFound } from "next/navigation"
import Link from "next/link"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { Navigation } from "@/components/navigation"
import { CtaFooter } from "@/components/cta-footer"
import { AnimatedSection, AnimatedItem } from "@/components/animated-section"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, CalendarDays, CheckCircle2, User } from "lucide-react"
import { TOPICS } from "@/lib/topics"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const topic = TOPICS[slug]
  if (!topic) return {}
  return {
    title: `${topic.title} — WealthPath`,
    description: topic.description,
  }
}

export default async function TopicPage({ params }: Props) {
  const { slug } = await params
  const topic = TOPICS[slug]
  if (!topic) notFound()

  const user = await getCurrentUser()

  let articles: any[] = []
  try {
    // First, try to find articles linked via the topics table
    articles = await sql`
      SELECT DISTINCT a.*, u.name as author_name 
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN article_topics at ON a.id = at.article_id
      LEFT JOIN topics t ON at.topic_id = t.id
      WHERE a.is_published = true
        AND a.status = 'approved'
        AND (t.slug = ${slug} OR a.category ILIKE ${topic.category})
      ORDER BY a.created_at DESC
      LIMIT 24
    `
  } catch { articles = [] }

  const Icon = topic.icon

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />

      <main>
        {/* ── Hero ── */}
        <section className={`relative overflow-hidden border-b border-border bg-gradient-to-br ${topic.color.heroBg} to-transparent px-6 py-16 md:py-24`}>
          <div className="pointer-events-none absolute -top-16 right-0 h-64 w-64 rounded-full blur-3xl opacity-20" />
          <div className="mx-auto max-w-7xl">
            <AnimatedSection>
              {/* Breadcrumb */}
              <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
                <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                <span>/</span>
                <span>Topics</span>
                <span>/</span>
                <span className="text-foreground font-medium">{topic.title}</span>
              </nav>

              <div className="flex flex-col gap-8 md:flex-row md:items-center md:gap-14">
                <div className="flex-1">
                  <div className={`mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${topic.color.badge}`}>
                    <Icon className="h-3.5 w-3.5" />
                    {topic.title}
                  </div>
                  <h1 className="font-serif text-4xl leading-tight text-foreground md:text-5xl text-balance max-w-xl">
                    {topic.tagline}
                  </h1>
                  <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
                    {topic.description}
                  </p>
                  <div className="mt-6 flex gap-3">
                    <Link
                      href="/articles"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      Browse all articles <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/signup"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      Join free
                    </Link>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 md:grid-cols-1 md:gap-3">
                  {topic.highlights.map((h) => (
                    <div
                      key={h.label}
                      className={`rounded-2xl border bg-card/70 backdrop-blur-sm px-5 py-4 ${topic.color.border}`}
                    >
                      <p className={`text-2xl font-bold ${topic.color.accent}`}>{h.stat}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground leading-snug">{h.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* ── What you'll learn ── */}
        <section className="px-6 py-12 border-b border-border bg-surface-1">
          <div className="mx-auto max-w-7xl">
            <AnimatedSection>
              <h2 className="font-serif text-xl text-foreground mb-5">What you&apos;ll learn</h2>
              <div className="flex flex-wrap gap-3">
                {topic.whatYouLearn.map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-xl bg-card border border-border px-4 py-2.5">
                    <CheckCircle2 className={`h-4 w-4 flex-shrink-0 ${topic.color.accent}`} />
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* ── Articles ── */}
        <section className="px-6 py-14 pb-20">
          <div className="mx-auto max-w-7xl">
            <AnimatedSection className="mb-10 flex items-end justify-between">
              <div>
                <h2 className="font-serif text-2xl text-foreground md:text-3xl">
                  {topic.title} Articles
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {articles.length > 0
                    ? `${articles.length} article${articles.length !== 1 ? "s" : ""} available`
                    : "More articles coming soon"}
                </p>
              </div>
            </AnimatedSection>

            {articles.length === 0 ? (
              <AnimatedSection className="rounded-2xl border border-dashed border-border bg-card py-20 text-center">
                <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${topic.color.iconBg}`}>
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="font-serif text-xl text-foreground mb-2">
                  Articles coming soon
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6">
                  We&apos;re working on great {topic.title.toLowerCase()} content. Check back soon or browse all articles.
                </p>
                <Link
                  href="/articles"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline underline-offset-4"
                >
                  Browse all articles <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </AnimatedSection>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                          <Badge variant="secondary" className="mb-3 w-fit text-xs">{article.category}</Badge>
                        )}
                        <h3 className="mb-2 font-serif text-xl leading-snug text-foreground transition-colors group-hover:text-primary text-balance">
                          {article.title}
                        </h3>
                        {article.excerpt && (
                          <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                            {article.excerpt}
                          </p>
                        )}
                        <div className="flex items-center justify-between border-t border-border pt-4 mt-auto">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {article.author_name && (
                              <span className="flex items-center gap-1"><User className="h-3 w-3" /> {article.author_name}</span>
                            )}
                            {article.created_at && (
                              <span className="flex items-center gap-1">
                                <CalendarDays className="h-3 w-3" />
                                {new Date(article.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </span>
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

        {/* ── Other topics ── */}
        <section className="border-t border-border bg-surface-1 px-6 py-12">
          <div className="mx-auto max-w-7xl">
            <AnimatedSection>
              <h2 className="mb-6 font-serif text-xl text-foreground">Explore other topics</h2>
              <div className="flex flex-wrap gap-3">
                {Object.values(TOPICS).filter((t) => t.slug !== slug).map((t) => (
                  <Link
                    key={t.slug}
                    href={`/topics/${t.slug}`}
                    className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-150 hover:scale-105 hover:shadow-sm ${t.color.badge} ${t.color.border}`}
                  >
                    <t.icon className="h-3.5 w-3.5" />
                    {t.title}
                  </Link>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </section>
      </main>

      <CtaFooter />
    </div>
  )
}
