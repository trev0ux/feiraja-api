import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    env: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL_SET: !!process.env.DATABASE_URL,
      JWT_SECRET_SET: !!process.env.JWT_SECRET
    }
  })
})

app.get('/api/test', (req, res) => {
  res.json({ message: 'Test endpoint working' })
})

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found', path: req.path })
})

export default app