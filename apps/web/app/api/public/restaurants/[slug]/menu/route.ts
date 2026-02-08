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

    // Vérifier que le restaurant existe
    const restaurant = await prisma.restaurant.findUnique({
      where: { 
        slug,
      },
      select: {
        id: true,
      },
    });

    if (!restaurant) {
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

    // Formater la réponse
    const formattedCategories = categories.map((category: any) => ({
      id: category.id,
      name: category.name,
      nameAr: category.nameAr,
      slug: category.slug,
      description: category.description,
      sortOrder: category.sortOrder,
      items: category.items.map((item: any) => ({
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
        // Options individuelles (sans groupe)
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
        // Groupes d'options avec quota inclus
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
          options: g.options.map((o: any) => ({
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
      })),
    }));

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
