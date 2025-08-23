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

export const updateAddress = async (req, res) => {
  try {
    const addressId = parseInt(req.params.id)
    const {
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

    const existingAddress = await prisma.address.findUnique({
      where: { id: addressId }
    })

    if (!existingAddress) {
      return res.status(404).json({ error: 'Address not found' })
    }

    // If setting as default, remove default from other addresses of the same user
    if (isDefault && isDefault !== 'false') {
      await prisma.address.updateMany({
        where: { 
          userId: existingAddress.userId,
          id: { not: addressId }
        },
        data: { isDefault: false }
      })
    }

    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data: {
        ...(name && { name }),
        ...(street && { street }),
        ...(neighborhood && { neighborhood }),
        ...(city && { city }),
        ...(state && { state }),
        ...(zipCode && { zipCode }),
        ...(complement !== undefined && { complement }),
        ...(reference !== undefined && { reference }),
        ...(isDefault !== undefined && { isDefault: Boolean(isDefault) }),
      }
    })

    res.json(updatedAddress)
  } catch (error) {
    console.error('Update address error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const deleteAddress = async (req, res) => {
  try {
    const addressId = parseInt(req.params.id)

    const existingAddress = await prisma.address.findUnique({
      where: { id: addressId }
    })

    if (!existingAddress) {
      return res.status(404).json({ error: 'Address not found' })
    }

    await prisma.address.delete({
      where: { id: addressId }
    })

    res.json({ message: 'Address deleted successfully' })
  } catch (error) {
    console.error('Delete address error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}