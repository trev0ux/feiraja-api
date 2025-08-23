import prisma from '../utils/database.js'

export const getProducers = async (req, res) => {
  try {
    console.log('🔍 Starting getProducers request')
    
    const { search, page = 1, limit = 20, isActive } = req.query
    
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const take = parseInt(limit)

    let whereClause = {}

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true'
    }

    const producers = await prisma.producer.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { products: true }
        }
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    })

    const total = await prisma.producer.count({ where: whereClause })

    res.json({
      producers,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    })
  } catch (error) {
    console.error('Get producers error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

export const getProducerById = async (req, res) => {
  try {
    const producerId = parseInt(req.params.id)

    const producer = await prisma.producer.findUnique({
      where: { id: producerId },
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true
              }
            }
          }
        }
      }
    })

    if (!producer) {
      return res.status(404).json({ error: 'Producer not found' })
    }

    res.json(producer)
  } catch (error) {
    console.error('Get producer error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const createProducer = async (req, res) => {
  try {
    const { name, email, phone, location, story } = req.body

    if (!name) {
      return res.status(400).json({
        error: 'Producer name is required'
      })
    }

    if (email) {
      const existingProducer = await prisma.producer.findUnique({
        where: { email }
      })
      if (existingProducer) {
        return res.status(400).json({ error: 'Email already exists' })
      }
    }

    const producerData = {
      name,
      email: email || null,
      phone: phone || null,
      location: location || null,
      story: story || null
    }

    if (req.body.certifications) {
      try {
        producerData.certifications = JSON.parse(req.body.certifications)
      } catch (e) {
        producerData.certifications = []
      }
    }

    const newProducer = await prisma.producer.create({
      data: producerData,
      include: {
        _count: {
          select: { products: true }
        }
      }
    })

    res.status(201).json(newProducer)
  } catch (error) {
    console.error('Create producer error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateProducer = async (req, res) => {
  try {
    const producerId = parseInt(req.params.id)
    const { name, email, phone, location, story, isActive } = req.body

    const existingProducer = await prisma.producer.findUnique({
      where: { id: producerId }
    })

    if (!existingProducer) {
      return res.status(404).json({ error: 'Producer not found' })
    }

    if (email && email !== existingProducer.email) {
      const emailExists = await prisma.producer.findUnique({
        where: { email }
      })
      if (emailExists) {
        return res.status(400).json({ error: 'Email already exists' })
      }
    }

    const updateData = {
      ...(name && { name }),
      ...(email !== undefined && { email: email || null }),
      ...(phone !== undefined && { phone: phone || null }),
      ...(location !== undefined && { location: location || null }),
      ...(story !== undefined && { story: story || null }),
      ...(isActive !== undefined && { isActive: isActive !== 'false' })
    }

    if (req.body.certifications) {
      try {
        updateData.certifications = JSON.parse(req.body.certifications)
      } catch (e) {
        updateData.certifications = []
      }
    }

    const updatedProducer = await prisma.producer.update({
      where: { id: producerId },
      data: updateData,
      include: {
        _count: {
          select: { products: true }
        }
      }
    })

    res.json(updatedProducer)
  } catch (error) {
    console.error('Update producer error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const deleteProducer = async (req, res) => {
  try {
    const producerId = parseInt(req.params.id)

    const existingProducer = await prisma.producer.findUnique({
      where: { id: producerId },
      include: {
        _count: {
          select: { products: true }
        }
      }
    })

    if (!existingProducer) {
      return res.status(404).json({ error: 'Producer not found' })
    }

    if (existingProducer._count.products > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete producer with associated products. Remove products first or deactivate the producer.' 
      })
    }

    await prisma.producer.delete({
      where: { id: producerId }
    })

    res.json({ message: 'Producer deleted successfully' })
  } catch (error) {
    console.error('Delete producer error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}