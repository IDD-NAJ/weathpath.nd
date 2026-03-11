import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import Link from "next/link"
import { TrendingUp, LogOut, Shield, User, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogoutButton } from "@/components/auth/logout-button"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <TrendingUp className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              WealthPath
            </span>
          </Link>
          <div className="flex items-center gap-3">
            {user.role === "admin" && (
              <Button variant="outline" size="sm" asChild className="gap-1.5">
                <Link href="/admin">
                  <Shield className="h-3.5 w-3.5" />
                  Admin
                </Link>
              </Button>
            )}
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.profile_photo_url || ''} alt="Profile" />
                <AvatarFallback className="text-xs">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <span className="text-sm font-medium text-foreground">
                  {user.name}
                </span>
                <Badge variant="secondary" className="ml-2 text-[10px] capitalize">
                  {user.role}
                </Badge>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild className="gap-1.5">
              <Link href="/profile">
                <Edit className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Profile</span>
              </Link>
            </Button>
            <LogoutButton variant="ghost" size="sm" />
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  )
}
