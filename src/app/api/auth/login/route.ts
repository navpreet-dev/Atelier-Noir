import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { scryptSync, timingSafeEqual } from 'crypto'
import { createSession, sessionCookie } from '@/lib/session'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const email = body?.email?.trim().toLowerCase()
  const password = body?.password
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
  }
  const user = await db.user.findUnique({ where: { email } })
  if (!user) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
  }
  const [salt, hash] = user.password.split(':')
  const candidate = scryptSync(password, salt, 64)
  const expected = Buffer.from(hash, 'hex')
  if (candidate.length !== expected.length || !timingSafeEqual(candidate, expected)) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
  }
  const token = await createSession(user.id)
  const res = NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
  })
  res.cookies.set(sessionCookie(token))
  return res
}
