/* Seed the database with the Atelier Noir catalogue. */
import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'

const db = new PrismaClient()

type Color = { name: string; hex: string }
type SeedProduct = {
  id: string
  slug: string
  name: string
  gender: string
  category: string
  price: number
  comparePrice: number | null
  description: string
  details: string[]
  materials: string[]
  colors: Color[]
  sizes: string[]
  images: string[]
  video: string | null
  rating: number
  reviewCount: number
  sold: number
  featured: boolean
  isNew: boolean
  isSale: boolean
  bestseller: boolean
  stock: number
  tags: string[]
  createdAt: string
}

async function main() {
  const researchDir = join(process.cwd(), 'research')
  const products: SeedProduct[] = JSON.parse(
    readFileSync(join(researchDir, 'products.json'), 'utf-8')
  ).products
  const reviews: Record<string, unknown[]> = JSON.parse(
    readFileSync(join(researchDir, 'reviews.json'), 'utf-8')
  )

  for (const p of products) {
    await db.product.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        slug: p.slug,
        name: p.name,
        gender: p.gender,
        category: p.category,
        price: p.price,
        comparePrice: p.comparePrice ?? null,
        description: p.description,
        details: JSON.stringify(p.details),
        materials: JSON.stringify(p.materials),
        colors: JSON.stringify(p.colors),
        sizes: JSON.stringify(p.sizes),
        images: JSON.stringify(p.images),
        video: p.video ?? null,
        rating: p.rating,
        reviewCount: p.reviewCount,
        sold: p.sold,
        featured: p.featured,
        isNew: p.isNew,
        isSale: p.isSale,
        bestseller: p.bestseller,
        stock: p.stock,
        tags: JSON.stringify(p.tags),
        createdAt: new Date(p.createdAt),
      },
    })

    const productReviews = (reviews[p.id] ?? []) as {
      id: string
      author: string
      location: string
      rating: number
      title: string
      body: string
      verified: boolean
      helpful: number
      createdAt: string
    }[]
    for (const r of productReviews) {
      await db.review.upsert({
        where: { id: r.id },
        update: {},
        create: {
          id: r.id,
          productId: p.id,
          author: r.author,
          location: r.location,
          rating: r.rating,
          title: r.title,
          body: r.body,
          verified: r.verified,
          helpful: r.helpful,
          createdAt: new Date(r.createdAt),
        },
      })
    }
  }

  console.log(
    `Seeded ${products.length} products and ${Object.values(reviews).flat().length} reviews.`
  )
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
