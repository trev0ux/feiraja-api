import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function migrateProducers() {
  try {
    console.log('🔄 Starting producer migration...')

    // First, get all existing product origins with producer data
    const existingOrigins = await prisma.$queryRaw`
      SELECT id, product_id, producer, location, story, certifications 
      FROM product_origins 
      WHERE producer IS NOT NULL
    `

    console.log(`📊 Found ${existingOrigins.length} origins with producer data`)

    // Create producers from existing data
    const producers = new Map()
    
    for (const origin of existingOrigins) {
      const producerKey = `${origin.producer}-${origin.location || ''}`
      
      if (!producers.has(producerKey)) {
        producers.set(producerKey, {
          name: origin.producer,
          location: origin.location,
          story: origin.story,
          certifications: origin.certifications,
          originalIds: [origin.id]
        })
      } else {
        producers.get(producerKey).originalIds.push(origin.id)
      }
    }

    console.log(`👥 Creating ${producers.size} unique producers...`)

    // Create producers and update origins
    for (const [key, producerData] of producers) {
      try {
        const newProducer = await prisma.$queryRaw`
          INSERT INTO producers (name, location, story, certifications, created_at, updated_at)
          VALUES (${producerData.name}, ${producerData.location}, ${producerData.story}, ${producerData.certifications}::jsonb, NOW(), NOW())
          RETURNING id
        `
        
        const producerId = newProducer[0].id
        console.log(`✅ Created producer: ${producerData.name} (ID: ${producerId})`)

        // Update all origins that belong to this producer
        for (const originId of producerData.originalIds) {
          await prisma.$queryRaw`
            UPDATE product_origins 
            SET producer_id = ${producerId}
            WHERE id = ${originId}
          `
        }
      } catch (error) {
        console.error(`❌ Error creating producer ${producerData.name}:`, error)
      }
    }

    console.log('✅ Producer migration completed!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateProducers()
}

export default migrateProducers