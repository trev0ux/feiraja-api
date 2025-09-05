import express from 'express'
import { authenticateUser, updateUserBasketConfiguration, getUserProfile, checkUserStatus } from '../controllers/userController.js'

const router = express.Router()

// POST /api/users/authenticate - Authenticate user via WhatsApp phone number
router.post('/authenticate', authenticateUser)

// PUT /api/users/:phoneNumber/basket - Update user basket configuration
router.put('/:phoneNumber/basket', updateUserBasketConfiguration)

// GET /api/users/:phoneNumber/profile - Get user profile
router.get('/:phoneNumber/profile', getUserProfile)

// GET /api/users/:phoneNumber/status - Check user status (exists, first time, has config, has address)
router.get('/:phoneNumber/status', checkUserStatus)

export default router