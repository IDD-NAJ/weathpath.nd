import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL)

const courses = [
  {
    slug: "investing-foundations",
    title: "Investing Foundations",
    subtitle: "Build a long-term portfolio with confidence",
    description:
      "A complete beginner-to-confident course covering index funds, asset allocation, tax-advantaged accounts, and how to build a portfolio you can hold for decades. No jargon, no hype — just the fundamentals that actually compound.",
    category: "Investing",
    kind: "course",
    level: "Beginner",
    price_cents: 4900,
    cover_image: "/courses/investing-foundations.png",
    lessons: 24,
    duration: "6.5 hours",
    what_you_get: [
      "24 on-demand video lessons",
      "Portfolio allocation spreadsheet",
      "Tax-advantaged account checklist",
      "Lifetime access & updates",
    ],
    download_url: "https://example.com/downloads/investing-foundations",
    featured: true,
  },
  {
    slug: "crypto-safely",
    title: "Crypto Without the Chaos",
    subtitle: "Navigate digital assets safely and rationally",
    description:
      "Understand how crypto actually works, how to store it securely, how to avoid scams, and how to think about risk. A grounded, security-first course for people who want exposure without gambling.",
    category: "Bitcoin",
    kind: "course",
    level: "Beginner",
    price_cents: 5900,
    cover_image: "/courses/crypto-safely.png",
    lessons: 18,
    duration: "4 hours",
    what_you_get: [
      "18 video lessons",
      "Wallet security setup guide",
      "Scam-detection checklist",
      "Lifetime access & updates",
    ],
    download_url: "https://example.com/downloads/crypto-safely",
    featured: true,
  },
  {
    slug: "dropshipping-blueprint",
    title: "The Dropshipping Blueprint",
    subtitle: "Launch a lean product business from scratch",
    description:
      "A step-by-step system for validating products, setting up a store, running your first ads, and fulfilling orders — without holding inventory. Includes real supplier vetting frameworks.",
    category: "Dropshipping",
    kind: "course",
    level: "Intermediate",
    price_cents: 7900,
    cover_image: "/courses/dropshipping-blueprint.png",
    lessons: 30,
    duration: "8 hours",
    what_you_get: [
      "30 video lessons",
      "Product validation framework",
      "Supplier vetting scorecard",
      "Ad campaign templates",
    ],
    download_url: "https://example.com/downloads/dropshipping-blueprint",
    featured: true,
  },
  {
    slug: "saas-coding",
    title: "Ship Your First SaaS",
    subtitle: "From idea to paying customers as a developer",
    description:
      "Turn your coding skills into recurring revenue. Covers picking an idea, building an MVP fast, pricing, and getting your first paying users. Practical and opinionated.",
    category: "Coding",
    kind: "course",
    level: "Intermediate",
    price_cents: 8900,
    cover_image: "/courses/saas-coding.png",
    lessons: 26,
    duration: "7 hours",
    what_you_get: [
      "26 video lessons",
      "MVP scoping template",
      "Pricing strategy worksheet",
      "Launch checklist",
    ],
    download_url: "https://example.com/downloads/saas-coding",
    featured: false,
  },
  {
    slug: "travel-content",
    title: "Earn While You Travel",
    subtitle: "Build income as a travel content creator",
    description:
      "Learn how creators fund their travels through content, sponsorships, and digital products. Covers content systems, brand deals, and diversifying beyond a single platform.",
    category: "Travel",
    kind: "course",
    level: "Beginner",
    price_cents: 4900,
    cover_image: "/courses/travel-content.png",
    lessons: 20,
    duration: "5 hours",
    what_you_get: [
      "20 video lessons",
      "Content calendar template",
      "Brand pitch email scripts",
      "Lifetime access & updates",
    ],
    download_url: "https://example.com/downloads/travel-content",
    featured: false,
  },
  {
    slug: "side-hustle-method",
    title: "The Weekend Side Hustle Method",
    subtitle: "A downloadable system for recurring income",
    description:
      "A concise, action-first method (PDF workbook + templates) for launching a profitable side hustle in your spare time. Pick a model, validate in a weekend, and scale what works.",
    category: "Side Hustles",
    kind: "method",
    level: "Beginner",
    price_cents: 2900,
    cover_image: "/courses/side-hustle-method.png",
    lessons: 0,
    duration: "PDF workbook",
    what_you_get: [
      "60-page PDF workbook",
      "12 side-hustle model breakdowns",
      "Weekend validation sprint",
      "Notion tracking template",
    ],
    download_url: "https://example.com/downloads/side-hustle-method",
    featured: false,
  },
]

async function seed() {
  console.log("Seeding courses...")
  for (const c of courses) {
    await sql`
      INSERT INTO courses (slug, title, subtitle, description, category, kind, level, price_cents, cover_image, lessons, duration, what_you_get, download_url, featured)
      VALUES (${c.slug}, ${c.title}, ${c.subtitle}, ${c.description}, ${c.category}, ${c.kind}, ${c.level}, ${c.price_cents}, ${c.cover_image}, ${c.lessons}, ${c.duration}, ${JSON.stringify(c.what_you_get)}, ${c.download_url}, ${c.featured})
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        subtitle = EXCLUDED.subtitle,
        description = EXCLUDED.description,
        category = EXCLUDED.category,
        kind = EXCLUDED.kind,
        level = EXCLUDED.level,
        price_cents = EXCLUDED.price_cents,
        cover_image = EXCLUDED.cover_image,
        lessons = EXCLUDED.lessons,
        duration = EXCLUDED.duration,
        what_you_get = EXCLUDED.what_you_get,
        download_url = EXCLUDED.download_url,
        featured = EXCLUDED.featured
    `
    console.log(`  seeded: ${c.title}`)
  }
  const rows = await sql`SELECT COUNT(*)::int AS count FROM courses`
  console.log(`Done. Total courses: ${rows[0].count}`)
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})
