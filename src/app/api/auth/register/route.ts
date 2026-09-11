import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { scryptSync, randomBytes, timingSafeEqual } from 'crypto'
import { createSession, sessionCookie } from '@/lib/session'

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const name = body?.name?.trim()
  const email = body?.email?.trim().toLowerCase()
  const password = body?.password
  if (!name || !email || !password) {
    return NextResponse.json(
      { error: 'Name, email and password are required.' },
      { status: 400 }
    )
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: 'Password must be at least 6 characters.' },
      { status: 400 }
    )
  }
  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json(
      { error: 'An account with this email already exists. Try signing in.' },
      { status: 409 }
    )
  }
  const user = await db.user.create({
    data: { name, email, password: hashPassword(password) },
  })
  await db.activity.create({
    data: { userId: user.id, type: 'account_created', meta: email },
  })
  const token = await createSession(user.id)
  const res = NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
  })
  res.cookies.set(sessionCookie(token))
  return res
}
