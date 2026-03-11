import { neon } from '@neondatabase/serverless'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env.local') })

const sql = neon(process.env.DATABASE_URL)

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

async function publishApprovedDrafts() {
  console.log('🔍 Checking for approved drafts to publish...\n')

  try {
    // Get all approved drafts
    const approvedDrafts = await sql`
      SELECT * FROM content_drafts 
      WHERE status = 'approved'
      ORDER BY created_at DESC
    `
    
    console.log(`Found ${approvedDrafts.length} approved drafts\n`)
    
    if (approvedDrafts.length === 0) {
      console.log('✅ No approved drafts to publish')
      return
    }
    
    let publishedCount = 0
    const now = new Date()
    
    for (const draft of approvedDrafts) {
      console.log(`\n📝 Processing: ${draft.title} (${draft.type})`)
      
      const slug = generateSlug(draft.title)
      
      // Convert JSONB fields to strings if they're objects
      const tags = typeof draft.tags === 'object' ? JSON.stringify(draft.tags) : draft.tags
      const keyPoints = typeof draft.key_points === 'object' ? JSON.stringify(draft.key_points) : draft.key_points
      const imageAttribution = draft.image_attribution && typeof draft.image_attribution === 'object' 
        ? JSON.stringify(draft.image_attribution) 
        : draft.image_attribution
      
      try {
        switch (draft.type) {
          case 'article':
            // Check if already exists
            const existingArticle = await sql`SELECT id FROM articles WHERE id = ${draft.id}`
            
            if (existingArticle.length > 0) {
              console.log('   ⏭️  Already exists in articles table')
            } else {
              await sql`
                INSERT INTO articles (
                  id, title, slug, content, summary, author_id, tags, difficulty,
                  tone, length, audience, key_points, estimated_read_time, image_url,
                  image_alt, image_caption, image_attribution, status, is_published,
                  created_at, updated_at, published_at
                ) VALUES (
                  ${draft.id}, ${draft.title}, ${slug}, ${draft.content || ''},
                  ${draft.summary || ''}, ${draft.author_id}, ${tags}::jsonb,
                  ${draft.difficulty}, ${draft.tone}, ${draft.length}, ${draft.audience},
                  ${keyPoints}::jsonb, ${draft.estimated_read_time || 5},
                  ${draft.image_url}, ${draft.image_alt}, ${draft.image_caption},
                  ${imageAttribution}::jsonb, 'approved', true,
                  ${draft.created_at}, ${now}, ${now}
                )
              `
              console.log('   ✅ Published to articles table')
              publishedCount++
            }
            break
            
          case 'story':
            const existingStory = await sql`SELECT id FROM success_stories WHERE id = ${draft.id}`
            
            if (existingStory.length > 0) {
              console.log('   ⏭️  Already exists in success_stories table')
            } else {
              await sql`
                INSERT INTO success_stories (
                  id, name, title, quote, income, strategy, slug, content, summary,
                  author_id, tags, difficulty, tone, length, audience, key_points,
                  estimated_read_time, image_url, image_alt, image_caption,
                  image_attribution, status, is_published, created_at, updated_at, published_at
                ) VALUES (
                  ${draft.id}, ${draft.title}, ${draft.title}, ${draft.summary || ''},
                  'Passive Income', 'Multiple Streams', ${slug}, ${draft.content || ''},
                  ${draft.summary || ''}, ${draft.author_id}, ${tags}::jsonb,
                  ${draft.difficulty}, ${draft.tone}, ${draft.length}, ${draft.audience},
                  ${keyPoints}::jsonb, ${draft.estimated_read_time || 5},
                  ${draft.image_url}, ${draft.image_alt}, ${draft.image_caption},
                  ${imageAttribution}::jsonb, 'approved', true,
                  ${draft.created_at}, ${now}, ${now}
                )
              `
              console.log('   ✅ Published to success_stories table')
              publishedCount++
            }
            break
            
          case 'learning_path':
            const existingPath = await sql`SELECT id FROM learning_paths WHERE id = ${draft.id}`
            
            if (existingPath.length > 0) {
              console.log('   ⏭️  Already exists in learning_paths table')
            } else {
              await sql`
                INSERT INTO learning_paths (
                  id, title, slug, content, summary, author_id, tags, difficulty,
                  tone, length, audience, key_points, estimated_read_time, image_url,
                  image_alt, image_caption, image_attribution, status, is_published,
                  created_at, updated_at, published_at
                ) VALUES (
                  ${draft.id}, ${draft.title}, ${slug}, ${draft.content || ''},
                  ${draft.summary || ''}, ${draft.author_id}, ${tags}::jsonb,
                  ${draft.difficulty}, ${draft.tone}, ${draft.length}, ${draft.audience},
                  ${keyPoints}::jsonb, ${draft.estimated_read_time || 30},
                  ${draft.image_url}, ${draft.image_alt}, ${draft.image_caption},
                  ${imageAttribution}::jsonb, 'approved', true,
                  ${draft.created_at}, ${now}, ${now}
                )
              `
              console.log('   ✅ Published to learning_paths table')
              publishedCount++
            }
            break
            
          case 'quiz':
            const existingQuiz = await sql`SELECT id FROM quizzes WHERE id = ${draft.id}`
            
            if (existingQuiz.length > 0) {
              console.log('   ⏭️  Already exists in quizzes table')
            } else {
              await sql`
                INSERT INTO quizzes (
                  id, title, slug, content, summary, author_id, tags, difficulty,
                  tone, length, audience, key_points, estimated_read_time, image_url,
                  image_alt, image_caption, image_attribution, status, is_published,
                  created_at, updated_at, published_at
                ) VALUES (
                  ${draft.id}, ${draft.title}, ${slug}, ${draft.content || ''},
                  ${draft.summary || ''}, ${draft.author_id}, ${tags}::jsonb,
                  ${draft.difficulty}, ${draft.tone}, ${draft.length}, ${draft.audience},
                  ${keyPoints}::jsonb, ${draft.estimated_read_time || 10},
                  ${draft.image_url}, ${draft.image_alt}, ${draft.image_caption},
                  ${imageAttribution}::jsonb, 'approved', true,
                  ${draft.created_at}, ${now}, ${now}
                )
              `
              console.log('   ✅ Published to quizzes table')
              publishedCount++
            }
            break
            
          default:
            console.log(`   ⚠️  Unknown type: ${draft.type}`)
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`)
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 SUMMARY:')
    console.log(`   ${publishedCount} drafts newly published`)
    console.log(`   ${approvedDrafts.length - publishedCount} drafts already published`)
    
    // Verify published content
    const counts = await sql`
      SELECT 
        (SELECT COUNT(*) FROM articles WHERE status = 'approved' AND is_published = true) as articles,
        (SELECT COUNT(*) FROM success_stories WHERE status = 'approved' AND is_published = true) as stories,
        (SELECT COUNT(*) FROM learning_paths WHERE status = 'approved' AND is_published = true) as paths,
        (SELECT COUNT(*) FROM quizzes WHERE status = 'approved' AND is_published = true) as quizzes
    `
    
    console.log('\n📈 Published Content:')
    console.log(`   Articles: ${counts[0].articles}`)
    console.log(`   Stories: ${counts[0].stories}`)
    console.log(`   Learning Paths: ${counts[0].paths}`)
    console.log(`   Quizzes: ${counts[0].quizzes}`)
    
    if (publishedCount > 0) {
      console.log('\n✅ SUCCESS! Approved drafts have been published!')
      console.log('\n📝 Next steps:')
      console.log('   1. Refresh your browser')
      console.log('   2. Visit /articles, /stories to see published content')
      console.log('   3. Check admin dashboard for updated metrics')
    } else {
      console.log('\n✅ All approved drafts were already published')
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error)
    process.exit(1)
  }
}

publishApprovedDrafts()
