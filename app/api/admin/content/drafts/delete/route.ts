import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
export const dynamic = 'force-dynamic'


export async function DELETE(request: Request) {
  try {
    await requireAdmin()

    const { draftId } = await request.json()

    if (!draftId) {
      return NextResponse.json({ 
        error: 'Draft ID is required' 
      }, { status: 400 })
    }

    // Delete the draft
    await sql`DELETE FROM content_drafts WHERE id = ${draftId}`

    return NextResponse.json({ 
      success: true, 
      message: 'Draft deleted successfully' 
    })
  } catch (error) {
    console.error('Delete draft API error:', error)
    return NextResponse.json({ 
      error: 'Failed to delete draft' 
    }, { status: 500 })
  }
}
