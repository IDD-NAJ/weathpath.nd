"use client"

import { useUser, useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { User, Mail, LogOut, Lock, Bell, Eye } from "lucide-react"
import { useState } from "react"

export default function AccountPage() {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("profile")
  const [loading, setLoading] = useState(false)

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  if (!user) {
    router.push("/login")
    return null
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      <main className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-bold text-foreground">Account Settings</h1>
            <p className="mt-2 text-muted-foreground">Manage your profile and preferences</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <nav className="space-y-2">
                {[
                  { id: "profile", label: "Profile", icon: User },
                  { id: "security", label: "Security", icon: Lock },
                  { id: "notifications", label: "Notifications", icon: Bell },
                  { id: "privacy", label: "Privacy", icon: Eye },
                ].map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-left ${
                        activeTab === tab.id
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  )
                })}
              </nav>

              <Button
                onClick={handleSignOut}
                variant="destructive"
                className="w-full mt-6 rounded-lg"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>

            {/* Content */}
            <div className="md:col-span-3">
              <div className="bg-card border border-border rounded-xl p-6">
                {/* Profile Tab */}
                {activeTab === "profile" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-4">Profile Information</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">First Name</label>
                          <Input
                            type="text"
                            value={user.firstName || ""}
                            disabled
                            className="bg-muted rounded-lg"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Last Name</label>
                          <Input
                            type="text"
                            value={user.lastName || ""}
                            disabled
                            className="bg-muted rounded-lg"
                          />
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <label className="text-sm font-medium text-foreground flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </label>
                        <Input
                          type="email"
                          value={user.emailAddresses[0]?.emailAddress || ""}
                          disabled
                          className="bg-muted rounded-lg"
                        />
                      </div>
                    </div>

                    <Button className="rounded-lg" disabled={true}>
                      Edit Profile
                    </Button>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === "security" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-4">Security Settings</h2>
                      
                      <div className="space-y-4">
                        <div className="border border-border rounded-lg p-4">
                          <h3 className="font-medium text-foreground mb-2">Password</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Change your password regularly to keep your account secure
                          </p>
                          <Button variant="outline" className="rounded-lg">
                            Change Password
                          </Button>
                        </div>

                        <div className="border border-border rounded-lg p-4">
                          <h3 className="font-medium text-foreground mb-2">Two-Factor Authentication</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Add an extra layer of security to your account
                          </p>
                          <Button variant="outline" className="rounded-lg">
                            Enable 2FA
                          </Button>
                        </div>

                        <div className="border border-border rounded-lg p-4">
                          <h3 className="font-medium text-foreground mb-2">Active Sessions</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Manage devices and sessions
                          </p>
                          <Button variant="outline" className="rounded-lg">
                            View Sessions
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === "notifications" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-4">Notification Preferences</h2>
                      
                      <div className="space-y-4">
                        {[
                          { label: "Course Updates", description: "Get notified about new lessons and course content" },
                          { label: "Marketing Emails", description: "Receive updates about new features and promotions" },
                          { label: "Account Activity", description: "Get alerts for important account changes" },
                          { label: "Weekly Summary", description: "Receive a weekly digest of your activity" },
                        ].map((notif) => (
                          <div key={notif.label} className="flex items-center justify-between border border-border rounded-lg p-4">
                            <div>
                              <p className="font-medium text-foreground">{notif.label}</p>
                              <p className="text-sm text-muted-foreground">{notif.description}</p>
                            </div>
                            <input type="checkbox" defaultChecked className="w-5 h-5" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Privacy Tab */}
                {activeTab === "privacy" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-4">Privacy Settings</h2>
                      
                      <div className="space-y-4">
                        {[
                          { label: "Profile Visibility", description: "Control who can see your profile" },
                          { label: "Course Progress Sharing", description: "Allow others to see your course progress" },
                          { label: "Achievement Badges", description: "Display your earned certificates publicly" },
                          { label: "Data Collection", description: "Help us improve by sharing usage data" },
                        ].map((privacy) => (
                          <div key={privacy.label} className="flex items-center justify-between border border-border rounded-lg p-4">
                            <div>
                              <p className="font-medium text-foreground">{privacy.label}</p>
                              <p className="text-sm text-muted-foreground">{privacy.description}</p>
                            </div>
                            <input type="checkbox" defaultChecked className="w-5 h-5" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
