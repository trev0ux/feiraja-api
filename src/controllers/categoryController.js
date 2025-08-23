import prisma from '../utils/database.js'

export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      }
    })

    const categoriesWithProducts = categories.filter(category => category._count.products > 0)
    
    res.json(categoriesWithProducts)
  } catch (error) {
    console.error('Categories error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' })
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
        description: description || '',
      }
    })

    res.status(201).json(newCategory)
  } catch (error) {
    console.error('Create category error:', error)
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Category name already exists' })
    }
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateCategory = async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id)
    const { name, description } = req.body

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
      }
    })

    res.json(updatedCategory)
  } catch (error) {
    console.error('Update category error:', error)
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Category not found' })
    }
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Category name already exists' })
    }
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const deleteCategory = async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id)

    const productsCount = await prisma.product.count({
      where: { categoryId }
    })

    if (productsCount > 0) {
      return res.status(400).json({
        error: 'Cannot delete category with existing products',
      })
    }

    await prisma.category.delete({
      where: { id: categoryId }
    })

    res.json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Delete category error:', error)
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Category not found' })
    }
    res.status(500).json({ error: 'Internal server error' })
  }
}