// Route API pour démarrer l'onboarding Stripe Connect
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
        { error: 'Seuls les propriétaires et managers peuvent connecter Stripe' },
        { status: 403 }
      );
    }

    const restaurantId = payload.restaurantId;

    // Vérifier que Stripe est configuré
    let stripe: Stripe;
    try {
      stripe = getStripeClient();
    } catch (err) {
      return NextResponse.json(
        { error: 'Stripe n\'est pas configuré sur cette plateforme' },
        { status: 500 }
      );
    }

    // Récupérer le restaurant
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant non trouvé' }, { status: 404 });
    }

    // URL de base
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://whataybo.com';

    let accountId = restaurant.stripeAccountId;

    // Créer un compte Connect si nécessaire
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express', // Express pour une expérience simplifiée
        country: 'EG', // Égypte
        email: restaurant.email || undefined,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'company',
        business_profile: {
          name: restaurant.name,
          mcc: '5812', // Restaurants
          url: `${baseUrl}/${restaurant.slug}`,
        },
        metadata: {
          restaurantId: restaurant.id,
          restaurantSlug: restaurant.slug,
        },
      });

      accountId = account.id;

      // Sauvegarder l'ID du compte
      await prisma.restaurant.update({
        where: { id: restaurantId },
        data: {
          stripeAccountId: accountId,
          stripeAccountStatus: 'pending',
        },
      });
    }

    // Créer un lien d'onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${baseUrl}/dashboard/settings?tab=payments&stripe_refresh=true`,
      return_url: `${baseUrl}/dashboard/settings?tab=payments&stripe_success=true`,
      type: 'account_onboarding',
    });

    return NextResponse.json({
      url: accountLink.url,
      accountId,
    });
  } catch (error: any) {
    console.error('❌ Erreur Stripe Connect onboard:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création du lien d\'onboarding' },
      { status: 500 }
    );
  }
}
