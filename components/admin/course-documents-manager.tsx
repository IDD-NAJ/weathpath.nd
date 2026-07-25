"use client"

import { useRef, useState } from "react"
import useSWR from "swr"
import { FileText, Trash2, Upload, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CourseDocument {
  id: string
  file_name: string
  file_type: string
  file_size: number
  created_at: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function CourseDocumentsManager({
  courseId,
  courseTitle,
  open,
  onClose,
}: {
  courseId: number
  courseTitle: string
  open: boolean
  onClose: () => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const { data, mutate } = useSWR<{ documents: CourseDocument[] }>(
    open ? `/api/admin/courses/${courseId}/documents` : null,
    fetcher
  )
  const documents = data?.documents || []

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch(`/api/admin/courses/${courseId}/documents`, {
        method: "POST",
        body: formData,
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Upload failed")
      }
      await mutate()
    } catch (error: any) {
      setUploadError(error.message)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  async function handleDelete(documentId: string) {
    if (!confirm("Remove this document?")) return
    try {
      await fetch(`/api/admin/courses/${courseId}/documents`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId }),
      })
      await mutate()
    } catch (error) {
      console.error("[v0] Failed to delete document:", error)
    }
  }

  function formatSize(bytes: number) {
    if (!bytes) return ""
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Course Documents
          </DialogTitle>
          <DialogDescription>
            PDFs and files delivered to buyers of &quot;{courseTitle}&quot; after payment.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Upload */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt,.csv,.epub"
              onChange={handleUpload}
              className="hidden"
              id={`doc-upload-${courseId}`}
            />
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full gap-2 rounded-sm"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload PDF or Document
                </>
              )}
            </Button>
            {uploadError && (
              <p className="mt-2 text-xs text-destructive flex items-center gap-1">
                <X className="h-3 w-3" />
                {uploadError}
              </p>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              Max 50MB. Supported: PDF, Word, Excel, PowerPoint, ZIP, TXT, CSV, EPUB.
            </p>
          </div>

          {/* Document list */}
          {documents.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-sm border border-dashed border-border py-8 text-center">
              <FileText className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No documents yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between gap-2 rounded-sm border border-border p-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="h-4 w-4 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{doc.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatSize(doc.file_size)}
                        {doc.file_size ? " · " : ""}
                        {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(doc.id)}
                    className="text-destructive hover:text-destructive shrink-0"
                    aria-label={`Delete ${doc.file_name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
