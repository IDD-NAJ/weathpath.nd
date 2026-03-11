import { neon } from '@neondatabase/serverless'
import { v4 as uuidv4 } from 'uuid'

const sql = neon(process.env.DATABASE_URL!)

export interface ContentDraft {
  id: string
  title: string
  content: string
  summary: string
  type: 'article' | 'story' | 'learning_path' | 'quiz'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tone: 'educational' | 'inspirational' | 'professional' | 'casual'
  length: 'short' | 'medium' | 'long'
  audience: 'general' | 'students' | 'professionals' | 'beginners'
  tags: string[]
  keyPoints: string[]
  estimatedReadTime: number
  imageUrl?: string
  imageAlt?: string
  imageCaption?: string
  imageAttribution?: {
    photographer: string
    source: string
    photographerUrl: string
  }
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected'
  authorId: string
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
  rejectionReason?: string
}

export async function saveContentDraft(content: Omit<ContentDraft, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<ContentDraft> {
  const id = uuidv4()
  const now = new Date()
  
  console.log('🔧 saveContentDraft called:', { 
    id, 
    title: content.title, 
    type: content.type, 
    authorId: content.authorId,
    authorIdType: typeof content.authorId
  })
  
  try {
    await sql`
      INSERT INTO content_drafts (
        id, title, content, summary, type, difficulty, tone, length, audience,
        tags, key_points, estimated_read_time, image_url, image_alt, image_caption,
        image_attribution, status, author_id, created_at, updated_at
      ) VALUES (
        ${id}, ${content.title}, ${content.content}, ${content.summary}, 
        ${content.type}, ${content.difficulty}, ${content.tone}, ${content.length}, 
        ${content.audience}, ${JSON.stringify(content.tags)}, 
        ${JSON.stringify(content.keyPoints)}, ${content.estimatedReadTime}, 
        ${content.imageUrl}, ${content.imageAlt}, ${content.imageCaption},
        ${JSON.stringify(content.imageAttribution)}, 'draft', 
        ${content.authorId}, ${now}, ${now}
      )
    `
    
    console.log('✅ Draft saved successfully to database')
    
    return {
      ...content,
      id,
      status: 'draft' as const,
      createdAt: now,
      updatedAt: now
    }
  } catch (error) {
    console.error('❌ Failed to save content draft:', error)
    throw new Error('Failed to save content draft')
  }
}

export async function submitForApproval(id: string, authorId: string): Promise<void> {
  try {
    await sql`
      UPDATE content_drafts 
      SET status = 'pending_approval', updated_at = NOW()
      WHERE id = ${id} AND author_id = ${authorId}
    `
  } catch (error) {
    console.error('Failed to submit for approval:', error)
    throw new Error('Failed to submit content for approval')
  }
}

export async function approveContent(id: string, adminId: string): Promise<void> {
  const now = new Date()
  
  try {
    // First, get the draft content
    const draft = await sql`
      SELECT * FROM content_drafts WHERE id = ${id}
    `
    
    if (!draft.length) {
      throw new Error('Content draft not found')
    }
    
    const content = draft[0]
    
    // Insert into the appropriate table based on content type
    // Status is set to 'approved' and is_published to true to make content public
    switch (content.type) {
      case 'article':
        await sql`
          INSERT INTO articles (
            id, title, slug, content, summary, author_id, tags, difficulty,
            tone, length, audience, key_points, estimated_read_time, image_url,
            image_alt, image_caption, image_attribution, status, is_published, 
            created_at, updated_at, published_at
          ) VALUES (
            ${id}, ${content.title}, ${generateSlug(content.title)}, ${content.content},
            ${content.summary}, ${content.author_id}, ${content.tags},
            ${content.difficulty}, ${content.tone}, ${content.length}, ${content.audience},
            ${content.key_points}, ${content.estimated_read_time},
            ${content.image_url}, ${content.image_alt}, ${content.image_caption},
            ${content.image_attribution}, 'approved', true,
            ${content.created_at}, ${now}, ${now}
          )
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            slug = EXCLUDED.slug,
            content = EXCLUDED.content,
            summary = EXCLUDED.summary,
            tags = EXCLUDED.tags,
            difficulty = EXCLUDED.difficulty,
            tone = EXCLUDED.tone,
            length = EXCLUDED.length,
            audience = EXCLUDED.audience,
            key_points = EXCLUDED.key_points,
            estimated_read_time = EXCLUDED.estimated_read_time,
            image_url = EXCLUDED.image_url,
            image_alt = EXCLUDED.image_alt,
            image_caption = EXCLUDED.image_caption,
            image_attribution = EXCLUDED.image_attribution,
            status = 'approved',
            is_published = true,
            updated_at = ${now},
            published_at = ${now}
        `
        break
        
      case 'story':
        await sql`
          INSERT INTO success_stories (
            id, name, title, quote, income, strategy, slug, content, summary, 
            author_id, tags, difficulty, tone, length, audience, key_points, 
            estimated_read_time, image_url, image_alt, image_caption, 
            image_attribution, status, is_published, created_at, updated_at, published_at
          ) VALUES (
            ${id}, ${content.title}, ${content.title}, ${content.summary}, 
            'Passive Income', 'Multiple Streams', ${generateSlug(content.title)}, 
            ${content.content}, ${content.summary}, ${content.author_id}, ${content.tags},
            ${content.difficulty}, ${content.tone}, ${content.length}, ${content.audience},
            ${content.key_points}, ${content.estimated_read_time},
            ${content.image_url}, ${content.image_alt}, ${content.image_caption},
            ${content.image_attribution}, 'approved', true,
            ${content.created_at}, ${now}, ${now}
          )
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            title = EXCLUDED.title,
            quote = EXCLUDED.quote,
            slug = EXCLUDED.slug,
            content = EXCLUDED.content,
            summary = EXCLUDED.summary,
            tags = EXCLUDED.tags,
            difficulty = EXCLUDED.difficulty,
            tone = EXCLUDED.tone,
            length = EXCLUDED.length,
            audience = EXCLUDED.audience,
            key_points = EXCLUDED.key_points,
            estimated_read_time = EXCLUDED.estimated_read_time,
            image_url = EXCLUDED.image_url,
            image_alt = EXCLUDED.image_alt,
            image_caption = EXCLUDED.image_caption,
            image_attribution = EXCLUDED.image_attribution,
            status = 'approved',
            is_published = true,
            updated_at = ${now},
            published_at = ${now}
        `
        break
        
      case 'learning_path':
        await sql`
          INSERT INTO learning_paths (
            id, title, slug, content, summary, author_id, tags, difficulty,
            tone, length, audience, key_points, estimated_read_time, image_url,
            image_alt, image_caption, image_attribution, status, is_published,
            created_at, updated_at, published_at
          ) VALUES (
            ${id}, ${content.title}, ${generateSlug(content.title)}, ${content.content},
            ${content.summary}, ${content.author_id}, ${content.tags},
            ${content.difficulty}, ${content.tone}, ${content.length}, ${content.audience},
            ${content.key_points}, ${content.estimated_read_time},
            ${content.image_url}, ${content.image_alt}, ${content.image_caption},
            ${content.image_attribution}, 'approved', true,
            ${content.created_at}, ${now}, ${now}
          )
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            slug = EXCLUDED.slug,
            content = EXCLUDED.content,
            summary = EXCLUDED.summary,
            tags = EXCLUDED.tags,
            difficulty = EXCLUDED.difficulty,
            tone = EXCLUDED.tone,
            length = EXCLUDED.length,
            audience = EXCLUDED.audience,
            key_points = EXCLUDED.key_points,
            estimated_read_time = EXCLUDED.estimated_read_time,
            image_url = EXCLUDED.image_url,
            image_alt = EXCLUDED.image_alt,
            image_caption = EXCLUDED.image_caption,
            image_attribution = EXCLUDED.image_attribution,
            status = 'approved',
            is_published = true,
            updated_at = ${now},
            published_at = ${now}
        `
        break
        
      case 'quiz':
        await sql`
          INSERT INTO quizzes (
            id, title, slug, content, summary, author_id, tags, difficulty,
            tone, length, audience, key_points, estimated_read_time, image_url,
            image_alt, image_caption, image_attribution, status, is_published,
            created_at, updated_at, published_at
          ) VALUES (
            ${id}, ${content.title}, ${generateSlug(content.title)}, ${content.content},
            ${content.summary}, ${content.author_id}, ${content.tags},
            ${content.difficulty}, ${content.tone}, ${content.length}, ${content.audience},
            ${content.key_points}, ${content.estimated_read_time},
            ${content.image_url}, ${content.image_alt}, ${content.image_caption},
            ${content.image_attribution}, 'approved', true,
            ${content.created_at}, ${now}, ${now}
          )
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            slug = EXCLUDED.slug,
            content = EXCLUDED.content,
            summary = EXCLUDED.summary,
            tags = EXCLUDED.tags,
            difficulty = EXCLUDED.difficulty,
            tone = EXCLUDED.tone,
            length = EXCLUDED.length,
            audience = EXCLUDED.audience,
            key_points = EXCLUDED.key_points,
            estimated_read_time = EXCLUDED.estimated_read_time,
            image_url = EXCLUDED.image_url,
            image_alt = EXCLUDED.image_alt,
            image_caption = EXCLUDED.image_caption,
            image_attribution = EXCLUDED.image_attribution,
            status = 'approved',
            is_published = true,
            updated_at = ${now},
            published_at = ${now}
        `
        break
    }
    
    // Update draft status
    await sql`
      UPDATE content_drafts 
      SET status = 'approved', updated_at = ${now}, published_at = ${now}
      WHERE id = ${id}
    `
    
    console.log(`✅ Content approved and published: ${content.type} - ${content.title}`)
  } catch (error) {
    console.error('Failed to approve content:', error)
    throw new Error('Failed to approve content')
  }
}

export async function rejectContent(id: string, adminId: string, reason: string): Promise<void> {
  try {
    await sql`
      UPDATE content_drafts 
      SET status = 'rejected', updated_at = NOW(), rejection_reason = ${reason}
      WHERE id = ${id}
    `
  } catch (error) {
    console.error('Failed to reject content:', error)
    throw new Error('Failed to reject content')
  }
}

export async function getDrafts(authorId: string, status?: string): Promise<ContentDraft[]> {
  try {
    let query = sql`
      SELECT * FROM content_drafts 
      WHERE author_id = ${authorId}
    `
    
    if (status) {
      query = sql`
        SELECT * FROM content_drafts 
        WHERE author_id = ${authorId} AND status = ${status}
      `
    }
    
    query = sql`${query} ORDER BY created_at DESC`
    
    const drafts = await query
    
    return drafts.map((draft: any) => ({
      id: draft.id,
      title: draft.title,
      content: draft.content,
      summary: draft.summary,
      type: draft.type,
      difficulty: draft.difficulty,
      tone: draft.tone,
      length: draft.length,
      audience: draft.audience,
      tags: typeof draft.tags === 'string' ? JSON.parse(draft.tags || '[]') : (draft.tags || []),
      keyPoints: typeof draft.key_points === 'string' ? JSON.parse(draft.key_points || '[]') : (draft.key_points || []),
      estimatedReadTime: draft.estimated_read_time,
      imageUrl: draft.image_url,
      imageAlt: draft.image_alt,
      imageCaption: draft.image_caption,
      imageAttribution: typeof draft.image_attribution === 'string' ? (draft.image_attribution ? JSON.parse(draft.image_attribution) : undefined) : draft.image_attribution,
      status: draft.status,
      authorId: draft.author_id,
      createdAt: new Date(draft.created_at),
      updatedAt: new Date(draft.updated_at),
      publishedAt: draft.published_at ? new Date(draft.published_at) : undefined,
      rejectionReason: draft.rejection_reason
    }))
  } catch (error) {
    console.error('Failed to get drafts:', error)
    throw new Error('Failed to get content drafts')
  }
}

export async function getPendingApprovals(): Promise<ContentDraft[]> {
  try {
    const drafts = await sql`
      SELECT cd.*, u.name as author_name, u.email as author_email
      FROM content_drafts cd
      JOIN users u ON cd.author_id = u.id
      WHERE cd.status = 'pending_approval'
      ORDER BY cd.created_at ASC
    `
    
    return drafts.map((draft: any) => ({
      id: draft.id,
      title: draft.title,
      content: draft.content,
      summary: draft.summary,
      type: draft.type,
      difficulty: draft.difficulty,
      tone: draft.tone,
      length: draft.length,
      audience: draft.audience,
      tags: typeof draft.tags === 'string' ? JSON.parse(draft.tags || '[]') : (draft.tags || []),
      keyPoints: typeof draft.key_points === 'string' ? JSON.parse(draft.key_points || '[]') : (draft.key_points || []),
      estimatedReadTime: draft.estimated_read_time,
      imageUrl: draft.image_url,
      imageAlt: draft.image_alt,
      imageCaption: draft.image_caption,
      imageAttribution: typeof draft.image_attribution === 'string' ? (draft.image_attribution ? JSON.parse(draft.image_attribution) : undefined) : draft.image_attribution,
      status: draft.status,
      authorId: draft.author_id,
      createdAt: new Date(draft.created_at),
      updatedAt: new Date(draft.updated_at),
      publishedAt: draft.published_at ? new Date(draft.published_at) : undefined,
      rejectionReason: draft.rejection_reason
    }))
  } catch (error) {
    console.error('Failed to get pending approvals:', error)
    throw new Error('Failed to get pending approvals')
  }
}

export async function updateDraft(id: string, authorId: string, updates: Partial<ContentDraft>): Promise<void> {
  try {
    const setClause = []
    const values = []
    
    if (updates.title) {
      setClause.push('title = ?')
      values.push(updates.title)
    }
    if (updates.content) {
      setClause.push('content = ?')
      values.push(updates.content)
    }
    if (updates.summary) {
      setClause.push('summary = ?')
      values.push(updates.summary)
    }
    if (updates.tags) {
      setClause.push('tags = ?')
      values.push(JSON.stringify(updates.tags))
    }
    if (updates.keyPoints) {
      setClause.push('key_points = ?')
      values.push(JSON.stringify(updates.keyPoints))
    }
    if (updates.imageUrl) {
      setClause.push('image_url = ?')
      values.push(updates.imageUrl)
    }
    if (updates.imageAlt) {
      setClause.push('image_alt = ?')
      values.push(updates.imageAlt)
    }
    if (updates.imageCaption) {
      setClause.push('image_caption = ?')
      values.push(updates.imageCaption)
    }
    if (updates.imageAttribution) {
      setClause.push('image_attribution = ?')
      values.push(JSON.stringify(updates.imageAttribution))
    }
    
    setClause.push('updated_at = NOW()')
    values.push(new Date())
    
    await sql`
      UPDATE content_drafts 
      SET ${setClause.join(', ')}
      WHERE id = ${id} AND author_id = ${authorId}
    `
  } catch (error) {
    console.error('Failed to update draft:', error)
    throw new Error('Failed to update content draft')
  }
}

export async function deleteDraft(id: string, authorId: string): Promise<void> {
  try {
    await sql`
      DELETE FROM content_drafts 
      WHERE id = ${id} AND author_id = ${authorId}
    `
  } catch (error) {
    console.error('Failed to delete draft:', error)
    throw new Error('Failed to delete content draft')
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}
