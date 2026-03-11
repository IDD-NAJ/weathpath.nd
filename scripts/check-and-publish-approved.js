import { neon } from '@neondatabase/serverless'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env.local') })

const sql = neon(process.env.DATABASE_URL)

async function checkAndPublishApproved() {
  console.log('🔍 Checking approval and publishing status...\n')

  try {
    // Check articles
    console.log('📰 ARTICLES:')
    const articles = await sql`
      SELECT id, title, status, is_published 
      FROM articles 
      ORDER BY created_at DESC 
      LIMIT 10
    `
    
    if (articles.length === 0) {
      console.log('  No articles found\n')
    } else {
      console.log(`  Total: ${articles.length} articles`)
      articles.forEach(a => {
        const statusIcon = a.status === 'approved' && a.is_published ? '✅' : 
                          a.status === 'approved' && !a.is_published ? '⚠️' : '📝'
        console.log(`  ${statusIcon} ${a.title?.substring(0, 40) || 'Untitled'} - status: ${a.status}, published: ${a.is_published}`)
      })
      
      // Find approved but not published
      const approvedNotPublished = articles.filter(a => a.status === 'approved' && !a.is_published)
      if (approvedNotPublished.length > 0) {
        console.log(`\n  ⚠️  Found ${approvedNotPublished.length} approved articles that are NOT published`)
        console.log('  Fixing now...')
        
        for (const article of approvedNotPublished) {
          await sql`
            UPDATE articles 
            SET is_published = true, published_at = COALESCE(published_at, NOW())
            WHERE id = ${article.id}
          `
          console.log(`    ✅ Published: ${article.title?.substring(0, 40)}`)
        }
      } else {
        console.log('  ✅ All approved articles are published')
      }
    }
    
    // Check success stories
    console.log('\n📖 SUCCESS STORIES:')
    const stories = await sql`
      SELECT id, name, title, status, is_published 
      FROM success_stories 
      ORDER BY created_at DESC 
      LIMIT 10
    `
    
    if (stories.length === 0) {
      console.log('  No stories found\n')
    } else {
      console.log(`  Total: ${stories.length} stories`)
      stories.forEach(s => {
        const statusIcon = s.status === 'approved' && s.is_published ? '✅' : 
                          s.status === 'approved' && !s.is_published ? '⚠️' : '📝'
        const displayName = s.name || s.title || 'Untitled'
        console.log(`  ${statusIcon} ${displayName.substring(0, 40)} - status: ${s.status}, published: ${s.is_published}`)
      })
      
      // Find approved but not published
      const approvedNotPublished = stories.filter(s => s.status === 'approved' && !s.is_published)
      if (approvedNotPublished.length > 0) {
        console.log(`\n  ⚠️  Found ${approvedNotPublished.length} approved stories that are NOT published`)
        console.log('  Fixing now...')
        
        for (const story of approvedNotPublished) {
          await sql`
            UPDATE success_stories 
            SET is_published = true, published_at = COALESCE(published_at, NOW())
            WHERE id = ${story.id}
          `
          const displayName = story.name || story.title || 'Untitled'
          console.log(`    ✅ Published: ${displayName.substring(0, 40)}`)
        }
      } else {
        console.log('  ✅ All approved stories are published')
      }
    }
    
    // Check learning paths
    console.log('\n🎯 LEARNING PATHS:')
    const paths = await sql`
      SELECT id, title, status, is_published 
      FROM learning_paths 
      ORDER BY created_at DESC 
      LIMIT 10
    `
    
    if (paths.length === 0) {
      console.log('  No learning paths found\n')
    } else {
      console.log(`  Total: ${paths.length} paths`)
      paths.forEach(p => {
        const statusIcon = p.status === 'approved' && p.is_published ? '✅' : 
                          p.status === 'approved' && !p.is_published ? '⚠️' : '📝'
        console.log(`  ${statusIcon} ${p.title?.substring(0, 40) || 'Untitled'} - status: ${p.status}, published: ${p.is_published}`)
      })
      
      // Find approved but not published
      const approvedNotPublished = paths.filter(p => p.status === 'approved' && !p.is_published)
      if (approvedNotPublished.length > 0) {
        console.log(`\n  ⚠️  Found ${approvedNotPublished.length} approved paths that are NOT published`)
        console.log('  Fixing now...')
        
        for (const path of approvedNotPublished) {
          await sql`
            UPDATE learning_paths 
            SET is_published = true, published_at = COALESCE(published_at, NOW())
            WHERE id = ${path.id}
          `
          console.log(`    ✅ Published: ${path.title?.substring(0, 40)}`)
        }
      } else {
        console.log('  ✅ All approved paths are published')
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 SUMMARY:')
    
    const summary = await sql`
      SELECT 
        (SELECT COUNT(*) FROM articles WHERE status = 'approved' AND is_published = true) as articles_published,
        (SELECT COUNT(*) FROM articles WHERE status = 'approved' AND is_published = false) as articles_not_published,
        (SELECT COUNT(*) FROM success_stories WHERE status = 'approved' AND is_published = true) as stories_published,
        (SELECT COUNT(*) FROM success_stories WHERE status = 'approved' AND is_published = false) as stories_not_published,
        (SELECT COUNT(*) FROM learning_paths WHERE status = 'approved' AND is_published = true) as paths_published,
        (SELECT COUNT(*) FROM learning_paths WHERE status = 'approved' AND is_published = false) as paths_not_published
    `
    
    const s = summary[0]
    console.log(`  Articles: ${s.articles_published} published, ${s.articles_not_published} not published`)
    console.log(`  Stories: ${s.stories_published} published, ${s.stories_not_published} not published`)
    console.log(`  Paths: ${s.paths_published} published, ${s.paths_not_published} not published`)
    
    const totalNotPublished = Number(s.articles_not_published) + Number(s.stories_not_published) + Number(s.paths_not_published)
    
    if (totalNotPublished === 0) {
      console.log('\n✅ SUCCESS! All approved content is now published!')
    } else {
      console.log(`\n⚠️  WARNING: ${totalNotPublished} approved items are still not published`)
    }
    
    console.log('\n📝 Next: Refresh your browser to see the changes')
    
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

checkAndPublishApproved()
