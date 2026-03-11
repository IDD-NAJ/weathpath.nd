-- Seed an admin user (password: admin123)
-- bcrypt hash for "admin123" with 10 rounds
INSERT INTO users (name, email, password_hash, role) VALUES
  ('Admin', 'admin@wealthpath.com', '$2a$10$Ks0xG7gfSa0VcI4lVjZqJeG8xT7mQjHYkD5L1xMu0XF7RqGkXz5Oi', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Seed a regular user (password: user123)
INSERT INTO users (name, email, password_hash, role) VALUES
  ('Demo User', 'user@wealthpath.com', '$2a$10$Ks0xG7gfSa0VcI4lVjZqJeG8xT7mQjHYkD5L1xMu0XF7RqGkXz5Oi', 'user')
ON CONFLICT (email) DO NOTHING;

-- Seed some learning paths
INSERT INTO learning_paths (title, description, level, duration, module_count, topics, is_published) VALUES
  ('Real Estate Fundamentals', 'Learn how rental properties generate steady monthly income, from finding your first property to managing tenants.', 'beginner', '4 weeks', 8, ARRAY['Rental Income', 'Property Selection', 'Financing', 'Tenant Management'], true),
  ('Dividend Investing', 'Build a portfolio of stocks that pay you regularly, growing your income over time.', 'beginner', '3 weeks', 6, ARRAY['Stock Selection', 'Dividend Growth', 'Portfolio Balance', 'Reinvestment'], true),
  ('Digital Products', 'Create once, sell forever. Learn to build ebooks, courses, and templates.', 'intermediate', '5 weeks', 10, ARRAY['Course Creation', 'Ebook Writing', 'Pricing Strategy', 'Marketing'], true),
  ('Online Business Models', 'Explore affiliate marketing, dropshipping, and content monetization.', 'intermediate', '6 weeks', 12, ARRAY['Affiliate Marketing', 'Content Strategy', 'Revenue Streams', 'Scaling'], true),
  ('Interest and Lending', 'Make your savings work harder through high-yield accounts and peer lending.', 'beginner', '2 weeks', 5, ARRAY['High-Yield Savings', 'Peer Lending', 'Bonds', 'Risk Assessment'], true),
  ('Risk Management', 'Protect your wealth with smart diversification and risk evaluation.', 'advanced', '3 weeks', 7, ARRAY['Diversification', 'Tax Planning', 'Insurance', 'Estate Planning'], false)
ON CONFLICT DO NOTHING;

-- Seed some articles
INSERT INTO articles (title, slug, content, excerpt, category, is_published) VALUES
  ('Getting Started with Passive Income', 'getting-started-passive-income', 'Passive income is money earned with minimal ongoing effort. Unlike a traditional job where you trade time for money, passive income streams continue to generate revenue even when you are not actively working...', 'A beginner-friendly guide to understanding what passive income really means and how to start building it.', 'Getting Started', true),
  ('The Power of Compound Interest', 'power-of-compound-interest', 'Albert Einstein reportedly called compound interest the eighth wonder of the world. Whether or not he actually said it, the principle is powerful...', 'Discover why starting early matters more than starting big when it comes to building wealth.', 'Investing', true),
  ('5 Low-Cost Ways to Start Investing', '5-low-cost-ways-to-start-investing', 'You do not need thousands of dollars to begin investing. Many platforms now allow you to start with as little as $5...', 'You do not need a fortune to begin. Here are five accessible ways to start your investment journey today.', 'Investing', true)
ON CONFLICT (slug) DO NOTHING;

-- Seed some success stories
INSERT INTO success_stories (name, title, quote, income, strategy, is_published, display_order) VALUES
  ('Sarah M.', 'From Teacher to Investor', 'I started with just $200 a month in index funds. Three years later, my dividend income covers my car payment. WealthPath showed me it was possible.', '$450/month', 'Dividend Investing', true, 1),
  ('Marcus L.', 'Digital Course Creator', 'After following the Digital Products path, I created an online course about woodworking. It now earns passive income every single month while I sleep.', '$2,100/month', 'Digital Products', true, 2),
  ('Jennifer K.', 'Real Estate Beginner', 'I was intimidated by real estate until I found the step-by-step guides here. I now own two rental properties that cover their own mortgages and then some.', '$1,800/month', 'Real Estate', true, 3),
  ('David P.', 'Side Income Builder', 'Between high-yield savings and a small affiliate blog, I have built multiple income streams. None of them are huge, but together they make a real difference.', '$900/month', 'Multiple Streams', true, 4)
ON CONFLICT DO NOTHING;
