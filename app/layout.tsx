import type { Metadata, Viewport } from 'next'
import { DM_Sans, DM_Serif_Display } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
})
const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
})

export const metadata: Metadata = {
  title: 'WealthPath - Your Guide to Building Passive Wealth',
  description: 'Learn how to create lasting passive income through clear, jargon-free education. Explore interactive tools, step-by-step guides, and real success stories.',
  icons: {
    icon: [
      {
        url: '/favicon.png',
        type: 'image/png',
      },
      {
        url: '/icon.png',
        type: 'image/png',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#9c1b1b',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  if (!publishableKey) {
    throw new Error(
      "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set. Add it to your Vercel project environment variables and redeploy."
    )
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <html lang="en" suppressHydrationWarning className="bg-background">
        <body className={`${dmSans.variable} ${dmSerif.variable} font-sans antialiased bg-background text-foreground`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            storageKey="app-theme"
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
