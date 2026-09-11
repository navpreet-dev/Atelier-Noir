import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { serializeProduct } from '../route'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const product = await db.product.findUnique({ where: { slug } })
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }
  const reviews = await db.review.findMany({
    where: { productId: product.id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ product: serializeProduct(product), reviews })
}
