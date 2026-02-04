// apps/web/app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import jwt from 'jsonwebtoken';

// Marquer la route comme dynamique
export const dynamic = 'force-dynamic';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  restaurantId: string;
}

/**
 * GET /api/auth/me
 * Récupérer le profil de l'utilisateur connecté
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Invalid token format' },
        { status: 401 }
      );
    }

    // Vérifier que JWT_SECRET est défini
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET is not defined in /api/auth/me');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Vérifier le token
    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
    } catch (error: any) {
      console.error('❌ Token verification error:', error?.message);
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        restaurantId: user.restaurantId,
        restaurant: user.restaurant,
      },
    });
  } catch (error: any) {
    console.error('Me error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
