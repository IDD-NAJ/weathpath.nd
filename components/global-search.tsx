'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2, BookOpen, FileText, Star, TrendingUp } from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

export function GlobalSearch() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any>({
    courses: [],
    articles: [],
    stories: [],
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  useEffect(() => {
    if (!query) {
      setResults({ courses: [], articles: [], stories: [] })
      return
    }

    const search = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        if (response.ok) {
          const data = await response.json()
          setResults(data)
        }
      } catch (error) {
        console.error('[v0] Search error:', error)
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(search, 300)
    return () => clearTimeout(debounce)
  }, [query])

  const handleSelect = (type: string, slug: string) => {
    setOpen(false)
    setQuery('')
    const routes: Record<string, string> = {
      course: `/courses/${slug}`,
      article: `/articles/${slug}`,
      story: `/stories/${slug}`,
    }
    router.push(routes[type] || '/')
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group relative hidden md:inline-flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground transition-all hover:bg-muted hover:border-primary/30"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden lg:inline">Search...</span>
        <span className="ml-auto hidden lg:inline text-[10px] font-semibold text-muted-foreground group-hover:text-primary transition-colors">
          ⌘K
        </span>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search courses, articles, stories..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {loading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
          {!loading && !query && (
            <CommandEmpty>Start typing to search...</CommandEmpty>
          )}
          {!loading && query && results.courses.length === 0 && results.articles.length === 0 && results.stories.length === 0 && (
            <CommandEmpty>No results found.</CommandEmpty>
          )}

          {results.courses.length > 0 && (
            <CommandGroup heading="Courses">
              {results.courses.map((course: any) => (
                <CommandItem
                  key={course.id}
                  onSelect={() => handleSelect('course', course.slug)}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  <div>
                    <div className="font-medium">{course.title}</div>
                    <div className="text-xs text-muted-foreground">{course.category}</div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results.articles.length > 0 && (
            <CommandGroup heading="Articles">
              {results.articles.map((article: any) => (
                <CommandItem
                  key={article.id}
                  onSelect={() => handleSelect('article', article.slug)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <div>
                    <div className="font-medium">{article.title}</div>
                    <div className="text-xs text-muted-foreground">{article.category}</div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results.stories.length > 0 && (
            <CommandGroup heading="Success Stories">
              {results.stories.map((story: any) => (
                <CommandItem
                  key={story.id}
                  onSelect={() => handleSelect('story', story.id)}
                >
                  <Star className="mr-2 h-4 w-4" />
                  <div>
                    <div className="font-medium">{story.name}</div>
                    <div className="text-xs text-muted-foreground">{story.title}</div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
