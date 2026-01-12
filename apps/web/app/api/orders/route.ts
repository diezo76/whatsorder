// apps/web/app/api/orders/route.ts
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth-app';
import { prisma } from '@/lib/server/prisma';
import { handleError, AppError } from '@/lib/server/errors-app';

// Marquer la route comme dynamique car elle utilise request.headers pour l'authentification
export const dynamic = 'force-dynamic';

// Enum OrderStatus
type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

type DeliveryType = 'DELIVERY' | 'PICKUP' | 'DINE_IN';

/**
 * GET /api/orders
 * Liste des commandes avec filtres
 */
export async function GET(request: Request) {
  return withAuth(async (req) => {
    try {
      const { searchParams } = new URL(req.url);
      const status = searchParams.get('status') as OrderStatus | null;
      const customerId = searchParams.get('customerId');
      const dateFrom = searchParams.get('dateFrom');
      const dateTo = searchParams.get('dateTo');
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = parseInt(searchParams.get('offset') || '0');

      // Construction du where
      const where: any = {
        restaurantId: req.user!.restaurantId,
      };

      if (status) where.status = status;
      if (customerId) where.customerId = customerId;
      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = new Date(dateFrom);
        if (dateTo) where.createdAt.lte = new Date(dateTo);
      }

      // Récupérer les commandes
      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          include: {
            items: {
              include: {
                menuItem: {
                  select: {
                    id: true,
                    name: true,
                    nameAr: true,
                    image: true,
                    price: true,
                  },
                },
              },
            },
            customer: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
            assignedTo: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        prisma.order.count({ where }),
      ]);

      return NextResponse.json({
        success: true,
        orders,
        total,
        limit,
        offset,
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}

/**
 * POST /api/orders
 * Créer une nouvelle commande
 */
export async function POST(request: Request) {
  return withAuth(async (req) => {
    try {
      const body = await req.json();
      const { customerId, items, deliveryType, deliveryAddress, customerNotes } = body;

      // Validation
      if (!customerId || !items || items.length === 0) {
        throw new AppError('customerId et items sont requis', 400);
      }

      if (!['DELIVERY', 'PICKUP', 'DINE_IN'].includes(deliveryType)) {
        throw new AppError('deliveryType invalide', 400);
      }

      // Récupérer les items du menu
      const menuItemIds = items.map((i: any) => i.menuItemId);
      const menuItems = await prisma.menuItem.findMany({
        where: {
          id: { in: menuItemIds },
          restaurantId: req.user!.restaurantId,
          isActive: true,
        },
      });

      if (menuItems.length !== menuItemIds.length) {
        throw new AppError('Certains items sont invalides', 400);
      }

      // Calculer le total
      let subtotal = 0;
      const orderItems = items.map((item: any) => {
        const menuItem = menuItems.find((m: { id: string }) => m.id === item.menuItemId);
        if (!menuItem) throw new AppError(`Item ${item.menuItemId} non trouvé`, 400);

        const itemTotal = menuItem.price * item.quantity;
        subtotal += itemTotal;

        return {
          name: menuItem.name,
          menuItemId: menuItem.id,
          quantity: item.quantity,
          customization: item.variant || item.modifiers ? {
            variant: item.variant || null,
            modifiers: item.modifiers || [],
          } : null,
          notes: item.notes || null,
          unitPrice: menuItem.price,
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
          deliveryType: deliveryType as DeliveryType,
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
