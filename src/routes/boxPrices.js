import express from 'express'
import { getBoxPrices, getBoxPriceById, createBoxPrice, updateBoxPrice, deleteBoxPrice } from '../controllers/boxPriceController.js'
import { authenticateToken } from '../middleware/auth.js'
import { checkDatabase } from '../middleware/database.js'

const router = express.Router()

// All box price routes require authentication
router.get('/', authenticateToken, checkDatabase, getBoxPrices)
router.get('/:id', authenticateToken, checkDatabase, getBoxPriceById)
router.post('/', authenticateToken, checkDatabase, createBoxPrice)
router.put('/:id', authenticateToken, checkDatabase, updateBoxPrice)
router.delete('/:id', authenticateToken, checkDatabase, deleteBoxPrice)

export default router