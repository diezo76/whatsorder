// Route API pour déconnecter le compte Stripe Connect
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { verifyToken } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.restaurantId) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est OWNER ou MANAGER
    if (payload.role !== 'OWNER' && payload.role !== 'MANAGER') {
      return NextResponse.json(
        { error: 'Seuls les propriétaires et managers peuvent déconnecter Stripe' },
        { status: 403 }
      );
    }

    const restaurantId = payload.restaurantId;

    // Réinitialiser les champs Stripe
    await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        stripeAccountId: null,
        stripeAccountStatus: null,
        stripeOnboardingComplete: false,
        stripeConnectedAt: null,
        enableStripePayment: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Compte Stripe déconnecté',
    });
  } catch (error: any) {
    console.error('❌ Erreur Stripe disconnect:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la déconnexion' },
      { status: 500 }
    );
  }
}
