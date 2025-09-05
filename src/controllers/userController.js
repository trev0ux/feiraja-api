import prisma from '../utils/database.js'

export const authenticateUser = async (req, res) => {
  try {
    const { phoneNumber } = req.body

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' })
    }

    // Clean the phone number (remove whatsapp: prefix if present)
    const cleanPhoneNumber = phoneNumber.replace('whatsapp:', '')

    let user = await prisma.user.findUnique({
      where: { phoneNumber: cleanPhoneNumber },
      include: {
        boxPrice: true
      }
    })

    // If user doesn't exist, create new user
    if (!user) {
      user = await prisma.user.create({
        data: {
          phoneNumber: cleanPhoneNumber,
          isFirstTime: true
        },
        include: {
          boxPrice: true
        }
      })
      console.log('🆕 New user created:', cleanPhoneNumber.substring(0, 5) + '***')
    } else {
      console.log('👤 Existing user found:', cleanPhoneNumber.substring(0, 5) + '***')
    }

    res.json({
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        isFirstTime: user.isFirstTime,
        selectedBoxSize: user.selectedBoxSize,
        deliveryDay: user.deliveryDay,
        householdSize: user.householdSize,
        preferences: user.preferences,
        hasAddresses: false, // Will implement address relation later
        boxPrice: user.boxPrice
      }
    })
  } catch (error) {
    console.error('User authentication error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateUserBasketConfiguration = async (req, res) => {
  try {
    const { phoneNumber } = req.params
    const { selectedBoxSize, deliveryDay, householdSize, preferences, isFirstTime } = req.body

    const cleanPhoneNumber = phoneNumber.replace('whatsapp:', '')

    const user = await prisma.user.update({
      where: { phoneNumber: cleanPhoneNumber },
      data: {
        selectedBoxSize,
        deliveryDay,
        householdSize,
        preferences,
        isFirstTime: isFirstTime !== undefined ? isFirstTime : false
      },
      include: {
        boxPrice: true
      }
    })

    console.log('📦 User basket configuration updated:', cleanPhoneNumber.substring(0, 5) + '***')

    res.json({
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        isFirstTime: user.isFirstTime,
        selectedBoxSize: user.selectedBoxSize,
        deliveryDay: user.deliveryDay,
        householdSize: user.householdSize,
        preferences: user.preferences,
        hasAddresses: false, // Will implement address relation later
        boxPrice: user.boxPrice
      }
    })
  } catch (error) {
    console.error('Update user configuration error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getUserProfile = async (req, res) => {
  try {
    const { phoneNumber } = req.params
    const cleanPhoneNumber = phoneNumber.replace('whatsapp:', '')

    const user = await prisma.user.findUnique({
      where: { phoneNumber: cleanPhoneNumber },
      include: {
        boxPrice: true
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        isFirstTime: user.isFirstTime,
        selectedBoxSize: user.selectedBoxSize,
        deliveryDay: user.deliveryDay,
        householdSize: user.householdSize,
        preferences: user.preferences,
        hasAddresses: false, // Will implement address relation later
        boxPrice: user.boxPrice,
        addresses: user.addresses
      }
    })
  } catch (error) {
    console.error('Get user profile error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const checkUserStatus = async (req, res) => {
  try {
    const { phoneNumber } = req.params
    const cleanPhoneNumber = phoneNumber.replace('whatsapp:', '')

    const user = await prisma.user.findUnique({
      where: { phoneNumber: cleanPhoneNumber },
      select: {
        id: true,
        phoneNumber: true,
        isFirstTime: true,
        selectedBoxSize: true,
        deliveryDay: true,
        householdSize: true
      }
    })

    if (!user) {
      return res.json({
        exists: false,
        isFirstTime: true,
        hasBasketConfiguration: false,
        hasAddress: false
      })
    }

    const hasBasketConfiguration = !!(user.selectedBoxSize && user.deliveryDay && user.householdSize)
    const hasAddress = false // Will implement address relation later

    res.json({
      exists: true,
      userId: user.id,
      isFirstTime: user.isFirstTime,
      hasBasketConfiguration,
      hasAddress,
      selectedBoxSize: user.selectedBoxSize,
      deliveryDay: user.deliveryDay,
      householdSize: user.householdSize
    })
  } catch (error) {
    console.error('Check user status error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}