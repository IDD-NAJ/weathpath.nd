import bcrypt from "bcryptjs"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL)

const hash = bcrypt.hashSync("admin123", 12)
console.log("Generated hash for admin123:", hash)

// Seed admin user
const existingAdmin = await sql`SELECT id FROM users WHERE email = 'admin@wealthpath.com'`
if (existingAdmin.length === 0) {
  await sql`
    INSERT INTO users (id, name, email, password_hash, role, is_active)
    VALUES (gen_random_uuid(), 'Admin User', 'admin@wealthpath.com', ${hash}, 'admin', true)
  `
  console.log("Admin user created: admin@wealthpath.com / admin123")
} else {
  console.log("Admin user already exists, skipping")
}

// Seed learning paths
const existingPaths = await sql`SELECT id FROM learning_paths LIMIT 1`
if (existingPaths.length === 0) {
  await sql`INSERT INTO learning_paths (title, description, level, duration, module_count, topics, is_published)
    VALUES ('Real Estate Fundamentals', 'Learn the basics of real estate investing, from rental properties to REITs.', 'beginner', '6 weeks', 8, ARRAY['Rental Properties', 'REITs', 'Market Analysis', 'Financing'], true)`
  await sql`INSERT INTO learning_paths (title, description, level, duration, module_count, topics, is_published)
    VALUES ('Dividend Investing', 'Build a portfolio of dividend-paying stocks for reliable passive income.', 'intermediate', '4 weeks', 6, ARRAY['Dividend Stocks', 'Portfolio Building', 'Reinvestment', 'Risk Management'], true)`
  await sql`INSERT INTO learning_paths (title, description, level, duration, module_count, topics, is_published)
    VALUES ('Digital Products', 'Create and sell digital products that generate income while you sleep.', 'beginner', '5 weeks', 7, ARRAY['E-books', 'Online Courses', 'Templates', 'Marketing'], true)`
  console.log("Learning paths seeded")
} else {
  console.log("Learning paths exist, skipping")
}

// Seed success stories
const existingStories = await sql`SELECT id FROM success_stories LIMIT 1`
if (existingStories.length === 0) {
  await sql`INSERT INTO success_stories (name, title, quote, income, strategy, display_order, is_published)
    VALUES ('Sarah M.', 'Dividend Investor', 'I started with just $500 per month in dividend stocks. Three years later, my portfolio generates $2,100 monthly in passive income.', '$2,100/mo', 'Dividend Investing', 1, true)`
  await sql`INSERT INTO success_stories (name, title, quote, income, strategy, display_order, is_published)
    VALUES ('James T.', 'Real Estate Investor', 'WealthPath taught me how to analyze rental properties. I now own two units that cover my mortgage and put $1,800 in my pocket each month.', '$1,800/mo', 'Rental Properties', 2, true)`
  await sql`INSERT INTO success_stories (name, title, quote, income, strategy, display_order, is_published)
    VALUES ('Priya K.', 'Digital Creator', 'My online course on financial literacy has sold over 3,000 copies. It truly is income that works while I rest.', '$3,200/mo', 'Digital Products', 3, true)`
  console.log("Success stories seeded")
} else {
  console.log("Success stories exist, skipping")
}

// Seed site settings
const existingSettings = await sql`SELECT key FROM site_settings LIMIT 1`
if (existingSettings.length === 0) {
  await sql`INSERT INTO site_settings (key, value) VALUES ('general', ${JSON.stringify({ site_name: "WealthPath", tagline: "Your Guide to Building Passive Wealth", description: "Learn how to create lasting passive income through clear, jargon-free education." })})`
  await sql`INSERT INTO site_settings (key, value) VALUES ('features', ${JSON.stringify({ show_quiz: true, show_calculator: true, show_stories: true, show_resources: true })})`
  await sql`INSERT INTO site_settings (key, value) VALUES ('contact', ${JSON.stringify({ support_email: "hello@wealthpath.com", twitter: "", linkedin: "" })})`
  console.log("Site settings seeded")
} else {
  console.log("Site settings exist, skipping")
}

console.log("Seed complete!")
