'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RichTextEditor } from './rich-text-editor'
import { renderMarkdownContent } from '@/lib/markdown-renderer'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

type ContentType = 'article' | 'story' | 'learning-path'

interface ContentFormData {
  title: string
  description: string
  type: ContentType
  content: string
  slug: string
  authorName: string
  status: 'draft' | 'published'
}

export function ContentCreator() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [formData, setFormData] = useState<ContentFormData>({
    title: '',
    description: '',
    type: 'article',
    content: '',
    slug: '',
    authorName: '',
    status: 'draft',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.content) {
      setError('Title and content are required')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const endpoint =
        formData.type === 'article'
          ? '/api/admin/articles'
          : formData.type === 'story'
          ? '/api/admin/stories'
          : '/api/admin/learning-paths'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          content: formData.content,
          slug: formData.slug,
          author_name: formData.authorName,
          status: formData.status,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create content')
      }

      setSuccess(`${formData.type} created successfully!`)
      setFormData({
        title: '',
        description: '',
        type: 'article',
        content: '',
        slug: '',
        authorName: '',
        status: 'draft',
      })

      setTimeout(() => {
        setSuccess('')
      }, 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Create Content</h2>
          <p className="text-muted-foreground mt-1">Write articles, stories, and learning paths with rich formatting</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowPreview(!showPreview)}
          className="gap-2"
        >
          {showPreview ? (
            <>
              <EyeOff className="h-4 w-4" />
              Hide Preview
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              Preview
            </>
          )}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Content title"
              className="mt-1"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Slug</label>
            <Input
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="url-slug"
              className="mt-1"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Content Type</label>
            <Select
              value={formData.type}
              onValueChange={(value: any) => setFormData({ ...formData, type: value })}
              disabled={isLoading}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="article">Article</SelectItem>
                <SelectItem value="story">Success Story</SelectItem>
                <SelectItem value="learning-path">Learning Path</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Author Name</label>
            <Input
              value={formData.authorName}
              onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
              placeholder="Your name"
              className="mt-1"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Description</label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description"
            rows={2}
            className="mt-1"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Content</label>
          <RichTextEditor
            value={formData.content}
            onChange={(content) => setFormData({ ...formData, content })}
            placeholder="Write your content here. Use **bold**, _italic_, and [link text](url) for formatting. Select text and click the highlight button to highlight."
            rows={12}
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Status:</label>
            <Select
              value={formData.status}
              onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              disabled={isLoading}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? 'Publishing...' : 'Publish Content'}
          </Button>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-500/10 p-4 text-sm text-green-700 dark:text-green-400">
            {success}
          </div>
        )}
      </form>

      {showPreview && formData.content && (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Content Preview</DialogTitle>
              <DialogDescription>{formData.type}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{formData.title}</h2>
                {formData.authorName && (
                  <p className="text-sm text-muted-foreground mt-1">By {formData.authorName}</p>
                )}
              </div>
              {formData.description && (
                <p className="text-muted-foreground italic">{formData.description}</p>
              )}
              <div
                className="prose prose-invert max-w-none space-y-4 text-foreground"
                dangerouslySetInnerHTML={{ __html: renderMarkdownContent(formData.content) }}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
