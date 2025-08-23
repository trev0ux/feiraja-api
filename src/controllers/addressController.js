import prisma from '../utils/database.js'

export const getAddresses = async (req, res) => {
  try {
    const { userId } = req.query
    
    const whereClause = userId ? { userId: parseInt(userId) } : {}
    
    const addresses = await prisma.address.findMany({
      where: whereClause,
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    res.json(addresses)
  } catch (error) {
    console.error('Addresses error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getAddressById = async (req, res) => {
  try {
    const addressId = parseInt(req.params.id)
    
    const address = await prisma.address.findUnique({
      where: { id: addressId }
    })

    if (!address) {
      return res.status(404).json({ error: 'Address not found' })
    }

    res.json(address)
  } catch (error) {
    console.error('Address error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const createAddress = async (req, res) => {
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
      await prisma.address.updateMany({
        where: { userId: parseInt(userId) },
        data: { isDefault: false }
      })
    }

    const newAddress = await prisma.address.create({
      data: {
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
      }
    })

    res.status(201).json(newAddress)
  } catch (error) {
    console.error('Create address error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}