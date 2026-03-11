"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface AnimatedCardProps {
  children: React.ReactNode
  className?: string
  delay?: number
  hover?: boolean
  glow?: boolean
}

export function AnimatedCard({ 
  children, 
  className, 
  delay = 0,
  hover = true,
  glow = false
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { 
        y: -5, 
        boxShadow: glow ? "0 20px 40px rgba(0,0,0,0.1)" : "0 10px 20px rgba(0,0,0,0.05)"
      } : {}}
      className={cn(
        "transition-all duration-300",
        glow && "hover:shadow-xl hover:shadow-primary/10",
        className
      )}
    >
      <Card className={cn(
        "border-border/50 bg-card/50 backdrop-blur-sm",
        hover && "hover:border-primary/30",
        className
      )}>
        {children}
      </Card>
    </motion.div>
  )
}

interface AnimatedStatCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  delay?: number
  className?: string
}

export function AnimatedStatCard({
  title,
  value,
  description,
  icon,
  trend,
  delay = 0,
  className
}: AnimatedStatCardProps) {
  return (
    <AnimatedCard delay={delay} className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: delay + 0.2 }}
          className="text-muted-foreground"
        >
          {icon}
        </motion.div>
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: delay + 0.3 }}
        >
          <div className="text-2xl font-bold text-foreground">{value}</div>
          {trend && (
            <div className="flex items-center gap-1 mt-1">
              <span className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}>
                {trend.isPositive ? "+" : "-"}{trend.value}%
              </span>
              <span className="text-xs text-muted-foreground">vs last period</span>
            </div>
          )}
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </motion.div>
      </CardContent>
    </AnimatedCard>
  )
}
