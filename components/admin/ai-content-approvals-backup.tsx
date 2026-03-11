"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Check, 
  X, 
  Eye, 
  Clock, 
  FileText, 
  BookOpen, 
  Trophy, 
  Brain,
  Wand2,
  Image,
  User,
  Calendar
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ContentDraft {
  id: string
  title: string
  content: string
  summary: string
  type: 'article' | 'story' | 'learning_path' | 'quiz'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tone: 'educational' | 'inspirational' | 'professional' | 'casual'
  length: 'short' | 'medium' | 'long'
  audience: 'general' | 'students' | 'professionals' | 'beginners'
  tags: string[]
  keyPoints: string[]
  estimatedReadTime: number
  imageUrl?: string
  imageAlt?: string
  imageCaption?: string
  imageAttribution?: {
    photographer: string
    source: string
    photographerUrl: string
  }
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected'
  authorId: string
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
  rejectionReason?: string
  author_name?: string
  author_email?: string
}

export function AIContentApprovals() {
  const [pendingApprovals, setPendingApprovals] = useState<ContentDraft[]>([])
  const [selectedDraft, setSelectedDraft] = useState<ContentDraft | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchPendingApprovals()
  }, [])

  const fetchPendingApprovals = async () => {
    try {
      const response = await fetch("/api/admin/content/approvals")
      const result = await response.json()
      
      if (response.ok) {
        setPendingApprovals(result.pendingApprovals)
      } else {
        throw new Error(result.error || "Failed to fetch pending approvals")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch pending approvals",
        variant: "destructive",
      })
    }
  }

  const handleApprove = async (draftId: string) => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/admin/content/approvals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "approve",
          id: draftId
        }),
      })

      const result = await response.json()
      
      if (response.ok) {
        toast({
          title: "Content Approved!",
          description: result.message,
        })
        fetchPendingApprovals()
        setSelectedDraft(null)
      } else {
        throw new Error(result.error || "Failed to approve content")
      }
    } catch (error) {
      toast({
        title: "Approval Failed",
        description: error instanceof Error ? error.message : "Failed to approve content",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async (draftId: string) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch("/api/admin/content/approvals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "reject",
          id: draftId,
          reason: rejectionReason
        }),
      })

      const result = await response.json()
      
      if (response.ok) {
        toast({
          title: "Content Rejected",
          description: result.message,
        })
        fetchPendingApprovals()
        setSelectedDraft(null)
        setRejectionReason("")
      } else {
        throw new Error(result.error || "Failed to reject content")
      }
    } catch (error) {
      toast({
        title: "Rejection Failed",
        description: error instanceof Error ? error.message : "Failed to reject content",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "article": return FileText
      case "story": return Trophy
      case "learning_path": return BookOpen
      case "quiz": return Brain
      default: return FileText
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "article": return "bg-blue-100 text-blue-800"
      case "story": return "bg-green-100 text-green-800"
      case "learning_path": return "bg-purple-100 text-purple-800"
      case "quiz": return "bg-orange-100 text-orange-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800"
      case "intermediate": return "bg-yellow-100 text-yellow-800"
      case "advanced": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Wand2 className="h-5 w-5" />
        <h3 className="text-lg font-semibold">AI-Generated Content Approvals</h3>
        <Badge variant="secondary">{pendingApprovals.length} pending</Badge>
      </div>

      {pendingApprovals.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Pending Approvals</h3>
              <p className="text-muted-foreground">
                No AI-generated content is currently waiting for approval.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* List of pending approvals */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Pending Content ({pendingApprovals.length})</h4>
            {pendingApprovals.map((draft) => {
              const Icon = getTypeIcon(draft.type)
              return (
                <Card key={draft.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedDraft(draft)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <h4 className="font-medium text-foreground line-clamp-1">{draft.title}</h4>
                      </div>
                      <Badge className={getTypeColor(draft.type)}>{draft.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{draft.summary}</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <User className="h-3 w-3" />
                      <span>{draft.author_name || draft.authorId}</span>
                      <Calendar className="h-3 w-3 ml-2" />
                      <span>{new Date(draft.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Badge className={getDifficultyColor(draft.difficulty)}>{draft.difficulty}</Badge>
                      <Badge variant="outline">{draft.tone}</Badge>
                      <Badge variant="outline">{draft.length}</Badge>
                      <Badge variant="outline">{draft.audience}</Badge>
                      {draft.estimatedReadTime > 0 && (
                        <Badge variant="outline">{draft.estimatedReadTime} min read</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Selected draft details */}
          {selectedDraft && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {(() => {
                        const Icon = getTypeIcon(selectedDraft.type)
                        return <Icon className="h-5 w-5" />
                      })()}
                      {selectedDraft.title}
                    </CardTitle>
                    <CardDescription>{selectedDraft.summary}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(selectedDraft.id)}
                      disabled={isProcessing}
                      className="gap-2"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleApprove(selectedDraft.id)}
                      disabled={isProcessing}
                      className="gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="content" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="key-points">Key Points</TabsTrigger>
                    {selectedDraft.imageUrl && <TabsTrigger value="image">Image</TabsTrigger>}
                  </TabsList>

                  <TabsContent value="content" className="space-y-4">
                    <div className="max-h-96 overflow-y-auto">
                      <Textarea
                        value={selectedDraft.content}
                        readOnly
                        className="min-h-64 resize-none"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Type</Label>
                        <p className="text-sm">{selectedDraft.type}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Difficulty</Label>
                        <p className="text-sm">{selectedDraft.difficulty}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Tone</Label>
                        <p className="text-sm">{selectedDraft.tone}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Length</Label>
                        <p className="text-sm">{selectedDraft.length}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Audience</Label>
                        <p className="text-sm">{selectedDraft.audience}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Read Time</Label>
                        <p className="text-sm">{selectedDraft.estimatedReadTime} minutes</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Tags</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedDraft.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="key-points" className="space-y-4">
                    <div className="space-y-2">
                      {selectedDraft.keyPoints.map((point, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                          <p className="text-sm text-foreground">{point}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {selectedDraft.imageUrl && (
                    <TabsContent value="image" className="space-y-4">
                      <div className="space-y-4">
                        <div className="relative rounded-lg overflow-hidden bg-muted">
                          <img
                            src={selectedDraft.imageUrl}
                            alt={selectedDraft.imageAlt}
                            className="w-full h-auto max-h-96 object-contain"
                          />
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium text-foreground">Caption</p>
                            <p className="text-sm text-muted-foreground">{selectedDraft.imageCaption}</p>
                          </div>
                          {selectedDraft.imageAttribution && (
                            <div>
                              <p className="text-sm font-medium text-foreground">Attribution</p>
                              <p className="text-sm text-muted-foreground">
                                Photo by{' '}
                                <a
                                  href={selectedDraft.imageAttribution.photographerUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {selectedDraft.imageAttribution.photographer}
                                </a>{' '}
                                on{' '}
                                <a
                                  href="https://pixabay.com"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {selectedDraft.imageAttribution.source}
                                </a>
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                </Tabs>

                {/* Rejection reason input */}
                <div className="mt-6 pt-6 border-t">
                  <Label htmlFor="rejection-reason" className="text-sm font-medium">Rejection Reason (if rejecting)</Label>
                  <Textarea
                    id="rejection-reason"
                    placeholder="Provide a reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="mt-2"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
