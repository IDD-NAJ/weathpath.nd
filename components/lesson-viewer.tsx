'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, ChevronRight, Clock, BookOpen, CheckCircle2, Lock } from 'lucide-react'

interface Lesson {
  id: number
  course_id: number
  title: string
  description: string
  content?: string
  order_index: number
  duration_minutes: number
  video_url?: string
  lesson_type: string
  is_published: boolean
}

interface LessonViewerProps {
  lessons: Lesson[]
  currentLessonIndex: number
  onLessonChange: (index: number) => void
  courseTitle: string
  completedLessons?: number[]
  userHasAccess?: boolean
}

export function LessonViewer({
  lessons,
  currentLessonIndex,
  onLessonChange,
  courseTitle,
  completedLessons = [],
  userHasAccess = true,
}: LessonViewerProps) {
  const currentLesson = lessons[currentLessonIndex]
  const [isLessonComplete, setIsLessonComplete] = useState(false)
  const totalLessons = lessons.length
  const progressPercentage = Math.round((currentLessonIndex / Math.max(totalLessons - 1, 1)) * 100)

  useEffect(() => {
    setIsLessonComplete(completedLessons.includes(currentLesson.id))
  }, [currentLessonIndex, currentLesson.id, completedLessons])

  const handlePrevious = () => {
    if (currentLessonIndex > 0) {
      onLessonChange(currentLessonIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentLessonIndex < totalLessons - 1) {
      onLessonChange(currentLessonIndex + 1)
    }
  }

  const getLessonTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      video: 'Video Lesson',
      text: 'Reading',
      quiz: 'Quiz',
      exercise: 'Exercise',
    }
    return types[type] || 'Lesson'
  }

  const getLessonTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      video: 'bg-blue-500',
      text: 'bg-purple-500',
      quiz: 'bg-green-500',
      exercise: 'bg-orange-500',
    }
    return colors[type] || 'bg-gray-500'
  }

  if (!currentLesson) {
    return <div className="text-center py-12 text-muted-foreground">No lessons available</div>
  }

  const isLocked = !userHasAccess
  const canViewContent = userHasAccess || currentLessonIndex === 0

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main Lesson Content */}
      <div className="flex-1">
        <Card className="border-border/60 bg-card overflow-hidden">
          {/* Lesson Header */}
          <CardHeader className="border-b border-border/40 pb-4">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={`${getLessonTypeColor(currentLesson.lesson_type)} text-white text-xs`}>
                      {getLessonTypeLabel(currentLesson.lesson_type)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Lesson {currentLessonIndex + 1} of {totalLessons}</span>
                  </div>
                  <CardTitle className="text-2xl md:text-3xl">{currentLesson.title}</CardTitle>
                  {currentLesson.description && (
                    <p className="text-sm text-muted-foreground mt-2">{currentLesson.description}</p>
                  )}
                </div>
                {isLessonComplete && (
                  <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                )}
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Course Progress</span>
                  <span>{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </div>
          </CardHeader>

          {/* Lesson Content */}
          <CardContent className="p-6 md:p-8">
            {isLocked && currentLessonIndex !== 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Lock className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Lesson Locked</h3>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  Enroll in this course to access this lesson and start learning.
                </p>
                <Button className="rounded-xl">Enroll Now</Button>
              </div>
            ) : currentLesson.video_url ? (
              <div className="space-y-6">
                {/* Video Player Placeholder */}
                <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center border border-border/40">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <div className="w-0 h-0 border-l-8 border-r-0 border-t-5 border-b-5 border-l-primary border-t-transparent border-b-transparent ml-1" />
                    </div>
                    <p className="text-sm text-muted-foreground">Video Player</p>
                    <p className="text-xs text-muted-foreground mt-1">{currentLesson.duration_minutes} minutes</p>
                  </div>
                </div>

                {/* Lesson Notes */}
                {currentLesson.content && (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <div className="bg-muted/40 rounded-lg p-6 border border-border/40">
                      <h4 className="text-sm font-semibold mb-3 text-foreground">Lesson Notes</h4>
                      <div className="space-y-3 text-sm text-foreground/80">
                        {currentLesson.content.split('\n').filter(line => line.trim()).map((line, idx) => (
                          <p key={idx}>{line}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Lesson Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/40 rounded-lg p-4 border border-border/40">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-1">
                      <Clock className="h-4 w-4 text-primary" />
                      Duration
                    </div>
                    <p className="text-sm text-muted-foreground">{currentLesson.duration_minutes} minutes</p>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-4 border border-border/40">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-1">
                      <BookOpen className="h-4 w-4 text-primary" />
                      Type
                    </div>
                    <p className="text-sm text-muted-foreground capitalize">{getLessonTypeLabel(currentLesson.lesson_type)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="space-y-4 text-foreground/80">
                  {currentLesson.content ? (
                    currentLesson.content.split('\n\n').map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))
                  ) : (
                    <p className="text-muted-foreground">Lesson content coming soon...</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>

          {/* Navigation */}
          <div className="flex items-center justify-between p-6 border-t border-border/40 bg-muted/20">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentLessonIndex === 0}
              className="rounded-lg gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <span className="text-xs text-muted-foreground">
              {currentLessonIndex + 1} / {totalLessons}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentLessonIndex === totalLessons - 1}
              className="rounded-lg gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Lessons Sidebar */}
      <div className="lg:w-80">
        <Card className="border-border/60 bg-card sticky top-20">
          <CardHeader>
            <CardTitle className="text-lg">Course Content</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">{totalLessons} lessons</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {lessons.map((lesson, index) => (
                <button
                  key={lesson.id}
                  onClick={() => onLessonChange(index)}
                  className={`w-full text-left px-4 py-3 border-l-2 transition-colors ${
                    currentLessonIndex === index
                      ? 'border-l-primary bg-primary/5 text-foreground'
                      : 'border-l-transparent hover:bg-muted/50 text-foreground/80'
                  } ${!userHasAccess && index !== 0 ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0">
                      {completedLessons.includes(lesson.id) ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : !userHasAccess && index !== 0 ? (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-border/40 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight truncate">
                        Lesson {index + 1}: {lesson.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{lesson.duration_minutes}m</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
