"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Home, Search, ArrowLeft, RefreshCw, FileQuestion, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

export default function NotFound() {
  const router = useRouter()

  const handleRefresh = () => {
    router.refresh()
  }

  const handleGoHome = () => {
    router.push("/")
  }

  const handleSearch = () => {
    router.push("/#search")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-none">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted"
            >
              <FileQuestion className="h-8 w-8 text-muted-foreground" />
            </motion.div>
            <CardTitle className="text-2xl font-bold">Page Not Found</CardTitle>
            <CardDescription>
              The page you're looking for doesn't exist or has been moved.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Here are a few things you can try:</p>
              <ul className="list-inside list-disc space-y-1 text-left">
                <li>Check the URL for typos</li>
                <li>Go back to the previous page</li>
                <li>Return to the homepage</li>
                <li>Search for what you're looking for</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={handleRefresh} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button variant="outline" onClick={() => router.back()} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <Button onClick={handleGoHome} className="gap-2">
                <Home className="h-4 w-4" />
                Go Home
              </Button>
              <Button variant="outline" onClick={handleSearch} className="gap-2">
                <Search className="h-4 w-4" />
                Search Site
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                If you think this is an error, please contact support
              </p>
            </div>
          </CardContent>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6 text-center"
        >
          <Card className="border-dashed border-border/50 bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4" />
                <span>
                  Error Code: 404 - Page Not Found
                </span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Timestamp: {new Date().toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
