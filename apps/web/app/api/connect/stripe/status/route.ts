// Route API pour vérifier le statut du compte Stripe Connect
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/server/prisma';
import { verifyToken } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY non configurée');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

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
        stripeAccountId: true,
        stripeAccountStatus: true,
        stripeOnboardingComplete: true,
        stripeConnectedAt: true,
        enableStripePayment: true,
      },
    });

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant non trouvé' }, { status: 404 });
    }

    // Si pas de compte Stripe
    if (!restaurant.stripeAccountId) {
      return NextResponse.json({
        connected: false,
        status: null,
        canAcceptPayments: false,
      });
    }

    // Vérifier le statut sur Stripe
    let stripe: Stripe;
    try {
      stripe = getStripeClient();
    } catch (err) {
      return NextResponse.json({
        connected: false,
        status: 'platform_not_configured',
        canAcceptPayments: false,
      });
    }

    const account = await stripe.accounts.retrieve(restaurant.stripeAccountId);

    // Déterminer le statut
    const chargesEnabled = account.charges_enabled;
    const payoutsEnabled = account.payouts_enabled;
    const detailsSubmitted = account.details_submitted;

    let status: string;
    if (chargesEnabled && payoutsEnabled) {
      status = 'active';
    } else if (detailsSubmitted) {
      status = 'pending_verification';
    } else {
      status = 'incomplete';
    }

    // Mettre à jour le restaurant si le statut a changé
    if (status !== restaurant.stripeAccountStatus || 
        (status === 'active' && !restaurant.stripeOnboardingComplete)) {
      await prisma.restaurant.update({
        where: { id: restaurantId },
        data: {
          stripeAccountStatus: status,
          stripeOnboardingComplete: status === 'active',
          stripeConnectedAt: status === 'active' ? new Date() : restaurant.stripeConnectedAt,
          enableStripePayment: status === 'active',
        },
      });
    }

    return NextResponse.json({
      connected: true,
      accountId: restaurant.stripeAccountId,
      status,
      chargesEnabled,
      payoutsEnabled,
      detailsSubmitted,
      canAcceptPayments: chargesEnabled,
      email: account.email,
      businessName: account.business_profile?.name,
    });
  } catch (error: any) {
    console.error('❌ Erreur Stripe Connect status:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la vérification du statut' },
      { status: 500 }
    );
  }
}
