import { stripe } from '@/lib/stripe'
import { neon } from '@neondatabase/serverless'
import { createPurchase } from '@/lib/purchase-service'

// Stripe webhook signature secret - set in environment
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return Response.json({ error: 'No signature' }, { status: 400 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error: any) {
    console.error('[v0] Webhook verification error:', error.message)
    return Response.json(
      { error: `Webhook verification failed: ${error.message}` },
      { status: 400 }
    )
  }

  try {
    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any

      const courseId = parseInt(session.metadata.courseId)
      const email = session.customer_email || session.metadata.email
      const amountCents = session.amount_total

      if (!courseId || !email || !amountCents) {
        console.error('[v0] Missing required metadata in session:', session)
        return Response.json({ error: 'Invalid session metadata' }, { status: 400 })
      }

      const sql = neon(process.env.DATABASE_URL!)

      // Create order record
      const orderResult = await sql(
        `INSERT INTO orders (reference, course_id, email, buyer_name, amount_cents, status, delivery_status, created_at, paid_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         RETURNING id`,
        [
          session.id, // Use Stripe session ID as order reference
          courseId,
          email,
          session.customer_details?.name || 'Guest',
          amountCents,
          'completed',
          'ready',
        ]
      )

      const orderId = orderResult[0].id

      // Create user_purchase record for access tracking
      await createPurchase(courseId, email, orderId.toString(), amountCents)

      console.log('[v0] Purchase recorded:', {
        orderId,
        courseId,
        email,
        amount: amountCents,
        stripeSessionId: session.id,
      })

      // TODO: Send confirmation email via Resend or other email service
      console.log('[v0] Email delivery would be queued here for:', email)
    }

    return Response.json({ received: true })
  } catch (error: any) {
    console.error('[v0] Webhook handler error:', error)
    return Response.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
