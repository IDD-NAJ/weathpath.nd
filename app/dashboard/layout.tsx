import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import Link from "next/link"
import {
  TrendingUp,
  Shield,
  Edit,
  LayoutDashboard,
  BookOpen,
  Bookmark,
  Trophy,
  Bell,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogoutButton } from "@/components/auth/logout-button"
import { ThemeToggle } from "@/components/theme-toggle"

const sideNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Learning Paths", href: "/#learn", icon: BookOpen },
  { label: "Bookmarks", href: "/dashboard#bookmarks", icon: Bookmark },
  { label: "Achievements", href: "/dashboard#achievements", icon: Trophy },
  { label: "Notifications", href: "/dashboard#notifications", icon: Bell },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (user.role === "admin") redirect("/admin")

  const initials = user.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="min-h-screen bg-background">
      {/* Top header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-2 sm:gap-4 sm:px-6 sm:py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0" aria-label="WealthPath home">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary transition-transform group-hover:scale-105">
              <TrendingUp className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="hidden text-lg font-bold tracking-tight text-foreground sm:inline">
              Wealth<span className="text-primary">Path</span>
            </span>
          </Link>

          {/* Breadcrumb hint - hidden on mobile */}
          <div className="hidden items-center gap-1.5 text-sm text-muted-foreground lg:flex">
            <span className="truncate">My Dashboard</span>
            <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="font-medium text-foreground truncate">Overview</span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            {user.role === "admin" && (
              <Button variant="outline" size="sm" asChild className="gap-1.5 rounded-xl">
                <Link href="/admin">
                  <Shield className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              </Button>
            )}
            <Button variant="ghost" size="sm" asChild className="gap-1.5 rounded-xl">
              <Link href="/profile">
                <Edit className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Profile</span>
              </Link>
            </Button>
            {/* Avatar + name */}
            <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-2 py-1 sm:gap-2.5 sm:px-3 sm:py-1.5">
              <Avatar className="h-7 w-7 flex-shrink-0">
                <AvatarImage src={user.profile_photo_url || ""} alt={user.name} />
                <AvatarFallback className="text-[11px] font-semibold bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block min-w-0">
                <p className="text-xs font-medium text-foreground leading-none truncate">{user.name}</p>
                <Badge variant="secondary" className="mt-0.5 px-1 py-0 text-[9px] capitalize h-auto">
                  {user.role}
                </Badge>
              </div>
            </div>
            <LogoutButton variant="ghost" size="sm" />
          </div>
        </nav>
      </header>

      {/* Page content */}
      <main className="mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  )
}
