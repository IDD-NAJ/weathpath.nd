'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Edit2, Trash2 } from "lucide-react"
import { AnimatedCard } from "@/components/ui/animated-card"
import { Card, CardContent } from "@/components/ui/card"

interface FAQ {
  id: number
  question: string
  answer: string
  category: string
  order_index: number
}

export default function AdminFAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "General",
  })

  useEffect(() => {
    fetchFAQs()
  }, [])

  const fetchFAQs = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/faqs")
      const data = await res.json()
      setFaqs(Array.isArray(data.faqs) ? data.faqs : [])
    } catch (err) {
      console.error("[v0] Failed to fetch FAQs:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch("/api/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          order_index: faqs.length,
        }),
      })

      if (res.ok) {
        await fetchFAQs()
        setFormData({ question: "", answer: "", category: "General" })
        setShowForm(false)
      }
    } catch (err) {
      console.error("[v0] Failed to add FAQ:", err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">FAQs</h1>
          <p className="text-muted-foreground">Manage frequently asked questions</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add FAQ
        </Button>
      </div>

      {/* Add FAQ Form */}
      {showForm && (
        <AnimatedCard delay={0}>
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Question</label>
                  <Input
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    placeholder="Enter question"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Answer</label>
                  <textarea
                    value={formData.answer}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    placeholder="Enter answer"
                    rows={4}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option>Courses</option>
                    <option>Billing</option>
                    <option>Support</option>
                    <option>Certificates</option>
                    <option>General</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Save FAQ</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setFormData({ question: "", answer: "", category: "General" })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </AnimatedCard>
      )}

      {/* FAQs List */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-muted-foreground text-center py-8">Loading...</p>
        ) : faqs.length === 0 ? (
          <div className="text-center py-12 border border-border rounded-lg bg-muted/30">
            <p className="text-muted-foreground">No FAQs yet. Create your first one!</p>
          </div>
        ) : (
          faqs.map((faq) => (
            <AnimatedCard key={faq.id} delay={0}>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{faq.question}</h3>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{faq.answer}</p>
                      <p className="text-xs text-muted-foreground/70 mt-2">{faq.category}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" className="gap-2">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedCard>
          ))
        )}
      </div>
    </div>
  )
}
