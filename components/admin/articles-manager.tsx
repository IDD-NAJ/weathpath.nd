"use client"

import { useState, useTransition } from "react"
import { Plus, Pencil, Trash2, Eye, EyeOff, ExternalLink, ImageIcon, Film } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MediaUploadField } from "@/components/admin/media-upload-field"
import { createArticle, updateArticle, deleteArticle } from "@/app/actions/articles"

interface Article {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  category: string
  author_name: string
  image_url?: string
  video_url?: string
  external_link?: string
  is_published: boolean
  created_at: string
}

const CATEGORIES = [
  "Getting Started",
  "Real Estate",
  "Investing",
  "Digital Products",
  "Online Business",
  "Mindset",
  "Travel",
  "Coding",
  "Bitcoin & Crypto",
  "Dropshipping",
  "Side Hustles",
]

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export function ArticlesManager({
  articles,
  authorId,
}: {
  articles: Article[]
  authorId: string
}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Article | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null)
  const [pending, startTransition] = useTransition()

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(article: Article) {
    setEditing(article)
    setDialogOpen(true)
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      if (editing) {
        await updateArticle(editing.id, formData)
      } else {
        await createArticle(formData, authorId)
      }
      setDialogOpen(false)
      setEditing(null)
    })
  }

  function handleDelete() {
    if (!deleteTarget) return
    startTransition(async () => {
      await deleteArticle(deleteTarget.id)
      setDeleteTarget(null)
    })
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <Badge variant="secondary">
          {articles.length} {articles.length === 1 ? "article" : "articles"}
        </Badge>
        <Button onClick={openCreate} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          New Article
        </Button>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Media</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-24"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  No articles yet. Create your first one above.
                </TableCell>
              </TableRow>
            ) : (
              articles.map((article) => (
                <TableRow key={article.id} className={pending ? "opacity-60" : ""}>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium leading-tight">{article.title}</span>
                      <span className="text-xs text-muted-foreground">/{article.slug}</span>
                      {article.external_link && (
                        <a
                          href={article.external_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary flex items-center gap-0.5 hover:underline w-fit"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Link attached
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {article.category ? (
                      <Badge variant="outline">{article.category}</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {article.image_url && (
                        <span title="Has image">
                          <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        </span>
                      )}
                      {article.video_url && (
                        <span title="Has video">
                          <Film className="h-3.5 w-3.5 text-muted-foreground" />
                        </span>
                      )}
                      {!article.image_url && !article.video_url && (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{article.author_name || "Unknown"}</TableCell>
                  <TableCell>
                    {article.is_published ? (
                      <Badge variant="default" className="gap-1">
                        <Eye className="h-3 w-3" /> Published
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <EyeOff className="h-3 w-3" /> Draft
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {new Date(article.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(article)}>
                        <Pencil className="h-3.5 w-3.5" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => setDeleteTarget(article)}>
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Article" : "New Article"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update article details, media, and links." : "Write a new educational article with optional media and links."}
            </DialogDescription>
          </DialogHeader>
          <form action={handleSubmit}>
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* Content Tab */}
              <TabsContent value="content" className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={editing?.title ?? ""}
                    required
                    onChange={(e) => {
                      if (!editing) {
                        const slugEl = document.getElementById("slug") as HTMLInputElement
                        if (slugEl) slugEl.value = generateSlug(e.target.value)
                      }
                    }}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input id="slug" name="slug" defaultValue={editing?.slug ?? ""} required />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea id="excerpt" name="excerpt" rows={2} defaultValue={editing?.excerpt ?? ""} placeholder="Brief summary shown in listings…" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="content">Body Content</Label>
                  <Textarea id="content" name="content" rows={10} defaultValue={editing?.content ?? ""} placeholder="Full article body…" className="font-mono text-xs" />
                </div>
              </TabsContent>

              {/* Media Tab */}
              <TabsContent value="media" className="flex flex-col gap-6">
                <MediaUploadField
                  label="Cover Image"
                  type="image"
                  urlFieldName="image_url"
                  defaultUrl={editing?.image_url ?? ""}
                />
                <MediaUploadField
                  label="Video (optional)"
                  type="video"
                  urlFieldName="video_url"
                  defaultUrl={editing?.video_url ?? ""}
                />
                <div className="flex flex-col gap-2">
                  <Label htmlFor="external_link">
                    External Link
                    <span className="ml-1.5 text-xs font-normal text-muted-foreground">(clicking this article routes users here)</span>
                  </Label>
                  <Input
                    id="external_link"
                    name="external_link"
                    type="url"
                    defaultValue={editing?.external_link ?? ""}
                    placeholder="https://example.com/full-article"
                  />
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" defaultValue={editing?.category ?? ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    id="is_published"
                    name="is_published"
                    value="true"
                    defaultChecked={editing?.is_published ?? false}
                  />
                  <Label htmlFor="is_published">Publish immediately</Label>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={pending}>
                {editing ? "Save Changes" : "Create Article"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Article</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.title}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
