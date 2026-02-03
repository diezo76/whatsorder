// Route API pour créer une commande PayPal (avec compte restaurant)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';

export const dynamic = 'force-dynamic';

// Configuration PayPal de la plateforme
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_SECRET = process.env.PAYPAL_SECRET || '';
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox';

const PAYPAL_API_URL = PAYPAL_MODE === 'live' 
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

// Obtenir un token d'accès PayPal
async function getPayPalAccessToken(): Promise<string> {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
  
  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error('Impossible d\'obtenir le token PayPal');
  }

  const data = await response.json();
  return data.access_token;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, orderNumber, amount, restaurantSlug } = body;

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

    // Récupérer le restaurant et vérifier PayPal
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: restaurantSlug },
      select: {
        id: true,
        name: true,
        paypalMerchantId: true,
        paypalEmail: true,
        paypalOnboardingComplete: true,
        enablePaypalPayment: true,
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
      console.error(`🔒 Tentative de paiement frauduleuse PayPal: commande ${orderId} n'appartient pas au restaurant ${restaurantSlug}`);
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

    // Vérifier que le restaurant a connecté PayPal
    if (!restaurant.paypalMerchantId || !restaurant.paypalOnboardingComplete) {
      return NextResponse.json(
        { error: 'Ce restaurant n\'a pas encore configuré PayPal' },
        { status: 400 }
      );
    }

    if (!restaurant.enablePaypalPayment) {
      return NextResponse.json(
        { error: 'Les paiements PayPal ne sont pas activés pour ce restaurant' },
        { status: 400 }
      );
    }

    // Vérifier que PayPal est configuré sur la plateforme
    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
      console.error('❌ PayPal non configuré');
      return NextResponse.json(
        { error: 'PayPal n\'est pas disponible actuellement' },
        { status: 500 }
      );
    }

    // URL de base pour les redirections
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
      (request.headers.get('origin') || 'http://localhost:3000');

    // Obtenir le token d'accès
    const accessToken = await getPayPalAccessToken();

    // Créer la commande PayPal avec le payee du restaurant
    const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: orderId,
            description: `${restaurant.name} - Commande #${orderNumber}`,
            custom_id: orderId,
            amount: {
              currency_code: 'USD', // PayPal utilise USD
              value: (amount / 30).toFixed(2), // Conversion EGP -> USD approximative
            },
            // Diriger le paiement vers le compte PayPal du restaurant
            payee: {
              merchant_id: restaurant.paypalMerchantId,
            },
          },
        ],
        application_context: {
          brand_name: restaurant.name,
          landing_page: 'BILLING',
          user_action: 'PAY_NOW',
          return_url: `${baseUrl}/${restaurantSlug}/payment/paypal/success?order=${orderNumber}&orderId=${orderId}`,
          cancel_url: `${baseUrl}/${restaurantSlug}/payment/cancel?order=${orderNumber}`,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Erreur PayPal:', errorData);
      throw new Error('Erreur lors de la création de la commande PayPal');
    }

    const paypalOrder = await response.json();
    
    // Trouver l'URL d'approbation
    const approvalUrl = paypalOrder.links?.find((link: any) => link.rel === 'approve')?.href;

    if (!approvalUrl) {
      throw new Error('URL d\'approbation PayPal non trouvée');
    }

    console.log(`✅ Commande PayPal créée: ${paypalOrder.id} pour commande ${orderNumber} (restaurant: ${restaurant.name})`);

    return NextResponse.json({
      paypalOrderId: paypalOrder.id,
      approvalUrl,
    });
  } catch (error: any) {
    console.error('❌ Erreur PayPal:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de la commande PayPal' },
      { status: 500 }
    );
  }
}
