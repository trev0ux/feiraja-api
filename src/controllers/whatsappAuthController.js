import prisma from '../utils/database.js'
import crypto from 'crypto'
import whatsappService from '../services/whatsappService.js'

// Helper function to generate 6-digit code
const generateVerificationCode = () => {
  return crypto.randomInt(100000, 999999).toString()
}

// Helper function to clean phone number
const cleanPhoneNumber = (phoneNumber) => {
  // Remove all non-digits
  let cleaned = phoneNumber.replace(/\D/g, '')
  
  // Add +55 if not present for Brazilian numbers
  if (cleaned.length === 11 && !cleaned.startsWith('55')) {
    cleaned = '55' + cleaned
  }
  
  return '+' + cleaned
}

// Check if user exists by phone number
export const checkUserStatus = async (req, res) => {
  try {
    const { phoneNumber } = req.body

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' })
    }

    const cleanedNumber = cleanPhoneNumber(phoneNumber)
    
    const user = await prisma.user.findUnique({
      where: { phoneNumber: cleanedNumber },
      select: {
        id: true,
        name: true,
        email: true,
        isFirstTime: true,
        selectedBoxSize: true,
        deliveryDay: true,
        householdSize: true
      }
    })

    const hasBasketConfiguration = user && !!(user.selectedBoxSize && user.deliveryDay && user.householdSize)
    
    res.json({
      userExists: !!user,
      isFirstTime: user?.isFirstTime ?? true,
      hasBasketConfiguration,
      hasAddress: false, // TODO: Check for addresses
      userInfo: user ? {
        id: user.id,
        name: user.name,
        email: user.email,
        selectedBoxSize: user.selectedBoxSize,
        deliveryDay: user.deliveryDay,
        householdSize: user.householdSize
      } : null
    })
  } catch (error) {
    console.error('Check user status error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Send verification code via WhatsApp
export const sendVerificationCode = async (req, res) => {
  try {
    const { phoneNumber } = req.body

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' })
    }

    const cleanedNumber = cleanPhoneNumber(phoneNumber)
    
    // Check rate limiting - max 3 attempts per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentAttempts = await prisma.whatsAppVerification.count({
      where: {
        phoneNumber: cleanedNumber,
        createdAt: { gte: oneHourAgo }
      }
    })

    if (recentAttempts >= 3) {
      return res.status(429).json({ 
        error: 'Muitas tentativas. Tente novamente em 1 hora.',
        retryAfter: 3600
      })
    }

    // Clean up old verification codes for this number
    await prisma.whatsAppVerification.deleteMany({
      where: {
        phoneNumber: cleanedNumber,
        expiresAt: { lte: new Date() }
      }
    })

    const code = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    // Create verification record
    await prisma.whatsAppVerification.create({
      data: {
        phoneNumber: cleanedNumber,
        code,
        expiresAt
      }
    })

    // Check if user exists to customize message
    const user = await prisma.user.findUnique({
      where: { phoneNumber: cleanedNumber },
      select: { name: true }
    })

    // Send WhatsApp message using service
    const whatsappResult = await whatsappService.sendVerificationCode(cleanedNumber, code, user)

    res.json({ 
      success: true,
      message: 'Código enviado com sucesso',
      whatsappLink: whatsappResult.whatsappLink,
      expiresIn: 300 // 5 minutes in seconds
    })
  } catch (error) {
    console.error('Send verification code error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Verify WhatsApp code and authenticate/register user
export const verifyCode = async (req, res) => {
  try {
    const { phoneNumber, code } = req.body

    if (!phoneNumber || !code) {
      return res.status(400).json({ error: 'Phone number and code are required' })
    }

    const cleanedNumber = cleanPhoneNumber(phoneNumber)
    
    // Find valid verification code
    const verification = await prisma.whatsAppVerification.findFirst({
      where: {
        phoneNumber: cleanedNumber,
        code: code.toString(),
        expiresAt: { gt: new Date() },
        verified: false
      }
    })

    if (!verification) {
      // Increment attempts for rate limiting
      await prisma.whatsAppVerification.updateMany({
        where: {
          phoneNumber: cleanedNumber,
          code: code.toString()
        },
        data: {
          attempts: { increment: 1 }
        }
      })

      return res.status(400).json({ error: 'Código inválido ou expirado' })
    }

    // Mark verification as used
    await prisma.whatsAppVerification.update({
      where: { id: verification.id },
      data: { verified: true }
    })

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { phoneNumber: cleanedNumber },
      include: {
        boxPrice: true,
        addresses: true
      }
    })

    if (user) {
      // Existing user - return user data
      res.json({
        success: true,
        userExists: true,
        requiresRegistration: false,
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          name: user.name,
          email: user.email,
          isFirstTime: user.isFirstTime,
          selectedBoxSize: user.selectedBoxSize,
          deliveryDay: user.deliveryDay,
          householdSize: user.householdSize,
          preferences: user.preferences,
          hasAddresses: user.addresses.length > 0,
          boxPrice: user.boxPrice
        }
      })
    } else {
      // New user - needs registration
      res.json({
        success: true,
        userExists: false,
        requiresRegistration: true,
        phoneNumber: cleanedNumber
      })
    }
  } catch (error) {
    console.error('Verify code error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Register new user after WhatsApp verification
export const registerUser = async (req, res) => {
  try {
    const { 
      phoneNumber, 
      name, 
      email, 
      address, 
      selectedBoxSize, 
      deliveryDay, 
      householdSize,
      preferences 
    } = req.body

    if (!phoneNumber || !name || !selectedBoxSize || !deliveryDay || !householdSize) {
      return res.status(400).json({ 
        error: 'Nome, tamanho da cesta, dia de entrega e tamanho do lar são obrigatórios' 
      })
    }

    const cleanedNumber = cleanPhoneNumber(phoneNumber)
    
    // Verify that the phone number was recently verified
    const recentVerification = await prisma.whatsAppVerification.findFirst({
      where: {
        phoneNumber: cleanedNumber,
        verified: true,
        createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) } // 10 minutes window
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!recentVerification) {
      return res.status(400).json({ error: 'Verificação não encontrada. Verifique seu número novamente.' })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber: cleanedNumber }
    })

    if (existingUser) {
      return res.status(400).json({ error: 'Usuário já cadastrado' })
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        phoneNumber: cleanedNumber,
        name,
        email,
        selectedBoxSize: parseInt(selectedBoxSize),
        deliveryDay,
        householdSize: parseInt(householdSize),
        preferences,
        isFirstTime: false
      },
      include: {
        boxPrice: true
      }
    })

    // Create address if provided
    if (address) {
      await prisma.address.create({
        data: {
          userId: user.id,
          name: address.name || 'Casa',
          street: address.street,
          neighborhood: address.neighborhood,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
          complement: address.complement,
          reference: address.reference,
          isDefault: true
        }
      })
    }

    // Send welcome message via WhatsApp
    try {
      await whatsappService.sendWelcomeMessage(cleanedNumber, name)
    } catch (welcomeError) {
      console.error('Failed to send welcome message:', welcomeError)
      // Don't fail the registration if welcome message fails
    }

    res.status(201).json({
      success: true,
      message: 'Usuário cadastrado com sucesso!',
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        email: user.email,
        isFirstTime: user.isFirstTime,
        selectedBoxSize: user.selectedBoxSize,
        deliveryDay: user.deliveryDay,
        householdSize: user.householdSize,
        preferences: user.preferences,
        hasAddresses: !!address,
        boxPrice: user.boxPrice
      }
    })
  } catch (error) {
    console.error('Register user error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Quick login for existing users
export const quickLogin = async (req, res) => {
  try {
    const { phoneNumber } = req.body

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' })
    }

    const cleanedNumber = cleanPhoneNumber(phoneNumber)
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { phoneNumber: cleanedNumber },
      include: {
        boxPrice: true,
        addresses: true
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        email: user.email,
        isFirstTime: user.isFirstTime,
        selectedBoxSize: user.selectedBoxSize,
        deliveryDay: user.deliveryDay,
        householdSize: user.householdSize,
        preferences: user.preferences,
        hasAddresses: user.addresses.length > 0,
        boxPrice: user.boxPrice,
        addresses: user.addresses
      }
    })
  } catch (error) {
    console.error('Quick login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}