'use client';

import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { ScrollReveal } from './scroll-reveal';

interface CommunityPost {
  id: number;
  author: string;
  avatar: string;
  topic: string;
  content: string;
  likes: number;
  comments: number;
  timestamp: string;
}

const communityPosts: CommunityPost[] = [
  {
    id: 1,
    author: 'Sarah Chen',
    avatar: '👩‍💼',
    topic: 'Travel Content Creation',
    content:
      'Just hit $5K from my first YouTube channel! Followed the roadmap exactly and the income started flowing. Cannot recommend enough!',
    likes: 324,
    comments: 42,
    timestamp: '2h ago',
  },
  {
    id: 2,
    author: 'Marcus Johnson',
    avatar: '👨‍💻',
    topic: 'Coding & Freelancing',
    content:
      'Finally landed my first $500 client project! Been practicing the pitching strategies and they actually work. Thanks to this community!',
    likes: 287,
    comments: 35,
    timestamp: '4h ago',
  },
  {
    id: 3,
    author: 'Priya Patel',
    avatar: '📈',
    topic: 'Investing',
    content:
      'My portfolio is now generating consistent passive income. The investment guides here helped me understand risk management much better.',
    likes: 412,
    comments: 58,
    timestamp: '6h ago',
  },
  {
    id: 4,
    author: 'Alex Rivera',
    avatar: '🛍️',
    topic: 'Dropshipping',
    content:
      'Month 3 and already broke even on my store! The traffic hacks taught here are game-changers. Scaling up next month!',
    likes: 356,
    comments: 51,
    timestamp: '8h ago',
  },
];

export function CommunityFeed() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-surface-1 to-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-foreground">
            Success Stories from Our Community
          </h2>
          <p className="text-lg text-muted-foreground">
            Real people, real results, real journeys to wealth
          </p>
        </ScrollReveal>

        <div className="space-y-6">
          {communityPosts.map((post, index) => (
            <ScrollReveal
              key={post.id}
              animation="fade-up"
              delay={Math.min(index * 0.1, 0.3)}
              className="stagger-item"
            >
              <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-md">
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-4xl">{post.avatar}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">
                        {post.author}
                      </h3>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {post.topic}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {post.timestamp}
                    </p>
                  </div>
                </div>

                <p className="text-foreground mb-4 leading-relaxed">
                  {post.content}
                </p>

                <div className="flex items-center gap-6 text-muted-foreground pt-4 border-t border-border/50">
                  <button className="flex items-center gap-2 hover:text-primary transition-colors duration-200 group">
                    <Heart
                      size={18}
                      className="group-hover:fill-primary transition-colors"
                    />
                    <span className="text-sm">{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-primary transition-colors duration-200">
                    <MessageCircle size={18} />
                    <span className="text-sm">{post.comments}</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-primary transition-colors duration-200 ml-auto">
                    <Share2 size={18} />
                  </button>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal
          animation="fade-up"
          delay={0.4}
          className="text-center mt-12"
        >
          <button className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 font-semibold">
            Join Our Community
          </button>
        </ScrollReveal>
      </div>
    </section>
  );
}
