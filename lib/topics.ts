import { Plane, Code2, Bitcoin, ShoppingBag, BarChart3, Zap, type LucideIcon } from "lucide-react"

export interface TopicConfig {
  slug: string
  title: string
  tagline: string
  description: string
  icon: LucideIcon
  color: {
    badge: string       // pill background + text
    iconBg: string      // icon wrapper
    heroBg: string      // hero section background
    accent: string      // text accent color (tailwind class)
    border: string      // card border color
  }
  highlights: { stat: string; label: string }[]
  whatYouLearn: string[]
  category: string      // DB category name used to filter articles
}

export const TOPICS: Record<string, TopicConfig> = {
  travel: {
    slug: "travel",
    title: "Travel Content",
    tagline: "Earn while you explore the world",
    description:
      "Discover how bloggers, YouTubers, and social creators turn wanderlust into sustainable income — from affiliate travel deals to brand sponsorships and course sales.",
    icon: Plane,
    color: {
      badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
      heroBg: "from-blue-50/60 dark:from-blue-950/20",
      accent: "text-blue-600 dark:text-blue-400",
      border: "border-blue-200/60 dark:border-blue-800/40",
    },
    highlights: [
      { stat: "$10k+", label: "Avg monthly travel blogger income" },
      { stat: "3–6 mo", label: "Time to first monetization" },
      { stat: "$0", label: "Startup cost for blog/YT" },
    ],
    whatYouLearn: [
      "Start a travel blog or YouTube channel from scratch",
      "Monetize through affiliate programs and partnerships",
      "Grow your audience with SEO and social content",
      "Land brand sponsorships and press trips",
      "Sell digital products like guides and presets",
    ],
    category: "Travel",
  },
  coding: {
    slug: "coding",
    title: "Coding & Tech",
    tagline: "Build products that generate revenue 24/7",
    description:
      "Whether you are a developer or just starting out, the internet pays well for technical skills. Learn to build SaaS products, sell templates, or offer freelance services that scale.",
    icon: Code2,
    color: {
      badge: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
      iconBg: "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
      heroBg: "from-violet-50/60 dark:from-violet-950/20",
      accent: "text-violet-600 dark:text-violet-400",
      border: "border-violet-200/60 dark:border-violet-800/40",
    },
    highlights: [
      { stat: "$150/hr", label: "Senior freelance dev rate" },
      { stat: "6 mo", label: "To launch a SaaS MVP" },
      { stat: "Recurring", label: "Revenue model for SaaS" },
    ],
    whatYouLearn: [
      "Launch a micro-SaaS product step by step",
      "Sell code templates and UI kits on marketplaces",
      "Offer high-value freelance dev services",
      "Build and monetize developer tools",
      "Create coding courses and tutorials",
    ],
    category: "Coding",
  },
  bitcoin: {
    slug: "bitcoin",
    title: "Bitcoin & Crypto",
    tagline: "Navigate digital assets with clarity",
    description:
      "Bitcoin, Ethereum, DeFi, staking — the crypto space is full of opportunity and risk. Learn to separate signal from noise, hold strategically, and avoid the most common mistakes.",
    icon: Bitcoin,
    color: {
      badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
      iconBg: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
      heroBg: "from-amber-50/60 dark:from-amber-950/20",
      accent: "text-amber-600 dark:text-amber-400",
      border: "border-amber-200/60 dark:border-amber-800/40",
    },
    highlights: [
      { stat: "21M", label: "Bitcoin hard cap (scarcity)" },
      { stat: "4 yr", label: "Bitcoin halving cycle" },
      { stat: "DYOR", label: "The #1 crypto rule" },
    ],
    whatYouLearn: [
      "Understand Bitcoin, Ethereum, and major altcoins",
      "Set up self-custody wallets safely",
      "Dollar-cost average and long-term hold strategies",
      "Explore DeFi, staking, and yield opportunities",
      "Spot and avoid scams and rug pulls",
    ],
    category: "Bitcoin",
  },
  dropshipping: {
    slug: "dropshipping",
    title: "Dropshipping",
    tagline: "Launch a product business without holding inventory",
    description:
      "Dropshipping lets you sell physical products online without warehousing or upfront inventory. Learn to find winning products, set up a store, and run profitable ad campaigns.",
    icon: ShoppingBag,
    color: {
      badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
      iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
      heroBg: "from-emerald-50/60 dark:from-emerald-950/20",
      accent: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-200/60 dark:border-emerald-800/40",
    },
    highlights: [
      { stat: "$500", label: "Typical starting budget" },
      { stat: "20–40%", label: "Average profit margin" },
      { stat: "Shopify", label: "Most popular platform" },
    ],
    whatYouLearn: [
      "Find winning products using data tools",
      "Build a Shopify store that converts",
      "Source reliable suppliers from AliExpress and beyond",
      "Run Facebook and TikTok ads profitably",
      "Scale from $0 to $10k/month",
    ],
    category: "Dropshipping",
  },
  investing: {
    slug: "investing",
    title: "Investing",
    tagline: "Let compounding do the heavy lifting",
    description:
      "Long-term investing is the most proven path to building wealth. Learn how stocks, index funds, dividends, and real estate can grow your net worth steadily over time.",
    icon: BarChart3,
    color: {
      badge: "bg-primary/10 text-primary",
      iconBg: "bg-primary/10 text-primary",
      heroBg: "from-primary/5 dark:from-primary/10",
      accent: "text-primary",
      border: "border-primary/20",
    },
    highlights: [
      { stat: "10%", label: "S&P 500 historical avg return" },
      { stat: "$100", label: "Enough to start investing" },
      { stat: "30 yr", label: "Compounding sweet spot" },
    ],
    whatYouLearn: [
      "Open and fund a brokerage account",
      "Understand index funds, ETFs, and dividends",
      "Build a diversified, low-cost portfolio",
      "Invest in real estate with REITs",
      "Tax-optimize with 401k, IRA, and HSA",
    ],
    category: "Investing",
  },
  "side-hustles": {
    slug: "side-hustles",
    title: "Side Hustles",
    tagline: "Earn extra income starting this week",
    description:
      "Not every income stream takes years to build. Side hustles can generate meaningful extra money quickly — from freelancing and consulting to reselling and gig platforms.",
    icon: Zap,
    color: {
      badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
      iconBg: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
      heroBg: "from-purple-50/60 dark:from-purple-950/20",
      accent: "text-purple-600 dark:text-purple-400",
      border: "border-purple-200/60 dark:border-purple-800/40",
    },
    highlights: [
      { stat: "$500–$5k", label: "Monthly side hustle range" },
      { stat: "1 week", label: "Time to first gig income" },
      { stat: "100+", label: "Viable side hustle options" },
    ],
    whatYouLearn: [
      "Find your highest-value skill and monetize it",
      "Start freelancing on Upwork and Fiverr",
      "Resell products on eBay, Amazon, and Facebook",
      "Offer local services with zero startup cost",
      "Turn a side hustle into a full-time business",
    ],
    category: "Side Hustles",
  },
}
