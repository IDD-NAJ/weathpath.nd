"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import Link from "next/link"
import { 
  FileEdit, 
  Search, 
  Eye, 
  AlertCircle,
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
}

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }
  return response.json()
}

export default function InDraftPage() {
  const [selectedDraft, setSelectedDraft] = useState<ContentDraft | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const { data: draftsData, error } = useSWR('/api/admin/content/drafts?status=draft', fetcher)
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
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Drafts in Progress</h2>
          <p className="text-sm text-muted-foreground">Content drafts currently being worked on</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Error loading drafts</h3>
              <p className="text-muted-foreground">Unable to load drafts in progress. Please try again.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Drafts in Progress</h2>
        <p className="text-sm text-muted-foreground">Content drafts currently being worked on</p>
      </div>

      {/* Search */}
      <AnimatedCard delay={0.1}>
        <CardHeader>
          <CardTitle className="text-base">Search Drafts in Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search drafts in progress..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </AnimatedCard>

      {/* Drafts in Progress */}
      <AnimatedCard delay={0.2}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-gray-500" />
            Drafts in Progress ({filteredDrafts.length})
          </CardTitle>
          <CardDescription>
            {filteredDrafts.length === 0 
              ? "No drafts are currently in progress"
              : `${filteredDrafts.length} draft${filteredDrafts.length !== 1 ? 's' : ''} being worked on`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredDrafts.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Drafts in Progress</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "No drafts in progress match your search"
                  : "No drafts are currently being worked on"
                }
              </p>
              <Link href="/admin/ai">
                <Button>
                  <FileEdit className="h-4 w-4 mr-2" />
                  Create New Draft
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
                  className="rounded-lg border border-border bg-card/50 p-4 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-foreground truncate">
                          {draft.title || 'Untitled Draft'}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          In Draft
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
                              <AlertCircle className="h-5 w-5 text-gray-500" />
                              {draft.title || 'Untitled Draft'}
                            </DialogTitle>
                            <DialogDescription>
                              <span className="flex items-center gap-2 text-sm">
                                <Badge variant="outline">In Draft</Badge>
                                <Badge variant="outline">{draft.type}</Badge>
                                <span>By {draft.author_name || 'Unknown'}</span>
                              </span>
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-6">
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
                                <Link href={`/admin/ai?draft=${draft.id}`}>
                                  <Button size="sm">
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit Draft
                                  </Button>
                                </Link>
                                
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
                                        Continue Editing
                                      </Link>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Link href={`/admin/ai?draft=${draft.id}`}>
                        <Button size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
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
