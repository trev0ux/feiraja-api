import express from 'express'
import { getProducers, getProducerById, createProducer, updateProducer, deleteProducer } from '../controllers/producerController.js'
import { authenticateToken } from '../middleware/auth.js'
import { checkDatabase } from '../middleware/database.js'

const router = express.Router()

// Public routes
router.get('/', checkDatabase, getProducers)
router.get('/:id', checkDatabase, getProducerById)

// Admin routes
router.post('/', authenticateToken, checkDatabase, createProducer)
router.put('/:id', authenticateToken, checkDatabase, updateProducer)
router.delete('/:id', authenticateToken, checkDatabase, deleteProducer)

export default router