"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Menu, X, User, LogOut, Shield, LayoutDashboard,
  ChevronDown, Plane, Code2, Bitcoin, ShoppingBag, BarChart3, Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { logoutAction } from "@/app/actions/auth"
import { SearchButton } from "@/components/search-overlay"
import { GlobalSearch } from "@/components/global-search"
import { ThemeToggle } from "@/components/theme-toggle"

const topics = [
  { label: "Travel Content", href: "/topics/travel", icon: Plane, color: "text-topic-travel", description: "Earn while exploring the world" },
  { label: "Coding & Tech", href: "/topics/coding", icon: Code2, color: "text-topic-coding", description: "Build digital products & SaaS" },
  { label: "Bitcoin & Crypto", href: "/topics/bitcoin", icon: Bitcoin, color: "text-topic-bitcoin", description: "Navigate digital assets safely" },
  { label: "Dropshipping", href: "/topics/dropshipping", icon: ShoppingBag, color: "text-topic-dropship", description: "Launch a product business" },
  { label: "Investing", href: "/topics/investing", icon: BarChart3, color: "text-topic-invest", description: "Grow long-term wealth" },
  { label: "Side Hustles", href: "/topics/side-hustles", icon: Zap, color: "text-topic-hustle", description: "Quick wins and recurring income" },
]

const navLinks = [
  { label: "Courses", href: "/courses" },
  { label: "Articles", href: "/articles" },
  { label: "Stories", href: "/stories" },
]

interface NavigationProps {
  user?: { name: string; email: string; role: string } | null
}

export function Navigation({ user }: NavigationProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [topicsOpen, setTopicsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border"
          : "bg-background/80 backdrop-blur-sm border-b border-border"
      )}
    >
      <div className="h-1 w-full bg-primary" aria-hidden="true" />
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3" aria-label="Main navigation">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group" aria-label="WealthPath home">
          <span className="font-serif text-2xl tracking-tight text-primary">
            WealthPath
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {/* Topics mega-dropdown */}
          <div className="relative" onMouseLeave={() => setTopicsOpen(false)}>
            <button
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                topicsOpen ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
              onMouseEnter={() => setTopicsOpen(true)}
              onClick={() => setTopicsOpen(!topicsOpen)}
              aria-expanded={topicsOpen}
              aria-haspopup="true"
            >
              Topics
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", topicsOpen && "rotate-180")} />
            </button>

            {topicsOpen && (
              <div
                className="absolute left-0 top-full mt-1 w-[520px] rounded-sm border border-border bg-card p-4 shadow-xl shadow-foreground/5 animate-in fade-in slide-in-from-top-2 duration-150"
                onMouseEnter={() => setTopicsOpen(true)}
              >
                <p className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Explore Topics</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {topics.map((t) => (
                    <Link
                      key={t.href}
                      href={t.href}
                      className="group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-muted/70"
                      onClick={() => setTopicsOpen(false)}
                    >
                      <div className={cn("mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-background", t.color)}>
                        <t.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{t.label}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{t.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="mt-3 border-t border-border pt-3 px-1">
                  <Link href="/articles" className="text-xs font-medium text-primary hover:underline" onClick={() => setTopicsOpen(false)}>
                    Browse all articles &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop right */}
        <div className="hidden items-center gap-1.5 md:flex">
          <SearchButton />
          <ThemeToggle />
          <div className="ml-1">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 rounded-sm">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="max-w-[110px] truncate text-sm">{user.name}</span>
                    {user.role === "admin" && (
                      <Badge variant="default" className="px-1.5 py-0 text-[9px]">Admin</Badge>
                    )}
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-sm">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        <Shield className="mr-2 h-4 w-4" /> Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <form action={logoutAction} className="w-full">
                      <button type="submit" className="flex w-full items-center">
                        <LogOut className="mr-2 h-4 w-4" /> Sign Out
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild className="rounded-sm">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild className="rounded-sm">
                  <Link href="/signup">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile right */}
        <div className="flex items-center gap-1 md:hidden">
          <GlobalSearch />
          <SearchButton />
          <ThemeToggle />
          <button
            className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-muted transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-6 pb-8 md:hidden animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="pt-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Topics</p>
            <div className="grid grid-cols-2 gap-1.5 mb-4">
              {topics.map((t) => (
                <Link
                  key={t.href}
                  href={t.href}
                  className="flex items-center gap-2.5 rounded-lg p-2.5 hover:bg-muted transition-colors"
                >
                  <t.icon className={cn("h-4 w-4", t.color)} />
                  <span className="text-sm font-medium text-foreground">{t.label}</span>
                </Link>
              ))}
            </div>
            <div className="border-t border-border pt-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="border-t border-border pt-4 mt-2">
              {user ? (
                <div className="flex flex-col gap-2">
                  <Link href="/dashboard" className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                  {user.role === "admin" && (
                    <Link href="/admin" className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                      <Shield className="h-4 w-4" /> Admin Panel
                    </Link>
                  )}
                  <form action={logoutAction}>
                    <Button variant="outline" className="w-full mt-1" type="submit">
                      <LogOut className="mr-2 h-4 w-4" /> Sign Out
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/signup">Get Started Free</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
