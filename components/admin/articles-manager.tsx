"use client"

import { useState, useTransition } from "react"
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react"
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
import { createArticle, updateArticle, deleteArticle } from "@/app/actions/articles"

interface Article {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  category: string
  author_name: string
  is_published: boolean
  created_at: string
}

const categories = [
  "Getting Started",
  "Real Estate",
  "Investing",
  "Digital Products",
  "Online Business",
  "Mindset",
]

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

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
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

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-24">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                  No articles yet. Write your first one above.
                </TableCell>
              </TableRow>
            ) : (
              articles.map((article) => (
                <TableRow key={article.id} className={pending ? "opacity-60" : ""}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{article.title}</span>
                      <span className="text-xs text-muted-foreground">/{article.slug}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {article.category ? (
                      <Badge variant="outline">{article.category}</Badge>
                    ) : (
                      <span className="text-muted-foreground">--</span>
                    )}
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
                  <TableCell className="text-muted-foreground">
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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Article" : "New Article"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update article details." : "Write a new educational article."}
            </DialogDescription>
          </DialogHeader>
          <form action={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                defaultValue={editing?.title || ""}
                required
                onChange={(e) => {
                  if (!editing) {
                    const slugInput = document.getElementById("slug") as HTMLInputElement
                    if (slugInput) slugInput.value = generateSlug(e.target.value)
                  }
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input id="slug" name="slug" defaultValue={editing?.slug || ""} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea id="excerpt" name="excerpt" rows={2} defaultValue={editing?.excerpt || ""} placeholder="Brief summary..." />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="content">Content</Label>
              <Textarea id="content" name="content" rows={8} defaultValue={editing?.content || ""} placeholder="Article body..." />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue={editing?.category || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Switch id="is_published" name="is_published" value="true" defaultChecked={editing?.is_published ?? false} />
              <Label htmlFor="is_published">Publish immediately</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
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
              Are you sure you want to delete <strong>{deleteTarget?.title}</strong>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
