// apps/web/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Marquer la route comme dynamique
export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/login
 * Connexion utilisateur
 */
export async function POST(request: Request) {
  try {
    // Vérifier que JWT_SECRET est défini
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET is not defined');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Chercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        restaurant: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Générer le token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        restaurantId: user.restaurantId,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Retourner l'utilisateur et le token
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        restaurantId: user.restaurantId,
      },
      token,
    });
  } catch (error: any) {
    console.error('❌ Login error:', error);
    console.error('❌ Error message:', error?.message);
    console.error('❌ Error stack:', error?.stack);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    );
  }
}
