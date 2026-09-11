import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { readSession } from '@/lib/session'

export async function GET() {
  const userId = await readSession()
  if (!userId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  const activities = await db.activity.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })
  return NextResponse.json({ activities })
}

export async function POST(req: NextRequest) {
  const userId = await readSession()
  if (!userId) return NextResponse.json({ ok: false })
  const body = await req.json().catch(() => null)
  const type = body?.type
  if (!type) return NextResponse.json({ ok: false })
  await db.activity.create({
    data: {
      userId,
      type: String(type).slice(0, 80),
      meta: body?.meta ? JSON.stringify(body.meta).slice(0, 500) : null,
    },
  })
  return NextResponse.json({ ok: true })
}
