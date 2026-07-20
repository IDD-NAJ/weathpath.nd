"use client"

import { useState, useTransition } from "react"
import { Plus, Pencil, Trash2, Eye, EyeOff, GripVertical, ExternalLink, ImageIcon, Film } from "lucide-react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MediaUploadField } from "@/components/admin/media-upload-field"
import { createStory, updateStory, deleteStory } from "@/app/actions/stories"

interface Story {
  id: string
  name: string
  title: string
  quote: string
  income: string
  strategy: string
  avatar_url?: string
  image_url?: string
  video_url?: string
  external_link?: string
  display_order: number
  is_published: boolean
  created_at: string
}

export function StoriesManager({ stories }: { stories: Story[] }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Story | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Story | null>(null)
  const [pending, startTransition] = useTransition()

  function openCreate() { setEditing(null); setDialogOpen(true) }
  function openEdit(s: Story) { setEditing(s); setDialogOpen(true) }

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

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"><span className="sr-only">Order</span></TableHead>
              <TableHead>Person</TableHead>
              <TableHead>Strategy</TableHead>
              <TableHead>Income</TableHead>
              <TableHead>Media</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  No success stories yet. Add your first one above.
                </TableCell>
              </TableRow>
            ) : (
              stories.map((story) => (
                <TableRow key={story.id} className={pending ? "opacity-60" : ""}>
                  <TableCell>
                    <div className="flex items-center justify-center gap-0.5">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{story.display_order}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{story.name}</span>
                      <span className="text-xs text-muted-foreground">{story.title}</span>
                      {story.external_link && (
                        <a
                          href={story.external_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary flex items-center gap-0.5 hover:underline w-fit"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Link
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{story.strategy || "—"}</TableCell>
                  <TableCell className="font-medium text-primary">{story.income || "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {(story.avatar_url || story.image_url) && <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />}
                      {story.video_url && <Film className="h-3.5 w-3.5 text-muted-foreground" />}
                      {!story.avatar_url && !story.image_url && !story.video_url && (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {story.is_published ? (
                      <Badge variant="default" className="gap-1"><Eye className="h-3 w-3" />Published</Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1"><EyeOff className="h-3 w-3" />Draft</Badge>
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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Story" : "Add Success Story"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update this success story." : "Share a community success story with optional media and links."}
            </DialogDescription>
          </DialogHeader>
          <form action={handleSubmit}>
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="info">Info</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* Info Tab */}
              <TabsContent value="info" className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input id="name" name="name" defaultValue={editing?.name ?? ""} required />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="title">Title / Role *</Label>
                    <Input id="title" name="title" defaultValue={editing?.title ?? ""} required placeholder="e.g. Real Estate Investor" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="quote">Quote / Testimonial *</Label>
                  <Textarea id="quote" name="quote" rows={4} defaultValue={editing?.quote ?? ""} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="income">Monthly Income</Label>
                    <Input id="income" name="income" defaultValue={editing?.income ?? ""} placeholder="e.g. $2,500/mo" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="strategy">Strategy</Label>
                    <Input id="strategy" name="strategy" defaultValue={editing?.strategy ?? ""} placeholder="e.g. Dividend Investing" />
                  </div>
                </div>
              </TabsContent>

              {/* Media Tab */}
              <TabsContent value="media" className="flex flex-col gap-6">
                <MediaUploadField
                  label="Avatar / Profile Photo"
                  type="image"
                  urlFieldName="avatar_url"
                  defaultUrl={editing?.avatar_url ?? ""}
                />
                <MediaUploadField
                  label="Feature Image (optional)"
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
                    <span className="ml-1.5 text-xs font-normal text-muted-foreground">(clicking this story card routes users here)</span>
                  </Label>
                  <Input
                    id="external_link"
                    name="external_link"
                    type="url"
                    defaultValue={editing?.external_link ?? ""}
                    placeholder="https://example.com/full-story"
                  />
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    name="display_order"
                    type="number"
                    min={0}
                    defaultValue={editing?.display_order ?? 0}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Switch id="is_published" name="is_published" value="true" defaultChecked={editing?.is_published ?? false} />
                  <Label htmlFor="is_published">Publish immediately</Label>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
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
