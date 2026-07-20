'use client';

import { useEffect, useRef } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  animation?: 'fade-up' | 'scale-in' | 'slide-in-left' | 'slide-in-right';
}

export function ScrollReveal({
  children,
  className = '',
  delay = 0,
  duration = 0.6,
  animation = 'fade-up',
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && ref.current) {
          ref.current.style.animation = `none`;
          const animationClass = `animate-${animation}`;
          const delayClass = delay > 0 ? `animate-${animation}-delay-${Math.round(delay * 10)}` : '';
          
          ref.current.classList.add(animationClass);
          if (delayClass) ref.current.classList.add(delayClass);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      ref.current.style.opacity = '0';
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [animation, delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
