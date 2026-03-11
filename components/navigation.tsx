"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, TrendingUp, User, LogOut, Shield, LayoutDashboard, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { logoutAction } from "@/app/actions/auth"
import { SearchButton } from "@/components/search-overlay"
import { ThemeToggle } from "@/components/theme-toggle"

const navLinks = [
  { label: "Learn", href: "/#learn" },
  { label: "Tools", href: "/#tools" },
  { label: "Stories", href: "/stories" },
  { label: "Articles", href: "/articles" },
  { label: "Resources", href: "/#resources" },
]

interface NavigationProps {
  user?: {
    name: string
    email: string
    role: string
  } | null
}

export function Navigation({ user }: NavigationProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2" aria-label="WealthPath home">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <TrendingUp className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            WealthPath
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-8 md:flex" role="list">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-1 md:flex">
          <SearchButton />
          <ThemeToggle />
          <div className="ml-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="max-w-[120px] truncate text-sm">{user.name}</span>
                    {user.role === "admin" && (
                      <Badge variant="default" className="px-1.5 py-0 text-[9px]">
                        Admin
                      </Badge>
                    )}
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <form action={logoutAction} className="w-full">
                      <button type="submit" className="flex w-full items-center">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/signup">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile right side */}
        <div className="flex items-center gap-1 md:hidden">
          <SearchButton />
          <ThemeToggle />
          <button
            className="flex items-center justify-center p-1"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-6 pb-6 md:hidden animate-in slide-in-from-top-2 fade-in duration-200">
          <ul className="flex flex-col gap-4 pt-4" role="list">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}

            {user ? (
              <>
                <li className="border-t border-border pt-4">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-base font-medium text-foreground"
                    onClick={() => setMobileOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </li>
                {user.role === "admin" && (
                  <li>
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 text-base font-medium text-foreground"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Shield className="h-4 w-4" />
                      Admin Panel
                    </Link>
                  </li>
                )}
                <li>
                  <form action={logoutAction}>
                    <Button variant="outline" className="w-full" type="submit">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </form>
                </li>
              </>
            ) : (
              <>
                <li className="border-t border-border pt-4">
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/login" onClick={() => setMobileOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                </li>
                <li>
                  <Button asChild className="w-full">
                    <Link href="/signup" onClick={() => setMobileOpen(false)}>
                      Get Started
                    </Link>
                  </Button>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </header>
  )
}
