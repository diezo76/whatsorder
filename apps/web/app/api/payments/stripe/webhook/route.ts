// Webhook Stripe pour recevoir les notifications de paiement
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
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('❌ STRIPE_WEBHOOK_SECRET non configuré');
      return NextResponse.json(
        { error: 'Webhook non configuré' },
        { status: 500 }
      );
    }

    if (!signature) {
      return NextResponse.json(
        { error: 'Signature manquante' },
        { status: 400 }
      );
    }

    let stripe: Stripe;
    try {
      stripe = getStripeClient();
    } catch (err) {
      return NextResponse.json(
        { error: 'Stripe non configuré' },
        { status: 500 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('❌ Erreur de vérification webhook:', err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Traiter les événements
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { orderId, orderNumber } = session.metadata || {};

        if (orderId) {
          // Mettre à jour la commande comme payée
          await prisma.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: 'PAID',
              paymentMethod: 'STRIPE',
              status: 'CONFIRMED', // Confirmer automatiquement la commande
            },
          });

          console.log(`✅ Paiement Stripe confirmé pour commande ${orderNumber}`);

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
                  content: `✅ **Paiement confirmé** pour la commande #${orderNumber}\n\n💳 Paiement par carte (Stripe)\n💰 Montant: ${(session.amount_total || 0) / 100} EGP`,
                  sender: 'SYSTEM',
                  direction: 'outbound', // Message système sortant
                  isSystemMessage: true,
                  metadata: {
                    type: 'payment_confirmation',
                    orderId,
                    orderNumber,
                    paymentMethod: 'STRIPE',
                    amount: session.amount_total,
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
        }
        break;
      }

      case 'checkout.session.expired':
      case 'payment_intent.payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { orderId, orderNumber } = session.metadata || {};

        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: 'FAILED',
            },
          });

          console.log(`❌ Paiement Stripe échoué pour commande ${orderNumber}`);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('❌ Erreur webhook Stripe:', error);
    return NextResponse.json(
      { error: 'Erreur interne' },
      { status: 500 }
    );
  }
}
