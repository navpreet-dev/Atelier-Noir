import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

async function loadCart(sessionId: string) {
  const items = await db.cartItem.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
    include: { product: true },
  })
  return items.map((item) => ({
    id: item.id,
    productId: item.productId,
    size: item.size,
    color: item.color,
    qty: item.qty,
    product: JSON.parse(
      JSON.stringify({
        ...item.product,
        details: JSON.parse(item.product.details),
        materials: JSON.parse(item.product.materials),
        colors: JSON.parse(item.product.colors),
        sizes: JSON.parse(item.product.sizes),
        images: JSON.parse(item.product.images),
        tags: JSON.parse(item.product.tags),
      })
    ),
  }))
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId')
  if (!sessionId) return NextResponse.json({ items: [] })
  return NextResponse.json({ items: await loadCart(sessionId) })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const sessionId = body?.sessionId
  const productId = body?.productId
  const size = body?.size
  const color = body?.color
  const qty = Math.max(1, Number(body?.qty) || 1)
  if (!sessionId || !productId || !size || !color) {
    return NextResponse.json(
      { error: 'sessionId, productId, size and color are required' },
      { status: 400 }
    )
  }
  const product = await db.product.findUnique({ where: { id: productId } })
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }
  const existing = await db.cartItem.findFirst({
    where: { sessionId, productId, size, color },
  })
  let item
  if (existing) {
    item = await db.cartItem.update({
      where: { id: existing.id },
      data: { qty: existing.qty + qty },
    })
  } else {
    item = await db.cartItem.create({
      data: { sessionId, productId, size, color, qty },
    })
  }
  const items = await loadCart(sessionId)
  return NextResponse.json({
    item: items.find((i) => i.id === item.id) ?? item,
    items,
  })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const { id, qty, sessionId } = body ?? {}
  if (!id || typeof qty !== 'number' || !sessionId) {
    return NextResponse.json(
      { error: 'id, qty and sessionId are required' },
      { status: 400 }
    )
  }
  if (qty <= 0) {
    await db.cartItem.deleteMany({ where: { id, sessionId } })
  } else {
    await db.cartItem.updateMany({ where: { id, sessionId }, data: { qty } })
  }
  return NextResponse.json({ items: await loadCart(sessionId) })
}

export async function DELETE(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const sessionId = sp.get('sessionId')
  const id = sp.get('id')
  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId is required' }, { status: 400 })
  }
  if (id) {
    await db.cartItem.deleteMany({ where: { id, sessionId } })
  } else {
    await db.cartItem.deleteMany({ where: { sessionId } })
  }
  return NextResponse.json({ items: await loadCart(sessionId) })
}
