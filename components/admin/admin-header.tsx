"use client"

import { usePathname } from "next/navigation"
import { LogOut, User, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { LogoutButton } from "@/components/auth/logout-button"
import Link from "next/link"

const pageTitles: Record<string, string> = {
  "/admin": "Overview",
  "/admin/users": "User Management",
  "/admin/learning-paths": "Learning Paths",
  "/admin/articles": "Articles",
  "/admin/stories": "Success Stories",
  "/admin/settings": "Settings",
}

export function AdminHeader({ userName, profilePhotoUrl }: { userName: string; profilePhotoUrl?: string | null }) {
  const pathname = usePathname()
  const title = pageTitles[pathname] || "Admin"

  return (
    <header className="flex h-14 items-center gap-3 border-b border-border bg-card px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-5" />
      <h1 className="text-sm font-semibold text-foreground">{title}</h1>
      <div className="ml-auto flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={profilePhotoUrl || ''} alt="Profile" />
            <AvatarFallback className="text-xs">
              {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium text-foreground sm:inline">
            {userName}
          </span>
          <Badge variant="secondary" className="text-[10px]">
            Admin
          </Badge>
        </div>
        <Button variant="outline" size="sm" asChild className="gap-1.5">
          <Link href="/profile">
            <Edit className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Profile</span>
          </Link>
        </Button>
        <LogoutButton variant="outline" size="sm" />
      </div>
    </header>
  )
}
