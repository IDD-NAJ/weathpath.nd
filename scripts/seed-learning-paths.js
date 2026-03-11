require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function seedLearningPaths() {
  console.log('🌱 Seeding learning paths...');
  
  const learningPaths = [
    {
      title: "Real Estate Income",
      description: "Understand how property ownership, rental income, and real estate funds can create steady cash flow without daily involvement.",
      level: "Beginner",
      duration: "4 weeks",
      module_count: 8,
      topics: ["Rental properties", "REITs", "Crowdfunding platforms", "Property management"],
      is_published: true,
    },
    {
      title: "Dividend Investing",
      description: "Learn how owning shares in established companies can provide regular income payments, and how to build a balanced portfolio over time.",
      level: "Beginner",
      duration: "3 weeks",
      module_count: 6,
      topics: ["Dividend stocks", "Index funds", "Reinvestment strategies", "Portfolio balancing"],
      is_published: true,
    },
    {
      title: "Digital Products",
      description: "Discover how to create valuable content once — like courses, templates, or ebooks — and earn from it repeatedly.",
      level: "Intermediate",
      duration: "5 weeks",
      module_count: 10,
      topics: ["Online courses", "Ebooks", "Templates", "Licensing"],
      is_published: true,
    },
    {
      title: "Online Business Models",
      description: "Explore business structures designed to generate income with minimal day-to-day management, from affiliate sites to automated services.",
      level: "Intermediate",
      duration: "5 weeks",
      module_count: 9,
      topics: ["Affiliate marketing", "Print on demand", "SaaS basics", "Automation"],
      is_published: true,
    },
    {
      title: "Interest & Lending",
      description: "Learn about savings vehicles, bonds, and peer-to-peer lending that let your money work for you safely and predictably.",
      level: "Beginner",
      duration: "2 weeks",
      module_count: 5,
      topics: ["High-yield savings", "Bonds", "Peer-to-peer lending", "CDs & money markets"],
      is_published: true,
    },
    {
      title: "Risk Management",
      description: "Every income stream comes with trade-offs. Learn to evaluate, protect, and diversify so your wealth grows steadily.",
      level: "Advanced",
      duration: "3 weeks",
      module_count: 7,
      topics: ["Diversification", "Tax planning", "Insurance", "Emergency funds"],
      is_published: true,
    },
  ];

  try {
    for (const path of learningPaths) {
      // Check if path already exists
      const existing = await sql`
        SELECT id FROM learning_paths WHERE title = ${path.title}
      `;
      
      if (existing.length === 0) {
        await sql`
          INSERT INTO learning_paths (title, description, level, duration, module_count, topics, is_published, status)
          VALUES (${path.title}, ${path.description}, ${path.level}, ${path.duration}, ${path.module_count}, ${path.topics}, ${path.is_published}, 'approved')
        `;
        console.log(`✅ Created: ${path.title}`);
      } else {
        await sql`
          UPDATE learning_paths 
          SET description = ${path.description}, 
              level = ${path.level}, 
              duration = ${path.duration}, 
              module_count = ${path.module_count}, 
              topics = ${path.topics}, 
              is_published = ${path.is_published},
              status = 'approved',
              updated_at = now()
          WHERE title = ${path.title}
        `;
        console.log(`🔄 Updated: ${path.title}`);
      }
    }
    
    console.log('\n🎉 Learning paths seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding learning paths:', error);
  }
}

seedLearningPaths();
