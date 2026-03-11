"use client"

import { useState } from "react"
import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Bell, 
  Send, 
  Users, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  AlertTriangle,
  Search,
  Filter,
  Trash2,
  Eye,
  Edit,
  Plus,
  Calendar,
  Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { AnimatedCard, AnimatedStatCard } from "@/components/ui/animated-card"
import { useToast } from "@/hooks/use-toast"

interface Notification {
  id: string
  user_id?: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  action_url?: string
  is_read?: boolean
  created_at: string
  sender_name?: string
  unread_count?: number
}

interface User {
  id: string
  name: string
  email: string
  role: string
  is_active: boolean
  created_at: string
}

interface NotificationsManagerProps {
  notifications: Notification[]
  users: User[]
}

const notificationTypes = [
  { value: "info", label: "Information", icon: Info, color: "bg-blue-500" },
  { value: "success", label: "Success", icon: CheckCircle, color: "bg-green-500" },
  { value: "warning", label: "Warning", icon: AlertTriangle, color: "bg-yellow-500" },
  { value: "error", label: "Error", icon: AlertCircle, color: "bg-red-500" }
]

export function NotificationsManager({ notifications, users }: NotificationsManagerProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [sendToAll, setSendToAll] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info" as const,
    action_url: ""
  })
  const { toast } = useToast()

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || notification.type === filterType
    return matchesSearch && matchesType
  })

  const totalNotifications = notifications.length
  const unreadNotifications = notifications.reduce((sum, n) => sum + (n.unread_count || 0), 0)
  const recentNotifications = notifications.filter(n => {
    const createdAt = new Date(n.created_at)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return createdAt > weekAgo
  }).length

  const handleCreateNotification = async () => {
    try {
      const response = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          send_to_all: sendToAll,
          user_ids: sendToAll ? [] : selectedUsers
        }),
      })

      if (response.ok) {
        toast({
          title: "Notification sent",
          description: `Successfully sent to ${sendToAll ? 'all users' : selectedUsers.length + ' users'}`,
        })
        setIsCreating(false)
        setFormData({ title: "", message: "", type: "info", action_url: "" })
        setSelectedUsers([])
        setSendToAll(false)
        window.location.reload()
      } else {
        throw new Error("Failed to send notification")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive",
      })
    }
  }

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const getTypeIcon = (type: string) => {
    const typeConfig = notificationTypes.find(t => t.value === type)
    return typeConfig?.icon || Bell
  }

  const getTypeColor = (type: string) => {
    const typeConfig = notificationTypes.find(t => t.value === type)
    return typeConfig?.color || "bg-gray-500"
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <AnimatedStatCard
          title="Total Notifications"
          value={totalNotifications}
          description="All notifications sent"
          icon={<Bell className="h-4 w-4" />}
          delay={0}
        />
        <AnimatedStatCard
          title="Unread Messages"
          value={unreadNotifications}
          description="Not yet read by users"
          icon={<MessageSquare className="h-4 w-4" />}
          delay={0.1}
        />
        <AnimatedStatCard
          title="Recent (7 days)"
          value={recentNotifications}
          description="Sent this week"
          icon={<Clock className="h-4 w-4" />}
          delay={0.2}
        />
        <AnimatedStatCard
          title="Active Users"
          value={users.length}
          description="Can receive notifications"
          icon={<Users className="h-4 w-4" />}
          delay={0.3}
        />
      </div>

      {/* Create Notification */}
      <AnimatedCard delay={0.4}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Create Notification
              </CardTitle>
              <CardDescription>
                Send announcements and alerts to users
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreating(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Notification
            </Button>
          </div>
        </CardHeader>
      </AnimatedCard>

      {/* Filters */}
      <AnimatedCard delay={0.5}>
        <CardHeader>
          <CardTitle className="text-lg">Notifications</CardTitle>
          <CardDescription>Manage and view all notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {notificationTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${type.color}`} />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </AnimatedCard>

      {/* Notifications List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredNotifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground">No notifications found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterType !== "all" 
                  ? "Try adjusting your filters" 
                  : "Create your first notification to get started"}
              </p>
            </motion.div>
          ) : (
            filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-full ${getTypeColor(notification.type)} text-white`}>
                        {React.createElement(getTypeIcon(notification.type), { className: "h-4 w-4" })}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3 className="font-medium text-foreground">
                              {notification.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            {notification.action_url && (
                              <p className="text-xs text-blue-600 mt-2">
                                Action URL: {notification.action_url}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant="outline" className="capitalize">
                              {notification.type}
                            </Badge>
                            {notification.unread_count && notification.unread_count > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {notification.unread_count} unread
                              </Badge>
                            )}
                            <div className="text-xs text-muted-foreground">
                              {new Date(notification.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        {notification.sender_name && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            Sent by: {notification.sender_name}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Create Notification Modal */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setIsCreating(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Create New Notification</CardTitle>
                  <CardDescription>
                    Send a notification to users
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        placeholder="Enter notification title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {notificationTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${type.color}`} />
                                {type.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Enter notification message"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="action_url">Action URL (Optional)</Label>
                    <Input
                      id="action_url"
                      placeholder="/dashboard or /learn"
                      value={formData.action_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, action_url: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sendToAll"
                        checked={sendToAll}
                        onCheckedChange={(checked) => setSendToAll(checked as boolean)}
                      />
                      <Label htmlFor="sendToAll">Send to all users</Label>
                    </div>

                    {!sendToAll && (
                      <div className="space-y-2">
                        <Label>Select Users</Label>
                        <div className="max-h-40 overflow-y-auto border rounded-lg p-2">
                          {users.map((user) => (
                            <div key={user.id} className="flex items-center space-x-2 p-2">
                              <Checkbox
                                id={user.id}
                                checked={selectedUsers.includes(user.id)}
                                onCheckedChange={() => handleUserToggle(user.id)}
                              />
                              <Label htmlFor={user.id} className="flex-1 cursor-pointer">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">{user.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {user.role}
                                  </Badge>
                                </div>
                                <span className="text-xs text-muted-foreground">{user.email}</span>
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateNotification}
                    disabled={!formData.title || !formData.message || (!sendToAll && selectedUsers.length === 0)}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Send Notification
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
