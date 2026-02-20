// Route API pour créer une session de paiement Stripe Checkout (avec Stripe Connect)
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/server/prisma';

export const dynamic = 'force-dynamic';

// Fonction pour obtenir le client Stripe (initialisation lazy)
function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY non configurée');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, orderNumber, amount, customerEmail, customerName, restaurantSlug } = body;

    // Validation
    if (!orderId || !orderNumber || !amount || !restaurantSlug) {
      return NextResponse.json(
        { error: 'Données manquantes: orderId, orderNumber, amount et restaurantSlug sont requis' },
        { status: 400 }
      );
    }

    // 🔒 SÉCURITÉ : Validation du montant (doit être positif et raisonnable)
    if (typeof amount !== 'number' || amount <= 0 || amount > 10000000) {
      return NextResponse.json(
        { error: 'Montant invalide' },
        { status: 400 }
      );
    }

    // Récupérer le restaurant et son compte Stripe Connect
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: restaurantSlug },
      select: {
        id: true,
        name: true,
        stripeAccountId: true,
        stripeOnboardingComplete: true,
        enableStripePayment: true,
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant non trouvé' },
        { status: 404 }
      );
    }

    // 🔒 SÉCURITÉ : Vérifier que la commande existe et appartient au restaurant
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { 
        id: true, 
        restaurantId: true, 
        orderNumber: true,
        total: true,
        paymentStatus: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    if (order.restaurantId !== restaurant.id) {
      console.error(`🔒 Tentative de paiement frauduleuse: commande ${orderId} n'appartient pas au restaurant ${restaurantSlug}`);
      return NextResponse.json(
        { error: 'Commande invalide' },
        { status: 403 }
      );
    }

    if (order.orderNumber !== orderNumber) {
      return NextResponse.json(
        { error: 'Numéro de commande invalide' },
        { status: 400 }
      );
    }

    // 🔒 SÉCURITÉ : Vérifier que la commande n'est pas déjà payée
    if (order.paymentStatus === 'PAID') {
      return NextResponse.json(
        { error: 'Cette commande a déjà été payée' },
        { status: 400 }
      );
    }

    // 🔒 SÉCURITÉ : Vérifier que le montant correspond au total de la commande (en piastres)
    const expectedAmount = Math.round(order.total * 100);
    if (Math.abs(amount - expectedAmount) > 1) {
      console.error(`🔒 Tentative de manipulation du montant Stripe: reçu ${amount}, attendu ${expectedAmount}`);
      return NextResponse.json(
        { error: 'Montant invalide' },
        { status: 400 }
      );
    }

    // Vérifier que le restaurant a connecté Stripe
    if (!restaurant.stripeAccountId || !restaurant.stripeOnboardingComplete) {
      return NextResponse.json(
        { error: 'Ce restaurant n\'a pas encore configuré les paiements en ligne' },
        { status: 400 }
      );
    }

    if (!restaurant.enableStripePayment) {
      return NextResponse.json(
        { error: 'Les paiements par carte en ligne ne sont pas activés pour ce restaurant' },
        { status: 400 }
      );
    }

    // Vérifier que Stripe est configuré sur la plateforme
    let stripe: Stripe;
    try {
      stripe = getStripeClient();
    } catch (err) {
      console.error('❌ STRIPE_SECRET_KEY non configurée');
      return NextResponse.json(
        { error: 'Les paiements en ligne ne sont pas disponibles actuellement' },
        { status: 500 }
      );
    }

    // URL de base pour les redirections
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
      (request.headers.get('origin') || 'http://localhost:3000');

    // Créer la session Stripe Checkout avec le compte Connect du restaurant
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'egp', // Livre égyptienne
            product_data: {
              name: `Commande #${orderNumber}`,
              description: `${restaurant.name} - Commande ${orderNumber}`,
            },
            unit_amount: amount, // Montant en piastres
          },
          quantity: 1,
        },
      ],
      customer_email: customerEmail || undefined,
      metadata: {
        orderId,
        orderNumber,
        restaurantSlug,
        restaurantId: restaurant.id,
        customerName: customerName || '',
      },
      success_url: `${baseUrl}/${restaurantSlug}/payment/success?order=${orderNumber}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/${restaurantSlug}/payment/cancel?order=${orderNumber}`,
    }, {
      // Utiliser le compte Stripe Connect du restaurant
      stripeAccount: restaurant.stripeAccountId,
    });

    console.log(`✅ Session Stripe créée: ${session.id} pour commande ${orderNumber} (restaurant: ${restaurant.name})`);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('❌ Erreur Stripe:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de la session de paiement' },
      { status: 500 }
    );
  }
}
