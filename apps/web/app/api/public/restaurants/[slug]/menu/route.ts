import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';

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

    // Vérifier que supabaseAdmin est disponible
    if (!supabaseAdmin) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Vérifier que le restaurant existe et est actif
    const { data: restaurant, error: restaurantError } = await supabaseAdmin
      .from('Restaurant')
      .select('id, isActive')
      .eq('slug', slug)
      .single();

    if (restaurantError) {
      console.error('Error fetching restaurant:', restaurantError);
      if (restaurantError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Restaurant not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: restaurantError.message || 'Failed to fetch restaurant' },
        { status: 500 }
      );
    }

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    if (!restaurant.isActive) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    // Récupérer les catégories actives
    const { data: categories, error: categoriesError } = await supabaseAdmin
      .from('Category')
      .select('id, name, nameAr, slug, description, image, sortOrder')
      .eq('restaurantId', restaurant.id)
      .eq('isActive', true)
      .order('sortOrder', { ascending: true });

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      return NextResponse.json(
        { error: categoriesError.message || 'Failed to fetch menu' },
        { status: 500 }
      );
    }

    // Pour chaque catégorie, récupérer ses items actifs et disponibles
    const formattedCategories = await Promise.all(
      (categories || []).map(async (category: any) => {
        if (!supabaseAdmin) {
          return {
            id: category.id,
            name: category.name,
            nameAr: category.nameAr,
            slug: category.slug,
            description: category.description,
            image: category.image,
            sortOrder: category.sortOrder,
            items: [],
          };
        }

        const { data: items, error: itemsError } = await supabaseAdmin
          .from('MenuItem')
          .select('id, name, nameAr, slug, description, descriptionAr, price, compareAtPrice, image, images, variants, modifiers, isAvailable, isFeatured, calories, preparationTime, tags, allergens, sortOrder')
          .eq('categoryId', category.id)
          .eq('isActive', true)
          .eq('isAvailable', true)
          .order('sortOrder', { ascending: true });
        
        if (itemsError) {
          console.warn(`Error fetching items for category ${category.id}:`, itemsError);
        }

        return {
          id: category.id,
          name: category.name,
          nameAr: category.nameAr,
          slug: category.slug,
          description: category.description,
          image: category.image,
          sortOrder: category.sortOrder,
          items: ((itemsError ? [] : items) || []).map((item: any) => ({
            id: item.id,
            name: item.name,
            nameAr: item.nameAr,
            slug: item.slug,
            description: item.description,
            descriptionAr: item.descriptionAr,
            price: item.price,
            compareAtPrice: item.compareAtPrice,
            image: item.image,
            images: item.images || [],
            variants: item.variants,
            modifiers: item.modifiers,
            isAvailable: item.isAvailable,
            isFeatured: item.isFeatured,
            calories: item.calories,
            preparationTime: item.preparationTime,
            tags: item.tags || [],
            allergens: item.allergens || [],
            sortOrder: item.sortOrder,
          })),
        };
      })
    );

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
