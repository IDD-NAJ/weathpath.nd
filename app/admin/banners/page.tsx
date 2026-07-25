'use client'

import { BannersManager } from '@/components/admin/banners-manager'

export default function BannersPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Banners & Announcements</h1>
          <p className="text-muted-foreground">Create and manage home page banners for announcements and campaigns</p>
        </div>
        <BannersManager />
      </div>
    </div>
  )
}
