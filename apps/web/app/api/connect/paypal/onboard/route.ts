// Route API pour connecter PayPal (saisie directe de l'email PayPal)
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

    // 🔒 SÉCURITÉ : Vérifier que l'utilisateur est OWNER ou MANAGER
    if (payload.role !== 'OWNER' && payload.role !== 'MANAGER') {
      return NextResponse.json(
        { error: 'Seuls les propriétaires et managers peuvent connecter PayPal' },
        { status: 403 }
      );
    }

    const restaurantId = payload.restaurantId;
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Veuillez fournir une adresse email PayPal valide' },
        { status: 400 }
      );
    }

    // Mettre à jour le restaurant avec l'email PayPal
    await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        paypalEmail: email.trim(),
        paypalOnboardingComplete: true,
        enablePaypalPayment: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Compte PayPal connecté avec succès',
    });
  } catch (error: any) {
    console.error('❌ Erreur PayPal onboard:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la connexion PayPal' },
      { status: 500 }
    );
  }
}
