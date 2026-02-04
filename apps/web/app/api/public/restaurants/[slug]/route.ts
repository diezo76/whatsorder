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

    // Récupérer le restaurant depuis Prisma
    const restaurant = await prisma.restaurant.findUnique({
      where: { 
        slug,
      },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(restaurant);
  } catch (error: any) {
    console.error('❌ Error in getRestaurantBySlug:', error);
    console.error('❌ Error message:', error?.message);
    console.error('❌ Error stack:', error?.stack);
    console.error('❌ Error code:', error?.code);
    
    // Vérifier si c'est une erreur de connexion Prisma
    if (error?.code === 'P1001' || error?.message?.includes('connect')) {
      return NextResponse.json(
        { 
          error: 'Database connection error',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: error?.message || 'Failed to fetch restaurant',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
