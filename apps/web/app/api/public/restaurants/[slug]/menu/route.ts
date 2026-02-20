import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Restaurant slug is required' },
        { status: 400 }
      );
    }

    // Vérifier que le restaurant existe et est approuvé
    const restaurant = await prisma.restaurant.findUnique({
      where: { 
        slug,
      },
      select: {
        id: true,
        isApproved: true,
      },
    });

    if (!restaurant || !restaurant.isApproved) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    // Récupérer les catégories actives avec leurs items
    const categories = await (prisma.category.findMany as any)({
      where: {
        restaurantId: restaurant.id,
        isActive: true,
      },
      include: {
        items: {
          where: {
            isActive: true,
            isAvailable: true,
          },
          include: {
            variants: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' },
            },
            options: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' },
            },
            // Inclure les groupes d'options avec leurs options
            optionGroups: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' },
              include: {
                options: {
                  where: { isActive: true },
                  orderBy: { sortOrder: 'asc' },
                },
              },
            },
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    // Helper : détecter si un groupe est Sauce ou Boisson
    const hasSauceGroup = (groups: any[]) =>
      groups.some((g: any) => (g?.name || '').toLowerCase().includes('sauce'));
    const hasBoissonGroup = (groups: any[]) =>
      groups.some((g: any) => {
        const n = (g?.name || '').toLowerCase();
        return n.includes('boisson') || n.includes('boissons') || n.includes('drink');
      });
    const findSauceGroup = (groups: any[]) =>
      groups.find((g: any) => (g?.name || '').toLowerCase().includes('sauce'));
    const findBoissonGroup = (groups: any[]) =>
      groups.find((g: any) => {
        const n = (g?.name || '').toLowerCase();
        return n.includes('boisson') || n.includes('boissons') || n.includes('drink');
      });

    // Formater la réponse
    const formattedCategories = categories.map((category: any) => {
      const formatItem = (item: any) => ({
        id: item.id,
        name: item.name,
        nameAr: item.nameAr,
        slug: item.slug,
        description: item.description,
        descriptionAr: item.descriptionAr,
        price: item.price,
        image: item.image,
        hasVariants: item.hasVariants,
        variants: item.variants.map((v: any) => ({
          id: v.id,
          name: v.name,
          nameAr: v.nameAr,
          price: v.price,
          sku: v.sku,
          trackInventory: v.trackInventory,
          stockQuantity: v.stockQuantity,
          lowStockAlert: v.lowStockAlert,
          isActive: v.isActive,
        })),
        options: item.options
          .filter((o: any) => !o.optionGroupId)
          .map((o: any) => ({
            id: o.id,
            name: o.name,
            nameAr: o.nameAr,
            type: o.type,
            priceModifier: o.priceModifier,
            isRequired: o.isRequired,
            isMultiple: o.isMultiple,
            maxSelections: o.maxSelections,
            isActive: o.isActive,
          })),
        optionGroups: (item.optionGroups || []).map((g: any) => ({
          id: g.id,
          name: g.name,
          nameAr: g.nameAr,
          includedCount: g.includedCount,
          minSelections: g.minSelections,
          maxSelections: g.maxSelections,
          isRequired: g.isRequired,
          isActive: g.isActive,
          sortOrder: g.sortOrder,
          options: (g.options || []).map((o: any) => ({
            id: o.id,
            name: o.name,
            nameAr: o.nameAr,
            type: o.type,
            priceModifier: o.priceModifier,
            optionGroupId: o.optionGroupId,
            isActive: o.isActive,
            sortOrder: o.sortOrder,
          })),
        })),
        isAvailable: item.isAvailable,
        sortOrder: item.sortOrder,
      });

      const formattedItems = category.items.map(formatItem);

      // Héritage Sauce/Boisson : items sans ces groupes les héritent d'un frère de la même catégorie
      const sourceItem = formattedItems.find(
        (it: any) =>
          hasSauceGroup(it.optionGroups || []) && hasBoissonGroup(it.optionGroups || [])
      );

      if (sourceItem && sourceItem.optionGroups?.length) {
        const sauceFromSource = findSauceGroup(sourceItem.optionGroups);
        const boissonFromSource = findBoissonGroup(sourceItem.optionGroups);

        formattedItems.forEach((it: any) => {
          if (it.id === sourceItem.id) return;
          const groups = it.optionGroups || [];
          const needsSauce = it.hasVariants && (it.variants?.length ?? 0) > 0 && !hasSauceGroup(groups);
          const needsBoisson = it.hasVariants && (it.variants?.length ?? 0) > 0 && !hasBoissonGroup(groups);

          if (needsSauce || needsBoisson) {
            const merged = [...groups];
            if (needsSauce && sauceFromSource) merged.push(sauceFromSource);
            if (needsBoisson && boissonFromSource) merged.push(boissonFromSource);
            it.optionGroups = merged;
          }
        });
      }

      return {
        id: category.id,
        name: category.name,
        nameAr: category.nameAr,
        slug: category.slug,
        description: category.description,
        sortOrder: category.sortOrder,
        items: formattedItems,
      };
    });

    return NextResponse.json({
      restaurantId: restaurant.id,
      categories: formattedCategories,
    });
  } catch (error: any) {
    console.error('Error in getRestaurantMenu:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to fetch menu',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
