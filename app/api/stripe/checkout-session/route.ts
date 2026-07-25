import { getStripe } from '@/lib/stripe'
import { getProductById, validateProductPrice } from '@/lib/products'
import { sql } from '@/lib/db'

const ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function POST(request: Request) {
  try {
    const { courseId, email, priceInCents, couponCode } = await request.json()

    if (!courseId || !email || !priceInCents) {
      return Response.json(
        { error: 'Missing required fields: courseId, email, priceInCents' },
        { status: 400 }
      )
    }

    // Server-side price validation to prevent tampering
    const isValidPrice = await validateProductPrice(courseId, priceInCents)
    if (!isValidPrice) {
      return Response.json(
        { error: 'Invalid price for this course' },
        { status: 400 }
      )
    }

    const product = await getProductById(courseId)
    if (!product) {
      return Response.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Validate and apply coupon server-side
    let finalPriceCents = priceInCents
    let appliedCoupon: { code: string; percent_off: number } | null = null
    if (couponCode) {
      const code = String(couponCode).trim().toUpperCase()
      const rows = await sql`
        SELECT code, percent_off, expires_at, max_redemptions, times_redeemed
        FROM coupons
        WHERE code = ${code} AND active = true
      `
      const coupon = rows[0]
      const isExpired = coupon?.expires_at && new Date(coupon.expires_at) < new Date()
      const isExhausted = coupon?.max_redemptions && coupon.times_redeemed >= coupon.max_redemptions
      if (!coupon || isExpired || isExhausted) {
        return Response.json({ error: 'Invalid or expired coupon code' }, { status: 400 })
      }
      appliedCoupon = { code: coupon.code, percent_off: coupon.percent_off }
      finalPriceCents = Math.max(50, Math.round(priceInCents * (1 - coupon.percent_off / 100)))
    }

    const stripe = getStripe()

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: appliedCoupon
                ? `${product.description || ''} (Coupon ${appliedCoupon.code}: ${appliedCoupon.percent_off}% off)`.trim()
                : product.description,
              images: product.image ? [product.image] : [],
            },
            unit_amount: finalPriceCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${ORIGIN}/courses/${product.slug}/success?session_id={CHECKOUT_SESSION_ID}&email=${encodeURIComponent(email)}`,
      cancel_url: `${ORIGIN}/courses/${product.slug}`,
      metadata: {
        courseId: courseId.toString(),
        email,
        ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {}),
      },
    })

    return Response.json({ sessionId: session.id, sessionUrl: session.url })
  } catch (error: any) {
    console.error('[v0] Checkout session error:', error)
    return Response.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
