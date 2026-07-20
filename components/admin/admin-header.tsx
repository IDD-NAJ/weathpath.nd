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
    <header className="flex h-14 items-center gap-2 border-b border-border bg-card px-3 sm:gap-3 sm:px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-5" />
      <h1 className="truncate text-sm font-semibold text-foreground md:text-base">{title}</h1>
      <div className="ml-auto flex items-center gap-1 sm:gap-3">
        <div className="hidden items-center gap-2 sm:flex">
          <Avatar className="h-7 w-7">
            <AvatarImage src={profilePhotoUrl || ''} alt="Profile" />
            <AvatarFallback className="text-xs">
              {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium text-foreground lg:inline">
            {userName}
          </span>
          <Badge variant="secondary" className="text-[10px]">
            Admin
          </Badge>
        </div>
        <Button variant="outline" size="sm" asChild className="hidden gap-1.5 sm:flex">
          <Link href="/profile">
            <Edit className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Profile</span>
          </Link>
        </Button>
        <LogoutButton variant="outline" size="sm" />
      </div>
    </header>
  )
}
