-- Insert topics
INSERT INTO topics (slug, title, description, category, difficulty, tone, audience, is_published, status, created_at, updated_at, published_at) VALUES
('investing-basics', 'Investing Basics', 'Learn the fundamentals of investing including stocks, bonds, and diversification strategies for building wealth.', 'investing', 'beginner', 'educational', 'general', true, 'approved', now(), now(), now()),
('financial-planning', 'Financial Planning', 'Master the essentials of creating a comprehensive financial plan for your future security and goals.', 'finance', 'intermediate', 'professional', 'professionals', true, 'approved', now(), now(), now()),
('budgeting-strategies', 'Budgeting Strategies', 'Discover effective budgeting techniques to control spending and increase your savings rate.', 'personal-finance', 'beginner', 'educational', 'general', true, 'approved', now(), now(), now()),
('real-estate-investing', 'Real Estate Investing', 'Explore the opportunities and strategies in real estate investment for long-term wealth building.', 'investing', 'intermediate', 'professional', 'professionals', true, 'approved', now(), now(), now()),
('entrepreneurship', 'Entrepreneurship', 'Start your own business journey with guidance on planning, funding, and growing your venture.', 'business', 'intermediate', 'inspirational', 'general', true, 'approved', now(), now(), now()),
('passive-income', 'Passive Income', 'Learn how to generate income that requires minimal ongoing effort through various strategies.', 'wealth-building', 'intermediate', 'inspirational', 'general', true, 'approved', now(), now(), now()),
('career-growth', 'Career Growth', 'Advance your professional career with strategies for skill development and income increase.', 'career', 'beginner', 'professional', 'professionals', true, 'approved', now(), now(), now()),
('crypto-and-blockchain', 'Crypto & Blockchain', 'Understand cryptocurrency, blockchain technology, and digital asset investing opportunities.', 'investing', 'advanced', 'professional', 'professionals', true, 'approved', now(), now(), now()) ON CONFLICT DO NOTHING;

-- Insert sample articles
INSERT INTO articles (slug, title, content, summary, excerpt, author_id, category, difficulty, tone, audience, estimated_read_time, key_points, tags, status, is_published, created_at, updated_at, published_at) VALUES
(
  'stock-market-guide',
  'The Complete Beginners Guide to Stock Market Investing',
  'Stock market investing is one of the most effective ways to build long-term wealth. Whether you are planning for retirement or building a nest egg, understanding stock market basics is essential. A stock represents ownership in a company. When you buy a stock, you become a partial owner of that company. The stock market is where these ownership shares are bought and sold. Blue Chip Stocks are shares in large, well-established companies with strong financial records. Growth Stocks are shares in companies expected to grow faster than the market average. Value Stocks are shares in established companies trading below their intrinsic value. Dividend Stocks are shares that pay regular dividends to shareholders. Stock prices fluctuate based on company earnings and performance, economic indicators, market sentiment, industry trends, and company-specific news. Choose a brokerage like Fidelity, Vanguard, Charles Schwab, or E-TRADE. You will need to open either a standard brokerage account for taxable investments, an IRA for retirement savings, or a 401k through your employer. Transfer money from your bank account to your brokerage account. Before purchasing any stock, analyze the company financial statements, read analyst reports, understand the industry, and consider your investment goals. Enter the stock ticker symbol, number of shares, and order type. Common order types include Market Order to buy at current market price, Limit Order to buy at a specific price or lower, and Stop Order to buy or sell at a specific price point. Diversification strategy means not putting all your money in one stock. Spread investments across different sectors, different company sizes, and different investment types. In your 20s use 90% stocks and 10% bonds. In your 30s use 80% stocks and 20% bonds. In your 40s use 70% stocks and 30% bonds. In your 50s use 60% stocks and 40% bonds. In your 60s use 50% stocks and 50% bonds. For beginners, consider starting with S&P 500 index funds for lowest fees and broad market exposure. Avoid emotional investing by not buying or selling based on fear or excitement. Avoid overtrading as excessive buying and selling increases fees and taxes. Do not ignore fees as high expense ratios significantly reduce returns over time. Lack of diversification by concentrating too much in one stock or sector is risky. Avoid chasing trends and trying to time the market as that usually does not work. Use dollar-cost averaging by investing fixed amounts regularly regardless of price. Reinvest dividends to purchase more shares. Stay patient as successful investors hold for decades. Keep learning and stay updated on market trends and company news. Review your portfolio quarterly to check allocation.',
  'Learn how to start investing in stocks with this comprehensive beginners guide covering everything from account setup to building a diversified portfolio.',
  'Stock market investing is one of the most effective ways to build long-term wealth. Whether you are planning for retirement or building a nest egg, understanding stock market basics is essential.',
  NULL,
  'investing',
  'beginner',
  'educational',
  'general',
  12,
  '["Stocks represent ownership in companies", "Diversification reduces risk", "Index funds are great for beginners", "Fees significantly impact returns", "Dollar-cost averaging is effective"]',
  '["stocks", "investing", "beginners", "portfolio", "wealth-building"]',
  'approved',
  true,
  now(),
  now(),
  now()
),
(
  'financial-independence',
  'Path to Financial Independence: FIRE Movement',
  'FIRE stands for Financial Independence, Retire Early. It is a movement focused on achieving financial independence through high savings rates and smart investing, allowing people to retire years or even decades earlier than traditional retirement age. The foundation of FIRE is spending significantly less than you earn. Most FIRE followers aim for a savings rate of 50-70% of their income. Your savings should be invested in a diversified portfolio that grows over time through compound interest. Monitor your net worth and adjust as needed. Many FIRE followers use the 4% rule which means you can safely withdraw 4% of your portfolio annually. If you have 1 million invested, you can withdraw 40,000 per year indefinitely. This is based on historical market returns and inflation data. Your FI Number is calculated as Annual Expenses times 25. If you spend 40,000 annually, your FI Number is 1,000,000. Phase 1 is to increase earnings over years 1-3 by developing valuable skills, negotiating higher salary, and starting side projects. Phase 2 is to maximize savings over years 4-10 by living frugally, saving 50%+ of income, investing in low-cost index funds, and building your investment portfolio. Phase 3 is optimization over years 10+ by fine-tuning spending, maximizing tax-advantaged accounts, rebalancing portfolio, and approaching financial independence. With a 50% savings rate on 60,000 annual income, you save 30,000 annually and reach FI in about 16 years with a target of 750,000. With a 70% savings rate on 100,000 annual income, you save 70,000 annually and reach FI in about 9 years with a target of 750,000. Coast FIRE means stop contributing to investments early but let them compound until retirement age. Lean FIRE means retire with lower expenses than traditional retirement projections. Barista FIRE means work part-time for benefits while living primarily off investments. Fat FIRE means retire with higher spending capacity for more lifestyle flexibility.',
  'Discover the FIRE movement strategy to achieve financial independence and potentially retire decades earlier through smart saving and investing.',
  'FIRE stands for Financial Independence, Retire Early. It is a movement focused on achieving financial independence through high savings rates.',
  NULL,
  'wealth-building',
  'intermediate',
  'inspirational',
  'professionals',
  10,
  '["Savings rate is crucial to FIRE", "The 4% rule guides safe withdrawals", "Diversification protects your wealth", "Compound interest accelerates growth", "Lifestyle optimization is key"]',
  '["FIRE", "financial-independence", "wealth-building", "investment", "retirement"]',
  'approved',
  true,
  now(),
  now(),
  now()
),
(
  'budget-like-pro',
  'How to Budget Like a Pro: Complete Framework',
  'A budget is simply a plan for your money. It ensures you spend intentionally rather than reactively, helping you reach your financial goals. Statistics show that people who budget save 20% more money annually, are 2x less likely to overspend, and achieve financial goals 4x faster. The 50/30/20 budget framework consists of 50% Needs which are essential expenses like housing, food, and utilities. 30% Wants are discretionary spending like entertainment and dining. 20% Savings are for emergency fund and investments. For 60,000 annual income this equals 30,000 per year or 2,500 per month for Needs, 18,000 per year or 1,500 per month for Wants, and 12,000 per year or 1,000 per month for Savings. Step 1 is to track all expenses for month 1 without budgeting yet to see your actual spending patterns. Step 2 is to categorize your spending into fixed expenses, variable expenses, and discretionary. Step 3 is to set realistic targets based on your tracking data, not idealistic wishes. Step 4 is to monitor progress weekly to catch overspending early. Step 5 is to adjust as needed since budgets are not rigid and should be adjusted quarterly. Popular budgeting tools include YNAB for most comprehensive features, Mint for free automatic tracking, EveryDollar for simple and intuitive interface, and spreadsheets for maximum control.',
  'Master the 50/30/20 budgeting framework with our comprehensive guide to take control of your finances and accelerate wealth building.',
  'A budget is simply a plan for your money. It ensures you spend intentionally rather than reactively, helping you reach your financial goals.',
  NULL,
  'personal-finance',
  'beginner',
  'educational',
  'general',
  8,
  '["50/30/20 rule simplifies budgeting", "Tracking is the first step", "Budgets should be flexible", "Review regularly for success", "Budgeting accelerates goal achievement"]',
  '["budgeting", "personal-finance", "money-management", "financial-planning"]',
  'approved',
  true,
  now(),
  now(),
  now()
) ON CONFLICT DO NOTHING;

-- Link articles to topics
INSERT INTO article_topics (article_id, topic_id) 
SELECT a.id, t.id FROM articles a, topics t 
WHERE (a.slug = 'stock-market-guide' AND t.slug = 'investing-basics')
   OR (a.slug = 'financial-independence' AND t.slug = 'passive-income')
   OR (a.slug = 'budget-like-pro' AND t.slug = 'budgeting-strategies')
   OR (a.slug = 'budget-like-pro' AND t.slug = 'financial-planning')
ON CONFLICT DO NOTHING;
