'use client'

import { useEffect, useRef, useState, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ScrollFadeSectionProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  parallax?: boolean
  parallaxIntensity?: number
}

export function ScrollFadeSection({
  children,
  className,
  delay = 0,
  direction = 'up',
  parallax = false,
  parallaxIntensity = 0.5,
}: ScrollFadeSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [parallaxOffset, setParallaxOffset] = useState(0)

  // Intersection Observer for fade-in animation
  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(node)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  // Parallax scroll effect
  useEffect(() => {
    if (!parallax) return

    const handleScroll = () => {
      if (!ref.current) return

      const rect = ref.current.getBoundingClientRect()
      const distanceFromTop = rect.top + window.scrollY

      if (rect.top >= -window.innerHeight && rect.bottom <= window.innerHeight * 2) {
        const scrollProgress = (window.scrollY - (distanceFromTop - window.innerHeight)) / window.innerHeight
        const offset = scrollProgress * 100 * parallaxIntensity
        setParallaxOffset(offset)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [parallax, parallaxIntensity])

  const translateMap = {
    up: 'translate-y-8',
    down: '-translate-y-8',
    left: 'translate-x-8',
    right: '-translate-x-8',
    none: '',
  }

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-out',
        isVisible
          ? 'translate-x-0 translate-y-0 opacity-100'
          : `opacity-0 ${translateMap[direction]}`,
        className
      )}
      style={{
        transitionDelay: `${delay}ms`,
        transform: parallax && isVisible ? `translateY(${parallaxOffset}px)` : undefined,
      }}
    >
      {children}
    </div>
  )
}
