// apps/web/app/api/ai/create-order/route.ts
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth-app';
import { prisma } from '@/lib/server/prisma';
import { handleError, AppError } from '@/lib/server/errors-app';

// Marquer la route comme dynamique car elle utilise request.headers pour l'authentification
export const dynamic = 'force-dynamic';

/**
 * POST /api/ai/create-order
 * Créer une commande depuis un parsedOrder
 */
export async function POST(request: Request) {
  return withAuth(async (req) => {
    try {
      const body = await req.json();
      const { parsedOrder } = body;

      if (!parsedOrder || !parsedOrder.items || parsedOrder.items.length === 0) {
        throw new AppError('parsedOrder invalide', 400);
      }

      const { customerId, items, deliveryType, deliveryAddress, customerNotes } = parsedOrder;

      // Validation
      if (!customerId) {
        throw new AppError('customerId requis', 400);
      }

      // Calculer le total
      let subtotal = 0;
      const orderItems = items.map((item: any) => {
        if (!item.menuItem) {
          throw new AppError(`Item ${item.name} non trouvé dans le menu`, 400);
        }

        const itemTotal = item.menuItem.price * item.quantity;
        subtotal += itemTotal;

        return {
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          variant: item.variant || null,
          modifiers: item.modifiers || [],
          notes: item.notes || null,
          unitPrice: item.menuItem.price,
          subtotal: itemTotal,
        };
      });

      const deliveryFee = deliveryType === 'DELIVERY' ? 20 : 0;
      const total = subtotal + deliveryFee;

      // Générer le numéro de commande
      const date = new Date();
      const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
      const count = await prisma.order.count({
        where: {
          restaurantId: req.user!.restaurantId,
          orderNumber: { startsWith: `ORD-${dateStr}-` },
        },
      });
      const orderNumber = `ORD-${dateStr}-${String(count + 1).padStart(3, '0')}`;

      // Créer la commande
      const order = await prisma.order.create({
        data: {
          orderNumber,
          restaurantId: req.user!.restaurantId,
          customerId,
          status: 'PENDING',
          deliveryType: deliveryType || 'DELIVERY',
          deliveryAddress: deliveryAddress || null,
          customerNotes: customerNotes || null,
          subtotal,
          deliveryFee,
          total,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              menuItem: true,
            },
          },
          customer: true,
        },
      });

      return NextResponse.json({
        success: true,
        order,
      }, { status: 201 });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
