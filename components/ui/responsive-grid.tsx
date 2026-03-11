"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ResponsiveGridProps {
  children: React.ReactNode
  className?: string
  cols?: {
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: number
}

export function ResponsiveGrid({ 
  children, 
  className,
  cols = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 4
}: ResponsiveGridProps) {
  const gridClasses = cn(
    "grid",
    `gap-${gap}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    className
  )

  return (
    <div className={gridClasses}>
      {children}
    </div>
  )
}

interface AnimatedGridItemProps {
  children: React.ReactNode
  index: number
  className?: string
  delay?: number
}

export function AnimatedGridItem({ 
  children, 
  index, 
  className,
  delay = 0.1
}: AnimatedGridItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay: delay + index * 0.1,
        ease: "easeOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
