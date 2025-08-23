import express from 'express'
import { getAddresses, getAddressById, createAddress } from '../controllers/addressController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

router.get('/', getAddresses)
router.get('/:id', getAddressById)
router.post('/', authenticateToken, createAddress)

export default router