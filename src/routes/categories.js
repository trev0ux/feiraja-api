import express from 'express'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

router.get('/', getCategories)
router.post('/', authenticateToken, createCategory)
router.put('/:id', authenticateToken, updateCategory)
router.delete('/:id', authenticateToken, deleteCategory)

export default router