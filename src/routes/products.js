import express from 'express'
import multer from 'multer'
import { getProducts, createProduct } from '../controllers/productController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

const storage = multer.memoryStorage()
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
})

router.get('/', getProducts)
router.post('/', authenticateToken, upload.single('image'), createProduct)

export default router