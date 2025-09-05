import express from 'express'
import whatsappService from '../services/whatsappService.js'

const router = express.Router()

// Test WhatsApp message sending
router.post('/test-message', async (req, res) => {
  try {
    const { phoneNumber, code, userName } = req.body

    if (!phoneNumber || !code) {
      return res.status(400).json({ error: 'Phone number and code are required' })
    }

    // Clean phone number
    let cleanedNumber = phoneNumber.replace(/\D/g, '')
    if (cleanedNumber.length === 11 && !cleanedNumber.startsWith('55')) {
      cleanedNumber = '55' + cleanedNumber
    }
    const formattedNumber = '+' + cleanedNumber

    // Mock user for testing
    const mockUser = userName ? { name: userName } : null

    const result = await whatsappService.sendVerificationCode(formattedNumber, code, mockUser)

    res.json({
      success: true,
      message: 'Test message sent successfully',
      phoneNumber: formattedNumber,
      code,
      whatsappLink: result.whatsappLink,
      result
    })
  } catch (error) {
    console.error('Test message error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Test welcome message
router.post('/test-welcome', async (req, res) => {
  try {
    const { phoneNumber, userName } = req.body

    if (!phoneNumber || !userName) {
      return res.status(400).json({ error: 'Phone number and user name are required' })
    }

    // Clean phone number
    let cleanedNumber = phoneNumber.replace(/\D/g, '')
    if (cleanedNumber.length === 11 && !cleanedNumber.startsWith('55')) {
      cleanedNumber = '55' + cleanedNumber
    }
    const formattedNumber = '+' + cleanedNumber

    const result = await whatsappService.sendWelcomeMessage(formattedNumber, userName)

    res.json({
      success: true,
      message: 'Welcome message sent successfully',
      phoneNumber: formattedNumber,
      userName,
      result
    })
  } catch (error) {
    console.error('Test welcome message error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Generate WhatsApp links for testing
router.post('/generate-link', (req, res) => {
  const { phoneNumber, code } = req.body

  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number is required' })
  }

  // Clean phone number
  let cleanedNumber = phoneNumber.replace(/\D/g, '')
  if (cleanedNumber.length === 11 && !cleanedNumber.startsWith('55')) {
    cleanedNumber = '55' + cleanedNumber
  }

  const message = code ? `Código: ${code}` : 'Olá! Testando WhatsApp da Feirajá'
  const encodedMessage = encodeURIComponent(message)
  const whatsappLink = `https://wa.me/${cleanedNumber}?text=${encodedMessage}`

  res.json({
    success: true,
    phoneNumber: `+${cleanedNumber}`,
    message,
    whatsappLink,
    instructions: 'Click the WhatsApp link to open a chat with the phone number'
  })
})

export default router