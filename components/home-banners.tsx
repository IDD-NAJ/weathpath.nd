'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Banner {
  id: number
  title: string
  content: string
  type: 'announcement' | 'campaign' | 'promotion'
  start_date: string | null
  end_date: string | null
  is_active: boolean
}

export function HomeBanners() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [dismissed, setDismissed] = useState<Set<number>>(new Set())

  useEffect(() => {
    // Load dismissed banners from localStorage
    const storedDismissed = localStorage.getItem('dismissedBanners')
    if (storedDismissed) {
      setDismissed(new Set(JSON.parse(storedDismissed)))
    }

    // Fetch active banners
    const fetchBanners = async () => {
      try {
        const res = await fetch('/api/admin/banners')
        if (res.ok) {
          const data = await res.json()
          const now = new Date()
          const active = data.filter((banner: Banner) => {
            if (!banner.is_active) return false
            if (banner.start_date && new Date(banner.start_date) > now) return false
            if (banner.end_date && new Date(banner.end_date) < now) return false
            return true
          })
          setBanners(active)
        }
      } catch (error) {
        console.error('[v0] Error fetching banners:', error)
      }
    }

    fetchBanners()
  }, [])

  const handleDismiss = (id: number) => {
    const newDismissed = new Set(dismissed)
    newDismissed.add(id)
    setDismissed(newDismissed)
    localStorage.setItem('dismissedBanners', JSON.stringify([...newDismissed]))
    setBanners(banners.filter((b) => b.id !== id))
  }

  if (banners.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      {banners.map((banner) => (
        <div
          key={banner.id}
          className={`relative rounded-lg p-4 flex items-start justify-between gap-4 ${
            banner.type === 'announcement'
              ? 'bg-blue-500/10 border border-blue-500/20'
              : banner.type === 'campaign'
              ? 'bg-purple-500/10 border border-purple-500/20'
              : 'bg-green-500/10 border border-green-500/20'
          }`}
        >
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{banner.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{banner.content}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDismiss(banner.id)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}
