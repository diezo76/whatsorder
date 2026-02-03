// Route API pour capturer un paiement PayPal après approbation
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';

export const dynamic = 'force-dynamic';

// Configuration PayPal
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
    const { paypalOrderId, orderId, orderNumber } = body;

    // Validation
    if (!paypalOrderId || !orderId) {
      return NextResponse.json(
        { error: 'Données manquantes: paypalOrderId et orderId sont requis' },
        { status: 400 }
      );
    }

    // 🔒 SÉCURITÉ : Vérifier que la commande existe et n'est pas déjà payée
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: { 
        id: true, 
        paymentStatus: true,
        orderNumber: true,
      },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    // 🔒 SÉCURITÉ : Empêcher la double capture
    if (existingOrder.paymentStatus === 'PAID') {
      console.log(`⚠️ Tentative de double capture PayPal pour commande ${existingOrder.orderNumber}`);
      return NextResponse.json({
        success: true,
        status: 'ALREADY_PAID',
        orderId,
        orderNumber: existingOrder.orderNumber,
        message: 'Cette commande a déjà été payée',
      });
    }

    // 🔒 SÉCURITÉ : Validation du format PayPal Order ID
    if (!/^[A-Z0-9]{17,}$/.test(paypalOrderId)) {
      return NextResponse.json(
        { error: 'Format PayPal Order ID invalide' },
        { status: 400 }
      );
    }

    // Obtenir le token d'accès
    const accessToken = await getPayPalAccessToken();

    // Capturer le paiement
    const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Erreur capture PayPal:', errorData);
      throw new Error('Erreur lors de la capture du paiement PayPal');
    }

    const captureData = await response.json();

    if (captureData.status === 'COMPLETED') {
      // Mettre à jour la commande comme payée
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
          paymentMethod: 'PAYPAL',
          status: 'CONFIRMED',
        },
      });

      console.log(`✅ Paiement PayPal capturé pour commande ${orderNumber}`);

      // Créer un message dans la conversation si elle existe
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { customer: true },
      });

      if (order) {
        const conversation = await prisma.conversation.findFirst({
          where: {
            customerPhone: order.customer.phone,
            restaurantId: order.restaurantId,
          },
        });

        if (conversation) {
          await prisma.message.create({
            data: {
              conversationId: conversation.id,
              type: 'TEXT',
              content: `✅ **Paiement PayPal confirmé** pour la commande #${orderNumber}\n\n🅿️ Paiement via PayPal\n💰 Montant: ${order.total} EGP`,
              sender: 'SYSTEM',
              direction: 'outbound', // Message système sortant
              isSystemMessage: true,
              metadata: {
                type: 'payment_confirmation',
                orderId,
                orderNumber,
                paymentMethod: 'PAYPAL',
                paypalOrderId,
              },
            },
          });

          await prisma.conversation.update({
            where: { id: conversation.id },
            data: {
              lastMessageAt: new Date(),
            },
          });
        }
      }

      return NextResponse.json({
        success: true,
        status: 'COMPLETED',
        orderId,
        orderNumber,
      });
    } else {
      // Paiement non complété
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'FAILED',
        },
      });

      return NextResponse.json({
        success: false,
        status: captureData.status,
        error: 'Le paiement n\'a pas été complété',
      });
    }
  } catch (error: any) {
    console.error('❌ Erreur capture PayPal:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la capture du paiement' },
      { status: 500 }
    );
  }
}
