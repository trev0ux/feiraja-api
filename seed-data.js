import prisma from './src/utils/database.js';

const categories = [
  {
    name: 'Frutas',
    description: 'Frutas frescas e naturais'
  },
  {
    name: 'Verduras',
    description: 'Verduras folhosas e fresquinhas'
  },
  {
    name: 'Legumes',
    description: 'Legumes variados e nutritivos'
  },
  {
    name: 'Temperos',
    description: 'Ervas e temperos frescos'
  },
  {
    name: 'Orgânicos',
    description: 'Produtos cultivados sem agrotóxicos'
  }
];

const products = [
  // Frutas
  {
    name: 'Maçã Gala',
    description: 'Maçãs doces e crocantes, perfeitas para lanches',
    price: 4.50,
    category: 'Frutas',
    image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&h=400&fit=crop',
    inStock: true
  },
  {
    name: 'Banana Prata',
    description: 'Bananas maduras e saborosas, ricas em potássio',
    price: 3.20,
    category: 'Frutas',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop',
    inStock: true
  },
  {
    name: 'Laranja Lima',
    description: 'Laranjas suculentas e doces, ideais para suco',
    price: 2.80,
    category: 'Frutas',
    image: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=400&h=400&fit=crop',
    inStock: true
  },
  {
    name: 'Abacaxi Pérola',
    description: 'Abacaxi doce e aromático, maduro no ponto',
    price: 6.90,
    category: 'Frutas',
    image: 'https://images.unsplash.com/photo-1550828520-4cb496926fc9?w=400&h=400&fit=crop',
    inStock: true
  },
  {
    name: 'Manga Tommy',
    description: 'Mangas maduras e doces, polpa suculenta',
    price: 5.60,
    category: 'Frutas',
    image: 'https://images.unsplash.com/photo-1605027990121-cbae9edd148a?w=400&h=400&fit=crop',
    inStock: true
  },
  {
    name: 'Limão Taiti',
    description: 'Limões frescos e suculentos para temperos',
    price: 2.40,
    category: 'Frutas',
    image: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=400&h=400&fit=crop',
    inStock: true
  },

  // Verduras
  {
    name: 'Alface Americana',
    description: 'Alface crocante e fresca, ideal para saladas',
    price: 2.50,
    category: 'Verduras',
    image: 'https://images.unsplash.com/photo-1622205313162-be1d5712a43f?w=400&h=400&fit=crop',
    inStock: true
  },
  {
    name: 'Rúcula',
    description: 'Folhas de rúcula com sabor levemente picante',
    price: 3.80,
    category: 'Verduras',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=400&fit=crop',
    inStock: true
  },
  {
    name: 'Espinafre',
    description: 'Espinafre fresco, rico em ferro e vitaminas',
    price: 4.20,
    category: 'Verduras',
    image: 'https://images.unsplash.com/photo-1576200187426-84a4b42e2b83?w=400&h=400&fit=crop',
    inStock: true
  },
  {
    name: 'Couve Manteiga',
    description: 'Folhas de couve tenras e nutritivas',
    price: 2.90,
    category: 'Verduras',
    image: 'https://images.unsplash.com/photo-1515023115689-589c33041d3c?w=400&h=400&fit=crop',
    inStock: true
  },

  // Legumes
  {
    name: 'Tomate Salada',
    description: 'Tomates maduros e saborosos para saladas',
    price: 4.80,
    category: 'Legumes',
    image: 'https://images.unsplash.com/photo-1546470427-e212b9ce8f5f?w=400&h=400&fit=crop',
    inStock: true
  },
  {
    name: 'Cenoura',
    description: 'Cenouras doces e crocantes, ricas em vitamina A',
    price: 3.60,
    category: 'Legumes',
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=400&fit=crop',
    inStock: true
  },
  {
    name: 'Batata Inglesa',
    description: 'Batatas frescas, ideais para diversos pratos',
    price: 2.20,
    category: 'Legumes',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=400&fit=crop',
    inStock: true
  },
  {
    name: 'Cebola Roxa',
    description: 'Cebolas roxas com sabor suave e doce',
    price: 3.90,
    category: 'Legumes',
    image: 'https://images.unsplash.com/photo-1508313880080-c4ba2c8d4afc?w=400&h=400&fit=crop',
    inStock: true
  },
  {
    name: 'Abobrinha',
    description: 'Abobrinhas tenras e versáteis para diversos pratos',
    price: 4.40,
    category: 'Legumes',
    image: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400&h=400&fit=crop',
    inStock: true
  },
  {
    name: 'Pimentão Amarelo',
    description: 'Pimentões amarelos doces e coloridos',
    price: 5.20,
    category: 'Legumes',
    image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&h=400&fit=crop',
    inStock: true
  },

  // Temperos
  {
    name: 'Manjericão',
    description: 'Folhas frescas de manjericão aromático',
    price: 3.50,
    category: 'Temperos',
    image: 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=400&h=400&fit=crop',
    inStock: true
  },
  {
    name: 'Salsa',
    description: 'Salsinha fresca para temperar seus pratos',
    price: 2.80,
    category: 'Temperos',
    image: 'https://images.unsplash.com/photo-1629978445136-18dd5cb14d41?w=400&h=400&fit=crop',
    inStock: true
  },
  {
    name: 'Cebolinha',
    description: 'Cebolinha verde fresca e aromática',
    price: 2.60,
    category: 'Temperos',
    image: 'https://images.unsplash.com/photo-1576200190026-e5e32ddb2c35?w=400&h=400&fit=crop',
    inStock: true
  },
  {
    name: 'Coentro',
    description: 'Folhas de coentro frescas com aroma marcante',
    price: 3.20,
    category: 'Temperos',
    image: 'https://images.unsplash.com/photo-1552752322-903ba6021198?w=400&h=400&fit=crop',
    inStock: true
  },

  // Orgânicos
  {
    name: 'Brócolis Orgânico',
    description: 'Brócolis cultivado sem agrotóxicos, super nutritivo',
    price: 7.80,
    category: 'Orgânicos',
    image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&h=400&fit=crop',
    inStock: true
  },
  {
    name: 'Alface Orgânica',
    description: 'Alface orgânica crocante e livre de pesticidas',
    price: 4.50,
    category: 'Orgânicos',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
    inStock: true
  },
  {
    name: 'Tomate Orgânico',
    description: 'Tomates orgânicos com sabor mais intenso',
    price: 8.90,
    category: 'Orgânicos',
    image: 'https://images.unsplash.com/photo-1582284540020-8acbe03f4924?w=400&h=400&fit=crop',
    inStock: true
  },
  {
    name: 'Cenoura Orgânica',
    description: 'Cenouras orgânicas doces e nutritivas',
    price: 6.20,
    category: 'Orgânicos',
    image: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=400&h=400&fit=crop',
    inStock: true
  }
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Clear existing data
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    console.log('🗑️  Cleared existing data');
    
    // Create categories
    console.log('📂 Creating categories...');
    const createdCategories = {};
    
    for (const category of categories) {
      const created = await prisma.category.create({
        data: category
      });
      createdCategories[category.name] = created.id;
      console.log(`  ✅ Created category: ${category.name}`);
    }
    
    // Create products
    console.log('🛒 Creating products...');
    for (const product of products) {
      await prisma.product.create({
        data: {
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.image,
          inStock: product.inStock,
          categoryId: createdCategories[product.category]
        }
      });
      console.log(`  ✅ Created product: ${product.name}`);
    }
    
    // Show summary
    const totalCategories = await prisma.category.count();
    const totalProducts = await prisma.product.count();
    const activeProducts = await prisma.product.count({ where: { inStock: true } });
    
    console.log('\n🎉 Seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`  - ${totalCategories} categories created`);
    console.log(`  - ${totalProducts} products created`);
    console.log(`  - ${activeProducts} active products`);
    console.log('\n🌐 All products have beautiful Unsplash images!');
    console.log('🖥️  You can now visit the admin dashboard to see the populated data.');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
};

seedDatabase();