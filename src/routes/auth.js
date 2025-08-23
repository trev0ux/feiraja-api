import express from 'express'
import { login, getAdmins, createAdmin, updateAdmin, deleteAdmin } from '../controllers/authController.js'
import { authenticateToken } from '../middleware/auth.js'
import { checkDatabase } from '../middleware/database.js'

const router = express.Router()

// Public auth routes
router.post('/login', checkDatabase, login)

// Admin management routes (require authentication)
router.get('/admins', authenticateToken, checkDatabase, getAdmins)
router.post('/admins', authenticateToken, checkDatabase, createAdmin)
router.put('/admins/:id', authenticateToken, checkDatabase, updateAdmin)
router.delete('/admins/:id', authenticateToken, checkDatabase, deleteAdmin)

export default router