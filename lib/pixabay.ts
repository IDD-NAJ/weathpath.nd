export interface PixabayImage {
  id: number
  pageURL: string
  type: string
  tags: string
  previewURL: string
  previewWidth: number
  previewHeight: number
  webformatURL: string
  webformatWidth: number
  webformatHeight: number
  largeImageURL: string
  largeImageWidth: number
  largeImageHeight: number
  imageWidth: number
  imageHeight: number
  imageSize: number
  views: number
  downloads: number
  likes: number
  comments: number
  user_id: number
  user: string
  userImageURL: string
}

interface PixabayResponse {
  total: number
  totalHits: number
  hits: PixabayImage[]
}

interface ImageSearchOptions {
  query: string
  category?: string
  min_width?: number
  min_height?: number
  orientation?: 'horizontal' | 'vertical'
  safesearch?: 'true' | 'false'
  per_page?: number
  page?: number
}

export async function searchPixabayImages(options: ImageSearchOptions): Promise<PixabayImage[]> {
  if (!process.env.PIXABAY_API_KEY) {
    throw new Error('Pixabay API key not configured')
  }

  const baseUrl = 'https://pixabay.com/api/'
  const params = new URLSearchParams({
    key: process.env.PIXABAY_API_KEY,
    q: options.query,
    category: options.category || '',
    min_width: options.min_width?.toString() || '800',
    min_height: options.min_height?.toString() || '600',
    orientation: options.orientation || 'horizontal',
    safesearch: options.safesearch || 'true',
    per_page: options.per_page?.toString() || '10',
    page: options.page?.toString() || '1',
    image_type: 'photo',
    editors_choice: 'true'
  })

  try {
    const response = await fetch(`${baseUrl}?${params}`)
    
    if (!response.ok) {
      throw new Error(`Pixabay API error: ${response.status} ${response.statusText}`)
    }

    const data: PixabayResponse = await response.json()
    
    if (data.hits.length === 0) {
      console.log(`No images found for query: ${options.query}`)
      return []
    }

    return data.hits
  } catch (error) {
    console.error('Pixabay API error:', error)
    throw new Error('Failed to fetch images from Pixabay')
  }
}

export async function findRelevantImage(content: string, contentType: string): Promise<PixabayImage | null> {
  // Extract keywords from content for image search
  const keywords = extractKeywords(content, contentType)
  
  // Try different search strategies
  const searchStrategies = [
    keywords.primary,
    keywords.secondary,
    keywords.fallback
  ].filter(Boolean)

  for (const query of searchStrategies) {
    try {
      const images = await searchPixabayImages({
        query,
        category: getCategoryForContentType(contentType),
        min_width: 1200,
        min_height: 800,
        orientation: 'horizontal',
        per_page: 5
      })

      if (images.length > 0) {
        // Return the highest quality image (largest dimensions)
        return images.reduce((best, current) => {
          const bestScore = best.imageWidth * best.imageHeight + best.likes * 10 + best.downloads * 5
          const currentScore = current.imageWidth * current.imageHeight + current.likes * 10 + current.downloads * 5
          return currentScore > bestScore ? current : best
        })
      }
    } catch (error) {
      console.warn(`Failed to search for images with query: ${query}`, error)
      continue
    }
  }

  return null
}

function extractKeywords(content: string, contentType: string): {
  primary: string
  secondary: string
  fallback: string
} {
  // Remove common words and extract meaningful terms
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they'
  ])

  // Extract first few sentences to get context
  const sentences = content.split(/[.!?]+/).filter(s => s.trim()).slice(0, 3)
  const text = sentences.join(' ').toLowerCase()

  // Extract keywords (words with 4+ characters)
  const words = text.split(/\s+/)
    .filter(word => word.length >= 4)
    .filter(word => !commonWords.has(word))
    .slice(0, 10)

  // Financial and education related terms
  const financialTerms = ['money', 'finance', 'investment', 'saving', 'budget', 'debt', 'credit', 'bank', 'stock', 'bond', 'retirement', 'wealth', 'income', 'expense', 'financial']
  const educationTerms = ['learn', 'study', 'education', 'course', 'lesson', 'student', 'teacher', 'school', 'university', 'knowledge', 'skill', 'training']

  // Find financial/education terms first
  const primaryTerms = words.filter(word => 
    financialTerms.includes(word) || educationTerms.includes(word)
  ).slice(0, 2)

  // Other relevant terms
  const secondaryTerms = words.filter(word => 
    !primaryTerms.includes(word)
  ).slice(0, 2)

  const primary = primaryTerms.length > 0 ? primaryTerms.join(' ') : words.slice(0, 2).join(' ')
  const secondary = secondaryTerms.length > 0 ? secondaryTerms.join(' ') : words.slice(2, 4).join(' ')
  const fallback = getDefaultSearchTerm(contentType)

  return { primary, secondary, fallback }
}

function getCategoryForContentType(contentType: string): string {
  switch (contentType) {
    case 'article':
      return 'education'
    case 'story':
      return 'people'
    case 'learning_path':
      return 'education'
    case 'quiz':
      return 'education'
    default:
      return ''
  }
}

function getDefaultSearchTerm(contentType: string): string {
  switch (contentType) {
    case 'article':
      return 'finance education'
    case 'story':
      return 'success business'
    case 'learning_path':
      return 'financial learning'
    case 'quiz':
      return 'education test'
    default:
      return 'business finance'
  }
}

export async function downloadImage(imageUrl: string, filename: string): Promise<string> {
  try {
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`)
    }

    const buffer = await response.arrayBuffer()
    const fs = require('fs')
    const path = require('path')
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'images')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    const filePath = path.join(uploadsDir, filename)
    fs.writeFileSync(filePath, Buffer.from(buffer))
    
    return `/uploads/images/${filename}`
  } catch (error) {
    console.error('Failed to download image:', error)
    throw new Error('Failed to download and save image')
  }
}

export function generateImageFilename(originalUrl: string, contentType: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(7)
  const extension = originalUrl.split('.').pop()?.split('?')[0] || 'jpg'
  return `${contentType}-${timestamp}-${random}.${extension}`
}

export async function getRelatedImages(query: string, count: number = 3): Promise<PixabayImage[]> {
  try {
    const images = await searchPixabayImages({
      query,
      per_page: count,
      min_width: 800,
      min_height: 600,
      safesearch: 'true'
    })

    return images.slice(0, count)
  } catch (error) {
    console.error('Failed to get related images:', error)
    return []
  }
}
