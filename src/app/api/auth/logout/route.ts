import { NextRequest, NextResponse } from 'next/server'
import { clearSession, readSession } from '@/lib/session'

export async function POST(_req: NextRequest) {
  const userId = await readSession()
  if (userId) await clearSession(userId)
  const res = NextResponse.json({ ok: true })
  res.cookies.set({ name: 'an_session', value: '', maxAge: 0, path: '/' })
  return res
}
