"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User, Mail, Calendar, Shield, Edit, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ProfileEditForm } from "@/components/profile/profile-edit-form"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  bio: string | null
  profilePhotoUrl: string | null
  created_at: string
  updated_at: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        throw new Error('Failed to fetch profile')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProfile = async (profileData: Partial<UserProfile>) => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setIsEditing(false)
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update profile')
      }
    } catch (error) {
      throw error // Re-throw to let the form handle the error
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <User className="h-8 w-8 text-primary" />
        </motion.div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-medium">Profile not found</h2>
          <p className="text-muted-foreground mb-4">Unable to load your profile information.</p>
          <Button onClick={fetchProfile}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => setIsEditing(false)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
        </div>
        <ProfileEditForm
          initialData={{
            name: user.name,
            email: user.email,
            bio: user.bio || '',
            profilePhotoUrl: user.profilePhotoUrl
          }}
          onSave={handleSaveProfile}
          isLoading={false}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
            <p className="text-muted-foreground">Manage your personal information</p>
          </div>
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        {/* Profile Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Overview</CardTitle>
            <CardDescription>Your account information and activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile Photo and Basic Info */}
              <div className="flex flex-col items-center space-y-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={user.profilePhotoUrl || ''} alt="Profile" />
                    <AvatarFallback className="text-2xl">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
                
                <div className="text-center">
                  <h2 className="text-xl font-semibold">{user.name}</h2>
                  <Badge variant={user.role === "admin" ? "default" : "secondary"} className="mt-1">
                    {user.role}
                  </Badge>
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      Email
                    </div>
                    <p className="font-medium">{user.email}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      Role
                    </div>
                    <p className="font-medium capitalize">{user.role}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Member Since
                    </div>
                    <p className="font-medium">
                      {new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Last Updated
                    </div>
                    <p className="font-medium">
                      {new Date(user.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {user.bio && (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Bio</div>
                    <p className="text-sm leading-relaxed">{user.bio}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common profile-related tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-4 flex-col" asChild>
                <Link href="/dashboard">
                  <User className="h-6 w-6 mb-2" />
                  <span>Dashboard</span>
                </Link>
              </Button>
              
              {user.role === "admin" && (
                <Button variant="outline" className="h-auto p-4 flex-col" asChild>
                  <Link href="/admin">
                    <Shield className="h-6 w-6 mb-2" />
                    <span>Admin Panel</span>
                  </Link>
                </Button>
              )}
              
              <Button variant="outline" className="h-auto p-4 flex-col" onClick={() => setIsEditing(true)}>
                <Edit className="h-6 w-6 mb-2" />
                <span>Edit Profile</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
