// apps/web/app/api/public/restaurants/[slug]/orders/route.ts
// Route publique pour créer des commandes depuis le site web (sans authentification)

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';

// Marquer la route comme dynamique
export const dynamic = 'force-dynamic';

// Types
type DeliveryType = 'DELIVERY' | 'PICKUP' | 'DINE_IN';
type PaymentMethod = 'CASH' | 'CARD' | 'STRIPE' | 'PAYPAL';

interface OrderItemInput {
  menuItemId: string;
  quantity: number;
  unitPrice?: number;
  customization?: {
    variant?: string | null;
    modifiers?: string[];
    notes?: string | null;
  };
}

interface CreateOrderInput {
  items: OrderItemInput[];
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryType: DeliveryType;
  deliveryAddress?: string;
  notes?: string;
  paymentMethod: PaymentMethod;
}

/**
 * Génère un numéro de commande unique
 */
async function generateOrderNumber(restaurantId: string): Promise<string> {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  
  const count = await prisma.order.count({
    where: {
      restaurantId,
      orderNumber: { startsWith: `ORD-${dateStr}-` },
    },
  });
  
  return `ORD-${dateStr}-${String(count + 1).padStart(3, '0')}`;
}

/**
 * POST /api/public/restaurants/[slug]/orders
 * Crée une nouvelle commande (route publique, pas besoin d'authentification)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  console.log('📥 [PUBLIC API] Requête reçue pour créer une commande');
  
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug du restaurant requis' },
        { status: 400 }
      );
    }

    // Parser le body
    const body: CreateOrderInput = await request.json();
    console.log('📦 [PUBLIC API] Body reçu:', {
      slug,
      itemsCount: body.items?.length,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      deliveryType: body.deliveryType,
    });

    // Validation basique
    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Le panier est vide' },
        { status: 400 }
      );
    }

    if (!body.customerName || !body.customerPhone) {
      return NextResponse.json(
        { error: 'Nom et téléphone du client requis' },
        { status: 400 }
      );
    }

    if (!['DELIVERY', 'PICKUP', 'DINE_IN'].includes(body.deliveryType)) {
      return NextResponse.json(
        { error: 'Type de livraison invalide' },
        { status: 400 }
      );
    }

    // Trouver le restaurant
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug },
      select: { id: true, name: true, slug: true, whatsappNumber: true },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant non trouvé' },
        { status: 404 }
      );
    }

    // Trouver ou créer le client
    let customer = await prisma.customer.findFirst({
      where: {
        phone: body.customerPhone,
        restaurantId: restaurant.id,
      },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          phone: body.customerPhone,
          name: body.customerName,
          email: body.customerEmail || null,
          restaurantId: restaurant.id,
        },
      });
      console.log('👤 [PUBLIC API] Nouveau client créé:', customer.id);
    } else {
      // Mettre à jour le nom et email si fournis
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          name: body.customerName,
          email: body.customerEmail || customer.email || null,
        },
      });
    }

    // Vérifier que les items existent et appartiennent au restaurant
    const menuItems = await Promise.all(
      body.items.map(async (item) => {
        const menuItem = await prisma.menuItem.findFirst({
          where: {
            id: item.menuItemId,
            restaurantId: restaurant.id,
          },
          select: {
            id: true,
            name: true,
            price: true,
            isAvailable: true,
            isActive: true,
          },
        });

        if (!menuItem) {
          console.error(`❌ [PUBLIC API] Menu item ${item.menuItemId} non trouvé pour restaurant ${slug}`);
          
          // Vérifier si l'item existe ailleurs
          const itemExists = await prisma.menuItem.findUnique({
            where: { id: item.menuItemId },
            select: { id: true, name: true, restaurantId: true },
          });

          if (itemExists) {
            throw new Error(`Menu item "${itemExists.name || item.menuItemId}" n'appartient pas au restaurant "${restaurant.name}". Veuillez vider votre panier et réessayer.`);
          } else {
            throw new Error(`Menu item ${item.menuItemId} non trouvé. Il a peut-être été supprimé. Veuillez vider votre panier et réessayer.`);
          }
        }

        if (!menuItem.isAvailable || !menuItem.isActive) {
          throw new Error(`L'article "${menuItem.name}" n'est plus disponible`);
        }

        return {
          ...item,
          menuItem,
          unitPrice: item.unitPrice || menuItem.price,
        };
      })
    );

    // Calculer les totaux
    const subtotal = menuItems.reduce((sum, item) => {
      const price = item.unitPrice || item.menuItem.price || 0;
      return sum + (price * item.quantity);
    }, 0);
    
    const deliveryFee = body.deliveryType === 'DELIVERY' ? 20 : 0;
    const total = subtotal + deliveryFee;

    // Générer un numéro de commande unique
    const orderNumber = await generateOrderNumber(restaurant.id);

    // Créer la commande
    const order = await prisma.order.create({
      data: {
        orderNumber,
        restaurantId: restaurant.id,
        customerId: customer.id,
        status: 'PENDING',
        deliveryType: body.deliveryType as DeliveryType,
        deliveryAddress: body.deliveryAddress || null,
        customerNotes: body.notes || null,
        subtotal,
        deliveryFee,
        discount: 0,
        tax: 0,
        total,
        paymentMethod: body.paymentMethod || 'CASH',
        paymentStatus: 'PENDING',
        items: {
          create: menuItems.map((item) => {
            const unitPrice = item.unitPrice || item.menuItem.price || 0;
            return {
              menuItem: { connect: { id: item.menuItemId } },
              name: item.menuItem.name,
              quantity: item.quantity,
              unitPrice,
              subtotal: unitPrice * item.quantity,
              customization: item.customization ? item.customization : undefined,
              notes: item.customization?.notes || undefined,
            };
          }),
        },
      },
      include: {
        customer: true,
        items: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                nameAr: true,
              },
            },
          },
        },
      },
    });

    console.log(`✅ [PUBLIC API] Commande créée: ${order.orderNumber} pour ${restaurant.name}`);

    // Créer ou trouver une conversation pour ce client
    let conversation = await prisma.conversation.findFirst({
      where: {
        customerPhone: body.customerPhone,
        restaurantId: restaurant.id,
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          customerPhone: body.customerPhone,
          customerId: customer.id,
          restaurantId: restaurant.id,
          status: 'OPEN',
          priority: 'NORMAL',
          isUnread: true,
          lastMessageAt: new Date(),
        },
      });
      console.log('💬 [PUBLIC API] Nouvelle conversation créée:', conversation.id);
    }

    // Formater le message de la commande
    const itemsList = order.items
      .map((item) => `• ${item.quantity}× ${item.name} - ${item.subtotal.toFixed(2)} EGP`)
      .join('\n');

    const deliveryTypeLabels: Record<string, string> = {
      'DELIVERY': '🚚 Livraison',
      'PICKUP': '🏪 À emporter',
      'DINE_IN': '🍽️ Sur place',
    };

    const orderMessage = `🛒 **Nouvelle Commande #${order.orderNumber}**

👤 Client: ${body.customerName}
📞 Téléphone: ${body.customerPhone}

${deliveryTypeLabels[body.deliveryType] || body.deliveryType}
${body.deliveryAddress ? `📍 Adresse: ${body.deliveryAddress}` : ''}

📦 Articles:
${itemsList}

💰 Sous-total: ${order.subtotal.toFixed(2)} EGP
${order.deliveryFee > 0 ? `🚚 Frais de livraison: ${order.deliveryFee.toFixed(2)} EGP` : ''}
💵 **Total: ${order.total.toFixed(2)} EGP**

${body.notes ? `📝 Notes: ${body.notes}` : ''}`;

    // Créer le message dans la conversation
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        type: 'TEXT',
        content: orderMessage,
        sender: 'CUSTOMER',
        direction: 'inbound', // Message du client
        isRead: false,
        isSystemMessage: false,
        metadata: {
          type: 'order',
          orderId: order.id,
          orderNumber: order.orderNumber,
          total: order.total,
        },
      },
    });

    // Mettre à jour la conversation
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        isUnread: true,
        lastMessageAt: new Date(),
        status: 'OPEN',
      },
    });

    console.log('📩 [PUBLIC API] Message créé dans l\'inbox');

    // Retourner la réponse
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
      },
      restaurant: {
        name: restaurant.name,
        whatsappNumber: restaurant.whatsappNumber,
      },
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ [PUBLIC API] Erreur création commande:', error);
    
    // Si c'est une erreur connue (item non trouvé, etc.), retourner le message
    if (error.message) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la création de la commande' },
      { status: 500 }
    );
  }
}
