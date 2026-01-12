// apps/web/app/api/onboarding/quick-setup/route.ts
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth-app';
import { prisma } from '@/lib/server/prisma';
import { handleError, AppError } from '@/lib/server/errors-app';

export const dynamic = 'force-dynamic';

/**
 * POST /api/onboarding/quick-setup
 * Configuration rapide du restaurant après inscription
 * Crée les données minimales pour mettre le restaurant en ligne rapidement
 */
export async function POST(request: Request) {
  return withAuth(async (req) => {
    try {
      // Seuls les OWNER peuvent faire le setup initial
      if (req.user!.role !== 'OWNER') {
        throw new AppError('Seul le propriétaire peut configurer le restaurant', 403);
      }

      const body = await request.json();
      const {
        restaurantName,
        phone,
        email,
        address,
        currency = 'EGP',
        timezone = 'Africa/Cairo',
        language = 'ar',
        createSampleMenu = true,
      } = body;

      if (!restaurantName || !phone) {
        throw new AppError('Le nom du restaurant et le téléphone sont requis', 400);
      }

      // Vérifier que le restaurant existe et appartient à l'utilisateur
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: req.user!.restaurantId },
      });

      if (!restaurant) {
        throw new AppError('Restaurant non trouvé', 404);
      }

      // Générer un slug unique si nécessaire
      let slug = restaurant.slug;
      if (!slug || slug.includes('restaurant-') || slug.includes('-restaurant')) {
        const baseSlug = restaurantName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        
        // Vérifier l'unicité du slug
        let uniqueSlug = baseSlug;
        let counter = 1;
        while (await prisma.restaurant.findUnique({ where: { slug: uniqueSlug } })) {
          uniqueSlug = `${baseSlug}-${counter}`;
          counter++;
        }
        slug = uniqueSlug;
      }

      // Mettre à jour le restaurant avec les informations de base
      const updatedRestaurant = await prisma.restaurant.update({
        where: { id: restaurant.id },
        data: {
          name: restaurantName,
          slug,
          phone,
          email: email || null,
          address: address || null,
          currency,
          timezone,
          language,
          description: `Bienvenue chez ${restaurantName}! Commandez en ligne et recevez votre commande rapidement.`,
        },
      });

      // Créer le menu par défaut si demandé
      let categoriesCreated = [];
      if (createSampleMenu) {
        categoriesCreated = await createDefaultMenu(restaurant.id, language, currency);
      }

      // Créer les horaires par défaut
      const defaultOpeningHours = {
        monday: { open: '09:00', close: '22:00', closed: false },
        tuesday: { open: '09:00', close: '22:00', closed: false },
        wednesday: { open: '09:00', close: '22:00', closed: false },
        thursday: { open: '09:00', close: '22:00', closed: false },
        friday: { open: '09:00', close: '22:00', closed: false },
        saturday: { open: '09:00', close: '22:00', closed: false },
        sunday: { open: '09:00', close: '22:00', closed: false },
      };

      await prisma.restaurant.update({
        where: { id: restaurant.id },
        data: {
          openingHours: defaultOpeningHours,
        },
      });

      return NextResponse.json({
        success: true,
        restaurant: updatedRestaurant,
        categoriesCreated: categoriesCreated.length,
        publicUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.whataybo.com'}/${slug}`,
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}

/**
 * Crée un menu par défaut avec quelques catégories et items
 */
async function createDefaultMenu(restaurantId: string, language: string = 'ar', currency: string = 'EGP') {
  const categories = [];

  // Fonction pour générer un slug unique
  const generateSlug = (name: string, existingSlugs: string[]): string => {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    let slug = baseSlug;
    let counter = 1;
    while (existingSlugs.includes(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    return slug;
  };

  const categorySlugs: string[] = [];
  const itemSlugs: string[] = [];

  // Catégorie 1: Entrées / المقبلات
  const entreesName = language === 'ar' ? 'المقبلات' : 'Entrées';
  const entreesSlug = generateSlug(entreesName, categorySlugs);
  categorySlugs.push(entreesSlug);

  const entreesCategory = await prisma.category.create({
    data: {
      name: entreesName,
      nameAr: 'المقبلات',
      slug: entreesSlug,
      restaurantId,
      sortOrder: 1,
      isActive: true,
    },
  });

  const hummusSlug = generateSlug('hummus', itemSlugs);
  itemSlugs.push(hummusSlug);
  const moutabalSlug = generateSlug('moutabal', itemSlugs);
  itemSlugs.push(moutabalSlug);

  await prisma.menuItem.createMany({
    data: [
      {
        name: language === 'ar' ? 'حمص' : 'Hummus',
        nameAr: 'حمص',
        description: language === 'ar' ? 'حمص طازج مع زيت الزيتون' : 'Hummus frais avec huile d\'olive',
        slug: hummusSlug,
        price: currency === 'EGP' ? 25 : currency === 'USD' ? 0.8 : 0.7,
        categoryId: entreesCategory.id,
        restaurantId,
        isAvailable: true,
        sortOrder: 1,
        isActive: true,
      },
      {
        name: language === 'ar' ? 'متبل' : 'Moutabal',
        nameAr: 'متبل',
        description: language === 'ar' ? 'متبل الباذنجان المشوي' : 'Moutabal d\'aubergines grillées',
        slug: moutabalSlug,
        price: currency === 'EGP' ? 30 : currency === 'USD' ? 1 : 0.9,
        categoryId: entreesCategory.id,
        restaurantId,
        isAvailable: true,
        sortOrder: 2,
        isActive: true,
      },
    ],
  });

  categories.push(entreesCategory);

  // Catégorie 2: Plats principaux / الأطباق الرئيسية
  const mainsName = language === 'ar' ? 'الأطباق الرئيسية' : 'Plats principaux';
  const mainsSlug = generateSlug(mainsName, categorySlugs);
  categorySlugs.push(mainsSlug);

  const mainsCategory = await prisma.category.create({
    data: {
      name: mainsName,
      nameAr: 'الأطباق الرئيسية',
      slug: mainsSlug,
      restaurantId,
      sortOrder: 2,
      isActive: true,
    },
  });

  const kebabSlug = generateSlug('kebab', itemSlugs);
  itemSlugs.push(kebabSlug);
  const shawarmaSlug = generateSlug('shawarma', itemSlugs);
  itemSlugs.push(shawarmaSlug);

  await prisma.menuItem.createMany({
    data: [
      {
        name: language === 'ar' ? 'كباب' : 'Kebab',
        nameAr: 'كباب',
        description: language === 'ar' ? 'كباب لحم مشوي مع أرز' : 'Kebab de viande grillée avec riz',
        slug: kebabSlug,
        price: currency === 'EGP' ? 80 : currency === 'USD' ? 2.5 : 2.3,
        categoryId: mainsCategory.id,
        restaurantId,
        isAvailable: true,
        sortOrder: 1,
        isActive: true,
      },
      {
        name: language === 'ar' ? 'شاورما' : 'Shawarma',
        nameAr: 'شاورما',
        description: language === 'ar' ? 'شاورما دجاج مع خبز' : 'Shawarma au poulet avec pain',
        slug: shawarmaSlug,
        price: currency === 'EGP' ? 60 : currency === 'USD' ? 2 : 1.8,
        categoryId: mainsCategory.id,
        restaurantId,
        isAvailable: true,
        sortOrder: 2,
        isActive: true,
      },
    ],
  });

  categories.push(mainsCategory);

  // Catégorie 3: Boissons / المشروبات
  const drinksName = language === 'ar' ? 'المشروبات' : 'Boissons';
  const drinksSlug = generateSlug(drinksName, categorySlugs);
  categorySlugs.push(drinksSlug);

  const drinksCategory = await prisma.category.create({
    data: {
      name: drinksName,
      nameAr: 'المشروبات',
      slug: drinksSlug,
      restaurantId,
      sortOrder: 3,
      isActive: true,
    },
  });

  const juiceSlug = generateSlug('orange-juice', itemSlugs);
  itemSlugs.push(juiceSlug);
  const teaSlug = generateSlug('tea', itemSlugs);
  itemSlugs.push(teaSlug);

  await prisma.menuItem.createMany({
    data: [
      {
        name: language === 'ar' ? 'عصير برتقال' : 'Jus d\'orange',
        nameAr: 'عصير برتقال',
        description: language === 'ar' ? 'عصير برتقال طازج' : 'Jus d\'orange frais',
        slug: juiceSlug,
        price: currency === 'EGP' ? 15 : currency === 'USD' ? 0.5 : 0.45,
        categoryId: drinksCategory.id,
        restaurantId,
        isAvailable: true,
        sortOrder: 1,
        isActive: true,
      },
      {
        name: language === 'ar' ? 'شاي' : 'Thé',
        nameAr: 'شاي',
        description: language === 'ar' ? 'شاي مصري تقليدي' : 'Thé égyptien traditionnel',
        slug: teaSlug,
        price: currency === 'EGP' ? 10 : currency === 'USD' ? 0.3 : 0.3,
        categoryId: drinksCategory.id,
        restaurantId,
        isAvailable: true,
        sortOrder: 2,
        isActive: true,
      },
    ],
  });

  categories.push(drinksCategory);

  return categories;
}
