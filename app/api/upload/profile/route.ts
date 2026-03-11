import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' }, { status: 400 })
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 })
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExtension}`

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'profiles')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Directory might already exist, ignore error
    }

    // Save file
    const filePath = join(uploadsDir, fileName)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Update user profile in database
    const profilePhotoUrl = `/uploads/profiles/${fileName}`
    await sql`
      UPDATE users 
      SET profile_photo_url = ${profilePhotoUrl}, updated_at = NOW()
      WHERE id = ${user.id}
    `

    return NextResponse.json({ 
      success: true, 
      profilePhotoUrl,
      message: 'Profile photo uploaded successfully'
    })

  } catch (error) {
    console.error('Profile photo upload error:', error)
    return NextResponse.json({ error: 'Failed to upload profile photo' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current profile photo URL
    const currentUser = await sql`
      SELECT profile_photo_url FROM users WHERE id = ${user.id}
    `

    if (currentUser.length > 0 && currentUser[0].profile_photo_url) {
      const filePath = join(process.cwd(), 'public', currentUser[0].profile_photo_url)
      try {
        await writeFile(filePath, Buffer.alloc(0)) // Clear the file
      } catch (error) {
        // File might not exist, ignore error
      }
    }

    // Remove profile photo from database
    await sql`
      UPDATE users 
      SET profile_photo_url = NULL, profile_photo_public_id = NULL, updated_at = NOW()
      WHERE id = ${user.id}
    `

    return NextResponse.json({ 
      success: true, 
      message: 'Profile photo removed successfully'
    })

  } catch (error) {
    console.error('Profile photo deletion error:', error)
    return NextResponse.json({ error: 'Failed to remove profile photo' }, { status: 500 })
  }
}
