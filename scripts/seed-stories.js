require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function seedSuccessStories() {
  console.log('📖 Seeding success stories...');
  
  const stories = [
    {
      name: "Sarah M.",
      title: "Dividend Investor",
      quote: "I started with just $500 per month in dividend stocks. Three years later, my portfolio generates $2,100 monthly in passive income.",
      income: "$2,100/mo",
      strategy: "Dividend Investing",
      display_order: 1,
      is_published: true,
    },
    {
      name: "James T.",
      title: "Real Estate Investor", 
      quote: "WealthPath taught me how to analyze rental properties. I now own two units that cover my mortgage and put $1,800 in my pocket each month.",
      income: "$1,800/mo",
      strategy: "Rental Properties",
      display_order: 2,
      is_published: true,
    },
    {
      name: "Priya K.",
      title: "Digital Creator",
      quote: "My online course on financial literacy has sold over 3,000 copies. It truly is income that works while I rest.",
      income: "$3,200/mo",
      strategy: "Digital Products",
      display_order: 3,
      is_published: true,
    },
    {
      name: "Carlos R.",
      title: "Small Business Owner",
      quote: "The compound calculator opened my eyes. I increased my monthly contributions and picked a diversified index fund from the Dividend Investing path.",
      income: "$1,200/mo",
      strategy: "Index Fund Investing",
      display_order: 4,
      is_published: true,
    },
  ];

  try {
    for (const story of stories) {
      // Check if story already exists
      const existing = await sql`
        SELECT id FROM success_stories WHERE name = ${story.name}
      `;
      
      if (existing.length === 0) {
        await sql`
          INSERT INTO success_stories (name, title, quote, income, strategy, display_order, is_published, status)
          VALUES (${story.name}, ${story.title}, ${story.quote}, ${story.income}, ${story.strategy}, ${story.display_order}, ${story.is_published}, 'approved')
        `;
        console.log(`✅ Created: ${story.name}`);
      } else {
        await sql`
          UPDATE success_stories 
          SET title = ${story.title},
              quote = ${story.quote},
              income = ${story.income},
              strategy = ${story.strategy},
              display_order = ${story.display_order},
              is_published = ${story.is_published},
              status = 'approved',
              updated_at = now()
          WHERE name = ${story.name}
        `;
        console.log(`🔄 Updated: ${story.name}`);
      }
    }
    
    console.log('\n🎉 Success stories seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding success stories:', error);
  }
}

seedSuccessStories();
