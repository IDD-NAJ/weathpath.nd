"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedProgressProps {
  value: number
  max?: number
  className?: string
  label?: string
  showPercentage?: boolean
  color?: "primary" | "secondary" | "success" | "warning" | "destructive"
  size?: "sm" | "md" | "lg"
  animated?: boolean
}

export function AnimatedProgress({
  value,
  max = 100,
  className,
  label,
  showPercentage = true,
  color = "primary",
  size = "md",
  animated = true
}: AnimatedProgressProps) {
  const percentage = Math.min((value / max) * 100, 100)
  
  const colorClasses = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    destructive: "bg-red-500"
  }

  const sizeClasses = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4"
  }

  return (
    <div className={cn("space-y-2", className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="font-medium">{label}</span>}
          {showPercentage && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-muted-foreground"
            >
              {Math.round(percentage)}%
            </motion.span>
          )}
        </div>
      )}
      <div className={cn(
        "w-full bg-secondary rounded-full overflow-hidden",
        sizeClasses[size]
      )}>
        <motion.div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            colorClasses[color]
          )}
          initial={{ width: "0%" }}
          animate={{ width: `${percentage}%` }}
          transition={{ 
            duration: animated ? 1.5 : 0,
            ease: "easeInOut",
            delay: 0.2
          }}
        />
      </div>
    </div>
  )
}

interface CircularProgressProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  className?: string
  color?: "primary" | "secondary" | "success" | "warning" | "destructive"
  showPercentage?: boolean
  label?: string
}

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  className,
  color = "primary",
  showPercentage = true,
  label
}: CircularProgressProps) {
  const percentage = Math.min((value / max) * 100, 100)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const colorClasses = {
    primary: "text-primary stroke-primary",
    secondary: "text-secondary stroke-secondary",
    success: "text-green-500 stroke-green-500",
    warning: "text-yellow-500 stroke-yellow-500",
    destructive: "text-red-500 stroke-red-500"
  }

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="fill-none stroke-secondary/20"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className={cn("fill-none", colorClasses[color])}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercentage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-2xl font-bold"
          >
            {Math.round(percentage)}%
          </motion.div>
        )}
        {label && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="text-xs text-muted-foreground text-center"
          >
            {label}
          </motion.div>
        )}
      </div>
    </div>
  )
}
