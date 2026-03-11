"use client"

import { motion } from "framer-motion"
import { Award, Star, Trophy, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface AchievementBadgeProps {
  type: 'bronze' | 'silver' | 'gold' | 'platinum'
  title: string
  description: string
  unlocked?: boolean
  progress?: number
  size?: 'sm' | 'md' | 'lg'
  delay?: number
  className?: string
}

export function AchievementBadge({
  type,
  title,
  description,
  unlocked = false,
  progress = 0,
  size = 'md',
  delay = 0,
  className
}: AchievementBadgeProps) {
  const typeConfig = {
    bronze: { color: 'bg-amber-600', icon: Award, glow: 'shadow-amber-500/20' },
    silver: { color: 'bg-gray-400', icon: Star, glow: 'shadow-gray-400/20' },
    gold: { color: 'bg-yellow-500', icon: Trophy, glow: 'shadow-yellow-500/20' },
    platinum: { color: 'bg-purple-600', icon: Zap, glow: 'shadow-purple-500/20' }
  }

  const sizeConfig = {
    sm: { size: 40, iconSize: 16 },
    md: { size: 60, iconSize: 24 },
    lg: { size: 80, iconSize: 32 }
  }

  const config = typeConfig[type]
  const sizeSettings = sizeConfig[size]
  const Icon = config.icon

  return (
    <motion.div
      className={cn(
        "relative flex flex-col items-center",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="relative">
        <motion.div
          className={cn(
            "rounded-full flex items-center justify-center",
            unlocked ? config.color : "bg-gray-300",
            unlocked && `shadow-lg ${config.glow}`
          )}
          style={{ width: sizeSettings.size, height: sizeSettings.size }}
          animate={unlocked ? {
            rotate: [0, 5, -5, 0],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
            ease: "easeInOut"
          }}
        >
          <Icon 
            size={sizeSettings.iconSize} 
            className={unlocked ? "text-white" : "text-gray-500"}
          />
        </motion.div>
        
        {progress > 0 && !unlocked && (
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
            <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>
        )}
        
        {unlocked && (
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.8 }}
          />
        )}
      </div>
      
      <motion.div
        className="text-center mt-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <div className="text-sm font-medium text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground max-w-[100px]">{description}</div>
      </motion.div>
    </motion.div>
  )
}

interface AchievementGridProps {
  achievements: Array<{
    type: 'bronze' | 'silver' | 'gold' | 'platinum'
    title: string
    description: string
    unlocked?: boolean
    progress?: number
  }>
  className?: string
}

export function AchievementGrid({ achievements, className }: AchievementGridProps) {
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4", className)}>
      {achievements.map((achievement, index) => (
        <AchievementBadge
          key={achievement.title}
          {...achievement}
          delay={index * 0.1}
        />
      ))}
    </div>
  )
}
