'use client';

import { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  animation?: 'fade-up' | 'scale-in' | 'slide-in-left' | 'slide-in-right';
}

const hiddenTransforms: Record<NonNullable<ScrollRevealProps['animation']>, string> = {
  'fade-up': 'translateY(24px)',
  'scale-in': 'scale(0.95)',
  'slide-in-left': 'translateX(-30px)',
  'slide-in-right': 'translateX(30px)',
};

export function ScrollReveal({
  children,
  className = '',
  delay = 0,
  duration = 0.6,
  animation = 'fade-up',
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(node);

    return () => {
      observer.unobserve(node);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'none' : hiddenTransforms[animation],
        transition: `opacity ${duration}s ease ${delay}s, transform ${duration}s ease ${delay}s`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}
