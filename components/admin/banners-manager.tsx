'use client'

import { useState, useEffect } from 'react'
import { Trash2, Plus, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Banner {
  id: number
  title: string
  content: string
  type: 'announcement' | 'campaign' | 'promotion'
  start_date: string | null
  end_date: string | null
  is_active: boolean
  created_at: string
  updated_at?: string
}

export function BannersManager() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'announcement' as const,
    startDate: '',
    endDate: '',
    isActive: true,
  })

  useEffect(() => {
    loadBanners()
  }, [])

  const loadBanners = async () => {
    try {
      const res = await fetch('/api/admin/banners')
      if (res.ok) {
        const data = await res.json()
        setBanners(data)
      }
    } catch (error) {
      console.error('[v0] Error loading banners:', error)
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/admin/banners/${editingId}` : '/api/admin/banners'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
        }),
      })

      if (res.ok) {
        await loadBanners()
        setShowDialog(false)
        setEditingId(null)
        setFormData({
          title: '',
          content: '',
          type: 'announcement',
          startDate: '',
          endDate: '',
          isActive: true,
        })
      }
    } catch (error) {
      console.error('[v0] Error saving banner:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (banner: Banner) => {
    setEditingId(banner.id)
    setFormData({
      title: banner.title,
      content: banner.content,
      type: banner.type as any,
      startDate: banner.start_date ? banner.start_date.split('T')[0] : '',
      endDate: banner.end_date ? banner.end_date.split('T')[0] : '',
      isActive: banner.is_active,
    })
    setShowDialog(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this banner?')) {
      try {
        const res = await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' })
        if (res.ok) {
          await loadBanners()
        }
      } catch (error) {
        console.error('[v0] Error deleting banner:', error)
      }
    }
  }

  const openNewDialog = () => {
    setEditingId(null)
    setFormData({
      title: '',
      content: '',
      type: 'announcement',
      startDate: '',
      endDate: '',
      isActive: true,
    })
    setShowDialog(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Banners & Announcements</h3>
        <Button onClick={openNewDialog} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Banner
        </Button>
      </div>

      {banners.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          <p>No banners yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-2 border rounded-lg divide-y">
          {banners.map((banner) => (
            <div key={banner.id} className="p-4 flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{banner.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded ${
                    banner.is_active
                      ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                      : 'bg-gray-500/20 text-gray-700 dark:text-gray-400'
                  }`}>
                    {banner.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-700 dark:text-blue-400">
                    {banner.type}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{banner.content}</p>
                <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                  {banner.start_date && (
                    <span>Start: {new Date(banner.start_date).toLocaleDateString()}</span>
                  )}
                  {banner.end_date && (
                    <span>End: {new Date(banner.end_date).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleEdit(banner)}
                  variant="outline"
                  size="sm"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => handleDelete(banner.id)}
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Banner' : 'Create Banner'}</DialogTitle>
            <DialogDescription>
              Create or edit a banner for announcements and campaigns
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Banner title"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Content</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Banner content"
                rows={4}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="campaign">Campaign</SelectItem>
                    <SelectItem value="promotion">Promotion</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mt-1">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4"
                  />
                  Active
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Date (Optional)</label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">End Date (Optional)</label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading || !formData.title || !formData.content}>
                {loading ? 'Saving...' : 'Save Banner'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
