'use client'

import { useState, useEffect } from 'react'
import { Heart, Bookmark, Trash2, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'

interface SavedItem {
  id: number
  item_id: number
  item_type: 'course' | 'article'
  list_type: 'favorite' | 'wishlist'
  item_title: string
  item_slug: string
  created_at: string
}

export function SavedItemsSection() {
  const [favorites, setFavorites] = useState<SavedItem[]>([])
  const [wishlist, setWishlist] = useState<SavedItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSavedItems()
  }, [])

  const loadSavedItems = async () => {
    try {
      const res = await fetch('/api/favorites')
      if (res.ok) {
        const data = await res.json()
        setFavorites(data.filter((item: SavedItem) => item.list_type === 'favorite'))
        setWishlist(data.filter((item: SavedItem) => item.list_type === 'wishlist'))
      }
    } catch (error) {
      console.error('[v0] Error loading saved items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (id: number, listType: string) => {
    try {
      const res = await fetch('/api/favorites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (res.ok) {
        if (listType === 'favorite') {
          setFavorites(favorites.filter((item) => item.id !== id))
        } else {
          setWishlist(wishlist.filter((item) => item.id !== id))
        }
      }
    } catch (error) {
      console.error('[v0] Error removing item:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bookmark className="h-5 w-5" />
          Saved Items
        </CardTitle>
        <CardDescription>Your favorite courses and articles</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="favorites">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="favorites">
              Favorites ({favorites.length})
            </TabsTrigger>
            <TabsTrigger value="wishlist">
              Wishlist ({wishlist.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="favorites" className="space-y-3">
            {favorites.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-6">
                No favorites yet. Add courses or articles to your favorites.
              </p>
            ) : (
              favorites.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.item_title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.item_type === 'course' ? 'Course' : 'Article'} • {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Link
                      href={
                        item.item_type === 'course'
                          ? `/courses/${item.item_slug}`
                          : `/articles/${item.item_slug}`
                      }
                      target="_blank"
                    >
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(item.id, 'favorite')}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="wishlist" className="space-y-3">
            {wishlist.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-6">
                No items in wishlist. Add courses or articles to your wishlist for later.
              </p>
            ) : (
              wishlist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.item_title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.item_type === 'course' ? 'Course' : 'Article'} • {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Link
                      href={
                        item.item_type === 'course'
                          ? `/courses/${item.item_slug}`
                          : `/articles/${item.item_slug}`
                      }
                      target="_blank"
                    >
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(item.id, 'wishlist')}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
