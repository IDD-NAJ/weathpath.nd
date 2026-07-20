import { BookOpen, Lock, CheckCircle2 } from "lucide-react"

interface Module {
  id: number
  title: string
  lessons: number
  description: string
}

const COURSE_MODULES: Record<string, Module[]> = {
  "investing-foundations": [
    {
      id: 1,
      title: "Investing Fundamentals",
      lessons: 8,
      description: "Learn the basics of stocks, bonds, and diversification",
    },
    {
      id: 2,
      title: "Building Your Portfolio",
      lessons: 6,
      description: "Create a balanced portfolio tailored to your goals",
    },
    {
      id: 3,
      title: "Risk Management",
      lessons: 5,
      description: "Protect your investments and handle market volatility",
    },
    {
      id: 4,
      title: "Advanced Strategies",
      lessons: 7,
      description: "Options, dividends, and tax-efficient investing",
    },
  ],
  "crypto-safely": [
    {
      id: 1,
      title: "Crypto Basics",
      lessons: 6,
      description: "Understand blockchain and cryptocurrency fundamentals",
    },
    {
      id: 2,
      title: "Secure Wallets & Storage",
      lessons: 5,
      description: "Protect your crypto assets with proper security",
    },
    {
      id: 3,
      title: "Trading & Exchanges",
      lessons: 7,
      description: "Navigate exchanges and execute trades safely",
    },
    {
      id: 4,
      title: "Risk & Compliance",
      lessons: 4,
      description: "Understand regulatory requirements and risks",
    },
  ],
  "dropshipping-blueprint": [
    {
      id: 1,
      title: "Dropshipping Basics",
      lessons: 5,
      description: "How dropshipping works and the business model",
    },
    {
      id: 2,
      title: "Finding Products",
      lessons: 8,
      description: "Research and identify winning products",
    },
    {
      id: 3,
      title: "Building Your Store",
      lessons: 10,
      description: "Set up Shopify and optimize for conversions",
    },
    {
      id: 4,
      title: "Marketing & Scale",
      lessons: 9,
      description: "Ads, SEO, and scaling to 6-7 figures",
    },
  ],
  "saas-coding": [
    {
      id: 1,
      title: "SaaS Foundations",
      lessons: 7,
      description: "SaaS business model and technical architecture",
    },
    {
      id: 2,
      title: "Full-Stack Development",
      lessons: 15,
      description: "Build modern web applications with Next.js",
    },
    {
      id: 3,
      title: "Database & APIs",
      lessons: 10,
      description: "Design scalable databases and RESTful APIs",
    },
    {
      id: 4,
      title: "Deployment & DevOps",
      lessons: 8,
      description: "Deploy to production and manage infrastructure",
    },
  ],
  "travel-content": [
    {
      id: 1,
      title: "Content Creation Basics",
      lessons: 6,
      description: "Photography, videography, and storytelling",
    },
    {
      id: 2,
      title: "Building an Audience",
      lessons: 7,
      description: "Grow followers and engagement on social media",
    },
    {
      id: 3,
      title: "Monetization Strategies",
      lessons: 8,
      description: "Sponsorships, affiliate marketing, and brand deals",
    },
    {
      id: 4,
      title: "Travel Hacking",
      lessons: 5,
      description: "Travel cheap and sustainably worldwide",
    },
  ],
  "side-hustle-method": [
    {
      id: 1,
      title: "Choosing Your Hustle",
      lessons: 4,
      description: "Identify the right side hustle for your skills",
    },
    {
      id: 2,
      title: "Getting Started",
      lessons: 6,
      description: "Launch your side business in your spare time",
    },
    {
      id: 3,
      title: "Time Management",
      lessons: 5,
      description: "Balance your job with your side hustle",
    },
    {
      id: 4,
      title: "Scaling to Full-Time",
      lessons: 7,
      description: "Grow your side hustle into a full-time income",
    },
  ],
}

export function CourseModules({ slug, isLocked }: { slug: string; isLocked: boolean }) {
  const modules = COURSE_MODULES[slug] || []

  return (
    <div className="space-y-6">
      <h3 className="font-serif text-2xl font-bold text-foreground">Course Modules</h3>

      <div className="space-y-3">
        {modules.map((module, index) => (
          <div
            key={module.id}
            className={`rounded-sm border p-4 ${
              isLocked
                ? "border-border bg-muted/30"
                : "border-border bg-card hover:shadow-md transition-shadow"
            }`}
          >
            <div className="flex items-start gap-3">
              {isLocked ? (
                <Lock className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              )}

              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-1">
                  Module {index + 1}: {module.title}
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {module.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <BookOpen className="h-3 w-3" />
                  {module.lessons} lessons
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
