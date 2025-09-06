import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../utils/database.js'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export const login = async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' })
    }

    // Try to find by username first (faster), then by email if not found
    let admin = await prisma.admin.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        password: true
      }
    })

    // If not found by username, try by email
    if (!admin) {
      admin = await prisma.admin.findUnique({
        where: { email: username },
        select: {
          id: true,
          username: true,
          email: true,
          password: true
        }
      })
    }

    if (!admin) {
      return res.status(401).json({ error: 'Credenciais inválidas' })
    }

    const isValidPassword = await bcrypt.compare(password, admin.password)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' })
    }

    const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, {
      expiresIn: '24h',
    })

    res.json({
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export const getAdmins = async (req, res) => {
  try {
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(admins)
  } catch (error) {
    console.error('Get admins error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const createAdmin = async (req, res) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: 'Username, email, and password are required' 
      })
    }

    // Check if username or email already exists
    const existingAdmin = await prisma.admin.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    })

    if (existingAdmin) {
      return res.status(400).json({ 
        error: 'Username or email already exists' 
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newAdmin = await prisma.admin.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    })

    res.status(201).json(newAdmin)
  } catch (error) {
    console.error('Create admin error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateAdmin = async (req, res) => {
  try {
    const adminId = parseInt(req.params.id)
    const { username, email, password } = req.body

    const existingAdmin = await prisma.admin.findUnique({
      where: { id: adminId }
    })

    if (!existingAdmin) {
      return res.status(404).json({ error: 'Admin not found' })
    }

    // Check if username or email already exists (excluding current admin)
    if (username || email) {
      const conflictingAdmin = await prisma.admin.findFirst({
        where: {
          AND: [
            { id: { not: adminId } },
            {
              OR: [
                ...(username ? [{ username }] : []),
                ...(email ? [{ email }] : [])
              ]
            }
          ]
        }
      })

      if (conflictingAdmin) {
        return res.status(400).json({ 
          error: 'Username or email already exists' 
        })
      }
    }

    const updateData = {
      ...(username && { username }),
      ...(email && { email }),
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const updatedAdmin = await prisma.admin.update({
      where: { id: adminId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    })

    res.json(updatedAdmin)
  } catch (error) {
    console.error('Update admin error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const deleteAdmin = async (req, res) => {
  try {
    const adminId = parseInt(req.params.id)
    const currentAdminId = req.admin.id

    // Prevent deleting self
    if (adminId === currentAdminId) {
      return res.status(400).json({ error: 'Cannot delete your own admin account' })
    }

    const existingAdmin = await prisma.admin.findUnique({
      where: { id: adminId }
    })

    if (!existingAdmin) {
      return res.status(404).json({ error: 'Admin not found' })
    }

    await prisma.admin.delete({
      where: { id: adminId }
    })

    res.json({ message: 'Admin deleted successfully' })
  } catch (error) {
    console.error('Delete admin error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}