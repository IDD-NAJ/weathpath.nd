"use client"

import { useState, useTransition } from "react"
import { Plus, Pencil, Trash2, Eye, EyeOff, GripVertical } from "lucide-react"
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
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { createStory, updateStory, deleteStory } from "@/app/actions/stories"

interface Story {
  id: string
  name: string
  title: string
  quote: string
  income: string
  strategy: string
  avatar_url: string
  display_order: number
  is_published: boolean
  created_at: string
}

export function StoriesManager({ stories }: { stories: Story[] }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Story | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Story | null>(null)
  const [pending, startTransition] = useTransition()

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(story: Story) {
    setEditing(story)
    setDialogOpen(true)
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      if (editing) {
        await updateStory(editing.id, formData)
      } else {
        await createStory(formData)
      }
      setDialogOpen(false)
      setEditing(null)
    })
  }

  function handleDelete() {
    if (!deleteTarget) return
    startTransition(async () => {
      await deleteStory(deleteTarget.id)
      setDeleteTarget(null)
    })
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <Badge variant="secondary">
          {stories.length} {stories.length === 1 ? "story" : "stories"}
        </Badge>
        <Button onClick={openCreate} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add Story
        </Button>
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <span className="sr-only">Order</span>
              </TableHead>
              <TableHead>Person</TableHead>
              <TableHead>Strategy</TableHead>
              <TableHead>Income</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                  No success stories yet. Add your first one above.
                </TableCell>
              </TableRow>
            ) : (
              stories.map((story) => (
                <TableRow key={story.id} className={pending ? "opacity-60" : ""}>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <span className="ml-1 text-xs text-muted-foreground">{story.display_order}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{story.name}</span>
                      <span className="text-xs text-muted-foreground">{story.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{story.strategy || "N/A"}</TableCell>
                  <TableCell className="font-medium text-primary">{story.income || "N/A"}</TableCell>
                  <TableCell>
                    {story.is_published ? (
                      <Badge variant="default" className="gap-1">
                        <Eye className="h-3 w-3" /> Published
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <EyeOff className="h-3 w-3" /> Draft
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(story)}>
                        <Pencil className="h-3.5 w-3.5" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => setDeleteTarget(story)}>
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
            <DialogTitle>{editing ? "Edit Story" : "Add Success Story"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update this success story." : "Share a new success story from the community."}
            </DialogDescription>
          </DialogHeader>
          <form action={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={editing?.name || ""} required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Title / Role</Label>
                <Input id="title" name="title" defaultValue={editing?.title || ""} required placeholder="e.g., Real Estate Investor" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="quote">Quote / Testimonial</Label>
              <Textarea id="quote" name="quote" rows={3} defaultValue={editing?.quote || ""} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="income">Monthly Income</Label>
                <Input id="income" name="income" defaultValue={editing?.income || ""} placeholder="e.g., $2,500/mo" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="strategy">Strategy</Label>
                <Input id="strategy" name="strategy" defaultValue={editing?.strategy || ""} placeholder="e.g., Dividend Investing" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="avatar_url">Avatar URL</Label>
                <Input id="avatar_url" name="avatar_url" defaultValue={editing?.avatar_url || ""} placeholder="https://..." />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="display_order">Display Order</Label>
                <Input id="display_order" name="display_order" type="number" min={0} defaultValue={editing?.display_order ?? 0} />
              </div>
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
                {editing ? "Save Changes" : "Add Story"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Story</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the story from <strong>{deleteTarget?.name}</strong>? This cannot be undone.
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
