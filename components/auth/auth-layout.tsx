'use client'

import React from 'react'

interface AuthLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  showLogo?: boolean
}

export function AuthLayout({
  children,
  title,
  subtitle,
  showLogo = true,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center px-4 py-8">
      {/* Animated background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-gentle"></div>
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse-gentle" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        {showLogo && (
          <div className="text-center mb-8 animate-fade-down">
            <h1 className="text-3xl font-bold text-foreground mb-2">WealthPath</h1>
            <p className="text-muted-foreground">Build Real Wealth, One Step at a Time</p>
          </div>
        )}

        {title && (
          <div className="mb-8 animate-fade-down-delay-1">
            <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
            {subtitle && (
              <p className="text-muted-foreground text-sm">{subtitle}</p>
            )}
          </div>
        )}

        {/* Form Container */}
        <div className="bg-background rounded-2xl border border-border/50 shadow-lg backdrop-blur-sm p-8 animate-fade-up">
          {children}
        </div>

        {/* Footer text */}
        <p className="text-center text-xs text-muted-foreground mt-6 animate-fade-up-delay-2">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
