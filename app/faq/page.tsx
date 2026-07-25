import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown } from "lucide-react"

export const metadata = {
  title: "FAQ — WealthPath",
  description: "Frequently asked questions about WealthPath courses and services.",
}

const faqs = [
  {
    question: "How do I get started with WealthPath?",
    answer: "Simply sign up for a free account and browse our courses. You can start with any beginner course to get familiar with passive income concepts."
  },
  {
    question: "Do you offer a money-back guarantee?",
    answer: "Yes! We offer a 7-day money-back guarantee on all courses. If you're not satisfied, we'll refund your purchase within 7 days."
  },
  {
    question: "Can I access courses offline?",
    answer: "Our courses are delivered via email and web. You can download materials and access them offline through your device."
  },
  {
    question: "How long do I have access to the courses?",
    answer: "Once purchased, you have lifetime access to all course materials. You can revisit content anytime."
  },
  {
    question: "Are there certificates upon completion?",
    answer: "Yes! Upon completing 100% of a course, you'll receive a certificate of completion that you can display on your profile or resume."
  },
  {
    question: "What if I need technical support?",
    answer: "Our support team is available via email at support@wealthpath.com. We typically respond within 24 hours."
  },
  {
    question: "Can I share my course access?",
    answer: "Courses are for personal use only. Sharing access violates our terms of service. Consider purchasing additional accounts for team members."
  },
  {
    question: "Do you offer group discounts?",
    answer: "Yes! For orders of 10 or more courses, contact our sales team at sales@wealthpath.com for special pricing."
  },
]

export default function FAQPage() {
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
            {faqs.map((faq, index) => (
              <details key={index} className="group">
                <summary className="flex cursor-pointer items-center justify-between rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-colors">
                  <h3 className="font-semibold text-foreground">{faq.question}</h3>
                  <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <div className="overflow-hidden border border-t-0 border-border rounded-b-lg bg-muted/30 px-4 py-3">
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              </details>
            ))}
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
