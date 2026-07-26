import { getSql } from "@/lib/db"
import { neon } from '@neondatabase/serverless'

export interface Product {
  id: number
  slug: string
  name: string
  description: string
  priceInCents: number
  image?: string
}

let productsCache: Product[] | null = null
let cacheTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function getProducts(): Promise<Product[]> {
  const now = Date.now()
  
  // Return cached products if still valid
  if (productsCache && now - cacheTime < CACHE_DURATION) {
    return productsCache
  }

  try {
    const sql = getSql()
    const courses = await sql(
      'SELECT id, slug, title, description, price_cents, cover_image FROM courses WHERE is_visible = true AND status = $1 ORDER BY featured DESC, created_at DESC',
      ['published']
    )

    productsCache = courses.map((course: any) => ({
      id: course.id,
      slug: course.slug,
      name: course.title,
      description: course.description,
      priceInCents: course.price_cents,
      image: course.cover_image,
    }))

    cacheTime = now
    return productsCache
  } catch (error) {
    console.error('[v0] Failed to fetch products:', error)
    return []
  }
}

export async function getProductById(id: number): Promise<Product | null> {
  const products = await getProducts()
  return products.find(p => p.id === id) || null
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getProducts()
  return products.find(p => p.slug === slug) || null
}

// Validate price matches server-side to prevent tampering
export async function validateProductPrice(id: number, priceInCents: number): Promise<boolean> {
  const product = await getProductById(id)
  if (!product) return false
  return product.priceInCents === priceInCents
}
