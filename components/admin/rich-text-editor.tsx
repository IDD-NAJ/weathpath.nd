'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Bold, Italic, Link, Highlighter, X } from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
}

export function RichTextEditor({ value, onChange, placeholder = 'Enter content...', rows = 6 }: RichTextEditorProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')
  const [highlightColor, setHighlightColor] = useState('#ffff00')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const applyFormatting = (before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)

    if (!selectedText) return

    const newValue =
      value.substring(0, start) +
      before +
      selectedText +
      after +
      value.substring(end)

    onChange(newValue)

    // Reset selection after formatting
    setTimeout(() => {
      textarea.selectionStart = start + before.length
      textarea.selectionEnd = start + before.length + selectedText.length
      textarea.focus()
    }, 0)
  }

  const applyBold = () => applyFormatting('**', '**')
  const applyItalic = () => applyFormatting('_', '_')

  const applyHighlight = () => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)

    if (!selectedText) return

    // Markdown-style highlight using HTML span (will be rendered in display)
    const highlighted = `<mark style="background-color: ${highlightColor}">${selectedText}</mark>`
    const newValue =
      value.substring(0, start) +
      highlighted +
      value.substring(end)

    onChange(newValue)
  }

  const applyLink = () => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = linkText || value.substring(start, end)

    if (!selectedText || !linkUrl) return

    const link = `[${selectedText}](${linkUrl})`
    const newValue =
      value.substring(0, start) +
      link +
      value.substring(end)

    onChange(newValue)
    setShowLinkDialog(false)
    setLinkUrl('')
    setLinkText('')
  }

  const handleOpenLinkDialog = () => {
    const textarea = textareaRef.current
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = value.substring(start, end)
      setLinkText(selectedText)
    }
    setShowLinkDialog(true)
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-1 flex-wrap p-2 border rounded-t-md bg-muted/30">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={applyBold}
          title="Bold (Ctrl+B)"
          className="h-8 w-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={applyItalic}
          title="Italic (Ctrl+I)"
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <div className="w-px bg-border" />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={applyHighlight}
          title="Highlight text"
          className="h-8 w-8 p-0 relative"
        >
          <Highlighter className="h-4 w-4" />
          <div
            className="absolute bottom-0.5 right-0.5 h-2 w-2 rounded-full"
            style={{ backgroundColor: highlightColor }}
          />
        </Button>
        <div className="flex items-center gap-1">
          <input
            type="color"
            value={highlightColor}
            onChange={(e) => setHighlightColor(e.target.value)}
            className="h-8 w-8 cursor-pointer border rounded"
            title="Highlight color"
          />
        </div>
        <div className="w-px bg-border" />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleOpenLinkDialog}
          title="Add link"
          className="h-8 w-8 p-0"
        >
          <Link className="h-4 w-4" />
        </Button>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 border border-input rounded-b-md bg-background text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
      />
      <p className="text-xs text-muted-foreground">
        Supports Markdown formatting: **bold**, _italic_, [link text](url), and HTML highlighting tags.
      </p>

      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Link</DialogTitle>
            <DialogDescription>
              Add a hyperlink to your selected text
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Link Text</label>
              <Input
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Text to display"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">URL</label>
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
                Cancel
              </Button>
              <Button onClick={applyLink} disabled={!linkText || !linkUrl}>
                Add Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
