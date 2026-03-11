"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Home, RefreshCw, AlertTriangle, Bug } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error)
  }, [error])

  const handleGoHome = () => {
    router.push("/")
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
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10"
            >
              <Bug className="h-8 w-8 text-destructive" />
            </motion.div>
            <CardTitle className="text-2xl font-bold text-destructive">
              Something went wrong
            </CardTitle>
            <CardDescription>
              An unexpected error occurred while loading this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>We apologize for the inconvenience. This error has been logged.</p>
              {process.env.NODE_ENV === "development" && (
                <details className="mt-2">
                  <summary className="cursor-pointer font-mono text-xs">
                    Error Details (Development Only)
                  </summary>
                  <div className="mt-2 rounded bg-muted p-2 text-xs font-mono">
                    <div className="text-destructive">{error.message}</div>
                    {error.digest && (
                      <div className="text-muted-foreground mt-1">
                        Digest: {error.digest}
                      </div>
                    )}
                    <div className="text-muted-foreground mt-1">
                      Stack: {error.stack?.substring(0, 200)}...
                    </div>
                  </div>
                </details>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button onClick={reset} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              <Button variant="outline" onClick={handleGoHome} className="gap-2">
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                If this problem persists, please contact our support team
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
                  Error Code: 500 - Internal Server Error
                </span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Timestamp: {new Date().toLocaleString()}
                {error.digest && (
                  <>
                    <br />
                    Error ID: {error.digest}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
