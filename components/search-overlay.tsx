"use client"

import { useState, useEffect, useRef, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Search, X, ArrowRight, BookOpen, FileText, Star, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SearchResult {
  id: string
  type: "story" | "path" | "article"
  title: string
  description: string
  href: string
}

export function SearchButton() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        onClick={() => setOpen(true)}
        aria-label="Search the site"
      >
        <Search className="h-4 w-4" />
      </Button>
      {open && <SearchOverlay onClose={() => setOpen(false)} />}
    </>
  )
}

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, startSearch] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onClose])

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }

    const timeout = setTimeout(() => {
      startSearch(async () => {
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
          if (res.ok) {
            const data = await res.json()
            setResults(data.results)
          }
        } catch {
          setResults([])
        }
      })
    }, 300)

    return () => clearTimeout(timeout)
  }, [query])

  function navigateTo(href: string) {
    onClose()
    router.push(href)
  }

  const iconMap = {
    story: Star,
    path: BookOpen,
    article: FileText,
  }

  const labelMap = {
    story: "Story",
    path: "Learning Path",
    article: "Article",
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div className="relative z-10 mx-4 w-full max-w-lg animate-in slide-in-from-top-4 fade-in duration-200">
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
          {/* Search input */}
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search stories, learning paths, articles..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-0 bg-transparent p-0 text-base shadow-none placeholder:text-muted-foreground/60 focus-visible:ring-0"
            />
            {searching && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />}
            <button
              onClick={onClose}
              className="flex h-6 shrink-0 items-center rounded border border-border bg-secondary px-1.5 text-[10px] font-medium text-muted-foreground"
            >
              ESC
            </button>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto">
            {query.trim().length < 2 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                Start typing to search across all content
              </div>
            ) : results.length === 0 && !searching ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No results found for &ldquo;{query}&rdquo;
              </div>
            ) : (
              <ul className="py-2" role="listbox">
                {results.map((result) => {
                  const Icon = iconMap[result.type]
                  return (
                    <li key={`${result.type}-${result.id}`}>
                      <button
                        onClick={() => navigateTo(result.href)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary"
                        role="option"
                        aria-selected={false}
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="truncate text-sm font-medium text-foreground">
                            {result.title}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {labelMap[result.type]} &middot; {result.description}
                          </p>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
