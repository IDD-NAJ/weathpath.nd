'use client'

import { useState } from 'react'
import { LessonViewer } from './lesson-viewer'

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

interface LessonViewerWrapperProps {
  lessons: Lesson[]
  courseTitle: string
  initialLessonIndex?: number
  userHasAccess?: boolean
}

export function LessonViewerWrapper({
  lessons,
  courseTitle,
  initialLessonIndex = 0,
  userHasAccess = true,
}: LessonViewerWrapperProps) {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(initialLessonIndex)

  return (
    <LessonViewer
      lessons={lessons}
      currentLessonIndex={currentLessonIndex}
      onLessonChange={setCurrentLessonIndex}
      courseTitle={courseTitle}
      userHasAccess={userHasAccess}
    />
  )
}
