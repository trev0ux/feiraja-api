import prisma from '../utils/database.js'

export const getBoxPrices = async (req, res) => {
  try {
    const boxPrices = await prisma.boxPrice.findMany({
      orderBy: { profileType: 'asc' }
    })

    res.json(boxPrices)
  } catch (error) {
    console.error('Box prices error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getBoxPriceById = async (req, res) => {
  try {
    const priceId = parseInt(req.params.id)

    const boxPrice = await prisma.boxPrice.findUnique({
      where: { id: priceId }
    })

    if (!boxPrice) {
      return res.status(404).json({ error: 'Box price not found' })
    }

    res.json(boxPrice)
  } catch (error) {
    console.error('Get box price error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const createBoxPrice = async (req, res) => {
  try {
    const { profileType, name, basePrice, itemCount } = req.body

    if (!profileType || !name || !basePrice || !itemCount) {
      return res.status(400).json({ 
        error: 'Profile type, name, base price, and item count are required' 
      })
    }

    // Check if profileType already exists
    const existingBoxPrice = await prisma.boxPrice.findFirst({
      where: { profileType: parseInt(profileType) }
    })

    if (existingBoxPrice) {
      return res.status(400).json({ 
        error: 'Box price with this profile type already exists' 
      })
    }

    const newBoxPrice = await prisma.boxPrice.create({
      data: {
        profileType: parseInt(profileType),
        name,
        basePrice: parseFloat(basePrice),
        itemCount: parseInt(itemCount),
      }
    })

    res.status(201).json(newBoxPrice)
  } catch (error) {
    console.error('Create box price error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateBoxPrice = async (req, res) => {
  try {
    const priceId = parseInt(req.params.id)
    const { name, basePrice, itemCount } = req.body

    const updatedBoxPrice = await prisma.boxPrice.update({
      where: { id: priceId },
      data: {
        ...(name && { name }),
        ...(basePrice && { basePrice: parseFloat(basePrice) }),
        ...(itemCount && { itemCount: parseInt(itemCount) }),
      }
    })

    res.json(updatedBoxPrice)
  } catch (error) {
    console.error('Update box price error:', error)
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Box price not found' })
    }
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const deleteBoxPrice = async (req, res) => {
  try {
    const priceId = parseInt(req.params.id)

    await prisma.boxPrice.delete({
      where: { id: priceId }
    })

    res.json({ message: 'Box price deleted successfully' })
  } catch (error) {
    console.error('Delete box price error:', error)
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Box price not found' })
    }
    res.status(500).json({ error: 'Internal server error' })
  }
}