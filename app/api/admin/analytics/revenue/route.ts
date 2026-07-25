import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()

    if (user?.role !== "admin") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Revenue by course
    const courseRevenueResult = await sql`
      SELECT 
        c.id, c.title, c.slug,
        COUNT(up.id) as purchases,
        SUM(up.amount_cents) as revenue_cents,
        AVG(up.amount_cents / 100.0) as avg_price
      FROM courses c
      LEFT JOIN user_purchases up ON c.id = up.course_id
      GROUP BY c.id, c.title, c.slug
      ORDER BY revenue_cents DESC NULLS LAST
    `

    // Revenue by coupon (if any)
    const couponRevenueResult = await sql`
      SELECT 
        cp.code, cp.discount_percent,
        COUNT(DISTINCT up.id) as uses,
        SUM(up.amount_cents) as revenue_cents
      FROM coupons cp
      LEFT JOIN user_purchases up ON up.metadata->>'couponCode' = cp.code
      WHERE cp.status = 'active'
      GROUP BY cp.code, cp.discount_percent
      ORDER BY revenue_cents DESC NULLS LAST
    `

    // Daily revenue (last 30 days)
    const dailyRevenueResult = await sql`
      SELECT 
        DATE(up.created_at) as date,
        COUNT(up.id) as purchases,
        SUM(up.amount_cents) as revenue_cents
      FROM user_purchases up
      WHERE up.created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(up.created_at)
      ORDER BY date DESC
    `

    // Summary stats
    const summaryResult = await sql`
      SELECT 
        COUNT(DISTINCT up.id) as total_purchases,
        SUM(up.amount_cents) as total_revenue_cents,
        COUNT(DISTINCT up.user_email) as unique_customers,
        COUNT(DISTINCT up.course_id) as courses_sold,
        AVG(up.amount_cents) as avg_order_value_cents
      FROM user_purchases up
      WHERE up.created_at >= NOW() - INTERVAL '30 days'
    `

    const summary = summaryResult.rows[0] || {}

    return new Response(
      JSON.stringify({
        summary: {
          totalPurchases: summary.total_purchases || 0,
          totalRevenue: (summary.total_revenue_cents || 0) / 100,
          uniqueCustomers: summary.unique_customers || 0,
          coursesSold: summary.courses_sold || 0,
          avgOrderValue: (summary.avg_order_value_cents || 0) / 100,
        },
        byCoarse: courseRevenueResult.rows.map((row: any) => ({
          ...row,
          revenue: (row.revenue_cents || 0) / 100,
          avgPrice: row.avg_price || 0,
        })),
        byCoupon: couponRevenueResult.rows.map((row: any) => ({
          ...row,
          revenue: (row.revenue_cents || 0) / 100,
        })),
        daily: dailyRevenueResult.rows.map((row: any) => ({
          ...row,
          revenue: (row.revenue_cents || 0) / 100,
        })),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    )
  } catch (error) {
    console.error("[v0] Revenue analytics error:", error)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
