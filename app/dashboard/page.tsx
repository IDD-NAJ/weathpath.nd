"use client"

import { useState } from "react"
import useSWR from "swr"
import {
  BookOpen, Calculator, HelpCircle, ArrowRight, Star, FileText,
  Award, Target, Bell, Bookmark, TrendingUp, Trophy, Zap, Lock,
  Plane, Code2, Bitcoin, ShoppingBag, BarChart3, ChevronRight,
  Sparkles, Circle, MessageSquare,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { MyCoursesSection } from "@/components/my-courses-section"
import { SavedItemsSection } from "@/components/dashboard/saved-items-section"
import { PurchasedCoursesSection } from "@/components/dashboard/purchased-courses-section"

interface UserData {
  progress: Array<any>
  recentActivity: Array<any>
  bookmarks: Array<any>
  quizResults: Array<any>
  notifications: Array<any>
}

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) throw new Error("Failed to fetch")
  return response.json()
}

const profileFetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) throw new Error("Failed to fetch")
  return response.json()
}

const quickLinks = [
  {
    title: "Learning Paths",
    description: "Structured courses on passive income",
    icon: BookOpen,
    href: "/#learn",
    color: "text-topic-invest bg-topic-invest/10",
  },
  {
    title: "Income Quiz",
    description: "Find your best income strategy",
    icon: HelpCircle,
    href: "/#quiz",
    color: "text-topic-hustle bg-topic-hustle/10",
  },
  {
    title: "Compound Calculator",
    description: "Project your wealth growth",
    icon: Calculator,
    href: "/#calculator",
    color: "text-topic-bitcoin bg-topic-bitcoin/10",
  },
  {
    title: "Success Stories",
    description: "Real passive income journeys",
    icon: Star,
    href: "/#stories",
    color: "text-topic-travel bg-topic-travel/10",
  },
  {
    title: "Resources",
    description: "Books, podcasts, and tools",
    icon: FileText,
    href: "/#resources",
    color: "text-topic-coding bg-topic-coding/10",
  },
  {
    title: "Articles",
    description: "Deep dives across all topics",
    icon: Sparkles,
    href: "/articles",
    color: "text-topic-dropship bg-topic-dropship/10",
  },
]

const topicLinks = [
  { label: "Travel Content", href: "/topics/travel", icon: Plane, color: "text-topic-travel" },
  { label: "Coding & Tech", href: "/topics/coding", icon: Code2, color: "text-topic-coding" },
  { label: "Bitcoin & Crypto", href: "/topics/bitcoin", icon: Bitcoin, color: "text-topic-bitcoin" },
  { label: "Dropshipping", href: "/topics/dropshipping", icon: ShoppingBag, color: "text-topic-dropship" },
  { label: "Investing", href: "/topics/investing", icon: BarChart3, color: "text-topic-invest" },
  { label: "Side Hustles", href: "/topics/side-hustles", icon: Zap, color: "text-topic-hustle" },
]

const achievements = [
  {
    id: "first-steps",
    icon: "🌱",
    title: "First Steps",
    description: "Complete your first learning path",
    type: "bronze",
    color: "border-amber-300 bg-amber-50 dark:bg-amber-950/20",
    iconColor: "text-amber-600",
    check: (d: UserData) => d.progress.some((p: any) => p.progress_percentage === 100),
  },
  {
    id: "knowledge-seeker",
    icon: "📚",
    title: "Knowledge Seeker",
    description: "Complete 3 learning paths",
    type: "silver",
    color: "border-slate-300 bg-slate-50 dark:bg-slate-900/20",
    iconColor: "text-slate-500",
    check: (d: UserData) => d.progress.filter((p: any) => p.progress_percentage === 100).length >= 3,
    progress: (d: UserData) =>
      Math.min((d.progress.filter((p: any) => p.progress_percentage === 100).length / 3) * 100, 100),
  },
  {
    id: "quiz-master",
    icon: "🏆",
    title: "Quiz Master",
    description: "Score 90%+ on any quiz",
    type: "gold",
    color: "border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20",
    iconColor: "text-yellow-600",
    check: (d: UserData) => d.quizResults.some((q: any) => q.score >= 90),
  },
  {
    id: "dedicated",
    icon: "🔥",
    title: "Dedicated Learner",
    description: "Active for 30 days",
    type: "platinum",
    color: "border-primary/30 bg-primary/5",
    iconColor: "text-primary",
    check: () => false,
    progress: () => 65,
  },
]

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: {
  title: string
  value: string | number
  description: string
  icon: React.ElementType
  trend?: string
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="h-4.5 w-4.5 text-primary" />
          </div>
          {trend && (
            <Badge variant="secondary" className="text-[11px] rounded-full">{trend}</Badge>
          )}
        </div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{title}</p>
        <p className="text-[11px] text-muted-foreground/70 mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}><CardContent className="p-5"><Skeleton className="h-24 w-full" /></CardContent></Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}><CardContent className="p-5"><Skeleton className="h-48 w-full" /></CardContent></Card>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { data: userData, error, isLoading } = useSWR<UserData>("/api/user/progress", fetcher)
  const { data: profileData } = useSWR<{ user: any }>("/api/user/profile", profileFetcher)

  const user = profileData?.user

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <LoadingSkeleton />
      </div>
    )
  }

  if (error || !userData || !user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <Target className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Unable to load dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">Something went wrong fetching your data.</p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline">Reload</Button>
      </div>
    )
  }

  const completedPaths = userData.progress.filter((p: any) => p.progress_percentage === 100).length
  const latestScore = userData.quizResults.length > 0 ? `${userData.quizResults[0].score}%` : "N/A"
  const firstName = user.name?.split(" ")[0] ?? "there"

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return "Good morning"
    if (h < 17) return "Good afternoon"
    return "Good evening"
  })()

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome header */}
      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm text-muted-foreground">{greeting}</p>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground truncate">
            {firstName}&apos;s Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Continue your wealth-building journey
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto flex-col sm:flex-row">
          <Button asChild className="sm:self-end rounded-xl gap-2" size="sm">
            <Link href="/#learn">
              <BookOpen className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Explore Learning Paths</span>
              <span className="sm:hidden">Learn More</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="sm:self-end rounded-xl gap-2" size="sm">
            <Link href="/dashboard/purchase-history">
              <ShoppingBag className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Purchase History</span>
              <span className="sm:hidden">History</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Paths"
          value={userData.progress.length}
          description="Learning paths started"
          icon={Target}
        />
        <StatCard
          title="Completed"
          value={completedPaths}
          description={completedPaths === 1 ? "Path finished" : "Paths finished"}
          icon={Award}
          trend={completedPaths > 0 ? "Done" : undefined}
        />
        <StatCard
          title="Bookmarks"
          value={userData.bookmarks.length}
          description="Saved articles & stories"
          icon={Bookmark}
        />
        <StatCard
          title="Quiz Score"
          value={latestScore}
          description="Latest result"
          icon={TrendingUp}
          trend={latestScore !== "N/A" ? "Latest" : undefined}
        />
      </div>

      {/* My Courses Section */}
      <MyCoursesSection />

      {/* Certificates Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Award className="h-4 w-4 text-primary" />
            Certificates
          </CardTitle>
          <CardDescription className="text-xs">Your earned certificates</CardDescription>
        </CardHeader>
        <CardContent>
          {userData.certificates && userData.certificates.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {userData.certificates.slice(0, 4).map((cert: any) => (
                <div key={cert.id} className="rounded-lg border border-border p-3 hover:shadow-md transition-shadow">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-foreground truncate">{cert.courseName}</h3>
                      <Award className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {cert.earnedAt ? new Date(cert.earnedAt).toLocaleDateString() : "Recently earned"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <Award className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-xs text-muted-foreground">Complete courses to earn certificates</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Progress */}
        <Card id="progress">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Target className="h-4 w-4 text-primary" />
              Learning Progress
            </CardTitle>
            <CardDescription className="text-xs">Your active learning paths</CardDescription>
          </CardHeader>
          <CardContent>
            {userData.progress.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                  <BookOpen className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">No paths started yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Pick a topic and begin learning</p>
                </div>
                <Button asChild size="sm" className="rounded-xl">
                  <Link href="/#learn">Browse Paths <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {userData.progress.map((path: any) => (
                  <div key={path.id} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2 min-w-0">
                      <span className="text-xs font-medium text-foreground truncate">
                        {path.title}
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {path.progress_percentage}%
                      </span>
                    </div>
                    <Progress
                      value={path.progress_percentage}
                      className="h-1.5"
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bookmarks */}
        <Card id="bookmarks">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Bookmark className="h-4 w-4 text-primary" />
              Saved Content
            </CardTitle>
            <CardDescription className="text-xs">Articles and stories you&apos;ve bookmarked</CardDescription>
          </CardHeader>
          <CardContent>
            {userData.bookmarks.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                  <Bookmark className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">No bookmarks yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Bookmark articles to read later</p>
                </div>
                <Button asChild variant="outline" size="sm" className="rounded-xl">
                  <Link href="/articles">Browse Articles</Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {userData.bookmarks.slice(0, 5).map((bookmark: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-border p-2.5 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Circle className="h-2 w-2 shrink-0 fill-primary text-primary" />
                      <span className="text-xs font-medium text-foreground truncate">
                        {bookmark.title}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-[10px] ml-2 shrink-0 rounded-full">
                      {bookmark.item_type}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Reviews */}
        <Card id="my-reviews">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <MessageSquare className="h-4 w-4 text-primary" />
              My Reviews
            </CardTitle>
            <CardDescription className="text-xs">Feedback you&apos;ve shared</CardDescription>
          </CardHeader>
          <CardContent>
            {userData.myReviews && userData.myReviews.length > 0 ? (
              <div className="flex flex-col gap-2">
                {userData.myReviews.slice(0, 3).map((review: any) => (
                  <div key={review.id} className="border-l-2 border-primary/50 pl-3 py-1">
                    <p className="text-xs font-semibold text-foreground truncate">{review.contentTitle}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={`text-xs ${i < review.rating ? "text-yellow-400" : "text-muted-foreground/30"}`}>
                            ★
                          </span>
                        ))}
                      </div>
                      <Badge variant="secondary" className="text-[9px]">{review.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <MessageSquare className="h-6 w-6 text-muted-foreground/50" />
                <p className="text-xs text-muted-foreground">No reviews yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card id="notifications">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Bell className="h-4 w-4 text-primary" />
              Notifications
            </CardTitle>
            <CardDescription className="text-xs">Updates and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            {userData.notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                  <Bell className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">All caught up</p>
                  <p className="text-xs text-muted-foreground mt-1">No new notifications right now</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {userData.notifications.slice(0, 4).map((notif: any) => (
                  <div key={notif.id} className="rounded-lg border border-border p-3">
                    <div className="flex items-start gap-2">
                      <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      <div>
                        <p className="text-xs font-semibold text-foreground">{notif.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card id="achievements">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Trophy className="h-4 w-4 text-primary" />
                Achievements
              </CardTitle>
              <CardDescription className="text-xs mt-1">Milestones you&apos;ve unlocked</CardDescription>
            </div>
            <Badge variant="secondary" className="rounded-full text-xs">
              {achievements.filter((a) => a.check(userData)).length} / {achievements.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {achievements.map((a) => {
              const unlocked = a.check(userData)
              const prog = a.progress ? a.progress(userData) : undefined
              return (
                <div
                  key={a.id}
                  className={`relative rounded-xl border p-3 sm:p-4 flex flex-col items-center gap-1.5 sm:gap-2 text-center transition-all ${
                    unlocked
                      ? a.color
                      : "border-border bg-muted/30 opacity-60"
                  }`}
                >
                  {!unlocked && (
                    <Lock className="absolute top-1.5 right-1.5 h-2.5 w-2.5 sm:h-3 sm:w-3 text-muted-foreground" />
                  )}
                  <span className="text-xl sm:text-2xl">{a.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{a.title}</p>
                    <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 leading-tight">
                      {a.description}
                    </p>
                  </div>
                  {!unlocked && prog !== undefined && (
                    <Progress value={prog} className="h-0.5 w-full mt-0.5" />
                  )}
                  {unlocked && (
                    <Badge className="text-[9px] sm:text-[10px] rounded-full px-1.5 py-0 h-auto capitalize mt-0.5">
                      Unlocked
                    </Badge>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick links */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">Quick Access</h2>
          <Link
            href="/articles"
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            All articles <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => (
            <Link key={link.title} href={link.href}>
              <div className="group flex items-center gap-3 rounded-xl border border-border p-3 sm:p-4 transition-all hover:border-primary/30 hover:bg-muted/40 hover:shadow-sm">
                <div className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl ${link.color}`}>
                  <link.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                    {link.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{link.description}</p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Purchased Courses Section */}
      <PurchasedCoursesSection />

      {/* Saved Items Section */}
      <SavedItemsSection />

      {/* Topic explorer */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Explore Topics</CardTitle>
          <CardDescription className="text-xs">Dive into a wealth-building category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {topicLinks.map((t) => (
              <Link key={t.href} href={t.href}>
                <div className="flex flex-col items-center gap-1.5 sm:gap-2 rounded-xl border border-border p-2.5 sm:p-3.5 text-center hover:border-primary/30 hover:bg-muted/40 transition-all group">
                  <t.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${t.color}`} />
                  <span className="text-[10px] sm:text-[11px] font-medium text-foreground group-hover:text-primary transition-colors leading-tight truncate px-0.5">
                    {t.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Account overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Account Overview</CardTitle>
          <CardDescription className="text-xs">Your membership details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Full Name", value: user.name },
              { label: "Email", value: user.email },
              {
                label: "Member Since",
                value: new Date(user.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }),
              },
              { label: "Role", value: user.role, capitalize: true },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col gap-1 rounded-xl border border-border px-4 py-3"
              >
                <span className="text-[11px] text-muted-foreground">{item.label}</span>
                <span className={`text-sm font-medium text-foreground truncate ${item.capitalize ? "capitalize" : ""}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Button asChild variant="outline" size="sm" className="rounded-xl">
              <Link href="/profile">Edit Profile</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
