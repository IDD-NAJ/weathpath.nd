import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { submitForApproval } from "@/lib/content-manager"
export const dynamic = 'force-dynamic'


export async function POST(request: Request) {
  try {
    await requireAdmin()

    const { draftId } = await request.json()

    if (!draftId) {
      return NextResponse.json({ 
        error: 'Draft ID is required' 
      }, { status: 400 })
    }

    // Update draft status to approved
    await sql`
      UPDATE content_drafts 
      SET status = 'approved', updated_at = NOW()
      WHERE id = ${draftId}
    `

    return NextResponse.json({ 
      success: true, 
      message: 'Draft approved successfully' 
    })
  } catch (error) {
    console.error('Approve draft API error:', error)
    return NextResponse.json({ 
      error: 'Failed to approve draft' 
    }, { status: 500 })
  }
}
