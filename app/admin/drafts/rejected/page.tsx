"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import Link from "next/link"
import { 
  FileEdit, 
  Search, 
  Eye, 
  XCircle,
  ArrowRight,
  Edit,
  MoreHorizontal
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import { AnimatedCard } from "@/components/ui/animated-card"

interface ContentDraft {
  id: string
  title: string | null
  type: string
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected'
  content: string
  summary: string | null
  difficulty: string | null
  tone: string | null
  audience: string | null
  tags: string[] | null
  key_points: string[] | null
  estimated_read_time: number | null
  created_at: string
  updated_at: string
  author_name: string | null
  author_email: string | null
  rejection_reason?: string | null
}

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }
  return response.json()
}

export default function RejectedPage() {
  const [selectedDraft, setSelectedDraft] = useState<ContentDraft | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const { data: draftsData, error } = useSWR('/api/admin/content/drafts?status=rejected', fetcher)
  const drafts = draftsData?.drafts || []

  // Filter drafts based on search
  const filteredDrafts = drafts.filter((draft: ContentDraft) => {
    const matchesSearch = !searchTerm || 
      draft.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      draft.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      draft.author_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Rejected Drafts</h2>
          <p className="text-sm text-muted-foreground">Content drafts that have been rejected</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <XCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Error loading drafts</h3>
              <p className="text-muted-foreground">Unable to load rejected drafts. Please try again.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Rejected Drafts</h2>
        <p className="text-sm text-muted-foreground">Content drafts that have been rejected</p>
      </div>

      {/* Search */}
      <AnimatedCard delay={0.1}>
        <CardHeader>
          <CardTitle className="text-base">Search Rejected Drafts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search rejected drafts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </AnimatedCard>

      {/* Rejected Drafts */}
      <AnimatedCard delay={0.2}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-500" />
            Rejected Drafts ({filteredDrafts.length})
          </CardTitle>
          <CardDescription>
            {filteredDrafts.length === 0 
              ? "No drafts have been rejected"
              : `${filteredDrafts.length} draft${filteredDrafts.length !== 1 ? 's' : ''} rejected and need revision`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredDrafts.length === 0 ? (
            <div className="text-center py-12">
              <XCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Rejected Drafts</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "No rejected drafts match your search"
                  : "No drafts have been rejected yet"
                }
              </p>
              <Link href="/admin/drafts/pending-review">
                <Button variant="outline">
                  <FileEdit className="h-4 w-4 mr-2" />
                  Review Pending Drafts
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDrafts.map((draft: ContentDraft, index: number) => (
                <motion.div
                  key={draft.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                  className="rounded-lg border border-red-300 bg-red-50/50 dark:border-red-800 dark:bg-red-950/30 p-4 hover:bg-red-100/50 dark:hover:bg-red-900/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-foreground truncate">
                          {draft.title || 'Untitled Draft'}
                        </h3>
                        <Badge variant="destructive" className="text-xs">
                          <XCircle className="h-3 w-3 mr-1" />
                          Rejected
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {draft.type}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <span>By {draft.author_name || 'Unknown'}</span>
                        <span>•</span>
                        <span>
                          {new Date(draft.updated_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>
                      
                      {draft.rejection_reason && (
                        <div className="mb-2 p-2 rounded bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                          <p className="text-xs text-red-800 dark:text-red-200">
                            <strong>Reason:</strong> {draft.rejection_reason}
                          </p>
                        </div>
                      )}
                      
                      {draft.summary && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {draft.summary}
                        </p>
                      )}
                      
                      {draft.tags && draft.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {draft.tags.slice(0, 3).map((tag: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {draft.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{draft.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <XCircle className="h-5 w-5 text-red-500" />
                              {draft.title || 'Untitled Draft'}
                            </DialogTitle>
                            <DialogDescription>
                              <span className="flex items-center gap-2 text-sm">
                                <Badge variant="destructive">Rejected</Badge>
                                <Badge variant="outline">{draft.type}</Badge>
                                <span>By {draft.author_name || 'Unknown'}</span>
                              </span>
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-6">
                            {draft.rejection_reason && (
                              <div className="p-3 rounded bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                                <Label className="text-sm font-medium text-red-800 dark:text-red-200">Rejection Reason</Label>
                                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{draft.rejection_reason}</p>
                              </div>
                            )}
                            
                            {draft.summary && (
                              <div>
                                <Label className="text-sm font-medium">Summary</Label>
                                <p className="text-sm text-muted-foreground mt-1">{draft.summary}</p>
                              </div>
                            )}
                            
                            {draft.content && (
                              <div>
                                <Label className="text-sm font-medium">Content</Label>
                                <div className="mt-1 p-3 rounded-lg border border-border bg-muted/50 max-h-60 overflow-y-auto">
                                  <p className="text-sm whitespace-pre-wrap">{draft.content}</p>
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between pt-4 border-t border-border">
                              <div className="text-xs text-muted-foreground">
                                Created: {new Date(draft.created_at).toLocaleString()}
                                {draft.updated_at !== draft.created_at && (
                                  <> • Updated: {new Date(draft.updated_at).toLocaleString()}</>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="ghost">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                      <Link href={`/admin/ai?draft=${draft.id}`}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Draft
                                      </Link>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </AnimatedCard>
    </div>
  )
}
