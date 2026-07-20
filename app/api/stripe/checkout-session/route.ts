import { stripe } from '@/lib/stripe'
import { getProductById, validateProductPrice } from '@/lib/products'

const ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function POST(request: Request) {
  try {
    const { courseId, email, priceInCents } = await request.json()

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
              description: product.description,
              images: product.image ? [product.image] : [],
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${ORIGIN}/courses/${product.slug}/success?session_id={CHECKOUT_SESSION_ID}&email=${encodeURIComponent(email)}`,
      cancel_url: `${ORIGIN}/courses/${product.slug}`,
      metadata: {
        courseId: courseId.toString(),
        email,
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
