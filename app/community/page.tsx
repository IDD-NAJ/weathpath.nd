import { SimpleLayoutWrapper } from "@/components/layout-wrapper"
import { Navigation } from "@/components/navigation"
import { CommunitySignup } from "@/components/community-signup"
import { CommunityMembers } from "@/components/community-members"
import { CommunityForum } from "@/components/community-forum"

export const metadata = {
  title: "Join Our Community | WealthPath",
  description: "Connect with wealth builders, share strategies, and grow together.",
}

export default function CommunityPage() {
  return (
    <SimpleLayoutWrapper>
      <Navigation />
      
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="border-b border-border bg-gradient-to-b from-primary/5 to-background py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center">
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
                Join Our Community
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Connect with thousands of wealth builders. Share strategies, ask questions, and grow your knowledge together. No gatekeeping, just genuine community.
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
              {/* Signup */}
              <div className="lg:col-span-1">
                <CommunitySignup />
              </div>

              {/* Stats */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-sm border border-border bg-card p-6 text-center">
                    <div className="font-serif text-4xl font-bold text-primary mb-2">
                      5,000+
                    </div>
                    <p className="text-muted-foreground">Active Members</p>
                  </div>
                  <div className="rounded-sm border border-border bg-card p-6 text-center">
                    <div className="font-serif text-4xl font-bold text-primary mb-2">
                      2,400+
                    </div>
                    <p className="text-muted-foreground">Discussions</p>
                  </div>
                  <div className="rounded-sm border border-border bg-card p-6 text-center">
                    <div className="font-serif text-4xl font-bold text-primary mb-2">
                      15K+
                    </div>
                    <p className="text-muted-foreground">Total Replies</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Members Directory */}
            <div className="mb-16 border-t border-border pt-12">
              <CommunityMembers />
            </div>

            {/* Forum */}
            <div className="border-t border-border pt-12">
              <CommunityForum />
            </div>
          </div>
        </section>
      </main>
    </SimpleLayoutWrapper>
  )
}
