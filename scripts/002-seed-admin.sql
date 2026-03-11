-- Seed a default admin user (password: admin123)
-- bcrypt hash for "admin123" with 12 rounds
INSERT INTO users (id, name, email, password_hash, role, is_active)
VALUES (
  gen_random_uuid(),
  'Admin User',
  'admin@wealthpath.com',
  '$2a$12$LJ3m4ys3GZxkGJMEP7VJd.0NLdkFSQGGCmSBYYBKQQHq3Pr.jDKWi',
  'admin',
  true
)
ON CONFLICT DO NOTHING;

-- Seed some sample learning paths
INSERT INTO learning_paths (title, description, level, duration, module_count, topics, is_published) VALUES
('Real Estate Fundamentals', 'Learn the basics of real estate investing, from rental properties to REITs.', 'beginner', '6 weeks', 8, ARRAY['Rental Properties', 'REITs', 'Market Analysis', 'Financing'], true),
('Dividend Investing', 'Build a portfolio of dividend-paying stocks for reliable passive income.', 'intermediate', '4 weeks', 6, ARRAY['Dividend Stocks', 'Portfolio Building', 'Reinvestment', 'Risk Management'], true),
('Digital Products', 'Create and sell digital products that generate income while you sleep.', 'beginner', '5 weeks', 7, ARRAY['E-books', 'Online Courses', 'Templates', 'Marketing'], true)
ON CONFLICT DO NOTHING;

-- Seed sample success stories
INSERT INTO success_stories (name, title, quote, income, strategy, display_order, is_published) VALUES
('Sarah M.', 'Dividend Investor', 'I started with just $500 per month in dividend stocks. Three years later, my portfolio generates $2,100 monthly in passive income.', '$2,100/mo', 'Dividend Investing', 1, true),
('James T.', 'Real Estate Investor', 'WealthPath taught me how to analyze rental properties. I now own two units that cover my mortgage and put $1,800 in my pocket each month.', '$1,800/mo', 'Rental Properties', 2, true),
('Priya K.', 'Digital Creator', 'My online course on financial literacy has sold over 3,000 copies. It truly is income that works while I rest.', '$3,200/mo', 'Digital Products', 3, true)
ON CONFLICT DO NOTHING;

-- Seed default site settings
INSERT INTO site_settings (key, value) VALUES
('general', '{"site_name": "WealthPath", "tagline": "Your Guide to Building Passive Wealth", "description": "Learn how to create lasting passive income through clear, jargon-free education."}'),
('features', '{"show_quiz": true, "show_calculator": true, "show_stories": true, "show_resources": true}'),
('contact', '{"support_email": "hello@wealthpath.com", "twitter": "", "linkedin": ""}')
ON CONFLICT (key) DO NOTHING;
