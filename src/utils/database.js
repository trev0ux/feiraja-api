import { PrismaClient } from '@prisma/client'

let prisma

try {
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  })
} catch (error) {
  console.error('Failed to initialize Prisma client:', error)
  // Create a mock prisma client for development when database is not available
  prisma = null
}

export default prisma