"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: "up" | "down" | "left" | "right" | "none"
}

export function AnimatedSection({
  children,
  className,
  delay = 0,
  direction = "up",
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

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
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const translateMap = {
    up: "translate-y-8",
    down: "-translate-y-8",
    left: "translate-x-8",
    right: "-translate-x-8",
    none: "",
  }

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        isVisible
          ? "translate-x-0 translate-y-0 opacity-100"
          : `opacity-0 ${translateMap[direction]}`,
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

interface AnimatedItemProps {
  children: ReactNode
  className?: string
  index?: number
  staggerMs?: number
  direction?: "up" | "down" | "left" | "right" | "none"
}

export function AnimatedItem({
  children,
  className,
  index = 0,
  staggerMs = 120,
  direction = "up",
}: AnimatedItemProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

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
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const translateMap = {
    up: "translate-y-6",
    down: "-translate-y-6",
    left: "translate-x-6",
    right: "-translate-x-6",
    none: "",
  }

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-600 ease-out",
        isVisible
          ? "translate-x-0 translate-y-0 opacity-100"
          : `opacity-0 ${translateMap[direction]}`,
        className
      )}
      style={{ transitionDelay: `${index * staggerMs}ms` }}
    >
      {children}
    </div>
  )
}

interface StaggerChildrenProps {
  children: ReactNode
  className?: string
  staggerMs?: number
  direction?: "up" | "down" | "left" | "right" | "none"
}

export function StaggerChildren({
  children,
  className,
  staggerMs = 100,
  direction = "up",
}: StaggerChildrenProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

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
      { threshold: 0.05, rootMargin: "0px 0px -40px 0px" }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const translateMap = {
    up: "translate-y-6",
    down: "-translate-y-6",
    left: "translate-x-6",
    right: "-translate-x-6",
    none: "",
  }

  return (
    <div ref={ref} className={className}>
      {Array.isArray(children)
        ? children.map((child, i) => (
            <div
              key={i}
              className={cn(
                "transition-all duration-600 ease-out",
                isVisible
                  ? "translate-x-0 translate-y-0 opacity-100"
                  : `opacity-0 ${translateMap[direction]}`
              )}
              style={{ transitionDelay: `${i * staggerMs}ms` }}
            >
              {child}
            </div>
          ))
        : children}
    </div>
  )
}
