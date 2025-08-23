import prisma from '../utils/database.js'

export const getProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query
    
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const take = parseInt(limit)

    let whereClause = {}

    if (category && category !== 'Todas') {
      const categoryObj = await prisma.category.findFirst({
        where: { name: category }
      })
      if (categoryObj) {
        whereClause.categoryId = categoryObj.id
      }
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        include: {
          category: {
            select: { name: true }
          },
          origin: true,
          nutritionalInfo: true
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where: whereClause })
    ])

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

    if (req.body['origin.producer']) {
      const originData = {
        productId: newProduct.id,
        producer: req.body['origin.producer'] || undefined,
        location: req.body['origin.location'] || undefined,
        distance: req.body['origin.distance'] || undefined,
        harvestDate: req.body['origin.harvestDate'] || undefined,
        story: req.body['origin.story'] || undefined,
      }

      if (req.body['origin.certifications']) {
        try {
          originData.certifications = JSON.parse(req.body['origin.certifications'])
        } catch (e) {
          originData.certifications = []
        }
      }

      await prisma.productOrigin.create({ data: originData })
    }

    if (req.body['nutritionalInfo.portion']) {
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