import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { z } from "zod"
export const dynamic = 'force-dynamic'

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
})


export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userProfile = await sql`
      SELECT id, name, email, role, bio, profile_photo_url, created_at, updated_at
      FROM users 
      WHERE id = ${user.id}
    `

    if (userProfile.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user: userProfile[0] })

  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}


export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = profileSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        fieldErrors: parsed.error.flatten().fieldErrors 
      }, { status: 400 })
    }

    const { name, email, bio } = parsed.data

    // Check if email is already taken by another user
    if (email !== user.email) {
      const existingUser = await sql`
        SELECT id FROM users WHERE email = ${email} AND id != ${user.id}
      `
      if (existingUser.length > 0) {
        return NextResponse.json({ error: 'Email already taken' }, { status: 400 })
      }
    }

    // Update user profile
    await sql`
      UPDATE users 
      SET name = ${name}, email = ${email}, bio = ${bio || null}, updated_at = NOW()
      WHERE id = ${user.id}
    `

    // Get updated user data
    const updatedUser = await sql`
      SELECT id, name, email, role, bio, profile_photo_url, created_at, updated_at
      FROM users 
      WHERE id = ${user.id}
    `

    return NextResponse.json({ 
      success: true, 
      user: updatedUser[0],
      message: 'Profile updated successfully'
    })

  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
