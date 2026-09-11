import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { readSession } from '@/lib/session'

export async function GET(req: NextRequest) {
  const userId = await readSession()
  const bearer = req.headers.get('authorization')
  void bearer
  if (!userId) return NextResponse.json({ user: null })
  const user = await db.user.findUnique({ where: { id: userId } })
  if (!user) return NextResponse.json({ user: null })
  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
  })
}
