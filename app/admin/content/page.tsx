'use client'

import { ContentCreator } from '@/components/admin/content-creator'

export default function ContentCreationPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-5xl">
        <ContentCreator />
      </div>
    </div>
  )
}
