"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import Link from "next/link"
import { 
  FileEdit, 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  ArrowRight,
  Edit,
  MoreHorizontal
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
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

export default function PendingReviewPage() {
  const [selectedDraft, setSelectedDraft] = useState<ContentDraft | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)

  const { data: draftsData, error, mutate } = useSWR('/api/admin/content/drafts?status=pending_approval', fetcher)
  const drafts = draftsData?.drafts || []

  // Filter drafts based on search
  const filteredDrafts = drafts.filter((draft: ContentDraft) => {
    const matchesSearch = !searchTerm || 
      draft.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      draft.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      draft.author_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  const handleApprove = async (draftId: string) => {
    setIsApproving(true)
    try {
      const response = await fetch('/api/admin/content/drafts/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftId })
      })
      
      if (response.ok) {
        toast({ title: "Draft approved", description: "The draft has been approved successfully." })
        mutate() // Refresh data
        setSelectedDraft(null)
      } else {
        throw new Error('Failed to approve draft')
      }
    } catch (error) {
      toast({ 
        title: "Approval failed", 
        description: "Failed to approve the draft. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async (draftId: string) => {
    if (!rejectionReason.trim()) {
      toast({ 
        title: "Reason required", 
        description: "Please provide a reason for rejection.",
        variant: "destructive"
      })
      return
    }

    setIsRejecting(true)
    try {
      const response = await fetch('/api/admin/content/drafts/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftId, reason: rejectionReason })
      })
      
      if (response.ok) {
        toast({ title: "Draft rejected", description: "The draft has been rejected." })
        mutate() // Refresh data
        setSelectedDraft(null)
        setRejectionReason("")
      } else {
        throw new Error('Failed to reject draft')
      }
    } catch (error) {
      toast({ 
        title: "Rejection failed", 
        description: "Failed to reject the draft. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsRejecting(false)
    }
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Pending Review</h2>
          <p className="text-sm text-muted-foreground">Content drafts awaiting approval</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Error loading drafts</h3>
              <p className="text-muted-foreground">Unable to load pending drafts. Please try again.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Pending Review</h2>
        <p className="text-sm text-muted-foreground">Content drafts awaiting approval</p>
      </div>

      {/* Search */}
      <AnimatedCard delay={0.1}>
        <CardHeader>
          <CardTitle className="text-base">Search Pending Drafts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search pending drafts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </AnimatedCard>

      {/* Pending Drafts */}
      <AnimatedCard delay={0.2}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500" />
            Pending Drafts ({filteredDrafts.length})
          </CardTitle>
          <CardDescription>
            {filteredDrafts.length === 0 
              ? "No drafts are currently pending review"
              : `${filteredDrafts.length} draft${filteredDrafts.length !== 1 ? 's' : ''} awaiting approval`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredDrafts.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Pending Drafts</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "No pending drafts match your search"
                  : "All drafts have been reviewed or no drafts are pending"
                }
              </p>
              <Link href="/admin/drafts">
                <Button variant="outline">
                  <FileEdit className="h-4 w-4 mr-2" />
                  View All Drafts
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
                  className="rounded-lg border border-amber-300 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/30 p-4 hover:bg-amber-100/50 dark:hover:bg-amber-900/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-foreground truncate">
                          {draft.title || 'Untitled Draft'}
                        </h3>
                        <Badge variant="default" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending Review
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
                              <Clock className="h-5 w-5 text-amber-500" />
                              {draft.title || 'Untitled Draft'}
                            </DialogTitle>
                            <DialogDescription>
                              <span className="flex items-center gap-2 text-sm">
                                <Badge variant="default">Pending Review</Badge>
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
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(draft.id)}
                                  disabled={isApproving}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="outline">
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Reject
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Reject Draft</DialogTitle>
                                      <DialogDescription>
                                        Please provide a reason for rejecting this draft.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="reason">Rejection Reason</Label>
                                        <Textarea
                                          id="reason"
                                          placeholder="Explain why this draft is being rejected..."
                                          value={rejectionReason}
                                          onChange={(e) => setRejectionReason(e.target.value)}
                                          className="min-h-[100px]"
                                        />
                                      </div>
                                      <div className="flex justify-end gap-2">
                                        <Button variant="outline" onClick={() => setRejectionReason("")}>
                                          Cancel
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          onClick={() => handleReject(draft.id)}
                                          disabled={isRejecting}
                                        >
                                          <XCircle className="h-4 w-4 mr-1" />
                                          Reject Draft
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                
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
                      
                      <Button size="sm" onClick={() => handleApprove(draft.id)} disabled={isApproving}>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Quick Approve
                      </Button>
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
