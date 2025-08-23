import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc1NTk2NDA0NSwiZXhwIjoxNzU2MDUwNDQ1fQ.AJ_iEETcERs0qr0I3vWp0KCuSt0AKfND1F95Txr0hX8"

// Sample product images as base64 (small placeholders)
const productImages = {
  tomato: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRkY2MzQ3Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VG9tYXRlPC90ZXh0Pgo8L3N2Zz4=",
  lettuce: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjNDFCODgzIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QWxmYWNlPC90ZXh0Pgo8L3N2Zz4=",
  carrot: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRkZBNTAwIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Q2Vub3VyYTwvdGV4dD4KPC9zdmc+",
  apple: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRkY0NTU3Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TWHDp8OjPC90ZXh0Pgo8L3N2Zz4=",
  banana: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRkZEQjAwIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSJibGFjayIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QmFuYW5hPC90ZXh0Pgo8L3N2Zz4=",
  rice: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRDJCNDhDIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSJibGFjayIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QXJyb3o8L3RleHQ+Cjwvc3ZnPg==",
  beans: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjOEI0NTEzIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RmVpasOjbzwvdGV4dD4KPC9zdmc+",
  onion: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRkZGRkZGIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSJibGFjayIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Q2Vib2xhPC90ZXh0Pgo8L3N2Zz4=",
  potato: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjQ0Q4NTNGIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QmF0YXRhPC90ZXh0Pgo8L3N2Zz4=",
  orange: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRkZBNTAwIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TGFyYW5qYTwvdGV4dD4KPC9zdmc+"
}

const products = [
  {
    name: "Tomate Orgânico Premium",
    description: "Tomate vermelho cultivado sem agrotóxicos, ideal para saladas e molhos",
    price: 8.50,
    categoryId: 2, // Vegetais
    image: productImages.tomato,
    producerId: 1
  },
  {
    name: "Alface Crespa Hidropônica",
    description: "Alface fresca cultivada em sistema hidropônico, crocante e saborosa",
    price: 4.90,
    categoryId: 2, // Vegetais  
    image: productImages.lettuce,
    producerId: 1
  },
  {
    name: "Cenoura Baby",
    description: "Cenoura pequena e doce, perfeita para aperitivos e pratos infantis",
    price: 6.20,
    categoryId: 2, // Vegetais
    image: productImages.carrot,
    producerId: 1
  },
  {
    name: "Maçã Gala Orgânica",
    description: "Maçã doce e crocante, cultivada organicamente em pomares sustentáveis",
    price: 12.90,
    categoryId: 1, // Frutas
    image: productImages.apple,
    producerId: 1
  },
  {
    name: "Banana Prata Premium",
    description: "Banana prata madura no ponto certo, rica em potássio e vitaminas",
    price: 7.80,
    categoryId: 1, // Frutas
    image: productImages.banana,
    producerId: 1
  },
  {
    name: "Arroz Integral Cateto",
    description: "Arroz integral tradicional, rico em fibras e nutrientes",
    price: 18.50,
    categoryId: 3, // Grãos
    image: productImages.rice,
    producerId: 1
  },
  {
    name: "Feijão Carioca Especial",
    description: "Feijão carioca selecionado, grãos uniformes e de alta qualidade",
    price: 15.90,
    categoryId: 3, // Grãos
    image: productImages.beans,
    producerId: 1
  },
  {
    name: "Cebola Roxa Orgânica",
    description: "Cebola roxa orgânica, sabor suave e ideal para saladas",
    price: 5.50,
    categoryId: 2, // Vegetais
    image: productImages.onion,
    producerId: 1
  },
  {
    name: "Batata Doce Roxa",
    description: "Batata doce com polpa roxa, rica em antioxidantes e sabor único",
    price: 9.90,
    categoryId: 2, // Vegetais
    image: productImages.potato,
    producerId: 1
  },
  {
    name: "Laranja Lima da Terra",
    description: "Laranja lima doce e suculenta, perfeita para sucos naturais",
    price: 8.90,
    categoryId: 1, // Frutas
    image: productImages.orange,
    producerId: 1
  }
]

async function clearAndSeedProducts() {
  try {
    console.log('🗑️  Clearing existing products...')

    // Delete all products (this will cascade delete origins and nutritional info)
    await prisma.product.deleteMany({})
    console.log('✅ Cleared all products')

    console.log('🌱 Creating 10 new products with images...')

    for (const [index, productData] of products.entries()) {
      console.log(`Creating product ${index + 1}: ${productData.name}`)
      
      const newProduct = await prisma.product.create({
        data: {
          name: productData.name,
          description: productData.description,
          price: productData.price,
          categoryId: productData.categoryId,
          image: productData.image,
          inStock: true
        },
        include: {
          category: {
            select: { name: true }
          }
        }
      })

      // Add origin data linking to producer
      await prisma.productOrigin.create({
        data: {
          productId: newProduct.id,
          producerId: productData.producerId,
          distance: "15km",
          harvestDate: new Date().toISOString().split('T')[0]
        }
      })

      console.log(`✅ Created: ${productData.name} - R$ ${productData.price}`)
    }

    console.log('🎉 Successfully created 10 products with images!')
    console.log('🔍 Fetching final product list...')

    const finalProducts = await prisma.product.findMany({
      include: {
        category: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`📊 Total products in database: ${finalProducts.length}`)
    finalProducts.forEach(p => {
      console.log(`- ${p.name} (${p.category.name}) - R$ ${p.price} - ${p.image ? 'With image' : 'No image'}`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
clearAndSeedProducts()