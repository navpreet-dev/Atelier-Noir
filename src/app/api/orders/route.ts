import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { readSession } from '@/lib/session'

type CartLine = {
  productId: string
  name: string
  image: string
  size: string
  color: string
  qty: number
  price: number
}

export async function GET() {
  const userId = await readSession()
  if (!userId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  const orders = await db.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  })
  return NextResponse.json({ orders })
}

export async function POST(req: NextRequest) {
  const userId = await readSession()
  if (!userId) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }
  const body = await req.json().catch(() => null)
  const {
    items,
    email,
    name,
    phone,
    address,
    city,
    postalCode,
    country,
    paymentMethod,
    paymentDetail,
    subtotal,
    shipping,
    total,
    sessionId,
  } = body ?? {}
  if (
    !Array.isArray(items) ||
    items.length === 0 ||
    !email ||
    !name ||
    !address ||
    !city ||
    !postalCode ||
    !country ||
    !paymentMethod
  ) {
    return NextResponse.json({ error: 'Missing checkout details.' }, { status: 400 })
  }
  const orderNumber = `AN-${Date.now().toString(36).toUpperCase()}${Math.floor(
    Math.random() * 90 + 10
  )}`
  const order = await db.order.create({
    data: {
      orderNumber,
      userId,
      email,
      name,
      phone: phone ?? '',
      address,
      city,
      postalCode,
      country,
      paymentMethod,
      paymentDetail: paymentDetail ?? '',
      subtotal: Number(subtotal) || 0,
      shipping: Number(shipping) || 0,
      total: Number(total) || 0,
      items: {
        create: (items as CartLine[]).map((i) => ({
          productId: i.productId,
          name: i.name,
          image: i.image,
          size: i.size,
          color: i.color,
          qty: i.qty,
          price: i.price,
        })),
      },
    },
    include: { items: true },
  })
  await db.activity.create({
    data: { userId, type: 'order_placed', meta: orderNumber },
  })
  if (sessionId) {
    await db.cartItem.deleteMany({ where: { sessionId } })
  }
  return NextResponse.json({ order }, { status: 201 })
}
