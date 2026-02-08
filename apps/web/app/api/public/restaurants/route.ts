import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Récupérer tous les restaurants avec leurs informations publiques
    const restaurants = await prisma.restaurant.findMany({
      where: {
        // Récupérer tous les restaurants qui ont au moins une catégorie active
        categories: {
          some: {
            isActive: true,
          },
        },
      },
      select: {
        id: true,
        name: true,
        nameAr: true,
        slug: true,
        description: true,
        logo: true,
        coverImage: true,
        openingHours: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc', // Plus récents en premier
      },
    });

    // Formater les données pour la réponse
    const formattedRestaurants = restaurants.map((restaurant) => {
      return {
        id: restaurant.id,
        name: restaurant.name,
        nameAr: restaurant.nameAr,
        slug: restaurant.slug,
        description: restaurant.description,
        logo: restaurant.logo,
        coverImage: restaurant.coverImage,
        openingHours: restaurant.openingHours,
        createdAt: restaurant.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      restaurants: formattedRestaurants,
    });
  } catch (error: any) {
    console.error('❌ Error fetching restaurants:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to fetch restaurants',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
