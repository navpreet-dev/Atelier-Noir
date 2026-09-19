import { PrismaClient } from '@prisma/client'
import path from 'path'
import fs from 'fs'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL
  if (envUrl && !envUrl.startsWith('file:')) {
    return envUrl
  }

  const possiblePaths = [
    path.join(process.cwd(), 'db', 'custom.db'),
    path.join(process.cwd(), 'prisma', 'custom.db'),
    path.join(process.cwd(), 'custom.db'),
    path.join(__dirname, '..', '..', 'db', 'custom.db'),
    path.join(__dirname, '..', '..', 'prisma', 'custom.db'),
  ]

  const existingSource = possiblePaths.find((p) => {
    try {
      return fs.existsSync(p)
    } catch {
      return false
    }
  })

  // On Vercel / serverless runtime, /var/task is read-only, so copy to /tmp for read/write access
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    const tmpDb = path.join('/tmp', 'custom.db')
    if (existingSource && !fs.existsSync(tmpDb)) {
      try {
        fs.copyFileSync(existingSource, tmpDb)
      } catch (err) {
        console.error('Error copying sqlite database to /tmp:', err)
      }
    }
    if (fs.existsSync(tmpDb)) {
      return `file:${tmpDb}`
    }
  }

  if (existingSource) {
    return `file:${existingSource}`
  }

  return envUrl || 'file:./db/custom.db'
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db