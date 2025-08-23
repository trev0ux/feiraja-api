import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@feiraja.com',
      password: await bcrypt.hash('admin123', 10),
    },
  })

  const categories = [
    { id: 1, name: 'Frutas', description: 'Frutas frescas da estação' },
    { id: 2, name: 'Vegetais', description: 'Vegetais frescos e orgânicos' },
    { id: 3, name: 'Grãos', description: 'Grãos e cereais' },
    { id: 4, name: 'Temperos', description: 'Temperos e ervas frescas' },
    { id: 5, name: 'Laticínios', description: 'Produtos lácteos artesanais' },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {},
      create: category,
    })
  }

  const products = [
    {
      id: 1,
      name: 'Tomate Orgânico',
      description: 'Tomate fresco da fazenda, cultivado sem agrotóxicos',
      price: 4.5,
      categoryId: 2,
      inStock: true,
    },
    {
      id: 2,
      name: 'Banana Prata',
      description: 'Banana madura e doce, cultivada naturalmente',
      price: 2.8,
      categoryId: 1,
      inStock: true,
    },
    {
      id: 3,
      name: 'Arroz Integral',
      description: 'Arroz integral orgânico, fonte de fibras',
      price: 8.5,
      categoryId: 3,
      inStock: true,
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {},
      create: product,
    })
  }

  const productOrigins = [
    {
      productId: 1,
      producer: 'Fazenda São João',
      location: 'Ibiúna, São Paulo',
      distance: '45 km de São Paulo',
      harvestDate: '2025-08-20',
      certifications: ['Orgânico IBD', 'Selo SisOrg'],
      story: 'A Fazenda São João é uma propriedade familiar que há 3 gerações se dedica ao cultivo orgânico.',
    },
    {
      productId: 2,
      producer: 'Sítio Frutas do Vale',
      location: 'Registro, São Paulo',
      distance: '180 km de São Paulo',
      harvestDate: '2025-08-19',
      certifications: ['Produção Sustentável'],
      story: 'O Sítio Frutas do Vale cultiva bananas há mais de 20 anos no Vale do Ribeira.',
    },
    {
      productId: 3,
      producer: 'Cooperativa Terra Rica',
      location: 'Eldorado, São Paulo',
      distance: '220 km de São Paulo',
      harvestDate: '2025-07-15',
      certifications: ['Orgânico IBD', 'Fair Trade'],
      story: 'A Cooperativa Terra Rica reúne 15 famílias de pequenos produtores.',
    },
  ]

  for (const origin of productOrigins) {
    await prisma.productOrigin.upsert({
      where: { productId: origin.productId },
      update: {},
      create: origin,
    })
  }

  const nutritionalInfos = [
    {
      productId: 1,
      portion: '100g',
      calories: 18,
      carbs: '3.9g',
      fiber: '1.2g',
      protein: '0.9g',
      vitamins: ['Vitamina C', 'Licopeno', 'Potássio'],
    },
    {
      productId: 2,
      portion: '100g',
      calories: 89,
      carbs: '22.8g',
      fiber: '2.6g',
      protein: '1.1g',
      vitamins: ['Potássio', 'Vitamina B6', 'Vitamina C'],
    },
    {
      productId: 3,
      portion: '100g',
      calories: 123,
      carbs: '23g',
      fiber: '1.8g',
      protein: '2.6g',
      vitamins: ['Magnésio', 'Selênio', 'Manganês'],
    },
  ]

  for (const info of nutritionalInfos) {
    await prisma.productNutritionalInfo.upsert({
      where: { productId: info.productId },
      update: {},
      create: info,
    })
  }

  const boxPrices = [
    { id: 1, profileType: 1, name: '1 pessoa', basePrice: 25.0, itemCount: 8 },
    { id: 2, profileType: 2, name: '2 pessoas', basePrice: 45.0, itemCount: 14 },
    { id: 3, profileType: 3, name: '3-4 pessoas', basePrice: 65.0, itemCount: 20 },
    { id: 4, profileType: 5, name: '5+ pessoas', basePrice: 85.0, itemCount: 26 },
  ]

  for (const boxPrice of boxPrices) {
    await prisma.boxPrice.upsert({
      where: { id: boxPrice.id },
      update: {},
      create: boxPrice,
    })
  }

  const addresses = [
    {
      id: 1,
      userId: 1,
      name: 'Casa',
      street: 'Rua das Flores, 123',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      complement: 'Apto 45',
      reference: 'Próximo ao mercado',
      isDefault: true,
    },
    {
      id: 2,
      userId: 1,
      name: 'Trabalho',
      street: 'Av. Paulista, 1000',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
      complement: '15º andar',
      reference: 'Torre Norte',
      isDefault: false,
    },
  ]

  for (const address of addresses) {
    await prisma.address.upsert({
      where: { id: address.id },
      update: {},
      create: address,
    })
  }

  console.log('✅ Database seeded successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })