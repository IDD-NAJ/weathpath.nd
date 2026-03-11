import { neon } from '@neondatabase/serverless'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env.local') })

const sql = neon(process.env.DATABASE_URL)

async function fixDraftJsonFields() {
  console.log('🔧 Fixing JSON fields in content_drafts table...\n')

  try {
    // Get all drafts
    const drafts = await sql`SELECT id, tags, key_points FROM content_drafts`
    
    console.log(`Found ${drafts.length} drafts to check\n`)
    
    let fixedCount = 0
    
    for (const draft of drafts) {
      let needsUpdate = false
      let newTags = draft.tags
      let newKeyPoints = draft.key_points
      
      // Check if tags is a string instead of JSON
      if (draft.tags && typeof draft.tags === 'string') {
        try {
          JSON.parse(draft.tags)
          // Already valid JSON, skip
        } catch {
          // Not valid JSON, convert to JSON array
          console.log(`Fixing tags for draft ${draft.id.substring(0, 8)}...`)
          newTags = JSON.stringify([draft.tags])
          needsUpdate = true
        }
      } else if (!draft.tags) {
        newTags = '[]'
        needsUpdate = true
      }
      
      // Check if key_points is a string instead of JSON
      if (draft.key_points && typeof draft.key_points === 'string') {
        try {
          JSON.parse(draft.key_points)
          // Already valid JSON, skip
        } catch {
          // Not valid JSON, convert to JSON array
          console.log(`Fixing key_points for draft ${draft.id.substring(0, 8)}...`)
          newKeyPoints = JSON.stringify([draft.key_points])
          needsUpdate = true
        }
      } else if (!draft.key_points) {
        newKeyPoints = '[]'
        needsUpdate = true
      }
      
      if (needsUpdate) {
        await sql`
          UPDATE content_drafts 
          SET 
            tags = ${newTags}::jsonb,
            key_points = ${newKeyPoints}::jsonb
          WHERE id = ${draft.id}
        `
        fixedCount++
        console.log(`  ✅ Fixed draft ${draft.id.substring(0, 8)}`)
      }
    }
    
    console.log(`\n✅ Fixed ${fixedCount} drafts`)
    
    // Verify
    console.log('\n🔍 Verifying fixes...')
    const verification = await sql`
      SELECT id, tags, key_points 
      FROM content_drafts 
      LIMIT 3
    `
    
    let allValid = true
    for (const draft of verification) {
      try {
        if (typeof draft.tags === 'string') {
          JSON.parse(draft.tags)
        }
        if (typeof draft.key_points === 'string') {
          JSON.parse(draft.key_points)
        }
        console.log(`✅ Draft ${draft.id.substring(0, 8)} - tags and key_points are valid JSON`)
      } catch (e) {
        console.log(`❌ Draft ${draft.id.substring(0, 8)} - still has invalid JSON`)
        allValid = false
      }
    }
    
    if (allValid) {
      console.log('\n🎉 All drafts fixed successfully!')
      console.log('\n📝 Refresh your browser to see the changes')
    } else {
      console.log('\n⚠️  Some drafts still have issues')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

fixDraftJsonFields()
