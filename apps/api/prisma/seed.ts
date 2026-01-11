import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');
  
  // 1. Créer un Restaurant de test
  const restaurant = await prisma.restaurant.upsert({
    where: { slug: 'nile-bites' },
    update: {
      phone: '+201276921081',
      whatsappNumber: '+201276921081',
    },
    create: {
      slug: 'nile-bites',
      name: 'Nile Bites',
      phone: '+201276921081',
      email: 'contact@nilebites.com',
      address: '123 Tahrir Street',
      description: 'Authentic Egyptian cuisine in Cairo',
      openingHours: {
        monday: { open: '09:00', close: '22:00' },
        tuesday: { open: '09:00', close: '22:00' },
        wednesday: { open: '09:00', close: '22:00' },
        thursday: { open: '09:00', close: '22:00' },
        friday: { open: '09:00', close: '23:00' },
        saturday: { open: '09:00', close: '23:00' },
        sunday: { open: '10:00', close: '21:00' },
      },
      deliveryZones: [
        { name: 'Zone 1 (< 3km)', radius: 3, fee: 10 },
        { name: 'Zone 2 (3-5km)', radius: 5, fee: 15 },
        { name: 'Zone 3 (5-10km)', radius: 10, fee: 25 },
      ],
      whatsappNumber: '+201276921081',
      isActive: true,
    },
  });
  
  console.log('✅ Restaurant created:', restaurant.name);
  
  // 2. Créer Admin User
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@whatsorder.com' },
    update: {},
    create: {
      email: 'admin@whatsorder.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'OWNER',
      restaurantId: restaurant.id,
      isActive: true,
    },
  });
  
  console.log('✅ Admin user created:', admin.email);
  console.log('   Password: Admin123!');
  
  // 3. Créer Staff User
  const staffPassword = await bcrypt.hash('Staff123!', 10);
  const staff = await prisma.user.upsert({
    where: { email: 'staff@whatsorder.com' },
    update: {},
    create: {
      email: 'staff@whatsorder.com',
      password: staffPassword,
      name: 'Staff User',
      role: 'STAFF',
      restaurantId: restaurant.id,
      isActive: true,
    },
  });
  
  console.log('✅ Staff user created:', staff.email);
  console.log('   Password: Staff123!');
  
  // 4. Créer les Catégories de Menu
  console.log('');
  console.log('🍽️ Creating menu categories...');
  
  const entrees = await prisma.category.upsert({
    where: { 
      restaurantId_slug: {
        restaurantId: restaurant.id,
        slug: 'entrees'
      }
    },
    update: {},
    create: {
      name: 'Entrées',
      nameAr: 'المقبلات',
      slug: 'entrees',
      description: 'Traditional Egyptian appetizers and starters',
      image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=600&fit=crop',
      sortOrder: 1,
      isActive: true,
      restaurantId: restaurant.id,
    },
  });
  
  const platsPrincipaux = await prisma.category.upsert({
    where: { 
      restaurantId_slug: {
        restaurantId: restaurant.id,
        slug: 'plats-principaux'
      }
    },
    update: {},
    create: {
      name: 'Plats Principaux',
      nameAr: 'الأطباق الرئيسية',
      slug: 'plats-principaux',
      description: 'Main courses featuring classic Egyptian dishes',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
      sortOrder: 2,
      isActive: true,
      restaurantId: restaurant.id,
    },
  });
  
  const grillades = await prisma.category.upsert({
    where: { 
      restaurantId_slug: {
        restaurantId: restaurant.id,
        slug: 'grillades'
      }
    },
    update: {},
    create: {
      name: 'Grillades',
      nameAr: 'المشويات',
      slug: 'grillades',
      description: 'Grilled meats and kebabs',
      image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=800&h=600&fit=crop',
      sortOrder: 3,
      isActive: true,
      restaurantId: restaurant.id,
    },
  });
  
  const desserts = await prisma.category.upsert({
    where: { 
      restaurantId_slug: {
        restaurantId: restaurant.id,
        slug: 'desserts'
      }
    },
    update: {},
    create: {
      name: 'Desserts',
      nameAr: 'الحلويات',
      slug: 'desserts',
      description: 'Traditional Egyptian sweets and desserts',
      image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&h=600&fit=crop',
      sortOrder: 4,
      isActive: true,
      restaurantId: restaurant.id,
    },
  });
  
  const boissons = await prisma.category.upsert({
    where: { 
      restaurantId_slug: {
        restaurantId: restaurant.id,
        slug: 'boissons'
      }
    },
    update: {},
    create: {
      name: 'Boissons',
      nameAr: 'المشروبات',
      slug: 'boissons',
      description: 'Traditional drinks and fresh juices',
      image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&h=600&fit=crop',
      sortOrder: 5,
      isActive: true,
      restaurantId: restaurant.id,
    },
  });
  
  console.log('✅ Categories created');
  
  // 5. Créer les Items de Menu - Entrées
  console.log('📝 Creating menu items...');
  
  await prisma.menuItem.upsert({
    where: {
      categoryId_slug: {
        categoryId: entrees.id,
        slug: 'koshari'
      }
    },
    update: {},
    create: {
      name: 'Koshari',
      nameAr: 'كشري',
      slug: 'koshari',
      description: 'Egypt\'s national dish - rice, lentils, pasta, chickpeas topped with spicy tomato sauce and crispy onions',
      descriptionAr: 'الطبق الوطني المصري - أرز وعدس ومعكرونة وحمص مع صلصة الطماطم الحارة والبصل المقلي',
      price: 45,
      image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=600&fit=crop',
      images: ['https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=600&fit=crop'],
      isAvailable: true,
      isActive: true,
      isFeatured: true,
      tags: ['popular', 'vegetarian', 'spicy'],
      allergens: [],
      calories: 450,
      preparationTime: 15,
      sortOrder: 1,
      categoryId: entrees.id,
      restaurantId: restaurant.id,
    },
  });
  
  await prisma.menuItem.upsert({
    where: {
      categoryId_slug: {
        categoryId: entrees.id,
        slug: 'ful-medames'
      }
    },
    update: {},
    create: {
      name: 'Ful Medames',
      nameAr: 'فول مدمس',
      slug: 'ful-medames',
      description: 'Slow-cooked fava beans seasoned with garlic, lemon, and olive oil, served with fresh bread',
      descriptionAr: 'فول مدمس مطبوخ ببطء مع الثوم والليمون وزيت الزيتون، يقدم مع الخبز الطازج',
      price: 35,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
      images: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop'],
      isAvailable: true,
      isActive: true,
      isFeatured: true,
      tags: ['vegetarian', 'traditional', 'breakfast'],
      allergens: [],
      calories: 320,
      preparationTime: 10,
      sortOrder: 2,
      categoryId: entrees.id,
      restaurantId: restaurant.id,
    },
  });
  
  await prisma.menuItem.upsert({
    where: {
      categoryId_slug: {
        categoryId: entrees.id,
        slug: 'taameya-falafel'
      }
    },
    update: {},
    create: {
      name: 'Ta\'ameya (Falafel)',
      nameAr: 'طعمية',
      slug: 'taameya-falafel',
      description: 'Egyptian falafel made from fava beans, deep-fried to golden perfection, served with tahini sauce',
      descriptionAr: 'طعمية مصرية مصنوعة من الفول، مقلية حتى تصبح ذهبية، تقدم مع صلصة الطحينة',
      price: 30,
      image: 'https://images.unsplash.com/photo-1572442388796-11668ba67c53?w=800&h=600&fit=crop',
      images: ['https://images.unsplash.com/photo-1572442388796-11668ba67c53?w=800&h=600&fit=crop'],
      isAvailable: true,
      isActive: true,
      isFeatured: false,
      tags: ['vegetarian', 'popular'],
      allergens: ['sesame'],
      calories: 280,
      preparationTime: 8,
      sortOrder: 3,
      categoryId: entrees.id,
      restaurantId: restaurant.id,
    },
  });
  
  await prisma.menuItem.upsert({
    where: {
      categoryId_slug: {
        categoryId: entrees.id,
        slug: 'hummus'
      }
    },
    update: {},
    create: {
      name: 'Hummus',
      nameAr: 'حمص',
      slug: 'hummus',
      description: 'Creamy chickpea dip with tahini, lemon, and garlic, drizzled with olive oil',
      descriptionAr: 'حمص كريمي مع الطحينة والليمون والثوم، يقدم مع زيت الزيتون',
      price: 40,
      image: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop',
      images: ['https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop'],
      isAvailable: true,
      isActive: true,
      isFeatured: false,
      tags: ['vegetarian'],
      allergens: ['sesame'],
      calories: 250,
      preparationTime: 5,
      sortOrder: 4,
      categoryId: entrees.id,
      restaurantId: restaurant.id,
    },
  });
  
  // Plats Principaux
  await prisma.menuItem.upsert({
    where: {
      categoryId_slug: {
        categoryId: platsPrincipaux.id,
        slug: 'mahshi'
      }
    },
    update: {},
    create: {
      name: 'Mahshi',
      nameAr: 'محشي',
      slug: 'mahshi',
      description: 'Vegetables (zucchini, peppers, tomatoes) stuffed with spiced rice and herbs, cooked in tomato sauce',
      descriptionAr: 'خضروات محشية (كوسة، فلفل، طماطم) بالأرز المتبل والأعشاب، مطبوخة في صلصة الطماطم',
      price: 85,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
      images: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop'],
      isAvailable: true,
      isActive: true,
      isFeatured: true,
      tags: ['vegetarian', 'traditional'],
      allergens: [],
      calories: 380,
      preparationTime: 30,
      sortOrder: 1,
      categoryId: platsPrincipaux.id,
      restaurantId: restaurant.id,
    },
  });
  
  await prisma.menuItem.upsert({
    where: {
      categoryId_slug: {
        categoryId: platsPrincipaux.id,
        slug: 'molokhia'
      }
    },
    update: {},
    create: {
      name: 'Molokhia',
      nameAr: 'ملوخية',
      slug: 'molokhia',
      description: 'Traditional jute leaf stew cooked with garlic and coriander, served with rice and chicken or meat',
      descriptionAr: 'طبق الملوخية التقليدي المطبوخ مع الثوم والكزبرة، يقدم مع الأرز والدجاج أو اللحم',
      price: 95,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
      images: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop'],
      isAvailable: true,
      isActive: true,
      isFeatured: true,
      tags: ['traditional', 'popular'],
      allergens: [],
      calories: 420,
      preparationTime: 25,
      sortOrder: 2,
      categoryId: platsPrincipaux.id,
      restaurantId: restaurant.id,
    },
  });
  
  await prisma.menuItem.upsert({
    where: {
      categoryId_slug: {
        categoryId: platsPrincipaux.id,
        slug: 'kofta'
      }
    },
    update: {},
    create: {
      name: 'Kofta',
      nameAr: 'كفتة',
      slug: 'kofta',
      description: 'Spiced minced meat grilled on skewers, served with rice, salad, and tahini',
      descriptionAr: 'لحم مفروم متبل مشوي على الأسياخ، يقدم مع الأرز والسلطة والطحينة',
      price: 120,
      image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=800&h=600&fit=crop',
      images: ['https://images.unsplash.com/photo-1558030006-450675393462?w=800&h=600&fit=crop'],
      isAvailable: true,
      isActive: true,
      isFeatured: false,
      tags: ['spicy', 'popular'],
      allergens: ['sesame'],
      calories: 550,
      preparationTime: 20,
      sortOrder: 3,
      categoryId: platsPrincipaux.id,
      restaurantId: restaurant.id,
    },
  });
  
  await prisma.menuItem.upsert({
    where: {
      categoryId_slug: {
        categoryId: platsPrincipaux.id,
        slug: 'sayadeya'
      }
    },
    update: {},
    create: {
      name: 'Sayadeya',
      nameAr: 'صيادية',
      slug: 'sayadeya',
      description: 'Spiced fish with rice, onions, and aromatic spices, baked to perfection',
      descriptionAr: 'سمك متبل مع الأرز والبصل والتوابل العطرية، مخبوز حتى الكمال',
      price: 150,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
      images: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop'],
      isAvailable: true,
      isActive: true,
      isFeatured: false,
      tags: ['seafood', 'traditional'],
      allergens: ['fish'],
      calories: 480,
      preparationTime: 35,
      sortOrder: 4,
      categoryId: platsPrincipaux.id,
      restaurantId: restaurant.id,
    },
  });
  
  // Grillades
  await prisma.menuItem.upsert({
    where: {
      categoryId_slug: {
        categoryId: grillades.id,
        slug: 'kebab'
      }
    },
    update: {},
    create: {
      name: 'Kebab',
      nameAr: 'كباب',
      slug: 'kebab',
      description: 'Tender chunks of marinated beef grilled on skewers, served with grilled vegetables',
      descriptionAr: 'قطع طرية من لحم البقر المتبل المشوي على الأسياخ، يقدم مع الخضار المشوية',
      price: 140,
      image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=800&h=600&fit=crop',
      images: ['https://images.unsplash.com/photo-1558030006-450675393462?w=800&h=600&fit=crop'],
      isAvailable: true,
      isActive: true,
      isFeatured: true,
      tags: ['popular', 'grilled'],
      allergens: [],
      calories: 580,
      preparationTime: 25,
      sortOrder: 1,
      categoryId: grillades.id,
      restaurantId: restaurant.id,
    },
  });
  
  await prisma.menuItem.upsert({
    where: {
      categoryId_slug: {
        categoryId: grillades.id,
        slug: 'shawarma'
      }
    },
    update: {},
    create: {
      name: 'Shawarma',
      nameAr: 'شاورما',
      slug: 'shawarma',
      description: 'Marinated chicken or beef, slow-roasted and thinly sliced, served in pita bread with tahini and pickles',
      descriptionAr: 'دجاج أو لحم متبل محمص ببطء ومقطع رفيعاً، يقدم في خبز البيتا مع الطحينة والمخلل',
      price: 75,
      image: 'https://images.unsplash.com/photo-1572442388796-11668ba67c53?w=800&h=600&fit=crop',
      images: ['https://images.unsplash.com/photo-1572442388796-11668ba67c53?w=800&h=600&fit=crop'],
      isAvailable: true,
      isActive: true,
      isFeatured: true,
      tags: ['popular', 'spicy'],
      allergens: ['sesame', 'gluten'],
      calories: 520,
      preparationTime: 15,
      sortOrder: 2,
      categoryId: grillades.id,
      restaurantId: restaurant.id,
    },
  });
  
  await prisma.menuItem.upsert({
    where: {
      categoryId_slug: {
        categoryId: grillades.id,
        slug: 'grilled-chicken'
      }
    },
    update: {},
    create: {
      name: 'Grilled Chicken',
      nameAr: 'دجاج مشوي',
      slug: 'grilled-chicken',
      description: 'Half chicken marinated in Egyptian spices, grilled to perfection, served with rice and salad',
      descriptionAr: 'نصف دجاجة متبلة بالبهارات المصرية، مشوية حتى الكمال، تقدم مع الأرز والسلطة',
      price: 110,
      image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=800&h=600&fit=crop',
      images: ['https://images.unsplash.com/photo-1558030006-450675393462?w=800&h=600&fit=crop'],
      isAvailable: true,
      isActive: true,
      isFeatured: false,
      tags: ['grilled', 'popular'],
      allergens: [],
      calories: 650,
      preparationTime: 30,
      sortOrder: 3,
      categoryId: grillades.id,
      restaurantId: restaurant.id,
    },
  });
  
  await prisma.menuItem.upsert({
    where: {
      categoryId_slug: {
        categoryId: grillades.id,
        slug: 'shish-tawook'
      }
    },
    update: {},
    create: {
      name: 'Shish Tawook',
      nameAr: 'شيش طاووق',
      slug: 'shish-tawook',
      description: 'Marinated chicken breast cubes grilled on skewers with garlic sauce, served with rice',
      descriptionAr: 'مكعبات صدور الدجاج المتبلة المشوية على الأسياخ مع صلصة الثوم، تقدم مع الأرز',
      price: 125,
      image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=800&h=600&fit=crop',
      images: ['https://images.unsplash.com/photo-1558030006-450675393462?w=800&h=600&fit=crop'],
      isAvailable: true,
      isActive: true,
      isFeatured: false,
      tags: ['grilled'],
      allergens: [],
      calories: 480,
      preparationTime: 20,
      sortOrder: 4,
      categoryId: grillades.id,
      restaurantId: restaurant.id,
    },
  });
  
  // Desserts
  await prisma.menuItem.upsert({
    where: {
      categoryId_slug: {
        categoryId: desserts.id,
        slug: 'basbousa'
      }
    },
    update: {},
    create: {
      name: 'Basbousa',
      nameAr: 'بسبوسة',
      slug: 'basbousa',
      description: 'Semolina cake soaked in sweet syrup, topped with coconut and almonds',
      descriptionAr: 'كعكة السميد المنقوعة في الشراب الحلو، مغطاة بجوز الهند واللوز',
      price: 50,
      image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&h=600&fit=crop',
      images: ['https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&h=600&fit=crop'],
      isAvailable: true,
      isActive: true,
      isFeatured: true,
      tags: ['sweet', 'popular', 'vegetarian'],
      allergens: ['gluten', 'nuts'],
      calories: 380,
      preparationTime: 5,
      sortOrder: 1,
      categoryId: desserts.id,
      restaurantId: restaurant.id,
    },
  });
  
  await prisma.menuItem.upsert({
    where: {
      categoryId_slug: {
        categoryId: desserts.id,
        slug: 'kunafa'
      }
    },
    update: {},
    create: {
      name: 'Kunafa',
      nameAr: 'كنافة',
      slug: 'kunafa',
      description: 'Shredded phyllo pastry filled with sweet cream or cheese, soaked in syrup',
      descriptionAr: 'عجينة الكنافة المقطعة محشوة بالقشطة الحلوة أو الجبن، منقوعة في الشراب',
      price: 65,
      image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&h=600&fit=crop',
      images: ['https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&h=600&fit=crop'],
      isAvailable: true,
      isActive: true,
      isFeatured: true,
      tags: ['sweet', 'popular'],
      allergens: ['gluten', 'dairy'],
      calories: 450,
      preparationTime: 8,
      sortOrder: 2,
      categoryId: desserts.id,
      restaurantId: restaurant.id,
    },
  });
  
  await prisma.menuItem.upsert({
    where: {
      categoryId_slug: {
        categoryId: desserts.id,
        slug: 'om-ali'
      }
    },
    update: {},
    create: {
      name: 'Om Ali',
      nameAr: 'أم علي',
      slug: 'om-ali',
      description: 'Traditional Egyptian bread pudding with milk, nuts, raisins, and coconut, baked until golden',
      descriptionAr: 'بودنغ الخبز المصري التقليدي مع الحليب والمكسرات والزبيب وجوز الهند، مخبوز حتى يصبح ذهبياً',
      price: 55,
      image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&h=600&fit=crop',
      images: ['https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&h=600&fit=crop'],
      isAvailable: true,
      isActive: true,
      isFeatured: false,
      tags: ['sweet', 'traditional', 'vegetarian'],
      allergens: ['gluten', 'nuts', 'dairy'],
      calories: 420,
      preparationTime: 10,
      sortOrder: 3,
      categoryId: desserts.id,
      restaurantId: restaurant.id,
    },
  });
  
  await prisma.menuItem.upsert({
    where: {
      categoryId_slug: {
        categoryId: desserts.id,
        slug: 'mahalabia'
      }
    },
    update: {},
    create: {
      name: 'Mahalabia',
      nameAr: 'مهلبية',
      slug: 'mahalabia',
      description: 'Creamy milk pudding flavored with rose water and topped with pistachios',
      descriptionAr: 'بودنغ الحليب الكريمي بنكهة ماء الورد ومغطى بالفستق',
      price: 45,
      image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&h=600&fit=crop',
      images: ['https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&h=600&fit=crop'],
      isAvailable: true,
      isActive: true,
      isFeatured: false,
      tags: ['sweet', 'vegetarian'],
      allergens: ['dairy', 'nuts'],
      calories: 280,
      preparationTime: 5,
      sortOrder: 4,
      categoryId: desserts.id,
      restaurantId: restaurant.id,
    },
  });
  
  // Boissons
  await prisma.menuItem.upsert({
    where: {
      categoryId_slug: {
        categoryId: boissons.id,
        slug: 'sahlab'
      }
    },
    update: {},
    create: {
      name: 'Sahlab',
      nameAr: 'سحلب',
      slug: 'sahlab',
      description: 'Warm creamy drink made from orchid root powder, topped with coconut and nuts',
      descriptionAr: 'مشروب دافئ كريمي مصنوع من مسحوق جذور الأوركيد، مغطى بجوز الهند والمكسرات',
      price: 40,
      image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&h=600&fit=crop',
      images: ['https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&h=600&fit=crop'],
      isAvailable: true,
      isActive: true,
      isFeatured: true,
      tags: ['hot', 'traditional', 'vegetarian'],
      allergens: ['nuts', 'dairy'],
      calories: 220,
      preparationTime: 5,
      sortOrder: 1,
      categoryId: boissons.id,
      restaurantId: restaurant.id,
    },
  });
  
  await prisma.menuItem.upsert({
    where: {
      categoryId_slug: {
        categoryId: boissons.id,
        slug: 'karkade'
      }
    },
    update: {},
    create: {
      name: 'Karkade',
      nameAr: 'كركديه',
      slug: 'karkade',
      description: 'Refreshing hibiscus tea, served hot or cold, naturally sweet and tangy',
      descriptionAr: 'شاي الكركديه المنعش، يقدم ساخناً أو بارداً، حلو وحامض طبيعياً',
      price: 35,
      image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&h=600&fit=crop',
      images: ['https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&h=600&fit=crop'],
      isAvailable: true,
      isActive: true,
      isFeatured: false,
      tags: ['traditional', 'vegetarian'],
      allergens: [],
      calories: 15,
      preparationTime: 3,
      sortOrder: 2,
      categoryId: boissons.id,
      restaurantId: restaurant.id,
    },
  });
  
  await prisma.menuItem.upsert({
    where: {
      categoryId_slug: {
        categoryId: boissons.id,
        slug: 'fresh-juice'
      }
    },
    update: {},
    create: {
      name: 'Fresh Juice',
      nameAr: 'عصير طازج',
      slug: 'fresh-juice',
      description: 'Freshly squeezed juice - choose from orange, mango, guava, or mixed fruit',
      descriptionAr: 'عصير طازج معصور - اختر من البرتقال، المانجو، الجوافة، أو الفواكه المختلطة',
      price: 50,
      image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&h=600&fit=crop',
      images: ['https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&h=600&fit=crop'],
      isAvailable: true,
      isActive: true,
      isFeatured: true,
      tags: ['fresh', 'healthy', 'vegetarian'],
      allergens: [],
      calories: 120,
      preparationTime: 5,
      sortOrder: 3,
      categoryId: boissons.id,
      restaurantId: restaurant.id,
    },
  });
  
  await prisma.menuItem.upsert({
    where: {
      categoryId_slug: {
        categoryId: boissons.id,
        slug: 'tamarind-juice'
      }
    },
    update: {},
    create: {
      name: 'Tamarind Juice',
      nameAr: 'عصير تمر هندي',
      slug: 'tamarind-juice',
      description: 'Sweet and tangy tamarind drink, refreshing and perfect for hot days',
      descriptionAr: 'مشروب التمر الهندي الحلو والحامض، منعش ومثالي للأيام الحارة',
      price: 40,
      image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&h=600&fit=crop',
      images: ['https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&h=600&fit=crop'],
      isAvailable: true,
      isActive: true,
      isFeatured: false,
      tags: ['traditional', 'vegetarian'],
      allergens: [],
      calories: 90,
      preparationTime: 5,
      sortOrder: 4,
      categoryId: boissons.id,
      restaurantId: restaurant.id,
    },
  });
  
  console.log('✅ Menu items created');
  
  console.log('');
  console.log('🎉 Seed completed!');
  console.log('');
  console.log('Test accounts:');
  console.log('  Admin: admin@whatsorder.com / Admin123!');
  console.log('  Staff: staff@whatsorder.com / Staff123!');
  console.log('');
  console.log('Menu created:');
  console.log('  - 5 Categories');
  console.log('  - 20 Menu Items');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
