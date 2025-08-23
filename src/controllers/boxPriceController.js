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

export const updateBoxPrice = async (req, res) => {
  try {
    const priceId = parseInt(req.params.id)
    const { basePrice, itemCount } = req.body

    const updatedBoxPrice = await prisma.boxPrice.update({
      where: { id: priceId },
      data: {
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