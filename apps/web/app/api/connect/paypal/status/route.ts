// Route API pour vérifier le statut du compte PayPal
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { verifyToken } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
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

    const restaurantId = payload.restaurantId;

    // Récupérer le restaurant
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: {
        paypalMerchantId: true,
        paypalEmail: true,
        paypalOnboardingComplete: true,
        paypalConnectedAt: true,
        enablePaypalPayment: true,
      },
    });

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant non trouvé' }, { status: 404 });
    }

    const isConnected = (!!restaurant.paypalEmail || !!restaurant.paypalMerchantId) && restaurant.paypalOnboardingComplete;

    return NextResponse.json({
      connected: isConnected,
      merchantId: restaurant.paypalMerchantId,
      email: restaurant.paypalEmail,
      canAcceptPayments: isConnected,
      connectedAt: restaurant.paypalConnectedAt,
    });
  } catch (error: any) {
    console.error('❌ Erreur PayPal status:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la vérification du statut' },
      { status: 500 }
    );
  }
}
