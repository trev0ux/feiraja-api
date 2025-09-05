import express from 'express'
import {
  checkUserStatus,
  sendVerificationCode,
  verifyCode,
  registerUser,
  quickLogin
} from '../controllers/whatsappAuthController.js'
import { checkDatabase } from '../middleware/database.js'

const router = express.Router()

// Check if user exists by phone number
router.post('/check-user', checkDatabase, checkUserStatus)

// Send verification code via WhatsApp
router.post('/send-code', checkDatabase, sendVerificationCode)

// Verify WhatsApp code and authenticate user
router.post('/verify-code', checkDatabase, verifyCode)

// Register new user after WhatsApp verification
router.post('/register', checkDatabase, registerUser)

// Quick login for existing users (development/testing)
router.post('/quick-login', checkDatabase, quickLogin)

export default router