-- Comprehensive course and lessons seed data

-- Delete existing courses first to avoid duplicates
DELETE FROM courses WHERE slug IN ('stock-trading-101', 'real-estate-mastery', 'crypto-fundamentals', 'financial-independence-101', 'entrepreneurship-bootcamp', 'passive-income-streams', 'investment-psychology', 'tax-strategies-wealth');

-- Insert comprehensive courses with lesson counts and pricing
INSERT INTO courses (
  slug, title, subtitle, description, level, category, price_cents, lessons, duration, 
  featured, is_visible, status, kind, what_you_get, cover_image, created_at
) VALUES
(
  'stock-trading-101',
  'Stock Trading 101: From Basics to Profits',
  'Master the fundamentals of stock trading and build your trading strategy',
  'Learn stock trading from the ground up. This comprehensive course covers market fundamentals, technical analysis, risk management, and proven trading strategies. Perfect for beginners wanting to enter the stock market with confidence.',
  'beginner',
  'investing',
  29999,
  12,
  '4 weeks',
  true,
  true,
  'published',
  'course',
  '{"items":["Complete trading strategy guide","12 video lessons (45+ mins each)","Daily trading journal template","Risk management calculator","Technical analysis cheat sheet","Live trading examples","Community access","90-day money-back guarantee"]}',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
  NOW()
),
(
  'real-estate-mastery',
  'Real Estate Mastery: Building Wealth Through Property',
  'Complete guide to real estate investing, from properties to portfolio management',
  'Comprehensive real estate course covering property analysis, financing strategies, tenant management, and portfolio diversification. Learn from successful real estate investors and build your property empire.',
  'intermediate',
  'real-estate',
  39999,
  15,
  '6 weeks',
  true,
  true,
  'published',
  'course',
  '{"items":["15 detailed video lessons","Property analysis spreadsheets","Financing options guide","Tenant screening checklist","Property management workflow","REI tax strategies","Case studies from $1M+ investors","Real estate software recommendations"]}',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
  NOW()
),
(
  'crypto-fundamentals',
  'Cryptocurrency Fundamentals: Bitcoin to DeFi',
  'Master blockchain, cryptocurrencies, and DeFi in 8 comprehensive lessons',
  'From Bitcoin basics to advanced DeFi strategies. Learn blockchain technology, cryptocurrency security, trading, and smart investing in digital assets. Includes real-world case studies and risk management.',
  'beginner',
  'crypto',
  24999,
  8,
  '3 weeks',
  true,
  true,
  'published',
  'course',
  '{"items":["8 comprehensive video lessons","Blockchain explained guide","Wallet security best practices","DeFi opportunity analysis","Trading vs. investing framework","Crypto tax implications","Scam prevention guide","Community discussion forum"]}',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
  NOW()
),
(
  'financial-independence-101',
  'Financial Independence 101: Your Path to Freedom',
  'Design and execute your personal financial independence plan in 10 modules',
  'The most comprehensive FIRE course available. Learn the FI/RE philosophy, calculate your FI number, optimize spending, maximize income, and invest strategically. Includes retirement calculators and case studies.',
  'beginner',
  'financial-planning',
  34999,
  10,
  '5 weeks',
  true,
  true,
  'published',
  'course',
  '{"items":["10 in-depth video modules","FI number calculator (interactive)","Retirement budget planner","Income optimization strategies","Investment portfolio builder","Tax-efficient withdrawal strategies","Geographic arbitrage guide","Real-world FI case studies"]}',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
  NOW()
),
(
  'entrepreneurship-bootcamp',
  'Entrepreneurship Bootcamp: Launch Your Business',
  'Complete guide from idea to $100K+ revenue in your first year',
  'Intensive 12-week bootcamp covering business fundamentals, market validation, funding, growth strategies, and scaling. Learn from successful entrepreneurs who built multi-million dollar businesses.',
  'intermediate',
  'entrepreneurship',
  49999,
  16,
  '12 weeks',
  true,
  true,
  'published',
  'course',
  '{"items":["16 intensive video lessons","Business plan template","Market research framework","Pitch deck template","Financial projections spreadsheet","Customer acquisition strategies","Scaling frameworks","Pitch to investors guide","1-on-1 office hours (4/month)"]}',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
  NOW()
),
(
  'passive-income-streams',
  'Passive Income Streams: Multiple Revenue Sources',
  'Build 5+ passive income streams and earn while you sleep',
  'Comprehensive guide to creating sustainable passive income. Covers digital products, rental income, dividends, affiliate marketing, and more. Real income reports from all income types included.',
  'intermediate',
  'passive-income',
  29999,
  11,
  '4 weeks',
  true,
  true,
  'published',
  'course',
  '{"items":["11 focused video lessons","Passive income calculator","Digital product checklist","Affiliate marketing guide","Rental income analysis template","Dividend portfolio builder","Automation workflows","Real student income reports","Tax implications guide"]}',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
  NOW()
),
(
  'investment-psychology',
  'Investment Psychology: Master Your Mind',
  'Overcome emotional investing and build long-term wealth',
  'Learn the psychology behind investing decisions. Understand cognitive biases, emotions, and behavioral patterns that hold back investors. Includes meditation, journaling, and decision-making frameworks.',
  'intermediate',
  'investing',
  19999,
  7,
  '2 weeks',
  false,
  true,
  'published',
  'course',
  '{"items":["7 practical video lessons","Behavioral finance guide","Emotion journal template","Cognitive bias reference","Decision-making framework","Market volatility guide","Portfolio review checklist","Mindfulness exercises"]}',
  'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800',
  NOW()
),
(
  'tax-strategies-wealth',
  'Tax Strategies for Wealth Building',
  'Legally minimize taxes and keep more of your wealth',
  'Advanced tax strategies for wealth building. Cover income optimization, investment tax-loss harvesting, retirement accounts, entity structures, and tax-efficient wealth transfer planning.',
  'advanced',
  'financial-planning',
  39999,
  9,
  '4 weeks',
  false,
  true,
  'published',
  'course',
  '{"items":["9 expert video lessons","Tax strategy checklist","Retirement account comparison","Tax-loss harvesting spreadsheet","Entity structure guide","Tax calendar 2024","Deduction tracker","Tax attorney referral network","Annual tax planning template"]}',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
  NOW()
);

-- Create a lessons table if it doesn't exist
CREATE TABLE IF NOT EXISTS lessons (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT,
  order_index INTEGER NOT NULL,
  duration_minutes INTEGER,
  video_url VARCHAR(500),
  lesson_type VARCHAR(50) DEFAULT 'video',
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert lessons for Stock Trading 101
INSERT INTO lessons (course_id, title, description, order_index, duration_minutes, lesson_type)
SELECT id, 'Markets Fundamentals: How Stock Markets Work', 'Understand market structure, exchanges, and trading basics', 1, 45, 'video'
FROM courses WHERE slug = 'stock-trading-101'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (course_id, title, description, order_index, duration_minutes, lesson_type)
SELECT id, 'Reading Charts: Technical Analysis Basics', 'Learn candlesticks, trends, and support/resistance levels', 2, 50, 'video'
FROM courses WHERE slug = 'stock-trading-101'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (course_id, title, description, order_index, duration_minutes, lesson_type)
SELECT id, 'Finding Winners: Stock Screening Strategies', 'Discover high-potential stocks using data-driven methods', 3, 40, 'video'
FROM courses WHERE slug = 'stock-trading-101'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (course_id, title, description, order_index, duration_minutes, lesson_type)
SELECT id, 'Building Your First Strategy', 'Create a personalized trading strategy from scratch', 4, 55, 'video'
FROM courses WHERE slug = 'stock-trading-101'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (course_id, title, description, order_index, duration_minutes, lesson_type)
SELECT id, 'Risk Management: Protecting Your Capital', 'Position sizing, stop losses, and risk/reward ratios', 5, 35, 'video'
FROM courses WHERE slug = 'stock-trading-101'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (course_id, title, description, order_index, duration_minutes, lesson_type)
SELECT id, 'Psychology of Trading: Emotions and Discipline', 'Master the mental game of successful trading', 6, 45, 'video'
FROM courses WHERE slug = 'stock-trading-101'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (course_id, title, description, order_index, duration_minutes, lesson_type)
SELECT id, 'Trading Platforms and Tools', 'Setup your trading workspace and essential tools', 7, 30, 'video'
FROM courses WHERE slug = 'stock-trading-101'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (course_id, title, description, order_index, duration_minutes, lesson_type)
SELECT id, 'Live Trading Examples: Real Trades Analyzed', 'Watch real trades with commentary and analysis', 8, 60, 'video'
FROM courses WHERE slug = 'stock-trading-101'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (course_id, title, description, order_index, duration_minutes, lesson_type)
SELECT id, 'Tax Implications for Day Traders', 'Understand wash sales, short-term gains, and reporting', 9, 25, 'video'
FROM courses WHERE slug = 'stock-trading-101'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (course_id, title, description, order_index, duration_minutes, lesson_type)
SELECT id, 'Advanced Setups: Multi-timeframe Analysis', 'Combine multiple timeframes for better entries', 10, 45, 'video'
FROM courses WHERE slug = 'stock-trading-101'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (course_id, title, description, order_index, duration_minutes, lesson_type)
SELECT id, 'Course Review and Action Plan', 'Recap concepts and build your 30-day trading plan', 11, 40, 'video'
FROM courses WHERE slug = 'stock-trading-101'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (course_id, title, description, order_index, duration_minutes, lesson_type)
SELECT id, 'Q&A: Your Trading Questions Answered', 'Student questions answered with detailed explanations', 12, 35, 'video'
FROM courses WHERE slug = 'stock-trading-101'
ON CONFLICT DO NOTHING;

-- Insert lessons for Real Estate Mastery  
INSERT INTO lessons (course_id, title, description, order_index, duration_minutes, lesson_type)
SELECT id, 'Real Estate Investing Foundations', 'Different strategies: flipping, rentals, REITs, wholesaling', 1, 50, 'video'
FROM courses WHERE slug = 'real-estate-mastery'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (course_id, title, description, order_index, duration_minutes, lesson_type)
SELECT id, 'Finding Deals: Where and How to Look', 'Off-market deals, auctions, wholesalers, and networks', 2, 45, 'video'
FROM courses WHERE slug = 'real-estate-mastery'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (course_id, title, description, order_index, duration_minutes, lesson_type)
SELECT id, 'Property Analysis: Making Offers That Win', 'Cap rates, cash flow, ARV, and ROI calculations', 3, 55, 'video'
FROM courses WHERE slug = 'real-estate-mastery'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (course_id, title, description, order_index, duration_minutes, lesson_type)
SELECT id, 'Financing Options: From Conventional to Creative', 'Mortgages, hard money, private lenders, and partnerships', 4, 50, 'video'
FROM courses WHERE slug = 'real-estate-mastery'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (course_id, title, description, order_index, duration_minutes, lesson_type)
SELECT id, 'Renovation Basics: Budgeting and Contractors', 'Estimating rehab costs and managing contractors', 5, 45, 'video'
FROM courses WHERE slug = 'real-estate-mastery'
ON CONFLICT DO NOTHING;

-- Insert lessons for Crypto Fundamentals
INSERT INTO lessons (course_id, title, description, order_index, duration_minutes, lesson_type)
SELECT id, 'Blockchain Basics: The Technology Behind Crypto', 'How blockchain works and why it matters', 1, 50, 'video'
FROM courses WHERE slug = 'crypto-fundamentals'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (course_id, title, description, order_index, duration_minutes, lesson_type)
SELECT id, 'Bitcoin Deep Dive: Digital Gold Explained', 'Bitcoin history, supply, and investment thesis', 2, 45, 'video'
FROM courses WHERE slug = 'crypto-fundamentals'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (course_id, title, description, order_index, duration_minutes, lesson_type)
SELECT id, 'Ethereum and Smart Contracts', 'Ethereum, tokens, and decentralized applications', 3, 50, 'video'
FROM courses WHERE slug = 'crypto-fundamentals'
ON CONFLICT DO NOTHING;

-- Insert lessons for Financial Independence
INSERT INTO lessons (course_id, title, description, order_index, duration_minutes, lesson_type)
SELECT id, 'What is Financial Independence (FI)?', 'FIRE philosophy and your path to freedom', 1, 45, 'video'
FROM courses WHERE slug = 'financial-independence-101'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (course_id, title, description, order_index, duration_minutes, lesson_type)
SELECT id, 'Calculate Your FI Number', 'Determine how much you need to retire', 2, 40, 'video'
FROM courses WHERE slug = 'financial-independence-101'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (course_id, title, description, order_index, duration_minutes, lesson_type)
SELECT id, 'The 4% Rule and Retirement Planning', 'Safe withdrawal strategies for life-long retirement', 3, 35, 'video'
FROM courses WHERE slug = 'financial-independence-101'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (course_id, title, description, order_index, duration_minutes, lesson_type)
SELECT id, 'Expense Optimization: Smart Frugality', 'Cut expenses strategically without sacrificing joy', 4, 50, 'video'
FROM courses WHERE slug = 'financial-independence-101'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (course_id, title, description, order_index, duration_minutes, lesson_type)
SELECT id, 'Income Maximization Strategies', 'Negotiate, side hustle, and increase earning power', 5, 55, 'video'
FROM courses WHERE slug = 'financial-independence-101'
ON CONFLICT DO NOTHING;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(course_id, order_index);
