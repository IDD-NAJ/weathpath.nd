"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { 
  Users, 
  BookOpen, 
  FileText, 
  Star, 
  TrendingUp, 
  UserPlus, 
  ShieldCheck,
  Activity,
  BarChart3,
  Bell,
  Target,
  Clock,
  Award,
  Eye,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Wand2,
  FileEdit,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { AnimatedStatCard, AnimatedCard } from "@/components/ui/animated-card"
import { ActivityChart } from "@/components/charts/activity-chart"
import { ProgressDonut } from "@/components/charts/progress-donut"
import { AnalyticsBar } from "@/components/charts/analytics-bar"
import { AnimatedProgress } from "@/components/ui/animated-progress"
import { AdminCourses } from "@/components/admin-courses"

interface AdminStats {
  users: {
    total: number
    active: number
    newThisMonth: number
  }
  engagement: {
    totalProgress: number
    completedPaths: number
    averageProgress: number
  }
  recentActivity: Array<Record<string, any>>
  popularContent: Array<Record<string, any>>
  quizStats: Array<Record<string, any>>
  notifications: {
    unread: number
  }
  content: {
    drafts: {
      total: number
      draft: number
      pending: number
      approved: number
      rejected: number
    }
    published: {
      articles: number
      stories: number
      learningPaths: number
    }
  }
  weeklyActivity?: Array<{ date: string; users: number; sessions: number; engagement: number }>
  contentStats?: Array<{ name: string; value: number; trend: "up" | "down" | "stable" }>
  userGrowth?: Array<{ month: string; count: number }>
  recentUsers?: Array<Record<string, any>>
}

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }
  return response.json()
}

export default function AdminOverviewPage() {
  const { data: stats, error, isLoading } = useSWR<AdminStats>('/api/admin/analytics', fetcher)
  const { data: draftsData, error: draftsError } = useSWR('/api/admin/content/drafts/recent', fetcher)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <BarChart3 className="h-8 w-8 text-primary" />
        </motion.div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-medium">Error loading dashboard</h2>
          <p className="text-muted-foreground mb-4">Unable to load admin dashboard data.</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Dashboard
        </h2>
        <p className="text-sm text-muted-foreground">
          A snapshot of your WealthPath platform
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <AnimatedStatCard
          title="Pending Approvals"
          value={stats.content?.drafts?.pending || 0}
          description="Awaiting review"
          icon={<ShieldCheck className="h-4 w-4" />}
          delay={0}
          className={(stats.content?.drafts?.pending || 0) > 0 ? "border-amber-300 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/30" : ""}
        />
        <AnimatedStatCard
          title="Total Drafts"
          value={stats.content?.drafts?.total || 0}
          description="All content drafts"
          icon={<FileEdit className="h-4 w-4" />}
          delay={0.1}
        />
        <AnimatedStatCard
          title="Active Users"
          value={stats.users?.active || 0}
          description="Last 30 days"
          icon={<Activity className="h-4 w-4" />}
          delay={0.2}
        />
        <AnimatedStatCard
          title="Total Users"
          value={stats.users?.total || 0}
          description="Registered accounts"
          icon={<Users className="h-4 w-4" />}
          delay={0.3}
        />
        <AnimatedStatCard
          title="Completed Paths"
          value={stats.engagement?.completedPaths || 0}
          description="User completions"
          icon={<Target className="h-4 w-4" />}
          delay={0.4}
        />
        <AnimatedStatCard
          title="Avg Progress"
          value={`${Math.round(stats.engagement?.averageProgress || 0)}%`}
          description="Across all paths"
          icon={<BarChart3 className="h-4 w-4" />}
          delay={0.5}
        />
        <AnimatedStatCard
          title="Unread Notifications"
          value={stats.notifications?.unread || 0}
          description="System notifications"
          icon={<Bell className="h-4 w-4" />}
          delay={0.6}
          className={(stats.notifications?.unread || 0) > 0 ? "border-amber-300 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/30" : ""}
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityChart 
          data={stats.weeklyActivity || []}
          title="Weekly User Activity"
          description="Daily active users and engagement"
        />
        <AnalyticsBar 
          data={stats.contentStats || []}
          title="Content Performance"
          description="Published content and user engagement"
          color="#8884d8"
        />
      </div>

      {/* Course Management Section */}
      <AnimatedCard delay={0.65}>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-4 w-4" />
                Course Management
              </CardTitle>
              <CardDescription>Create, edit, or delete courses directly from the dashboard</CardDescription>
            </div>
            <Link
              href="/admin/courses"
              className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80"
            >
              Full course manager
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <AdminCourses />
        </CardContent>
      </AnimatedCard>

      {/* Content Drafts Section */}
      <AnimatedCard delay={0.7}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileEdit className="h-4 w-4" />
            Content Drafts Overview
          </CardTitle>
          <CardDescription>Status of AI-generated and manual content drafts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Link href="/admin/drafts">
              <motion.div 
                className="text-center p-4 rounded-lg border border-border bg-card/50 cursor-pointer hover:bg-secondary/50 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.8 }}
              >
                <div className="flex items-center justify-center mb-2">
                  <FileEdit className="h-5 w-5 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-foreground">{stats.content?.drafts?.total || 0}</div>
                <p className="text-xs text-muted-foreground">Total Drafts</p>
              </motion.div>
            </Link>
            
            <Link href="/admin/drafts/in-draft">
              <motion.div 
                className="text-center p-4 rounded-lg border border-border bg-card/50 cursor-pointer hover:bg-secondary/50 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.9 }}
              >
                <div className="flex items-center justify-center mb-2">
                  <AlertCircle className="h-5 w-5 text-gray-500" />
                </div>
                <div className="text-2xl font-bold text-foreground">{stats.content?.drafts?.draft || 0}</div>
                <p className="text-xs text-muted-foreground">In Draft</p>
              </motion.div>
            </Link>
            
            <Link href="/admin/drafts/pending-review">
              <motion.div 
                className="text-center p-4 rounded-lg border border-amber-300 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/30 cursor-pointer hover:bg-amber-100/50 dark:hover:bg-amber-900/30 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 1.0 }}
              >
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
                <div className="text-2xl font-bold text-foreground">{stats.content?.drafts?.pending || 0}</div>
                <p className="text-xs text-muted-foreground">Pending Review</p>
              </motion.div>
            </Link>
            
            <Link href="/admin/drafts/approved">
              <motion.div 
                className="text-center p-4 rounded-lg border border-green-300 bg-green-50/50 dark:border-green-800 dark:bg-green-950/30 cursor-pointer hover:bg-green-100/50 dark:hover:bg-green-900/30 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 1.1 }}
              >
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-foreground">{stats.content?.drafts?.approved || 0}</div>
                <p className="text-xs text-muted-foreground">Approved</p>
              </motion.div>
            </Link>
            
            <Link href="/admin/drafts/rejected">
              <motion.div 
                className="text-center p-4 rounded-lg border border-red-300 bg-red-50/50 dark:border-red-800 dark:bg-red-950/30 cursor-pointer hover:bg-red-100/50 dark:hover:bg-red-900/30 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 1.2 }}
              >
                <div className="flex items-center justify-center mb-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="text-2xl font-bold text-foreground">{stats.content?.drafts?.rejected || 0}</div>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </motion.div>
            </Link>
          </div>
          
          {(stats.content?.drafts?.pending || 0) > 0 && (
            <div className="mt-4 p-3 rounded-lg border border-amber-300 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/30">
              <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">
                  {stats.content?.drafts?.pending || 0} draft{((stats.content?.drafts?.pending || 0) !== 1) ? 's' : ''} pending review
                </span>
              </div>
              <Link href="/admin/approvals" className="mt-2 inline-flex items-center gap-1 text-xs text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100">
                Review drafts now
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </CardContent>
      </AnimatedCard>

      {/* Recent Content Drafts Section */}
      <AnimatedCard delay={0.8}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileEdit className="h-4 w-4" />
            Recent Content Drafts
          </CardTitle>
          <CardDescription>Latest content drafts created or updated</CardDescription>
        </CardHeader>
        <CardContent>
          {draftsError ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">Error loading recent drafts</p>
            </div>
          ) : !draftsData?.drafts || draftsData.drafts.length === 0 ? (
            <div className="text-center py-8">
              <FileEdit className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No content drafts yet</p>
              <Link href="/admin/ai" className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80">
                <Wand2 className="h-4 w-4" />
                Create your first draft
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {draftsData.drafts.map((draft: Record<string, any>, index: number) => (
                <motion.div
                  key={draft.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.9 + index * 0.1 }}
                  className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-foreground truncate">
                        {draft.title || 'Untitled Draft'}
                      </h4>
                      <Badge 
                        variant={
                          draft.status === 'pending_approval' ? 'default' :
                          draft.status === 'approved' ? 'secondary' :
                          draft.status === 'rejected' ? 'destructive' :
                          'outline'
                        }
                        className="text-xs"
                      >
                        {draft.status === 'pending_approval' ? 'Pending Review' :
                         draft.status === 'approved' ? 'Approved' :
                         draft.status === 'rejected' ? 'Rejected' :
                         'Draft'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="capitalize">{draft.type}</span>
                      <span>•</span>
                      <span>By {draft.author_name || 'Unknown'}</span>
                      <span>•</span>
                      <span>
                        {new Date(draft.updated_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                    {draft.summary && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {draft.summary}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {draft.status === 'pending_approval' && (
                      <Link href={`/admin/approvals?draft=${draft.id}`}>
                        <Button size="sm" variant="outline" className="text-xs">
                          Review
                        </Button>
                      </Link>
                    )}
                    <Link href={`/admin/ai?draft=${draft.id}`}>
                      <Button size="sm" variant="ghost" className="text-xs">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          {draftsData?.drafts && draftsData.drafts.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <Link href="/admin/approvals" className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80">
                View all drafts
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </CardContent>
      </AnimatedCard>

      <div className="grid gap-6 lg:grid-cols-3">
        <ProgressDonut 
          data={[
            { name: 'Completed', value: stats.engagement?.completedPaths || 0, color: '#10b981' },
            { name: 'In Progress', value: (stats.engagement?.totalProgress || 0) - (stats.engagement?.completedPaths || 0), color: '#3b82f6' },
            { name: 'Not Started', value: Math.max(0, (stats.users?.total || 0) - (stats.engagement?.totalProgress || 0)), color: '#6b7280' }
          ]}
          title="Learning Progress Distribution"
          description="User completion rates across all paths"
          centerValue={(stats.engagement?.totalProgress || 0).toString()}
          centerLabel="Total Active"
        />
        <AnimatedCard delay={0.4}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserPlus className="h-4 w-4" />
              Recent Signups
            </CardTitle>
            <CardDescription>Latest user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentUsers?.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No users yet
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {(stats.recentUsers || []).map((user: Record<string, string>, index: number) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                      className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                          {user.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                        {user.role}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={0.6}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common management tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Manage Courses", href: "/admin/courses", icon: BookOpen },
                { label: "Coupons", href: "/admin/coupons", icon: Target },
                { label: "Review Moderation", href: "/admin/reviews", icon: Star },
                { label: "Manage Drafts", href: "/admin/drafts", icon: FileEdit },
                { label: "Review Content", href: "/admin/approvals", icon: ShieldCheck },
                { label: "User Analytics", href: "/admin/analytics", icon: BarChart3 },
                { label: "Add Learning Path", href: "/admin/learning-paths", icon: BookOpen },
                { label: "Write Article", href: "/admin/articles", icon: FileText },
                { label: "Add Story", href: "/admin/stories", icon: Star },
                { label: "Manage Users", href: "/admin/users", icon: Users },
                { label: "Send Notifications", href: "/admin/notifications", icon: Bell },
                { label: "AI Content Generator", href: "/admin/ai", icon: Wand2 },
                { label: "Banners & Announcements", href: "/admin/banners", icon: Bell },
                { label: "Create Content", href: "/admin/content", icon: FileEdit },
                { label: "Site Settings", href: "/admin/settings", icon: Award },
              ].map((action, index) => (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.7 + index * 0.05 }}
                >
                  <Link
                    href={action.href}
                    className="flex items-center justify-center rounded-md border border-border px-3 py-2.5 text-sm font-medium text-foreground transition-all duration-200 hover:bg-secondary hover:border-primary/30 hover:shadow-md"
                  >
                    <action.icon className="h-3 w-3 mr-1" />
                    {action.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </AnimatedCard>
      </div>

      <AnimatedCard delay={0.8}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Award className="h-4 w-4" />
            Platform Overview
          </CardTitle>
          <CardDescription>Content and user statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
            >
              <div className="text-2xl font-bold text-foreground">{stats.content?.published?.learningPaths || 0}</div>
              <p className="text-xs text-muted-foreground">Learning Paths</p>
              <AnimatedProgress value={stats.content?.published?.learningPaths || 0} max={10} size="sm" className="mt-2" />
            </motion.div>
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
            >
              <div className="text-2xl font-bold text-foreground">{stats.content?.published?.articles || 0}</div>
              <p className="text-xs text-muted-foreground">Articles</p>
              <AnimatedProgress value={stats.content?.published?.articles || 0} max={20} size="sm" className="mt-2" />
            </motion.div>
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.1 }}
            >
              <div className="text-2xl font-bold text-foreground">{stats.content?.published?.stories || 0}</div>
              <p className="text-xs text-muted-foreground">Success Stories</p>
              <AnimatedProgress value={stats.content?.published?.stories || 0} max={15} size="sm" className="mt-2" />
            </motion.div>
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              <div className="text-2xl font-bold text-foreground">{stats.users?.active || 0}</div>
              <p className="text-xs text-muted-foreground">Active Users (7d)</p>
              <AnimatedProgress value={stats.users?.active || 0} max={stats.users?.total || 1} size="sm" className="mt-2" />
            </motion.div>
          </div>
        </CardContent>
      </AnimatedCard>
    </div>
  )
}
