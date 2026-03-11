import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { 
  getPendingApprovals, 
  approveContent, 
  rejectContent 
} from "@/lib/content-manager"

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const pendingApprovals = await getPendingApprovals()
    
    return NextResponse.json({
      success: true,
      pendingApprovals
    })
  } catch (error) {
    console.error("Content approvals API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch pending approvals" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, id, reason } = body

    switch (action) {
      case 'approve':
        await approveContent(id, currentUser.id)
        return NextResponse.json({ success: true, message: "Content approved and published" })
      
      case 'reject':
        if (!reason) {
          return NextResponse.json(
            { error: "Rejection reason is required" },
            { status: 400 }
          )
        }
        await rejectContent(id, currentUser.id, reason)
        return NextResponse.json({ success: true, message: "Content rejected" })
      
      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error("Content approvals API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process approval action" },
      { status: 500 }
    )
  }
}
