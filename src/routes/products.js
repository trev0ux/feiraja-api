import express from 'express'
import multer from 'multer'
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js'
import { authenticateToken } from '../middleware/auth.js'
import { checkDatabase } from '../middleware/database.js'

const router = express.Router()

const storage = multer.memoryStorage()
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
})

// Public routes
router.get('/', checkDatabase, getProducts)
router.get('/:id', checkDatabase, getProductById)

// Admin routes
router.post('/', authenticateToken, checkDatabase, upload.single('image'), createProduct)
router.put('/:id', authenticateToken, checkDatabase, upload.single('image'), updateProduct)
router.delete('/:id', authenticateToken, checkDatabase, deleteProduct)

export default router