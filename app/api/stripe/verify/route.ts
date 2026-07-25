import { NextResponse, type NextRequest } from "next/server"
import { getStripe } from "@/lib/stripe"
import { sql } from "@/lib/db"
import { createPurchase } from "@/lib/purchase-service"

/**
 * Auto-confirm orders after payment.
 * Called from the success page with the Stripe session id — verifies payment
 * status directly with Stripe and records the order + purchase idempotently.
 */
export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 })
    }

    const session = await getStripe().checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== "paid") {
      return NextResponse.json({ confirmed: false, status: session.payment_status })
    }

    const email = session.customer_email || session.metadata?.email || session.customer_details?.email
    const amountCents = session.amount_total || 0

    // Donation session
    if (session.metadata?.type === "donation") {
      const updated = await sql`
        UPDATE donations
        SET status = 'completed', completed_at = NOW(),
            donor_email = COALESCE(donor_email, ${email || null})
        WHERE stripe_session_id = ${sessionId} AND status != 'completed'
        RETURNING id
      `
      // Insert if the pending record was never created
      if (updated.length === 0) {
        const existing = await sql`SELECT id FROM donations WHERE stripe_session_id = ${sessionId}`
        if (existing.length === 0) {
          await sql`
            INSERT INTO donations (donor_email, amount_cents, method, status, stripe_session_id, completed_at)
            VALUES (${email || null}, ${amountCents}, 'card', 'completed', ${sessionId}, NOW())
          `
        }
      }
      return NextResponse.json({ confirmed: true, type: "donation" })
    }

    // Course purchase session
    const courseId = Number(session.metadata?.courseId)
    if (!courseId || !email) {
      return NextResponse.json({ error: "Invalid session metadata" }, { status: 400 })
    }

    // Idempotent: skip if already recorded
    const existing = await sql`
      SELECT id, reference, email, buyer_name, status, created_at
      FROM orders WHERE stripe_session_id = ${sessionId}
    `
    if (existing.length > 0) {
      return NextResponse.json({ confirmed: true, order: existing[0], alreadyRecorded: true })
    }

    const orderRows = await sql`
      INSERT INTO orders (reference, course_id, email, buyer_name, amount_cents, status, delivery_status, stripe_session_id, created_at, paid_at)
      VALUES (${sessionId}, ${courseId}, ${email}, ${session.customer_details?.name || "Guest"}, ${amountCents}, 'completed', 'ready', ${sessionId}, NOW(), NOW())
      RETURNING id, reference, email, buyer_name, status, created_at
    `
    const order = orderRows[0]

    await createPurchase(courseId, email, String(order.id), amountCents)

    // Record coupon redemption if one was used
    if (session.metadata?.couponCode) {
      try {
        await sql`
          UPDATE coupons SET times_redeemed = times_redeemed + 1 WHERE code = ${session.metadata.couponCode}
        `
      } catch (couponError) {
        console.error("[v0] Failed to record coupon redemption:", couponError)
      }
    }

    console.log("[v0] Order auto-confirmed:", { orderId: order.id, courseId, email })

    return NextResponse.json({ confirmed: true, order })
  } catch (error: any) {
    console.error("[v0] Payment verify error:", error)
    return NextResponse.json({ error: error.message || "Verification failed" }, { status: 500 })
  }
}
