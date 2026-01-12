// apps/web/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Marquer la route comme dynamique
export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/register
 * Inscription nouvel utilisateur et création restaurant
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, phone, restaurantName } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Générer un slug unique pour le restaurant
    const baseSlug = (restaurantName || `${firstName || 'user'}-restaurant`)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`;

    // Créer l'utilisateur et le restaurant en transaction
    const result = await prisma.$transaction(async (tx) => {
      // Créer le restaurant
      const restaurant = await tx.restaurant.create({
        data: {
          name: restaurantName || `${firstName || 'Mon'} Restaurant`,
          slug: uniqueSlug,
          currency: 'EUR',
        },
      });

      // Créer l'utilisateur
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          firstName,
          lastName,
          name: firstName && lastName ? `${firstName} ${lastName}` : firstName || email.split('@')[0],
          phone,
          role: 'OWNER',
          restaurantId: restaurant.id,
          isActive: true,
        },
      });

      return { user, restaurant };
    });

    // Générer le token JWT
    const token = jwt.sign(
      {
        userId: result.user.id,
        email: result.user.email,
        role: result.user.role,
        restaurantId: result.restaurant.id,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Retourner l'utilisateur et le token
    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.user.role,
        restaurantId: result.restaurant.id,
      },
      token,
    });
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
