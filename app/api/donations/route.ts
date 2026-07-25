import { NextResponse, type NextRequest } from "next/server"
import { stripe } from "@/lib/stripe"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

const ORIGIN = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

// POST — create a Stripe Checkout session for a card donation
export async function POST(request: NextRequest) {
  try {
    const { amountCents, donorName, donorEmail, message } = await request.json()

    const amount = Number(amountCents)
    if (!Number.isInteger(amount) || amount < 100 || amount > 100000000) {
      return NextResponse.json(
        { error: "Donation must be between $1 and $1,000,000" },
        { status: 400 }
      )
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: donorEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Donation to WealthPath",
              description: "Support free financial education for everyone",
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${ORIGIN}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${ORIGIN}/#donate`,
      metadata: {
        type: "donation",
        donorName: donorName || "",
      },
    })

    await sql`
      INSERT INTO donations (donor_name, donor_email, amount_cents, method, message, status, stripe_session_id)
      VALUES (${donorName || null}, ${donorEmail || null}, ${amount}, 'card', ${message || null}, 'pending', ${session.id})
    `

    return NextResponse.json({ sessionUrl: session.url })
  } catch (error: any) {
    console.error("[v0] Donation checkout error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to start donation" },
      { status: 500 }
    )
  }
}

// GET — admin: list donations with totals
export async function GET() {
  const user = await getCurrentUser()
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const [donations, totals] = await Promise.all([
      sql`
        SELECT id, donor_name, donor_email, amount_cents, currency, method, message, status, created_at, completed_at
        FROM donations ORDER BY created_at DESC LIMIT 100
      `,
      sql`
        SELECT
          COALESCE(SUM(amount_cents) FILTER (WHERE status = 'completed'), 0) AS total_completed_cents,
          COUNT(*) FILTER (WHERE status = 'completed') AS completed_count,
          COUNT(*) FILTER (WHERE status = 'pending') AS pending_count
        FROM donations
      `,
    ])

    return NextResponse.json({ donations, totals: totals[0] })
  } catch (error) {
    console.error("[v0] Donations list error:", error)
    return NextResponse.json({ error: "Failed to load donations" }, { status: 500 })
  }
}
