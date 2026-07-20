"use client"

import { useState, useRef } from "react"
import { Upload, Link, X, Image, Film, Loader2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface MediaUploadFieldProps {
  label: string
  type: "image" | "video"
  urlFieldName: string
  defaultUrl?: string
  onUrlChange?: (url: string) => void
  className?: string
}

export function MediaUploadField({
  label,
  type,
  urlFieldName,
  defaultUrl = "",
  onUrlChange,
  className,
}: MediaUploadFieldProps) {
  const [url, setUrl] = useState(defaultUrl)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const accept = type === "image" ? "image/*" : "video/*"
  const Icon = type === "image" ? Image : Film

  async function uploadFile(file: File) {
    setUploading(true)
    setUploadSuccess(false)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", type)
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData })
      if (!res.ok) throw new Error("Upload failed")
      const data = await res.json()
      setUrl(data.url)
      onUrlChange?.(data.url)
      setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 3000)
    } catch {
      // silent fail — user can try again
    } finally {
      setUploading(false)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) uploadFile(file)
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label>{label}</Label>

      {/* Hidden field that holds the final URL — submitted with the form */}
      <input type="hidden" name={urlFieldName} value={url} />

      <Tabs defaultValue="url">
        <TabsList className="h-8 w-full">
          <TabsTrigger value="url" className="flex-1 text-xs gap-1">
            <Link className="h-3 w-3" />
            URL
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex-1 text-xs gap-1">
            <Upload className="h-3 w-3" />
            Upload
          </TabsTrigger>
        </TabsList>

        {/* URL Tab */}
        <TabsContent value="url" className="mt-2">
          <div className="flex items-center gap-2">
            <Input
              placeholder={type === "image" ? "https://example.com/image.jpg" : "https://youtube.com/watch?v=..."}
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                onUrlChange?.(e.target.value)
              }}
              className="text-xs"
            />
            {url && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 shrink-0 text-muted-foreground"
                onClick={() => { setUrl(""); onUrlChange?.("") }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </TabsContent>

        {/* Upload Tab */}
        <TabsContent value="upload" className="mt-2">
          <div
            className={cn(
              "relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 text-center transition-colors cursor-pointer",
              dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/40",
              uploading && "pointer-events-none opacity-60"
            )}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            ) : uploadSuccess ? (
              <CheckCircle className="h-6 w-6 text-green-500" />
            ) : (
              <Icon className="h-6 w-6 text-muted-foreground" />
            )}
            <p className="text-xs text-muted-foreground">
              {uploading
                ? "Uploading…"
                : uploadSuccess
                ? "Uploaded successfully"
                : `Click or drag a ${type} file here`}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              className="sr-only"
              onChange={handleFileChange}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Preview */}
      {url && type === "image" && (
        <div className="relative overflow-hidden rounded-md border border-border bg-muted/30 h-28">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="Preview" className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
        </div>
      )}
      {url && type === "video" && (
        <p className="text-xs text-muted-foreground truncate">
          Video URL set: {url}
        </p>
      )}
    </div>
  )
}
