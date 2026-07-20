import { neon } from '@neondatabase/serverless'

/**
 * Verify if a user has access to a course
 * Checks both guest (email-based) and registered user (user_id) purchases
 */
export async function verifyPurchaseAccess(
  courseId: number,
  email?: string,
  userId?: string
): Promise<boolean> {
  if (!email && !userId) {
    return false
  }

  try {
    const sql = neon(process.env.DATABASE_URL!)

    if (email) {
      // Check for guest purchase or registered user purchase via email
      const result = await sql(
        `SELECT up.id FROM user_purchases up
         JOIN orders o ON o.id = up.order_id OR (o.email = up.user_email AND up.order_id IS NULL)
         WHERE up.user_email = $1 AND up.course_id = $2 AND up.payment_status = 'completed'
         LIMIT 1`,
        [email, courseId]
      )
      return result.length > 0
    }

    if (userId) {
      // Check for registered user purchase
      const result = await sql(
        `SELECT up.id FROM user_purchases up
         WHERE up.user_id = $1 AND up.course_id = $2 AND up.payment_status = 'completed'
         LIMIT 1`,
        [userId, courseId]
      )
      return result.length > 0
    }

    return false
  } catch (error) {
    console.error('[v0] Purchase verification error:', error)
    return false
  }
}

/**
 * Get all courses a user has purchased
 */
export async function getUserPurchasedCourses(
  email?: string,
  userId?: string
): Promise<number[]> {
  if (!email && !userId) {
    return []
  }

  try {
    const sql = neon(process.env.DATABASE_URL!)

    if (email) {
      const result = await sql(
        `SELECT DISTINCT up.course_id FROM user_purchases up
         WHERE up.user_email = $1 AND up.payment_status = 'completed'
         ORDER BY up.created_at DESC`,
        [email]
      )
      return result.map((r: any) => r.course_id)
    }

    if (userId) {
      const result = await sql(
        `SELECT DISTINCT up.course_id FROM user_purchases up
         WHERE up.user_id = $1 AND up.payment_status = 'completed'
         ORDER BY up.created_at DESC`,
        [userId]
      )
      return result.map((r: any) => r.course_id)
    }

    return []
  } catch (error) {
    console.error('[v0] Failed to fetch purchased courses:', error)
    return []
  }
}

/**
 * Create a purchase record
 */
export async function createPurchase(
  courseId: number,
  email: string,
  orderId: string,
  amountCents: number,
  userId?: string
) {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    
    const result = await sql(
      `INSERT INTO user_purchases (user_email, course_id, order_id, amount_cents, payment_status, user_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       ON CONFLICT (user_email, course_id) DO UPDATE SET
         order_id = $3,
         amount_cents = $4,
         payment_status = $5,
         updated_at = NOW()
       RETURNING *`,
      [email, courseId, orderId, amountCents, 'completed', userId || null]
    )

    return result[0]
  } catch (error) {
    console.error('[v0] Failed to create purchase:', error)
    throw error
  }
}
