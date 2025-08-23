import { PrismaClient } from '@prisma/client'

let prisma = null

try {
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  })
  console.log('✅ Prisma client initialized')
} catch (error) {
  console.error('❌ Failed to initialize Prisma client:', error)
  console.error('DATABASE_URL exists:', !!process.env.DATABASE_URL)
  console.error('NODE_ENV:', process.env.NODE_ENV)
  prisma = null
}

export default prisma