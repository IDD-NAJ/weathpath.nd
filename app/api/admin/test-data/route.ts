import { sql } from "@/lib/db"
export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization')
  
  if (authHeader !== 'Bearer test-key-12345') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    
    // Insert test course
    const courseResult = await sql(
      `INSERT INTO courses (slug, title, subtitle, description, category, level, price_cents, cover_image, lessons, featured, is_visible, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
       ON CONFLICT(slug) DO NOTHING
       RETURNING id, slug, title, price_cents`,
      [
        'passive-income-101',
        'Passive Income 101',
        'Build Your First Income Stream',
        'Learn proven strategies to create passive income from scratch. Perfect for beginners looking to start building wealth.',
        'finance',
        'Beginner',
        9999, // $99.99
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop',
        12,
        true,
        true,
        'published'
      ]
    )

    return Response.json({ 
      message: 'Test data inserted',
      course: courseResult[0] || { message: 'Course already exists' }
    })
  } catch (error: any) {
    console.error('[v0] Test data error:', error)
    return Response.json(
      { error: error.message || 'Failed to insert test data' },
      { status: 500 }
    )
  }
}
