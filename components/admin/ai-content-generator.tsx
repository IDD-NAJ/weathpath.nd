"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Sparkles, 
  FileText, 
  BookOpen, 
  Trophy, 
  Brain, 
  Lightbulb, 
  RefreshCw, 
  Copy, 
  Check,
  Wand2,
  Target,
  Clock,
  Tag,
  Save,
  Send,
  Eye,
  Edit,
  Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnimatedCard } from "@/components/ui/animated-card"
import { useToast } from "@/hooks/use-toast"
import { MediaUploadField } from "@/components/admin/media-upload-field"

interface GeneratedContent {
  title: string
  content: string
  summary: string
  tags: string[]
  estimatedReadTime: number
  difficulty: string
  keyPoints: string[]
  image?: {
    url: string
    alt: string
    caption: string
    attribution: {
      photographer: string
      source: string
      photographerUrl: string
    }
  }
}

export function AIContentGenerator() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [contentIdeas, setContentIdeas] = useState<string[]>([])
  const [copied, setCopied] = useState(false)
  const [savedDraftId, setSavedDraftId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    type: "article",
    topic: "",
    difficulty: "beginner",
    tone: "educational",
    length: "medium",
    audience: "general",
    includeImage: false,
    promptImageUrl: "",
    promptVideoUrl: "",
  })
  const { toast } = useToast()

  const handleGenerate = async () => {
    if (!formData.topic.trim()) {
      toast({
        title: "Topic required",
        description: "Please enter a topic to generate content.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch("/api/admin/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "generate",
          ...formData,
          ...(formData.promptImageUrl && { imageContext: formData.promptImageUrl }),
          ...(formData.promptVideoUrl && { videoContext: formData.promptVideoUrl }),
        }),
      })

      const result = await response.json()
      
      if (response.ok) {
        setGeneratedContent(result.data)
        toast({
          title: "Content generated!",
          description: "Your AI-generated content is ready to review.",
        })
      } else {
        throw new Error(result.error || "Failed to generate content")
      }
    } catch (error) {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate content",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateIdeas = async () => {
    if (!formData.topic.trim()) {
      toast({
        title: "Topic required",
        description: "Please enter a topic to generate ideas.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/admin/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "ideas",
          topic: formData.topic,
          count: 5
        }),
      })

      const result = await response.json()
      
      if (response.ok) {
        setContentIdeas(result.data)
        toast({
          title: "Ideas generated!",
          description: "Check out the suggested content ideas.",
        })
      } else {
        throw new Error(result.error || "Failed to generate ideas")
      }
    } catch (error) {
      toast({
        title: "Failed to generate ideas",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCopyContent = async () => {
    if (!generatedContent) return

    const textToCopy = `Title: ${generatedContent.title}\n\nSummary: ${generatedContent.summary}\n\nContent:\n${generatedContent.content}\n\nTags: ${generatedContent.tags.join(', ')}\n\nKey Points:\n${generatedContent.keyPoints.map(point => `• ${point}`).join('\n')}`
    
    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "Copied to clipboard",
        description: "Content has been copied to your clipboard.",
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy content to clipboard.",
        variant: "destructive",
      })
    }
  }

  const handleSaveDraft = async () => {
    if (!generatedContent) {
      toast({
        title: "No content to save",
        description: "Generate content first before saving.",
        variant: "destructive",
      })
      return
    }

    console.log('🔧 Saving draft...', { title: generatedContent.title, type: formData.type })
    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/content/drafts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "save",
          title: generatedContent.title,
          content: generatedContent.content,
          summary: generatedContent.summary,
          type: formData.type,
          difficulty: formData.difficulty,
          tone: formData.tone,
          length: formData.length,
          audience: formData.audience,
          tags: generatedContent.tags,
          keyPoints: generatedContent.keyPoints,
          estimatedReadTime: generatedContent.estimatedReadTime,
          imageUrl: generatedContent.image?.url,
          imageAlt: generatedContent.image?.alt,
          imageCaption: generatedContent.image?.caption,
          imageAttribution: generatedContent.image?.attribution
        }),
      })

      const result = await response.json()
      console.log('📋 Save response:', result)
      
      if (response.ok) {
        setSavedDraftId(result.draft.id)
        console.log('✅ Draft saved with ID:', result.draft.id)
        toast({
          title: "Draft saved!",
          description: "Your content has been saved as a draft.",
        })
      } else {
        console.error('❌ Save failed:', result.error)
        throw new Error(result.error || "Failed to save draft")
      }
    } catch (error) {
      console.error('❌ Save error:', error)
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Failed to save draft",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubmitForApproval = async () => {
    if (!savedDraftId) {
      toast({
        title: "Save first",
        description: "Please save the content as a draft before submitting for approval.",
        variant: "destructive",
      })
      return
    }

    console.log('🔧 Submitting for approval...', { draftId: savedDraftId })
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/admin/content/drafts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "submit_for_approval",
          id: savedDraftId
        }),
      })

      const result = await response.json()
      console.log('📋 Submit response:', result)
      
      if (response.ok) {
        console.log('✅ Submitted for approval')
        toast({
          title: "Submitted for approval!",
          description: "Your content has been submitted for admin approval.",
        })
        // Reset form after successful submission
        setGeneratedContent(null)
        setSavedDraftId(null)
        setFormData({
          type: "article",
          topic: "",
          difficulty: "beginner",
          tone: "educational",
          length: "medium",
          audience: "general",
          includeImage: false,
          promptImageUrl: "",
          promptVideoUrl: "",
        })
      } else {
        console.error('❌ Submit failed:', result.error)
        throw new Error(result.error || "Failed to submit for approval")
      }
    } catch (error) {
      console.error('❌ Submit error:', error)
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Failed to submit for approval",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
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
      case "article": return "bg-blue-500"
      case "story": return "bg-green-500"
      case "learning_path": return "bg-purple-500"
      case "quiz": return "bg-orange-500"
      default: return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      <AnimatedCard delay={0.1}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            AI Content Generator
          </CardTitle>
          <CardDescription>
            Generate articles, stories, learning paths, and quizzes using AI
          </CardDescription>
        </CardHeader>
      </AnimatedCard>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Configuration Panel */}
        <AnimatedCard delay={0.2}>
          <CardHeader>
            <CardTitle className="text-lg">Content Configuration</CardTitle>
            <CardDescription>
              Configure the type and parameters for AI-generated content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Content Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="article">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Article
                      </div>
                    </SelectItem>
                    <SelectItem value="story">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        Success Story
                      </div>
                    </SelectItem>
                    <SelectItem value="learning_path">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Learning Path
                      </div>
                    </SelectItem>
                    <SelectItem value="quiz">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        Quiz
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select value={formData.difficulty} onValueChange={(value: any) => setFormData(prev => ({ ...prev, difficulty: value }))}>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                placeholder="e.g., Personal Budgeting, Investment Basics, Retirement Planning"
                value={formData.topic}
                onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tone">Tone</Label>
                <Select value={formData.tone} onValueChange={(value: any) => setFormData(prev => ({ ...prev, tone: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="educational">Educational</SelectItem>
                    <SelectItem value="inspirational">Inspirational</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="length">Length</Label>
                <Select value={formData.length} onValueChange={(value: any) => setFormData(prev => ({ ...prev, length: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (300-500 words)</SelectItem>
                    <SelectItem value="medium">Medium (800-1200 words)</SelectItem>
                    <SelectItem value="long">Long (1500-2000 words)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="audience">Target Audience</Label>
              <Select value={formData.audience} onValueChange={(value: any) => setFormData(prev => ({ ...prev, audience: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Public</SelectItem>
                  <SelectItem value="students">Students</SelectItem>
                  <SelectItem value="professionals">Professionals</SelectItem>
                  <SelectItem value="beginners">Beginners</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="includeImage" 
                checked={formData.includeImage}
                onCheckedChange={(checked: boolean) => setFormData(prev => ({ ...prev, includeImage: checked }))}
              />
              <Label htmlFor="includeImage" className="text-sm">
                Include relevant image (Pixabay)
              </Label>
            </div>

            {/* Prompt Media — image or video to attach as AI context */}
            <div className="rounded-lg border border-border p-4 flex flex-col gap-4 bg-muted/30">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Prompt Media Context (optional)
              </p>
              <p className="text-xs text-muted-foreground -mt-2">
                Attach an image or video to give the AI visual context when generating content.
              </p>
              <MediaUploadField
                label="Reference Image"
                type="image"
                urlFieldName="_promptImageUrl"
                defaultUrl={formData.promptImageUrl}
                onUrlChange={(url) => setFormData(prev => ({ ...prev, promptImageUrl: url }))}
              />
              <MediaUploadField
                label="Reference Video"
                type="video"
                urlFieldName="_promptVideoUrl"
                defaultUrl={formData.promptVideoUrl}
                onUrlChange={(url) => setFormData(prev => ({ ...prev, promptVideoUrl: url }))}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || !formData.topic.trim()}
                className="flex-1 gap-2"
              >
                {isGenerating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {isGenerating ? "Generating..." : "Generate Content"}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleGenerateIdeas}
                disabled={!formData.topic.trim()}
                className="gap-2"
              >
                <Lightbulb className="h-4 w-4" />
                Ideas
              </Button>
            </div>
          </CardContent>
        </AnimatedCard>

        {/* Results Panel */}
        <AnimatedCard delay={0.3}>
          <CardHeader>
            <CardTitle className="text-lg">Generated Results</CardTitle>
            <CardDescription>
              Review and use your AI-generated content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {!generatedContent && !contentIdeas.length && (
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center py-12"
                >
                  <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No content generated yet</h3>
                  <p className="text-muted-foreground">
                    Configure your content parameters and click "Generate Content" to get started.
                  </p>
                </motion.div>
              )}

              {contentIdeas.length > 0 && (
                <motion.div
                  key="content-ideas"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Content Ideas
                  </h4>
                  <div className="space-y-2">
                    {contentIdeas.map((idea, index) => (
                      <div key={`idea-${index}`} className="p-3 bg-muted rounded-lg">
                        <p className="text-sm">{idea}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {generatedContent && (
                <motion.div
                  key="generated-content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Tabs defaultValue="content" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="content">Content</TabsTrigger>
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="key-points">Key Points</TabsTrigger>
                      {generatedContent.image && <TabsTrigger value="image">Image</TabsTrigger>}
                    </TabsList>

                    <TabsContent value="content" className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground mb-2">{generatedContent.title}</h4>
                          <p className="text-sm text-muted-foreground mb-3">{generatedContent.summary}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopyContent}
                            className="gap-2"
                          >
                            {copied ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                            {copied ? "Copied!" : "Copy"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSaveDraft}
                            disabled={isSaving || !!savedDraftId}
                            className="gap-2"
                          >
                            {isSaving ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                            {savedDraftId ? "Saved" : "Save Draft"}
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={handleSubmitForApproval}
                            disabled={isSubmitting || !savedDraftId}
                            className="gap-2"
                            title={!savedDraftId ? "Please save the draft first before submitting for approval" : "Submit this draft for admin approval"}
                          >
                            {isSubmitting ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                            Submit for Approval
                          </Button>
                        </div>
                        {savedDraftId && (
                          <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            Draft saved successfully. Ready to submit for approval.
                          </div>
                        )}
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        <Textarea
                          value={generatedContent.content}
                          readOnly
                          className="min-h-64 resize-none"
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="details" className="space-y-4">
                      <div className="grid gap-4">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Type:</span>
                          <Badge variant="outline" className="capitalize">
                            {formData.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Read Time:</span>
                          <span className="text-sm text-muted-foreground">
                            {generatedContent.estimatedReadTime} minutes
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Tags:</span>
                          <div className="flex flex-wrap gap-1">
                            {generatedContent.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="key-points" className="space-y-4">
                      <h4 className="font-medium text-foreground">Key Takeaways</h4>
                      <div className="space-y-2">
                        {generatedContent.keyPoints.map((point, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <p className="text-sm text-foreground">{point}</p>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    {generatedContent.image && (
                      <TabsContent value="image" className="space-y-4">
                        <h4 className="font-medium text-foreground">Generated Image</h4>
                        <div className="space-y-4">
                          <div className="relative rounded-lg overflow-hidden bg-muted">
                            <img
                              src={generatedContent.image.url}
                              alt={generatedContent.image.alt}
                              className="w-full h-auto max-h-96 object-contain"
                            />
                          </div>
                          <div className="space-y-2">
                            <div>
                              <p className="text-sm font-medium text-foreground">Caption</p>
                              <p className="text-sm text-muted-foreground">{generatedContent.image.caption}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">Attribution</p>
                              <p className="text-sm text-muted-foreground">
                                Photo by{' '}
                                <a
                                  href={generatedContent.image.attribution.photographerUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {generatedContent.image.attribution.photographer}
                                </a>{' '}
                                on{' '}
                                <a
                                  href="https://pixabay.com"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {generatedContent.image.attribution.source}
                                </a>
                              </p>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    )}
                  </Tabs>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </AnimatedCard>
      </div>
    </div>
  )
}
