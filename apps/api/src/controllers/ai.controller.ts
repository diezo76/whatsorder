import { Response } from 'express';
import { z } from 'zod';
import { parseOrderMessage } from '../services/ai-parser.service';
import { isAIEnabled } from '../config/openai';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { getIoInstance, broadcastOrderUpdate } from '../utils/socket';
import { sendOrderNotification } from '../services/whatsapp.service';

// ==========================================
// SCHÉMAS DE VALIDATION ZOD
// ==========================================

const parseOrderSchema = z.object({
  message: z.string().min(1, 'Le message ne peut pas être vide').max(2000, 'Le message est trop long (max 2000 caractères)'),
  conversationId: z.string().uuid('ID de conversation invalide').optional()
});

const createOrderSchema = z.object({
  parsedOrder: z.object({
    items: z.array(z.object({
      name: z.string(),
      quantity: z.number().int().positive(),
      variant: z.string().optional(),
      modifiers: z.array(z.string()).optional(),
      notes: z.string().optional(),
      matchedMenuItemId: z.string().uuid()
    })),
    deliveryType: z.enum(['DELIVERY', 'PICKUP', 'DINE_IN']).optional(),
    deliveryAddress: z.string().optional(),
    customerNotes: z.string().optional(),
    confidence: z.number().min(0).max(1).optional(),
    needsClarification: z.boolean().optional(),
    clarificationQuestions: z.array(z.string()).optional()
  }),
  conversationId: z.string().uuid().optional(),
  customerId: z.string().uuid('ID client requis')
});

// ==========================================
// CACHE DU MENU (OPTIONNEL)
// ==========================================

// Cache le menu en mémoire pour éviter de charger à chaque requête
// Invalidation quand le menu change
let menuCache: Map<string, { items: any[], timestamp: number }> = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedMenu(restaurantId: string) {
  const cached = menuCache.get(restaurantId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.items;
  }
  return null;
}

function setCachedMenu(restaurantId: string, items: any[]) {
  menuCache.set(restaurantId, {
    items,
    timestamp: Date.now()
  });
}

function invalidateMenuCache(restaurantId: string) {
  menuCache.delete(restaurantId);
}

// ==========================================
// CONTROLLERS
// ==========================================

/**
 * Parse un message WhatsApp pour extraire les informations de commande
 * POST /api/ai/parse-order
 */
export async function parseOrderFromMessage(req: AuthRequest, res: Response) {
  try {
    // Vérifie que l'IA est activée
    if (!isAIEnabled()) {
      return res.status(503).json({
        error: 'AI parsing is not available',
        message: 'OpenAI API key is not configured'
      });
    }

    // Validation des données
    let validatedData;
    try {
      validatedData = parseOrderSchema.parse(req.body);
    } catch (validationError: any) {
      return res.status(400).json({
        error: 'Validation error',
        message: validationError.errors?.[0]?.message || 'Invalid request data'
      });
    }

    const { message, conversationId } = validatedData;

    // Récupère l'utilisateur pour obtenir son restaurantId
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { restaurantId: true },
    });

    if (!user || !user.restaurantId) {
      return res.status(403).json({ error: 'Aucun restaurant associé à votre compte' });
    }

    const restaurantId = user.restaurantId;

    // Logs détaillés
    console.log('🤖 AI Parsing request:', {
      restaurantId,
      conversationId,
      messageLength: message.length,
      messagePreview: message.substring(0, 100)
    });

    // Charge le menu du restaurant (avec cache)
    let menuItems: any[] | null = getCachedMenu(restaurantId);
    
    if (!menuItems) {
      menuItems = await prisma.menuItem.findMany({
        where: {
          restaurantId,
          isActive: true,
          isAvailable: true
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              nameAr: true,
              slug: true
            }
          }
        },
        orderBy: {
          sortOrder: 'asc'
        }
      });
      
      if (menuItems) {
        setCachedMenu(restaurantId, menuItems);
      }
    }

    // Vérifier si menuItems est vide
    if (!menuItems || menuItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No menu items found'
      });
    }

    // Récupère les infos du restaurant
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { 
        name: true,
        currency: true,
        language: true
      }
    });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Parse le message avec l'IA
    const parsed = await parseOrderMessage(
      message,
      menuItems,
      restaurant
    );

    // Log pour debug
    console.log('✅ AI Parsing completed:', {
      restaurantId,
      itemsFound: parsed.items.length,
      confidence: parsed.confidence,
      needsClarification: parsed.needsClarification,
      deliveryType: parsed.deliveryType
    });

    // Enrichit les items avec les infos du menu
    const enrichedItems = parsed.items
      .filter((item: any) => item.matchedMenuItemId)
      .map((item: any) => {
        const menuItem = menuItems.find((mi: any) => mi.id === item.matchedMenuItemId);
      return {
        ...item,
        menuItem: menuItem ? {
          id: menuItem.id,
          name: menuItem.name,
          nameAr: menuItem.nameAr,
          price: menuItem.price,
          image: menuItem.image,
          category: menuItem.category ? {
            id: menuItem.category.id,
            name: menuItem.category.name,
            nameAr: menuItem.category.nameAr
          } : null
        } : null
      };
    });

    return res.json({
      success: true,
      parsed: {
        ...parsed,
        items: enrichedItems
      }
    });

  } catch (error: any) {
    console.error('❌ Error parsing order:', error);

    // Gestion des erreurs spécifiques OpenAI
    if (error.message?.includes('Quota OpenAI dépassé') || error.code === 'insufficient_quota') {
      return res.status(503).json({
        error: 'AI service temporarily unavailable',
        message: 'OpenAI quota exceeded. Please try again later or contact support.'
      });
    }

    if (error.message?.includes('Clé API OpenAI invalide') || error.code === 'invalid_api_key') {
      return res.status(503).json({
        error: 'AI service configuration error',
        message: 'OpenAI API key is invalid. Please contact support.'
      });
    }

    if (error.message?.includes('Limite de taux dépassée') || error.code === 'rate_limit_exceeded') {
      return res.status(429).json({
        error: 'AI service rate limit exceeded',
        message: 'Too many requests. Please try again later.'
      });
    }

    if (error.message?.includes('timeout') || error.code === 'timeout') {
      return res.status(504).json({
        error: 'AI parsing timeout',
        message: 'The request took too long. Please try again.'
      });
    }

    // Erreur générique
    return res.status(500).json({
      error: 'Failed to parse order',
      message: error.message || 'An unexpected error occurred'
    });
  }
}

// ==========================================
// FONCTIONS HELPER
// ==========================================

/**
 * Génère un numéro de commande unique
 * Format: ORD-YYYYMMDD-XXX (ex: ORD-20240111-001)
 */
async function generateOrderNumber(restaurantId: string): Promise<string> {
  const today = new Date();
  const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, '');
  
  // Compte les commandes du jour
  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);
  
  const count = await prisma.order.count({
    where: {
      restaurantId,
      createdAt: { gte: todayStart }
    }
  });
  
  const sequence = String(count + 1).padStart(3, '0');
  
  return `ORD-${datePrefix}-${sequence}`;
}

/**
 * Calcule le prix d'un item avec variantes et modifiers
 * TODO: Implémenter la logique complète de calcul des prix
 * 
 * @param menuItem - Item du menu avec variants et modifiers
 * @param variant - Variante sélectionnée (ex: "Large")
 * @param modifiers - Modifiers sélectionnés (ex: ["Extra sauce"])
 * @returns Prix total de l'item
 */
function calculateItemPrice(
  menuItem: any,
  variant?: string,
  modifiers?: string[]
): number {
  let price = menuItem.price;
  
  // TODO: Ajouter prix variante si applicable
  // Si menuItem.variants contient les prix
  // Exemple : variants: [{name: "Size", options: ["Small", "Large"], prices: [0, 10]}]
  if (variant && menuItem.variants && Array.isArray(menuItem.variants)) {
    for (const variantGroup of menuItem.variants) {
      if (variantGroup.options && Array.isArray(variantGroup.options)) {
        const variantIndex = variantGroup.options.indexOf(variant);
        if (variantIndex >= 0 && variantGroup.prices && Array.isArray(variantGroup.prices)) {
          const variantPrice = variantGroup.prices[variantIndex];
          if (typeof variantPrice === 'number') {
            price += variantPrice;
          }
        }
      }
    }
  }
  
  // TODO: Ajouter prix modifiers si applicable
  // Exemple : modifiers: [{name: "Extra Cheese", price: 5, max: 2}]
  if (modifiers && Array.isArray(modifiers) && modifiers.length > 0 && menuItem.modifiers && Array.isArray(menuItem.modifiers)) {
    for (const modifierName of modifiers) {
      const modifier = menuItem.modifiers.find((m: any) => m.name === modifierName);
      if (modifier && typeof modifier.price === 'number') {
        price += modifier.price;
      }
    }
  }
  
  return price;
}

// ==========================================
// CONTROLLERS
// ==========================================

/**
 * Crée une commande depuis un résultat parsé
 * POST /api/ai/create-order
 */
export async function createOrderFromParsed(req: AuthRequest, res: Response) {
  try {
    // Validation des données
    let validatedData;
    try {
      validatedData = createOrderSchema.parse(req.body);
    } catch (validationError: any) {
      return res.status(400).json({
        error: 'Validation error',
        message: validationError.errors?.[0]?.message || 'Invalid request data',
        details: validationError.errors
      });
    }

    const { parsedOrder, conversationId, customerId } = validatedData;

    // Validation des items
    if (!parsedOrder.items || parsedOrder.items.length === 0) {
      return res.status(400).json({
        error: 'No items in parsed order',
        message: 'Cannot create order without items'
      });
    }

    // Vérifie que la commande ne nécessite pas de clarification
    if (parsedOrder.needsClarification) {
      return res.status(400).json({
        error: 'Order needs clarification',
        message: 'Cannot create order with clarification questions',
        clarificationQuestions: parsedOrder.clarificationQuestions || []
      });
    }

    // Vérifie le niveau de confiance (optionnel mais recommandé)
    if (parsedOrder.confidence !== undefined && parsedOrder.confidence < 0.7) {
      return res.status(400).json({
        error: 'Low confidence',
        message: 'Order confidence is too low to create automatically',
        confidence: parsedOrder.confidence
      });
    }

    // Récupère l'utilisateur pour obtenir son restaurantId
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { restaurantId: true },
    });

    if (!user || !user.restaurantId) {
      return res.status(403).json({ error: 'Aucun restaurant associé à votre compte' });
    }

    const restaurantId = user.restaurantId;

    // Logs détaillés
    console.log('📦 Creating order from AI:', {
      restaurantId,
      customerId,
      conversationId,
      itemsCount: parsedOrder.items.length,
      deliveryType: parsedOrder.deliveryType
    });

    // Vérifie que le customer appartient au restaurant
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        restaurantId
      }
    });

    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found',
        message: 'Customer does not exist or does not belong to this restaurant'
      });
    }

    // Utilise une transaction pour garantir la cohérence
    const order = await prisma.$transaction(async (tx: any) => {
      // Calcule les totaux
      let subtotal = 0;
      const orderItems: any[] = [];

      for (const item of parsedOrder.items) {
        if (!item.matchedMenuItemId) {
          throw new Error(`Item "${item.name}" not found in menu`);
        }

        // Récupère le menu item
        const menuItem = await tx.menuItem.findUnique({
          where: { id: item.matchedMenuItemId }
        });

        if (!menuItem) {
          throw new Error(`Menu item ${item.matchedMenuItemId} not found`);
        }

        // Vérifie que l'item est disponible
        if (!menuItem.isAvailable || !menuItem.isActive) {
          throw new Error(`Menu item "${menuItem.name}" is not available`);
        }

        // Calcule le prix (base + variantes/modifiers si applicable)
        const unitPrice = calculateItemPrice(menuItem, item.variant, item.modifiers);
        const itemSubtotal = unitPrice * item.quantity;

        subtotal += itemSubtotal;

        orderItems.push({
          menuItemId: menuItem.id,
          name: menuItem.name,
          quantity: item.quantity,
          unitPrice,
          subtotal: itemSubtotal,
          customization: {
            variant: item.variant || null,
            modifiers: item.modifiers || [],
            notes: item.notes || null
          }
        });
      }

      // Calcule frais de livraison
      const deliveryFee = parsedOrder.deliveryType === 'DELIVERY' ? 20 : 0; // TODO: Calculer depuis deliveryZones
      const total = subtotal + deliveryFee;

      // Génère le numéro de commande
      const orderNumber = await generateOrderNumber(restaurantId);

      // Crée la commande
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          restaurantId,
          customerId,
          deliveryType: parsedOrder.deliveryType || 'DELIVERY',
          deliveryAddress: parsedOrder.deliveryAddress || null,
          deliveryFee,
          subtotal,
          discount: 0,
          tax: 0,
          total,
          customerNotes: parsedOrder.customerNotes || null,
          source: 'WHATSAPP',
          status: 'PENDING',
          paymentMethod: 'CASH',
          paymentStatus: 'PENDING',
          conversationId: conversationId || null,
          items: {
            create: orderItems
          }
        },
        include: {
          customer: true,
          items: {
            include: {
              menuItem: true
            }
          },
          restaurant: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      });

      // Met à jour les stats du customer
      await tx.customer.update({
        where: { id: customerId },
        data: {
          totalOrders: { increment: 1 },
          totalSpent: { increment: total },
          lastOrderAt: new Date()
        }
      });

      return newOrder;
    });

    // Émet l'événement Socket.io
    const io = getIoInstance();
    if (io) {
      // Émet dans la room restaurant (pour le board Kanban)
      broadcastOrderUpdate(restaurantId, 'new_order', order);

      // Émet dans la room de la commande spécifique (pour le modal détails)
      io.to(`order_${order.id}`).emit('order_updated', order);

      console.log(`[Socket] New order created: ${order.orderNumber}`, {
        orderId: order.id,
        restaurantId
      });
    }

    // Envoie notification WhatsApp
    try {
      await sendOrderNotification(order, 'CONFIRMED');
    } catch (error) {
      console.error('❌ Error sending WhatsApp notification:', error);
      // Ne pas bloquer si la notification échoue
    }

    // Met à jour le message avec aiParsed si conversationId fourni
    if (conversationId) {
      try {
        // Trouve le dernier message de la conversation
        const lastMessage = await prisma.message.findFirst({
          where: {
            conversationId,
            direction: 'inbound'
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        if (lastMessage) {
          await prisma.message.update({
            where: { id: lastMessage.id },
            data: {
              isProcessed: true,
              aiParsed: parsedOrder as any
            }
          });
        }
      } catch (error) {
        console.error('❌ Error updating message:', error);
        // Ne pas bloquer si la mise à jour du message échoue
      }
    }

    console.log('✅ Order created from AI parsing:', {
      orderNumber: order.orderNumber,
      orderId: order.id,
      total: order.total,
      itemsCount: order.items.length
    });

    return res.status(201).json({
      success: true,
      order
    });

  } catch (error: any) {
    console.error('❌ Error creating order from parsed:', error);

    // Gestion des erreurs spécifiques
    if (error.message?.includes('not found')) {
      return res.status(404).json({
        error: 'Resource not found',
        message: error.message
      });
    }

    if (error.message?.includes('not available')) {
      return res.status(400).json({
        error: 'Item not available',
        message: error.message
      });
    }

    // Erreur générique
    return res.status(500).json({
      error: 'Failed to create order',
      message: error.message || 'An unexpected error occurred'
    });
  }
}

// Export pour invalidation du cache depuis d'autres modules
export { invalidateMenuCache, generateOrderNumber };
