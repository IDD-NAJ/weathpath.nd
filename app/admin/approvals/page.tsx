import { getPendingContent, getAllContentWithStatus } from "@/app/actions/approval"
import { ApprovalsManager } from "@/components/admin/approvals-manager"
import { AIContentApprovals } from "@/components/admin/ai-content-approvals"

export default async function ApprovalsPage() {
  const [pending, allContent] = await Promise.all([
    getPendingContent(),
    getAllContentWithStatus(),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Content Approvals
        </h2>
        <p className="text-sm text-muted-foreground">
          Review and manage content status across all content types
        </p>
      </div>

      <div className="space-y-8">
        <ApprovalsManager pending={pending} allContent={allContent} />
        <AIContentApprovals />
      </div>
    </div>
  )
}
