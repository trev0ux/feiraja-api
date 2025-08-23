import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Middleware
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

// Configure multer for file uploads (simplified for Vercel)
const storage = multer.memoryStorage()
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
})

// In-memory database (replace with real database in production)
let database = {
  admins: [
    {
      id: 1,
      username: 'admin',
      password: bcrypt.hashSync('admin123', 10),
      email: 'admin@feiraja.com',
    },
  ],
  categories: [
    { id: 1, name: 'Frutas', description: 'Frutas frescas da estação', createdAt: new Date() },
    { id: 2, name: 'Vegetais', description: 'Vegetais frescos e orgânicos', createdAt: new Date() },
    { id: 3, name: 'Grãos', description: 'Grãos e cereais', createdAt: new Date() },
    { id: 4, name: 'Temperos', description: 'Temperos e ervas frescas', createdAt: new Date() },
    {
      id: 5,
      name: 'Laticínios',
      description: 'Produtos lácteos artesanais',
      createdAt: new Date(),
    },
  ],
  products: [
    {
      id: 1,
      name: 'Tomate Orgânico',
      description: 'Tomate fresco da fazenda, cultivado sem agrotóxicos',
      price: 4.5,
      categoryId: 2,
      image: null,
      inStock: true,
      origin: {
        producer: 'Fazenda São João',
        location: 'Ibiúna, São Paulo',
        distance: '45 km de São Paulo',
        harvestDate: '2025-08-20',
        certifications: ['Orgânico IBD', 'Selo SisOrg'],
        story:
          'A Fazenda São João é uma propriedade familiar que há 3 gerações se dedica ao cultivo orgânico. Nossos tomates são cultivados em estufas com sistema de irrigação por gotejamento, garantindo o máximo aproveitamento da água.',
      },
      nutritionalInfo: {
        portion: '100g',
        calories: 18,
        carbs: '3.9g',
        fiber: '1.2g',
        protein: '0.9g',
        vitamins: ['Vitamina C', 'Licopeno', 'Potássio'],
      },
      createdAt: new Date(),
    },
    {
      id: 2,
      name: 'Banana Prata',
      description: 'Banana madura e doce, cultivada naturalmente',
      price: 2.8,
      categoryId: 1,
      image: null,
      inStock: true,
      origin: {
        producer: 'Sítio Frutas do Vale',
        location: 'Registro, São Paulo',
        distance: '180 km de São Paulo',
        harvestDate: '2025-08-19',
        certifications: ['Produção Sustentável'],
        story:
          'O Sítio Frutas do Vale cultiva bananas há mais de 20 anos no Vale do Ribeira. Utilizamos técnicas de agricultura regenerativa que preservam o solo e promovem a biodiversidade local.',
      },
      nutritionalInfo: {
        portion: '100g',
        calories: 89,
        carbs: '22.8g',
        fiber: '2.6g',
        protein: '1.1g',
        vitamins: ['Potássio', 'Vitamina B6', 'Vitamina C'],
      },
      createdAt: new Date(),
    },
    {
      id: 3,
      name: 'Arroz Integral',
      description: 'Arroz integral orgânico, fonte de fibras',
      price: 8.5,
      categoryId: 3,
      image: null,
      inStock: true,
      origin: {
        producer: 'Cooperativa Terra Rica',
        location: 'Eldorado, São Paulo',
        distance: '220 km de São Paulo',
        harvestDate: '2025-07-15',
        certifications: ['Orgânico IBD', 'Fair Trade'],
        story:
          'A Cooperativa Terra Rica reúne 15 famílias de pequenos produtores que trabalham juntas para produzir arroz integral de alta qualidade, respeitando os ciclos naturais e preservando as nascentes da região.',
      },
      nutritionalInfo: {
        portion: '100g',
        calories: 123,
        carbs: '23g',
        fiber: '1.8g',
        protein: '2.6g',
        vitamins: ['Magnésio', 'Selênio', 'Manganês'],
      },
      createdAt: new Date(),
    },
  ],
  boxPrices: [
    { id: 1, profileType: 1, name: '1 pessoa', basePrice: 25.0, itemCount: 8 },
    { id: 2, profileType: 2, name: '2 pessoas', basePrice: 45.0, itemCount: 14 },
    { id: 3, profileType: 3, name: '3-4 pessoas', basePrice: 65.0, itemCount: 20 },
    { id: 4, profileType: 5, name: '5+ pessoas', basePrice: 85.0, itemCount: 26 },
  ],
  addresses: [
    {
      id: 1,
      userId: 1,
      name: 'Casa',
      street: 'Rua das Flores, 123',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      complement: 'Apto 45',
      reference: 'Próximo ao mercado',
      isDefault: true,
      createdAt: new Date(),
    },
    {
      id: 2,
      userId: 1,
      name: 'Trabalho',
      street: 'Av. Paulista, 1000',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
      complement: '15º andar',
      reference: 'Torre Norte',
      isDefault: false,
      createdAt: new Date(),
    },
  ],
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  jwt.verify(token, JWT_SECRET, (err, admin) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' })
    }
    req.admin = admin
    next()
  })
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// AUTH ROUTES
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body

    const admin = database.admins.find(a => a.username === username)
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const isValidPassword = await bcrypt.compare(password, admin.password)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, {
      expiresIn: '24h',
    })

    res.json({
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// CATEGORY ROUTES
app.get('/api/categories', (req, res) => {
  try {
    const categoriesWithProducts = database.categories.filter(category => {
      return database.products.some(product => product.categoryId === category.id)
    })

    res.json(categoriesWithProducts)
  } catch (error) {
    console.error('Categories error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/admin/categories', authenticateToken, (req, res) => {
  try {
    const { name, description } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' })
    }

    const newCategory = {
      id: Math.max(...database.categories.map(c => c.id), 0) + 1,
      name,
      description: description || '',
      createdAt: new Date(),
    }

    database.categories.push(newCategory)
    res.status(201).json(newCategory)
  } catch (error) {
    console.error('Create category error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.put('/api/admin/categories/:id', authenticateToken, (req, res) => {
  try {
    const categoryId = parseInt(req.params.id)
    const { name, description } = req.body

    const categoryIndex = database.categories.findIndex(c => c.id === categoryId)
    if (categoryIndex === -1) {
      return res.status(404).json({ error: 'Category not found' })
    }

    database.categories[categoryIndex] = {
      ...database.categories[categoryIndex],
      name: name || database.categories[categoryIndex].name,
      description:
        description !== undefined ? description : database.categories[categoryIndex].description,
      updatedAt: new Date(),
    }

    res.json(database.categories[categoryIndex])
  } catch (error) {
    console.error('Update category error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.delete('/api/admin/categories/:id', authenticateToken, (req, res) => {
  try {
    const categoryId = parseInt(req.params.id)

    const productsInCategory = database.products.filter(p => p.categoryId === categoryId)
    if (productsInCategory.length > 0) {
      return res.status(400).json({
        error: 'Cannot delete category with existing products',
      })
    }

    const categoryIndex = database.categories.findIndex(c => c.id === categoryId)
    if (categoryIndex === -1) {
      return res.status(404).json({ error: 'Category not found' })
    }

    database.categories.splice(categoryIndex, 1)
    res.json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Delete category error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// PRODUCT ROUTES
app.get('/api/products', (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query
    let products = [...database.products]

    if (category && category !== 'Todas') {
      const categoryObj = database.categories.find(c => c.name === category)
      if (categoryObj) {
        products = products.filter(p => p.categoryId === categoryObj.id)
      }
    }

    if (search) {
      const searchLower = search.toLowerCase()
      products = products.filter(
        p =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
      )
    }

    products = products.map(product => ({
      ...product,
      category: database.categories.find(c => c.id === product.categoryId)?.name || 'Unknown',
    }))

    const startIndex = (page - 1) * limit
    const endIndex = startIndex + parseInt(limit)
    const paginatedProducts = products.slice(startIndex, endIndex)

    res.json({
      products: paginatedProducts,
      total: products.length,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(products.length / limit),
    })
  } catch (error) {
    console.error('Products error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/admin/products', authenticateToken, upload.single('image'), (req, res) => {
  try {
    const { name, description, price, categoryId, inStock } = req.body

    if (!name || !price || !categoryId) {
      return res.status(400).json({
        error: 'Name, price, and category are required',
      })
    }

    const category = database.categories.find(c => c.id === parseInt(categoryId))
    if (!category) {
      return res.status(400).json({ error: 'Invalid category' })
    }

    // Handle image upload (for Vercel, we'd typically use a cloud storage service)
    let imageUrl = null
    if (req.file) {
      // In a real deployment, upload to Cloudinary, AWS S3, etc.
      const imageBase64 = req.file.buffer.toString('base64')
      imageUrl = `data:${req.file.mimetype};base64,${imageBase64}`
    }

    // Parse origin information
    const origin = {}
    if (req.body['origin.producer']) origin.producer = req.body['origin.producer']
    if (req.body['origin.location']) origin.location = req.body['origin.location']
    if (req.body['origin.distance']) origin.distance = req.body['origin.distance']
    if (req.body['origin.harvestDate']) origin.harvestDate = req.body['origin.harvestDate']
    if (req.body['origin.certifications']) {
      try {
        origin.certifications = JSON.parse(req.body['origin.certifications'])
      } catch (e) {
        origin.certifications = []
      }
    }
    if (req.body['origin.story']) origin.story = req.body['origin.story']

    // Parse nutritional information
    const nutritionalInfo = {}
    if (req.body['nutritionalInfo.portion'])
      nutritionalInfo.portion = req.body['nutritionalInfo.portion']
    if (req.body['nutritionalInfo.calories'])
      nutritionalInfo.calories = parseInt(req.body['nutritionalInfo.calories'])
    if (req.body['nutritionalInfo.carbs']) nutritionalInfo.carbs = req.body['nutritionalInfo.carbs']
    if (req.body['nutritionalInfo.fiber']) nutritionalInfo.fiber = req.body['nutritionalInfo.fiber']
    if (req.body['nutritionalInfo.protein'])
      nutritionalInfo.protein = req.body['nutritionalInfo.protein']
    if (req.body['nutritionalInfo.vitamins']) {
      try {
        nutritionalInfo.vitamins = JSON.parse(req.body['nutritionalInfo.vitamins'])
      } catch (e) {
        nutritionalInfo.vitamins = []
      }
    }

    const newProduct = {
      id: Math.max(...database.products.map(p => p.id), 0) + 1,
      name,
      description: description || '',
      price: parseFloat(price),
      categoryId: parseInt(categoryId),
      image: imageUrl,
      inStock: inStock !== 'false',
      origin: Object.keys(origin).length > 0 ? origin : undefined,
      nutritionalInfo: Object.keys(nutritionalInfo).length > 0 ? nutritionalInfo : undefined,
      createdAt: new Date(),
    }

    database.products.push(newProduct)

    const productWithCategory = {
      ...newProduct,
      category: category.name,
    }

    res.status(201).json(productWithCategory)
  } catch (error) {
    console.error('Create product error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// BOX PRICING ROUTES
app.get('/api/admin/box-prices', authenticateToken, (req, res) => {
  try {
    res.json(database.boxPrices)
  } catch (error) {
    console.error('Box prices error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.put('/api/admin/box-prices/:id', authenticateToken, (req, res) => {
  try {
    const priceId = parseInt(req.params.id)
    const { basePrice, itemCount } = req.body

    const priceIndex = database.boxPrices.findIndex(p => p.id === priceId)
    if (priceIndex === -1) {
      return res.status(404).json({ error: 'Box price not found' })
    }

    database.boxPrices[priceIndex] = {
      ...database.boxPrices[priceIndex],
      basePrice: basePrice ? parseFloat(basePrice) : database.boxPrices[priceIndex].basePrice,
      itemCount: itemCount ? parseInt(itemCount) : database.boxPrices[priceIndex].itemCount,
      updatedAt: new Date(),
    }

    res.json(database.boxPrices[priceIndex])
  } catch (error) {
    console.error('Update box price error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ADDRESS ROUTES
app.get('/api/addresses', (req, res) => {
  try {
    const { userId } = req.query
    let addresses = database.addresses

    if (userId) {
      addresses = addresses.filter(addr => addr.userId === parseInt(userId))
    }

    res.json(addresses)
  } catch (error) {
    console.error('Addresses error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.get('/api/addresses/:id', (req, res) => {
  try {
    const addressId = parseInt(req.params.id)
    const address = database.addresses.find(addr => addr.id === addressId)

    if (!address) {
      return res.status(404).json({ error: 'Address not found' })
    }

    res.json(address)
  } catch (error) {
    console.error('Address error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/admin/addresses', authenticateToken, (req, res) => {
  try {
    const {
      userId = 1,
      name,
      street,
      neighborhood,
      city,
      state,
      zipCode,
      complement,
      reference,
      isDefault = false,
    } = req.body

    if (!name || !street || !neighborhood || !city || !state || !zipCode) {
      return res.status(400).json({
        error: 'Name, street, neighborhood, city, state, and zipCode are required',
      })
    }

    if (isDefault) {
      database.addresses.forEach(addr => {
        if (addr.userId === userId) {
          addr.isDefault = false
        }
      })
    }

    const newAddress = {
      id: Math.max(...database.addresses.map(addr => addr.id), 0) + 1,
      userId: parseInt(userId),
      name,
      street,
      neighborhood,
      city,
      state,
      zipCode,
      complement: complement || '',
      reference: reference || '',
      isDefault: Boolean(isDefault),
      createdAt: new Date(),
    }

    database.addresses.push(newAddress)
    res.status(201).json(newAddress)
  } catch (error) {
    console.error('Create address error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error:', err)
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

// For local development
const PORT = process.env.PORT || 3001
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Feiraja API Server running on port ${PORT}`)
    console.log(`📡 API available at http://localhost:${PORT}/api`)
    console.log(`🔍 Health check: http://localhost:${PORT}/api/health`)
  })
}

// For Vercel deployment
export default app