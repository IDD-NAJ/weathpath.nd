'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Clock, Archive } from "lucide-react"
import { AnimatedCard } from "@/components/ui/animated-card"

interface Contact {
  id: number
  name: string
  email: string
  subject: string
  status: string
  created_at: string
}

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filter, setFilter] = useState("new")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContacts()
  }, [filter])

  const fetchContacts = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/contacts?status=${filter}`)
      const data = await res.json()
      setContacts(data.contacts || [])
    } catch (err) {
      console.error("[v0] Failed to fetch contacts:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Contact Messages</h1>
        <p className="text-muted-foreground">Manage incoming contact form submissions</p>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <Button
          variant={filter === "new" ? "default" : "outline"}
          onClick={() => setFilter("new")}
          className="gap-2"
        >
          <Clock className="h-4 w-4" />
          New
        </Button>
        <Button
          variant={filter === "read" ? "default" : "outline"}
          onClick={() => setFilter("read")}
        >
          Read
        </Button>
        <Button
          variant={filter === "archive" ? "default" : "outline"}
          onClick={() => setFilter("archive")}
          className="gap-2"
        >
          <Archive className="h-4 w-4" />
          Archived
        </Button>
      </div>

      {/* Messages List */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-muted-foreground text-center py-8">Loading...</p>
        ) : contacts.length === 0 ? (
          <div className="text-center py-12 border border-border rounded-lg bg-muted/30">
            <Mail className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No messages found</p>
          </div>
        ) : (
          contacts.map((contact) => (
            <AnimatedCard key={contact.id} delay={0}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{contact.subject}</h3>
                      <p className="text-sm text-muted-foreground mt-1">From: {contact.name}</p>
                      <p className="text-sm text-muted-foreground">{contact.email}</p>
                      <p className="text-xs text-muted-foreground/70 mt-2">
                        {new Date(contact.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button variant="outline" size="sm">Reply</Button>
                      <Button variant="ghost" size="sm">Archive</Button>
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
