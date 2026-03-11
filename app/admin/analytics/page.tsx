"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, TrendingUp, BookOpen, FileText, Star, Activity, BarChart3 } from "lucide-react"
import { ActivityChart } from "@/components/charts/activity-chart"
import { AnalyticsBar } from "@/components/charts/analytics-bar"
import { ProgressDonut } from "@/components/charts/progress-donut"
import { AnimatedStatCard } from "@/components/ui/animated-card"

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Failed to fetch')
  return response.json()
}

export default function AnalyticsPage() {
  const { data: stats, error, isLoading } = useSWR('/api/admin/analytics', fetcher, {
    refreshInterval: 30000
  })

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <BarChart3 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-medium">Error loading analytics</h2>
          <p className="text-muted-foreground">Unable to load analytics data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Analytics
        </h2>
        <p className="text-sm text-muted-foreground">
          Detailed insights into platform usage and content performance
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnimatedStatCard
          title="Total Users"
          value={stats.users?.total || 0}
          description="All registered users"
          icon={<Users className="h-4 w-4" />}
          delay={0}
        />
        <AnimatedStatCard
          title="Active Users"
          value={stats.users?.active || 0}
          description="Last 30 days"
          icon={<Activity className="h-4 w-4" />}
          delay={0.1}
        />
        <AnimatedStatCard
          title="New This Month"
          value={stats.users?.newThisMonth || 0}
          description="New registrations"
          icon={<TrendingUp className="h-4 w-4" />}
          delay={0.2}
        />
        <AnimatedStatCard
          title="Avg Progress"
          value={`${Math.round(stats.engagement?.averageProgress || 0)}%`}
          description="Across all paths"
          icon={<BarChart3 className="h-4 w-4" />}
          delay={0.3}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityChart 
          data={stats.weeklyActivity || []}
          title="Weekly User Activity"
          description="Daily active users over the last 7 days"
        />
        <AnalyticsBar 
          data={stats.contentStats || []}
          title="Content Performance"
          description="Published content across all types"
          color="#8884d8"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ProgressDonut 
          data={[
            { name: 'Completed', value: stats.engagement?.completedPaths || 0, color: '#10b981' },
            { name: 'In Progress', value: Math.max(0, (stats.engagement?.totalProgress || 0) - (stats.engagement?.completedPaths || 0)), color: '#3b82f6' },
            { name: 'Not Started', value: Math.max(0, (stats.users?.total || 0) - (stats.engagement?.totalProgress || 0)), color: '#6b7280' }
          ]}
          title="Learning Progress"
          description="User completion rates"
          centerValue={(stats.engagement?.totalProgress || 0).toString()}
          centerLabel="Active"
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Published Content</CardTitle>
            <CardDescription>Content available to users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Articles</span>
              </div>
              <Badge variant="secondary">{stats.content?.published?.articles || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Success Stories</span>
              </div>
              <Badge variant="secondary">{stats.content?.published?.stories || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-green-500" />
                <span className="text-sm">Learning Paths</span>
              </div>
              <Badge variant="secondary">{stats.content?.published?.learningPaths || 0}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Content Drafts</CardTitle>
            <CardDescription>Draft status breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Drafts</span>
              <Badge>{stats.content?.drafts?.total || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Pending Review</span>
              <Badge variant="default">{stats.content?.drafts?.pending || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Approved</span>
              <Badge className="bg-green-500">{stats.content?.drafts?.approved || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Rejected</span>
              <Badge variant="destructive">{stats.content?.drafts?.rejected || 0}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
          <CardDescription>Latest user actions on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentActivity?.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {(stats.recentActivity || []).slice(0, 10).map((activity: any, index: number) => (
                <div key={index} className="flex items-center justify-between text-sm border-b border-border pb-2 last:border-0">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{activity.name}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{activity.activity_type}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
