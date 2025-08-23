import prisma from '../utils/database.js'

export const checkDatabase = (req, res, next) => {
  if (!prisma) {
    return res.status(503).json({ 
      error: 'Database not available',
      message: 'Please configure DATABASE_URL environment variable' 
    })
  }
  next()
}