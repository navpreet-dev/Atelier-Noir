import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

type ProductRecord = {
  id: string
  slug: string
  name: string
  gender: string
  category: string
  price: number
  comparePrice: number | null
  description: string
  details: string
  materials: string
  colors: string
  sizes: string
  images: string
  video: string | null
  rating: number
  reviewCount: number
  sold: number
  featured: boolean
  isNew: boolean
  isSale: boolean
  bestseller: boolean
  stock: number
  tags: string
  createdAt: Date
}

export function serializeProduct(p: ProductRecord) {
  return {
    ...p,
    details: JSON.parse(p.details),
    materials: JSON.parse(p.materials),
    colors: JSON.parse(p.colors),
    sizes: JSON.parse(p.sizes),
    images: JSON.parse(p.images),
    tags: JSON.parse(p.tags),
    createdAt: p.createdAt,
  }
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const gender = sp.get('gender') ?? undefined
  const categoryParam = sp.get('category') ?? undefined
  const exclude = sp.get('exclude') ?? undefined
  const limitParam = sp.get('limit')
  const isNew = sp.get('new')
  const bestseller = sp.get('bestseller')
  const sale = sp.get('sale')
  const search = sp.get('search')?.trim().toLowerCase()
  const sort = sp.get('sort') ?? undefined

  const where: Record<string, unknown> = {}
  if (gender && gender !== 'all') where.gender = gender
  if (categoryParam) {
    where.category = { in: categoryParam.split(',').filter(Boolean) }
  }
  if (exclude) where.slug = { not: exclude }
  if (isNew === 'true') where.isNew = true
  if (bestseller === 'true') where.bestseller = true
  if (sale === 'true') where.isSale = true

  let orderBy: Record<string, 'asc' | 'desc'> = { createdAt: 'desc' }
  if (sort === 'newest') orderBy = { createdAt: 'desc' }
  else if (sort === 'popular') orderBy = { sold: 'desc' }
  else if (sort === 'price-asc') orderBy = { price: 'asc' }
  else if (sort === 'price-desc') orderBy = { price: 'desc' }
  else if (sort === 'rating') orderBy = { rating: 'desc' }

  const products = await db.product.findMany({
    where,
    orderBy,
    ...(limitParam ? { take: Math.min(parseInt(limitParam, 10) || 60, 100) } : {}),
  })

  const words = (search ?? '').split(/\s+/).filter(Boolean)
  const filtered =
    words.length > 0
      ? products.filter((p) => {
          const hay = `${p.name} ${p.category} ${p.slug} ${p.description}`.toLowerCase()
          return words.some((w) => hay.includes(w))
        })
      : products

  return NextResponse.json({ products: filtered.map(serializeProduct) })
}
