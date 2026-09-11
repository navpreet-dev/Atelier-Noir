import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get('productId')
  if (!productId) {
    return NextResponse.json({ error: 'productId is required' }, { status: 400 })
  }
  const reviews = await db.review.findMany({
    where: { productId },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ reviews })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const { productId, author, location, rating, title, body: text } = body ?? {}
  if (!productId || !author || !rating || !title || !text) {
    return NextResponse.json(
      { error: 'productId, author, rating, title and body are required' },
      { status: 400 }
    )
  }
  const review = await db.review.create({
    data: {
      productId,
      author,
      location: location ?? 'Verified purchase',
      rating: Math.min(5, Math.max(1, Number(rating))),
      title,
      body: text,
      verified: true,
      helpful: 0,
    },
  })
  return NextResponse.json({ review }, { status: 201 })
}
