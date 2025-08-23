import express from 'express'
import { getAddresses, getAddressById, createAddress, updateAddress, deleteAddress } from '../controllers/addressController.js'
import { authenticateToken } from '../middleware/auth.js'
import { checkDatabase } from '../middleware/database.js'

const router = express.Router()

// Public routes (can be filtered by userId in query)
router.get('/', checkDatabase, getAddresses)
router.get('/:id', checkDatabase, getAddressById)

// Admin routes
router.post('/', authenticateToken, checkDatabase, createAddress)
router.put('/:id', authenticateToken, checkDatabase, updateAddress)
router.delete('/:id', authenticateToken, checkDatabase, deleteAddress)

export default router