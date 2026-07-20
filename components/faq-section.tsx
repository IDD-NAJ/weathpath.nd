'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ScrollReveal } from './scroll-reveal';

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: 'How long does it take to start earning passive income?',
    answer:
      'Most of our learners see their first income within 2-4 weeks of applying the strategies. However, building sustainable passive income typically takes 3-6 months of consistent effort. The key is starting immediately and being persistent.',
  },
  {
    question: 'Do I need any prior experience?',
    answer:
      'Not at all! Our guides are designed for complete beginners. We start with the fundamentals and gradually build up to advanced strategies. All you need is the willingness to learn and take action.',
  },
  {
    question: 'Which income stream should I focus on first?',
    answer:
      'We recommend starting with the income stream that aligns with your skills and interests. Our learning paths guide you through each option. Most successful members combine 2-3 streams for maximum income generation.',
  },
  {
    question: 'Is there a guarantee I&apos;ll make money?',
    answer:
      'While we provide proven strategies from successful students, individual results vary based on effort and market conditions. We offer support and guidance to maximize your chances of success.',
  },
  {
    question: 'Can I access materials on mobile?',
    answer:
      'Yes! All our guides, courses, and resources are fully optimized for mobile devices. Learn and work on income streams from anywhere, anytime.',
  },
  {
    question: 'What if I need help with a specific income stream?',
    answer:
      'Our community forum and expert guides cover all common questions. You can also connect with other learners and mentors for personalized advice and support.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know to get started
          </p>
        </ScrollReveal>

        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <ScrollReveal
              key={index}
              animation="fade-up"
              delay={Math.min(index * 0.08, 0.4)}
              className="stagger-item"
            >
              <button
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
                className="w-full bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all duration-300 text-left group"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                    {item.question}
                  </h3>
                  <ChevronDown
                    size={20}
                    className={`text-muted-foreground flex-shrink-0 transition-transform duration-300 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </div>

                {openIndex === index && (
                  <div className="mt-4 pt-4 border-t border-border text-muted-foreground animate-fade-up">
                    {item.answer}
                  </div>
                )}
              </button>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
