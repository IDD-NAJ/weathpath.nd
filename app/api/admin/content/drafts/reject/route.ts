import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
export const dynamic = 'force-dynamic'


export async function POST(request: Request) {
  try {
    await requireAdmin()

    const { draftId, reason } = await request.json()

    if (!draftId) {
      return NextResponse.json({ 
        error: 'Draft ID is required' 
      }, { status: 400 })
    }

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json({ 
        error: 'Rejection reason is required' 
      }, { status: 400 })
    }

    // Update draft status to rejected and store rejection reason
    await sql`
      UPDATE content_drafts 
      SET 
        status = 'rejected', 
        rejection_reason = ${reason.trim()},
        updated_at = NOW()
      WHERE id = ${draftId}
    `

    return NextResponse.json({ 
      success: true, 
      message: 'Draft rejected successfully' 
    })
  } catch (error) {
    console.error('Reject draft API error:', error)
    return NextResponse.json({ 
      error: 'Failed to reject draft' 
    }, { status: 500 })
  }
}
