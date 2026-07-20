"use client"

import { useEffect, useState } from "react"
import { Users } from "lucide-react"

interface Member {
  id: number
  email: string
  name: string
  bio?: string
  joined_at: string
}

export function CommunityMembers() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/community/members")
      .then((res) => res.json())
      .then((data) => {
        setMembers(data.members || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error("[v0] Failed to fetch members:", err)
        setLoading(false)
      })
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="h-5 w-5 text-primary" />
        <h3 className="font-serif text-2xl font-bold text-foreground">
          Community Members ({members.length})
        </h3>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-sm animate-pulse" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          No members yet. Be the first to join!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="rounded-sm border border-border bg-card p-4 hover:shadow-md transition-shadow"
            >
              <h4 className="font-semibold text-foreground">{member.name}</h4>
              <p className="text-sm text-muted-foreground">{member.email}</p>
              {member.bio && (
                <p className="mt-2 text-sm text-foreground line-clamp-2">{member.bio}</p>
              )}
              <p className="mt-3 text-xs text-muted-foreground">
                Joined {new Date(member.joined_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
