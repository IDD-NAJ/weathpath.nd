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
import {
  createLearningPath, updateLearningPath, deleteLearningPath, toggleLearningPathPublished,
} from "@/app/actions/learning-paths"

interface LearningPath {
  id: string
  title: string
  description: string
  level: string
  duration: string
  module_count: number
  topics: string[]
  is_published: boolean
  created_at: string
}

export function LearningPathsManager({ paths }: { paths: LearningPath[] }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<LearningPath | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<LearningPath | null>(null)
  const [pending, startTransition] = useTransition()

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(path: LearningPath) {
    setEditing(path)
    setDialogOpen(true)
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      if (editing) {
        await updateLearningPath(editing.id, formData)
      } else {
        await createLearningPath(formData)
      }
      setDialogOpen(false)
      setEditing(null)
    })
  }

  function handleDelete() {
    if (!deleteTarget) return
    startTransition(async () => {
      await deleteLearningPath(deleteTarget.id)
      setDeleteTarget(null)
    })
  }

  function handleTogglePublish(id: string, published: boolean) {
    startTransition(async () => {
      await toggleLearningPathPublished(id, published)
    })
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <Badge variant="secondary">
          {paths.length} {paths.length === 1 ? "path" : "paths"}
        </Badge>
        <Button onClick={openCreate} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add Path
        </Button>
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Modules</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paths.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                  No learning paths yet. Create your first one above.
                </TableCell>
              </TableRow>
            ) : (
              paths.map((path) => (
                <TableRow key={path.id} className={pending ? "opacity-60" : ""}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{path.title}</span>
                      {path.topics?.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {path.topics.slice(0, 3).join(", ")}
                          {path.topics.length > 3 && ` +${path.topics.length - 3}`}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {path.level}
                    </Badge>
                  </TableCell>
                  <TableCell>{path.module_count}</TableCell>
                  <TableCell className="text-muted-foreground">{path.duration || "N/A"}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleTogglePublish(path.id, !path.is_published)}
                      className="flex items-center gap-1 text-xs"
                    >
                      {path.is_published ? (
                        <Badge variant="default" className="cursor-pointer gap-1">
                          <Eye className="h-3 w-3" /> Published
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="cursor-pointer gap-1">
                          <EyeOff className="h-3 w-3" /> Draft
                        </Badge>
                      )}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(path)}>
                        <Pencil className="h-3.5 w-3.5" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => setDeleteTarget(path)}>
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
            <DialogTitle>{editing ? "Edit Learning Path" : "Create Learning Path"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update the details of this learning path." : "Fill in the details for a new learning path."}
            </DialogDescription>
          </DialogHeader>
          <form action={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={editing?.title || ""} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={3} defaultValue={editing?.description || ""} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="level">Level</Label>
                <Select name="level" defaultValue={editing?.level || "beginner"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="duration">Duration</Label>
                <Input id="duration" name="duration" placeholder="e.g., 4 weeks" defaultValue={editing?.duration || ""} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="module_count">Module Count</Label>
              <Input id="module_count" name="module_count" type="number" min={0} defaultValue={editing?.module_count ?? 0} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="topics">Topics (comma-separated)</Label>
              <Input id="topics" name="topics" placeholder="Stocks, Bonds, Index Funds" defaultValue={editing?.topics?.join(", ") || ""} />
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
                {editing ? "Save Changes" : "Create Path"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Learning Path</AlertDialogTitle>
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
