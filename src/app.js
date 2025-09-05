import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'

// Only load dotenv in development - Vercel injects env vars automatically
if (process.env.NODE_ENV !== 'production') {
  dotenv.config()
}

const app = express()

app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'http://localhost:3002', 
    'https://feiraja.vercel.app',
    'https://feiraja-api.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}))

app.use(bodyParser.json({ limit: '10mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }))

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    database: process.env.DATABASE_URL ? 'configured' : 'not configured',
    env: {
      NODE_ENV: process.env.NODE_ENV,
      hasDbUrl: !!process.env.DATABASE_URL,
      hasJwtSecret: !!process.env.JWT_SECRET
    }
  })
})

// Import routes only after app is configured
import authRoutes from './routes/auth.js'
import categoryRoutes from './routes/categories.js'
import productRoutes from './routes/products.js'
import producerRoutes from './routes/producers.js'
import boxPriceRoutes from './routes/boxPrices.js'
import addressRoutes from './routes/addresses.js'
import userRoutes from './routes/users.js'
import webhookRoutes from './routes/webhook.js'
import whatsappAuthRoutes from './routes/whatsappAuth.js'
import whatsappTestRoutes from './routes/whatsappTest.js'

app.use('/api/admin', authRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/products', productRoutes)
app.use('/api/producers', producerRoutes)
app.use('/api/admin/categories', categoryRoutes)
app.use('/api/admin/products', productRoutes)
app.use('/api/admin/producers', producerRoutes)
app.use('/api/admin/box-prices', boxPriceRoutes)
app.use('/api/addresses', addressRoutes)
app.use('/api/admin/addresses', addressRoutes)
app.use('/api/users', userRoutes)
app.use('/api/webhook', webhookRoutes)
app.use('/api/whatsapp', whatsappAuthRoutes)
app.use('/api/whatsapp-test', whatsappTestRoutes)

app.use((err, req, res, next) => {
  console.error('Global error:', err)
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

export default app