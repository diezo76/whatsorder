// apps/web/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Créer le restaurant
  const restaurant = await prisma.restaurant.upsert({
    where: { slug: 'nile-bites' },
    update: {},
    create: {
      name: 'Nile Bites',
      nameAr: 'نايل بايتس',
      slug: 'nile-bites',
      description: 'Authentic Egyptian cuisine delivered to your door',
      phone: '+20 123 456 7890',
      address: 'Cairo, Egypt',
      currency: 'EGP',
      whatsappNumber: '+201234567890',
      enableAiParsing: true,
    },
  });

  console.log('✅ Restaurant created:', restaurant.name);

  // 2. Créer l'utilisateur admin
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@whatsorder.com' },
    update: {},
    create: {
      email: 'admin@whatsorder.com',
      password: hashedPassword,
      name: 'Admin',
      role: 'OWNER',
      restaurantId: restaurant.id,
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // 3. Créer les catégories
  const categories = [
    { name: 'Main Dishes', nameAr: 'الأطباق الرئيسية', slug: 'main-dishes', sortOrder: 1 },
    { name: 'Appetizers', nameAr: 'المقبلات', slug: 'appetizers', sortOrder: 2 },
    { name: 'Desserts', nameAr: 'الحلويات', slug: 'desserts', sortOrder: 3 },
    { name: 'Beverages', nameAr: 'المشروبات', slug: 'beverages', sortOrder: 4 },
  ];

  const createdCategories = [];
  for (const cat of categories) {
    const category = await prisma.category.upsert({
      where: {
        restaurantId_slug: {
          restaurantId: restaurant.id,
          slug: cat.slug,
        },
      },
      update: {},
      create: {
        ...cat,
        restaurantId: restaurant.id,
      },
    });
    createdCategories.push(category);
  }

  console.log('✅ Categories created');

  // 4. Créer des items de menu
  const mainDishesCategory = createdCategories.find(c => c.slug === 'main-dishes');
  const appetizersCategory = createdCategories.find(c => c.slug === 'appetizers');
  const beveragesCategory = createdCategories.find(c => c.slug === 'beverages');

  if (mainDishesCategory) {
    const mainItems = [
      {
        name: 'Koshari',
        nameAr: 'كشري',
        slug: 'koshari',
        description: 'Egyptian rice, lentils, and pasta with tomato sauce',
        price: 45,
        image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400',
      },
      {
        name: 'Molokhia',
        nameAr: 'ملوخية',
        slug: 'molokhia',
        description: 'Traditional Egyptian green soup',
        price: 60,
        image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
      },
      {
        name: 'Grilled Chicken',
        nameAr: 'دجاج مشوي',
        slug: 'grilled-chicken',
        description: 'Marinated grilled chicken with rice',
        price: 85,
        image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400',
      },
    ];

    for (const item of mainItems) {
      await prisma.menuItem.upsert({
        where: {
          categoryId_slug: {
            categoryId: mainDishesCategory.id,
            slug: item.slug,
          },
        },
        update: {},
        create: {
          ...item,
          categoryId: mainDishesCategory.id,
          restaurantId: restaurant.id,
        },
      });
    }
  }

  if (appetizersCategory) {
    await prisma.menuItem.upsert({
      where: {
        categoryId_slug: {
          categoryId: appetizersCategory.id,
          slug: 'falafel',
        },
      },
      update: {},
      create: {
        name: 'Falafel',
        nameAr: 'فلافل',
        slug: 'falafel',
        description: 'Crispy fried chickpea balls',
        price: 25,
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400',
        categoryId: appetizersCategory.id,
        restaurantId: restaurant.id,
      },
    });
  }

  if (beveragesCategory) {
    await prisma.menuItem.upsert({
      where: {
        categoryId_slug: {
          categoryId: beveragesCategory.id,
          slug: 'karkade',
        },
      },
      update: {},
      create: {
        name: 'Karkade',
        nameAr: 'كركديه',
        slug: 'karkade',
        description: 'Refreshing hibiscus tea',
        price: 15,
        image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
        categoryId: beveragesCategory.id,
        restaurantId: restaurant.id,
      },
    });
  }

  console.log('✅ Menu items created');

  // 5. Créer un client exemple
  await prisma.customer.upsert({
    where: {
      phone_restaurantId: {
        phone: '+201234567890',
        restaurantId: restaurant.id,
      },
    },
    update: {},
    create: {
      phone: '+201234567890',
      name: 'Ahmed Mohamed',
      email: 'ahmed@example.com',
      restaurantId: restaurant.id,
    },
  });

  console.log('✅ Sample customer created');

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
