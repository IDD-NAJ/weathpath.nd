'use client';

import { AnimatedCounter } from './animated-counter';
import { ScrollReveal } from './scroll-reveal';

export function StatisticsSection() {
  const stats = [
    {
      value: 50000,
      suffix: '+',
      label: 'Active Learners',
      description: 'Students building wealth daily',
    },
    {
      value: 1000000,
      prefix: '$',
      label: 'Generated Income',
      description: 'From our student community',
    },
    {
      value: 150,
      suffix: '+',
      label: 'Expert Guides',
      description: 'Real strategies & tactics',
    },
    {
      value: 95,
      suffix: '%',
      label: 'Success Rate',
      description: 'Students achieve their goals',
    },
  ];

  return (
    <section className="relative py-16 md:py-24 bg-gradient-to-b from-background to-surface-1 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-accent opacity-5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-20 w-96 h-96 bg-primary opacity-5 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 max-w-6xl">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-foreground">
            Our Community&apos;s Impact
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of successful wealth builders
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <ScrollReveal
              key={index}
              animation="scale-in"
              delay={index * 0.15}
              className="min-w-0 bg-card rounded-lg p-6 border border-border hover:border-primary/50 transition-colors duration-300"
            >
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2 font-sans leading-tight break-words">
                <AnimatedCounter
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  duration={2}
                  delay={index * 0.1}
                />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {stat.label}
              </h3>
              <p className="text-sm text-muted-foreground">
                {stat.description}
              </p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
