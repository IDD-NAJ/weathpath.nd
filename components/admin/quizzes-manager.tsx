"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Eye, CheckCircle, XCircle, Clock } from "lucide-react"
import { toast } from "sonner"
import { updateContentStatus } from "@/app/actions/approval"

interface Quiz {
  id: string
  title: string
  slug: string
  description?: string
  difficulty: string
  status: string
  is_published: boolean
  author_name?: string
  created_at: string
  questions?: any
}

interface QuizzesManagerProps {
  quizzes: Quiz[]
  authorId: string
}

export function QuizzesManager({ quizzes, authorId }: QuizzesManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleStatusChange = async (quizId: string, newStatus: string) => {
    setIsSubmitting(true)
    try {
      const result = await updateContentStatus("quizzes" as any, quizId, newStatus)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Quiz status updated successfully")
        window.location.reload()
      }
    } catch (error) {
      toast.error("Failed to update quiz status")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string, isPublished: boolean) => {
    if (isPublished && status === 'approved') {
      return <Badge className="bg-green-500">Published</Badge>
    }
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>
      case 'pending':
        return <Badge variant="default">Pending Review</Badge>
      case 'approved':
        return <Badge variant="secondary">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''} total
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Quiz
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Quiz</DialogTitle>
              <DialogDescription>
                Create a new interactive quiz for users
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Quiz title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Brief description" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select defaultValue="beginner">
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
                <div className="space-y-2">
                  <Label htmlFor="passing-score">Passing Score (%)</Label>
                  <Input id="passing-score" type="number" defaultValue="70" min="0" max="100" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast.info("Quiz creation will be implemented with full question builder")
                setIsCreateDialogOpen(false)
              }}>
                Create Quiz
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {quizzes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No quizzes yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first quiz to get started
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Quiz
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {quizzes.map((quiz) => (
            <Card key={quiz.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{quiz.title}</CardTitle>
                    <CardDescription>
                      {quiz.description || 'No description'}
                    </CardDescription>
                    <div className="flex items-center gap-2 pt-2">
                      {getStatusBadge(quiz.status, quiz.is_published)}
                      <Badge variant="outline" className="text-xs">
                        {quiz.difficulty}
                      </Badge>
                      {quiz.author_name && (
                        <span className="text-xs text-muted-foreground">
                          by {quiz.author_name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {quiz.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handleStatusChange(quiz.id, 'approved')}
                          disabled={isSubmitting}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleStatusChange(quiz.id, 'rejected')}
                          disabled={isSubmitting}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    {quiz.status === 'draft' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(quiz.id, 'pending')}
                        disabled={isSubmitting}
                      >
                        <Clock className="h-4 w-4 mr-1" />
                        Submit for Review
                      </Button>
                    )}
                    <Button size="sm" variant="ghost">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
