require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function seedSampleData() {
  console.log('🌱 Seeding sample data for enhanced features...');
  
  try {
    // Get existing users and learning paths
    const users = await sql`SELECT id, name FROM users ORDER BY created_at LIMIT 3`;
    const learningPaths = await sql`SELECT id, title FROM learning_paths WHERE is_published = true LIMIT 3`;
    const articles = await sql`SELECT id, title FROM articles WHERE is_published = true LIMIT 2`;
    const stories = await sql`SELECT id, name FROM success_stories WHERE is_published = true LIMIT 2`;

    if (users.length === 0 || learningPaths.length === 0) {
      console.log('❌ No users or learning paths found. Please run basic seeding first.');
      return;
    }

    console.log(`Found ${users.length} users and ${learningPaths.length} learning paths`);

    // Seed user progress
    console.log('\n📊 Seeding user progress...');
    for (const user of users) {
      for (let i = 0; i < Math.min(2, learningPaths.length); i++) {
        const path = learningPaths[i];
        const progress = Math.floor(Math.random() * 100);
        const modulesCompleted = progress === 100 ? ['module1', 'module2', 'module3'] : ['module1'];
        
        await sql`
          INSERT INTO user_progress (user_id, learning_path_id, progress_percentage, modules_completed, started_at, last_accessed)
          VALUES (${user.id}, ${path.id}, ${progress}, ${modulesCompleted}, NOW() - INTERVAL '7 days', NOW() - INTERVAL '1 day')
          ON CONFLICT (user_id, learning_path_id) DO UPDATE SET
            progress_percentage = EXCLUDED.progress_percentage,
            modules_completed = EXCLUDED.modules_completed,
            last_accessed = EXCLUDED.last_accessed
        `;
      }
    }

    // Seed user activity
    console.log('📝 Seeding user activity...');
    const activityTypes = ['login', 'module_completed', 'quiz_completed', 'article_viewed', 'calculator_used'];
    
    for (const user of users) {
      for (let i = 0; i < 5; i++) {
        const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
        const activityData = activityType === 'quiz_completed' 
          ? JSON.stringify({ score: Math.floor(Math.random() * 40) + 60 })
          : activityType === 'module_completed'
          ? JSON.stringify({ module: `module${Math.floor(Math.random() * 3) + 1}` })
          : null;
        
        await sql`
          INSERT INTO user_activity (user_id, activity_type, activity_data, created_at)
          VALUES (${user.id}, ${activityType}, ${activityData}, NOW() - INTERVAL '3 days')
        `;
      }
    }

    // Seed user bookmarks
    console.log('🔖 Seeding user bookmarks...');
    for (const user of users) {
      // Bookmark some learning paths
      for (let i = 0; i < Math.min(2, learningPaths.length); i++) {
        await sql`
          INSERT INTO user_bookmarks (user_id, item_type, item_id)
          VALUES (${user.id}, 'learning_path', ${learningPaths[i].id})
          ON CONFLICT (user_id, item_type, item_id) DO NOTHING
        `;
      }
      
      // Bookmark some articles
      for (let i = 0; i < Math.min(1, articles.length); i++) {
        await sql`
          INSERT INTO user_bookmarks (user_id, item_type, item_id)
          VALUES (${user.id}, 'article', ${articles[i].id})
          ON CONFLICT (user_id, item_type, item_id) DO NOTHING
        `;
      }
    }

    // Seed quiz results
    console.log('📋 Seeding quiz results...');
    for (const user of users) {
      const quizTypes = ['income_strategy', 'risk_tolerance', 'investment_timeline'];
      
      for (const quizType of quizTypes) {
        const score = Math.floor(Math.random() * 40) + 60;
        const answers = JSON.stringify({
          q1: Math.floor(Math.random() * 4) + 1,
          q2: Math.floor(Math.random() * 4) + 1,
          q3: Math.floor(Math.random() * 4) + 1
        });
        const resultData = JSON.stringify({
          recommended_strategy: ['dividend_investing', 'real_estate', 'digital_products'][Math.floor(Math.random() * 3)],
          risk_level: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
        });
        
        await sql`
          INSERT INTO user_quiz_results (user_id, quiz_type, answers, result_data, score, completed_at)
          VALUES (${user.id}, ${quizType}, ${answers}, ${resultData}, ${score}, NOW() - INTERVAL '7 days')
        `;
      }
    }

    // Seed notifications
    console.log('🔔 Seeding notifications...');
    const notificationTemplates = [
      { title: 'Welcome to WealthPath!', message: 'Start your journey to financial independence today.', type: 'info' },
      { title: 'New Learning Path Available', message: 'Check out our latest course on dividend investing.', type: 'info' },
      { title: 'Quiz Completed', message: 'Great job on completing the income strategy quiz!', type: 'success' },
      { title: 'Milestone Reached', message: 'You\'ve completed 50% of your first learning path!', type: 'success' }
    ];

    for (const user of users) {
      for (let i = 0; i < 2; i++) {
        const template = notificationTemplates[i];
        await sql`
          INSERT INTO user_notifications (user_id, title, message, type, created_at)
          VALUES (${user.id}, ${template.title}, ${template.message}, ${template.type}, NOW() - INTERVAL '3 days')
        `;
      }
    }

    // Seed content ratings
    console.log('⭐ Seeding content ratings...');
    for (const user of users) {
      // Rate some learning paths
      for (let i = 0; i < Math.min(2, learningPaths.length); i++) {
        const rating = Math.floor(Math.random() * 3) + 3; // 3-5 stars
        await sql`
          INSERT INTO content_ratings (user_id, item_type, item_id, rating, review)
          VALUES (${user.id}, 'learning_path', ${learningPaths[i].id}, ${rating}, 'Great content! Very helpful.')
          ON CONFLICT (user_id, item_type, item_id) DO UPDATE SET
            rating = EXCLUDED.rating,
            review = EXCLUDED.review,
            updated_at = NOW()
        `;
      }
    }

    console.log('\n🎉 Sample data seeded successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding sample data:', error);
  }
}

seedSampleData();
