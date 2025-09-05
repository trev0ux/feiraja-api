import prisma from '../utils/database.js'

export const getProducts = async (req, res) => {
  try {
    console.log('🔍 Starting getProducts request')
    
    const { category, search, page = 1, limit = 20, inStock } = req.query
    
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const take = parseInt(limit)

    let whereClause = {}

    // Simplified category filtering to avoid additional queries
    if (category && category !== 'Todas') {
      // Try to parse as ID first, then by name
      const categoryId = parseInt(category)
      if (!isNaN(categoryId)) {
        whereClause.categoryId = categoryId
      } else {
        // For name-based filtering, we'll do it after the query
        console.log('🔍 Category filtering by name:', category)
      }
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (inStock !== undefined) {
      whereClause.inStock = inStock === 'true'
    }

    console.log('🔍 Where clause:', JSON.stringify(whereClause))

    // Simplified query without complex includes initially
    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: {
          select: { name: true }
        }
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    })

    console.log('🔍 Found products:', products.length)

    const total = await prisma.product.count({ where: whereClause })

    const productsWithCategory = products.map(product => ({
      ...product,
      category: product.category.name
    }))

    res.json({
      products: productsWithCategory,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    })
  } catch (error) {
    console.error('Products error:', error)
    console.error('Error details:', error.message)
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

export const getProductById = async (req, res) => {
  try {
    const productId = parseInt(req.params.id)

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: {
          select: { name: true }
        },
        origin: {
          include: {
            producerRef: true
          }
        },
        nutritionalInfo: true
      }
    })

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    const productWithCategory = {
      ...product,
      category: product.category.name
    }

    res.json(productWithCategory)
  } catch (error) {
    console.error('Get product error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, categoryId, inStock } = req.body

    if (!name || !price || !categoryId) {
      return res.status(400).json({
        error: 'Name, price, and category are required',
      })
    }

    const category = await prisma.category.findUnique({
      where: { id: parseInt(categoryId) }
    })

    if (!category) {
      return res.status(400).json({ error: 'Invalid category' })
    }

    let imageUrl = null
    if (req.file) {
      const imageBase64 = req.file.buffer.toString('base64')
      imageUrl = `data:${req.file.mimetype};base64,${imageBase64}`
    }

    const productData = {
      name,
      description: description || '',
      price: parseFloat(price),
      categoryId: parseInt(categoryId),
      image: imageUrl,
      inStock: inStock !== 'false',
    }

    const newProduct = await prisma.product.create({
      data: productData,
      include: {
        category: {
          select: { name: true }
        }
      }
    })

    if (req.body['origin.producerId'] || req.body['origin.distance'] || req.body['origin.harvestDate'] ||
        req.body['origin.producer'] || req.body['origin.location'] || req.body['origin.story'] || req.body['origin.certifications']) {
      
      const originData = {
        productId: newProduct.id,
        producerId: req.body['origin.producerId'] ? parseInt(req.body['origin.producerId']) : undefined,
        producer: req.body['origin.producer'] || undefined,
        location: req.body['origin.location'] || undefined,
        distance: req.body['origin.distance'] || undefined,
        harvestDate: req.body['origin.harvestDate'] || undefined,
        story: req.body['origin.story'] || undefined,
      }

      // Handle certifications JSON array
      if (req.body['origin.certifications']) {
        try {
          originData.certifications = JSON.parse(req.body['origin.certifications'])
        } catch (e) {
          originData.certifications = []
        }
      }

      await prisma.productOrigin.create({ data: originData })
    }

    if (req.body['nutritionalInfo.portion'] || req.body['nutritionalInfo.calories'] || 
        req.body['nutritionalInfo.carbs'] || req.body['nutritionalInfo.fiber'] || 
        req.body['nutritionalInfo.protein'] || req.body['nutritionalInfo.vitamins']) {
      
      const nutritionalData = {
        productId: newProduct.id,
        portion: req.body['nutritionalInfo.portion'] || undefined,
        calories: req.body['nutritionalInfo.calories'] ? parseInt(req.body['nutritionalInfo.calories']) : undefined,
        carbs: req.body['nutritionalInfo.carbs'] || undefined,
        fiber: req.body['nutritionalInfo.fiber'] || undefined,
        protein: req.body['nutritionalInfo.protein'] || undefined,
      }

      if (req.body['nutritionalInfo.vitamins']) {
        try {
          nutritionalData.vitamins = JSON.parse(req.body['nutritionalInfo.vitamins'])
        } catch (e) {
          nutritionalData.vitamins = []
        }
      }

      await prisma.productNutritionalInfo.create({ data: nutritionalData })
    }

    const productWithCategory = {
      ...newProduct,
      category: newProduct.category.name,
    }

    res.status(201).json(productWithCategory)
  } catch (error) {
    console.error('Create product error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateProduct = async (req, res) => {
  try {
    const productId = parseInt(req.params.id)
    const { name, description, price, categoryId, inStock } = req.body

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' })
    }

    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: parseInt(categoryId) }
      })
      if (!category) {
        return res.status(400).json({ error: 'Invalid category' })
      }
    }

    let imageUrl = existingProduct.image
    if (req.file) {
      const imageBase64 = req.file.buffer.toString('base64')
      imageUrl = `data:${req.file.mimetype};base64,${imageBase64}`
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(categoryId && { categoryId: parseInt(categoryId) }),
        ...(inStock !== undefined && { inStock: inStock !== 'false' }),
        ...(req.file && { image: imageUrl }),
      },
      include: {
        category: {
          select: { name: true }
        },
        origin: {
          include: {
            producerRef: true
          }
        },
        nutritionalInfo: true
      }
    })

    // Update origin if provided
    if (req.body['origin.producerId'] || req.body['origin.distance'] || req.body['origin.harvestDate'] || 
        req.body['origin.producer'] || req.body['origin.location'] || req.body['origin.story'] || req.body['origin.certifications']) {
      
      const originData = {
        producerId: req.body['origin.producerId'] ? parseInt(req.body['origin.producerId']) : undefined,
        producer: req.body['origin.producer'] || undefined,
        location: req.body['origin.location'] || undefined,
        distance: req.body['origin.distance'] || undefined,
        harvestDate: req.body['origin.harvestDate'] || undefined,
        story: req.body['origin.story'] || undefined,
      }

      // Handle certifications JSON array
      if (req.body['origin.certifications']) {
        try {
          originData.certifications = JSON.parse(req.body['origin.certifications'])
        } catch (e) {
          originData.certifications = []
        }
      }

      await prisma.productOrigin.upsert({
        where: { productId },
        update: originData,
        create: { productId, ...originData }
      })
    }

    // Update nutritional info if provided
    if (req.body['nutritionalInfo.portion'] || req.body['nutritionalInfo.calories'] || 
        req.body['nutritionalInfo.carbs'] || req.body['nutritionalInfo.fiber'] || 
        req.body['nutritionalInfo.protein'] || req.body['nutritionalInfo.vitamins']) {
      
      const nutritionalData = {
        portion: req.body['nutritionalInfo.portion'] || undefined,
        calories: req.body['nutritionalInfo.calories'] ? parseInt(req.body['nutritionalInfo.calories']) : undefined,
        carbs: req.body['nutritionalInfo.carbs'] || undefined,
        fiber: req.body['nutritionalInfo.fiber'] || undefined,
        protein: req.body['nutritionalInfo.protein'] || undefined,
      }

      if (req.body['nutritionalInfo.vitamins']) {
        try {
          nutritionalData.vitamins = JSON.parse(req.body['nutritionalInfo.vitamins'])
        } catch (e) {
          nutritionalData.vitamins = []
        }
      }

      await prisma.productNutritionalInfo.upsert({
        where: { productId },
        update: nutritionalData,
        create: { productId, ...nutritionalData }
      })
    }

    const productWithCategory = {
      ...updatedProduct,
      category: updatedProduct.category.name,
    }

    res.json(productWithCategory)
  } catch (error) {
    console.error('Update product error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const deleteProduct = async (req, res) => {
  try {
    const productId = parseInt(req.params.id)

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' })
    }

    // Delete related records first (cascade delete)
    await prisma.product.delete({
      where: { id: productId }
    })

    res.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Delete product error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}