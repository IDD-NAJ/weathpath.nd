"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { BookOpen, Calculator, HelpCircle, ArrowRight, Star, FileText, Award, Clock, Target, Bell, Bookmark, TrendingUp, Trophy, Zap } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { AnimatedStatCard, AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedProgress, CircularProgress } from "@/components/ui/animated-progress"
import { AchievementBadge } from "@/components/ui/achievement-badge"
import { ProgressDonut } from "@/components/charts/progress-donut"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { getCurrentUser } from "@/lib/auth"

interface UserData {
  progress: Array<any>
  recentActivity: Array<any>
  bookmarks: Array<any>
  quizResults: Array<any>
  notifications: Array<any>
}

interface DashboardStats {
  totalUsers: number
  completedPaths: number
  bookmarks: number
  quizScore: string | number
}

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }
  return response.json()
}

export default function DashboardPage() {
  const { data: userData, error, isLoading } = useSWR<UserData>('/api/user/progress', fetcher)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Fetch current user data
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user/profile')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
      }
    }
    fetchUser()
  }, [])

  if (isLoading || !user) {
    return (
      <LayoutWrapper showNavigation={false}>
        <div className="flex min-h-screen items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Target className="h-8 w-8 text-primary" />
          </motion.div>
        </div>
      </LayoutWrapper>
    )
  }

  if (error || !userData) {
    return (
      <LayoutWrapper showNavigation={false}>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-medium">Error loading dashboard</h2>
            <p className="text-muted-foreground mb-4">Unable to load your dashboard data.</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </LayoutWrapper>
    )
  }

  const stats: DashboardStats = {
    totalUsers: userData.progress.length,
    completedPaths: userData.progress.filter(p => p.progress_percentage === 100).length,
    bookmarks: userData.bookmarks.length,
    quizScore: userData.quizResults.length > 0 ? `${userData.quizResults[0].score}%` : "N/A"
  }

  const quickLinks = [
    {
      title: "Learning Paths",
      description: "Browse structured courses on building passive income",
      icon: BookOpen,
      href: "/#learn",
    },
    {
      title: "Income Quiz",
      description: "Discover which passive income strategies suit you best",
      icon: HelpCircle,
      href: "/#quiz",
    },
    {
      title: "Compound Calculator",
      description: "See how your money can grow over time",
      icon: Calculator,
      href: "/#calculator",
    },
    {
      title: "Success Stories",
      description: "Read how others built their passive income streams",
      icon: Star,
      href: "/#stories",
    },
    {
      title: "Resources",
      description: "Curated books, podcasts, and articles on wealth building",
      icon: FileText,
      href: "/#resources",
    },
  ]

  return (
    <LayoutWrapper showNavigation={false}>
      <div className="px-6 pt-8 pb-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Welcome back, {user.name.split(" ")[0]}
              </h1>
              <p className="mt-1 text-muted-foreground">
                Continue your journey toward building lasting passive wealth
              </p>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <AnimatedStatCard
                title="Learning Progress"
                value={`${userData.progress.length} paths`}
                description="Active learning paths"
                icon={<Target className="h-4 w-4" />}
                delay={0.1}
              />
              <AnimatedStatCard
                title="Completed"
                value={userData.progress.filter(p => p.progress_percentage === 100).length}
                description="Finished paths"
                icon={<Award className="h-4 w-4" />}
                delay={0.2}
              />
              <AnimatedStatCard
                title="Bookmarks"
                value={userData.bookmarks.length}
                description="Saved content"
                icon={<Bookmark className="h-4 w-4" />}
                delay={0.3}
              />
              <AnimatedStatCard
                title="Quiz Score"
                value={userData.quizResults.length > 0 ? `${userData.quizResults[0].score}%` : "N/A"}
                description="Latest quiz result"
                icon={<TrendingUp className="h-4 w-4" />}
                delay={0.4}
              />
            </div>

            {/* Progress Overview Section */}
            <div className="grid gap-6 lg:grid-cols-3">
              <AnimatedCard delay={0.5}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Target className="h-4 w-4" />
                    Your Progress
                  </CardTitle>
                  <CardDescription>Learning paths you're working on</CardDescription>
                </CardHeader>
                <CardContent>
                  {userData.progress.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                        <Target className="h-6 w-6 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">No learning paths started yet</p>
                      <Link
                        href="/#learn"
                        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        Start Learning
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userData.progress.map((path: any, index: number) => (
                        <motion.div
                          key={path.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                          className="space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{path.title}</span>
                            <Badge variant="outline">{path.progress_percentage}%</Badge>
                          </div>
                          <AnimatedProgress 
                            value={path.progress_percentage} 
                            size="sm"
                            color={path.progress_percentage === 100 ? "success" : "primary"}
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </AnimatedCard>

              <AnimatedCard delay={0.6}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Bookmark className="h-4 w-4" />
                    Recent Bookmarks
                  </CardTitle>
                  <CardDescription>Content you've saved</CardDescription>
                </CardHeader>
                <CardContent>
                  {userData.bookmarks.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="mx-auto w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-4">
                        <Bookmark className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">No bookmarks yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {userData.bookmarks.map((bookmark: any, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                          className="flex items-center justify-between p-2 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium truncate">{bookmark.title}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs ml-2">
                            {bookmark.item_type}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </AnimatedCard>

              <AnimatedCard delay={0.7}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Bell className="h-4 w-4" />
                    Notifications
                  </CardTitle>
                  <CardDescription>Updates and alerts</CardDescription>
                </CardHeader>
                <CardContent>
                  {userData.notifications.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="mx-auto w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                        <Bell className="h-6 w-6 text-green-600" />
                      </div>
                      <p className="text-sm text-muted-foreground">No new notifications</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {userData.notifications.map((notif: any, index: number) => (
                        <motion.div
                          key={notif.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                          className="p-3 rounded-lg border border-border bg-card/50"
                        >
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{notif.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </AnimatedCard>
            </div>

            {/* Achievements Section */}
            <AnimatedCard delay={0.8}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Trophy className="h-4 w-4" />
                  Your Achievements
                </CardTitle>
                <CardDescription>Milestones and accomplishments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <AchievementBadge
                    type="bronze"
                    title="First Steps"
                    description="Complete your first learning path"
                    unlocked={userData.progress.some(p => p.progress_percentage === 100)}
                    delay={0.9}
                  />
                  <AchievementBadge
                    type="silver"
                    title="Knowledge Seeker"
                    description="Complete 3 learning paths"
                    unlocked={userData.progress.filter(p => p.progress_percentage === 100).length >= 3}
                    progress={Math.min((userData.progress.filter(p => p.progress_percentage === 100).length / 3) * 100, 100)}
                    delay={1.0}
                  />
                  <AchievementBadge
                    type="gold"
                    title="Quiz Master"
                    description="Score 90% or higher on any quiz"
                    unlocked={userData.quizResults.some(q => q.score >= 90)}
                    delay={1.1}
                  />
                  <AchievementBadge
                    type="platinum"
                    title="Dedicated Learner"
                    description="Active for 30 days"
                    unlocked={false}
                    progress={65}
                    delay={1.2}
                  />
                </div>
              </CardContent>
            </AnimatedCard>

            {/* Quick Links Section */}
            <AnimatedCard delay={0.9}>
              <CardHeader>
                <CardTitle className="text-base">Quick Links</CardTitle>
                <CardDescription>Explore WealthPath features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {quickLinks.map((link, index) => (
                    <motion.div
                      key={link.title}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 1.0 + index * 0.05 }}
                    >
                      <Link href={link.href}>
                        <div className="group flex items-center gap-3 rounded-lg border border-border p-3 transition-all duration-200 hover:border-primary/30 hover:bg-secondary/50 hover:shadow-md">
                          <motion.div 
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <link.icon className="h-4 w-4 text-primary" />
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{link.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{link.description}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </AnimatedCard>

            {/* Account Overview */}
            <AnimatedCard delay={1.0}>
              <CardHeader>
                <CardTitle className="text-base">Your Account</CardTitle>
                <CardDescription>Account details and membership information</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-3 sm:grid-cols-2">
                  <motion.div 
                    className="flex flex-col gap-1 rounded-md border border-border px-4 py-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 1.1 }}
                  >
                    <dt className="text-xs text-muted-foreground">Name</dt>
                    <dd className="text-sm font-medium text-foreground">{user.name}</dd>
                  </motion.div>
                  <motion.div 
                    className="flex flex-col gap-1 rounded-md border border-border px-4 py-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 1.2 }}
                  >
                    <dt className="text-xs text-muted-foreground">Email</dt>
                    <dd className="text-sm font-medium text-foreground">{user.email}</dd>
                  </motion.div>
                  <motion.div 
                    className="flex flex-col gap-1 rounded-md border border-border px-4 py-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 1.3 }}
                  >
                    <dt className="text-xs text-muted-foreground">Member Since</dt>
                    <dd className="text-sm font-medium text-foreground">
                      {new Date(user.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </dd>
                  </motion.div>
                  <motion.div 
                    className="flex flex-col gap-1 rounded-md border border-border px-4 py-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 1.4 }}
                  >
                    <dt className="text-xs text-muted-foreground">Role</dt>
                    <dd className="text-sm font-medium capitalize text-foreground">{user.role}</dd>
                  </motion.div>
                </dl>
              </CardContent>
            </AnimatedCard>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}
