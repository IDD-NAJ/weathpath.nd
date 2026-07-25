import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ChevronDown } from "lucide-react"
import { neon } from "@neondatabase/serverless"

export const metadata = {
  title: "FAQ — WealthPath",
  description: "Frequently asked questions about WealthPath courses and services.",
}

export const dynamic = 'force-dynamic'

async function getFAQs() {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    const faqs = await sql(
      `SELECT id, question, answer, category FROM faqs 
       WHERE is_active = true 
       ORDER BY order_index ASC, category ASC`
    )
    return faqs || []
  } catch (error) {
    console.error("[v0] Failed to fetch FAQs:", error)
    return []
  }
}

export default async function FAQPage() {
  const faqs = await getFAQs()
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation user={null} />
      
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-12 md:py-20">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-lg text-muted-foreground">Find answers to common questions about WealthPath</p>
          </div>

          <div className="space-y-4">
            {faqs && faqs.length > 0 ? (
              faqs.map((faq: any) => (
                <details key={faq.id} className="group">
                  <summary className="flex cursor-pointer items-center justify-between rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground text-left">{faq.question}</h3>
                      {faq.category && (
                        <p className="text-xs text-muted-foreground mt-1">{faq.category}</p>
                      )}
                    </div>
                    <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-180 ml-4 flex-shrink-0" />
                  </summary>
                  <div className="overflow-hidden border border-t-0 border-border rounded-b-lg bg-muted/30 px-4 py-3">
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                </details>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No FAQs available. Check back soon!</p>
              </div>
            )}
          </div>

          <div className="mt-12 rounded-lg border border-border bg-card p-8 text-center">
            <h2 className="font-serif text-2xl font-bold mb-2">Still have questions?</h2>
            <p className="text-muted-foreground mb-6">Can't find what you're looking for?</p>
            <a href="/contact" className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              Contact us
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
