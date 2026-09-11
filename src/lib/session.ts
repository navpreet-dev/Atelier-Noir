import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'
import { db } from '@/lib/db'

export const SESSION_COOKIE = 'an_session'

export function sessionCookie(token: string) {
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  }
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString('hex')
  await db.session.create({ data: { token, userId } })
  return token
}

export async function readSession(): Promise<string | null> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (!token) return null
  const session = await db.session.findUnique({ where: { token } })
  return session?.userId ?? null
}

export async function clearSession(userId: string) {
  await db.session.deleteMany({ where: { userId } })
}
