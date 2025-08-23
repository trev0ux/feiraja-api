import express from 'express'
import { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js'
import { authenticateToken } from '../middleware/auth.js'
import { checkDatabase } from '../middleware/database.js'

const router = express.Router()

// Public routes
router.get('/', checkDatabase, getCategories)
router.get('/:id', checkDatabase, getCategoryById)

// Admin routes
router.post('/', authenticateToken, checkDatabase, createCategory)
router.put('/:id', authenticateToken, checkDatabase, updateCategory)
router.delete('/:id', authenticateToken, checkDatabase, deleteCategory)

export default router