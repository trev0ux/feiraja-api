import express from 'express'
import { getBoxPrices, updateBoxPrice } from '../controllers/boxPriceController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

router.get('/', authenticateToken, getBoxPrices)
router.put('/:id', authenticateToken, updateBoxPrice)

export default router