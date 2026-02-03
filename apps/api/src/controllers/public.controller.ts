import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '@/utils/prisma';
import { getIoInstance, broadcastOrderUpdate } from '@/utils/socket';
import { generateOrderNumber } from './ai.controller';
import { sendWhatsAppMessage, formatPhoneNumber } from '@/services/whatsapp.service';
import { isWhatsAppEnabled } from '@/config/whatsapp';

// Schéma de validation pour créer une commande
const createOrderSchema = z.object({
  items: z.array(z.object({
    menuItemId: z.string().uuid('ID menu item invalide'),
    quantity: z.number().int().positive('La quantité doit être positive'),
    unitPrice: z.number().positive('Le prix unitaire doit être positif'),
    customization: z.any().optional(), // JSON pour variants, modifiers, notes
  })).min(1, 'Au moins un item est requis'),
  customerName: z.string().min(1, 'Le nom du client est requis'),
  customerPhone: z.string().min(1, 'Le téléphone du client est requis'),
  customerEmail: z.string().email('Email invalide').optional().or(z.literal('')),
  deliveryType: z.enum(['DELIVERY', 'PICKUP', 'DINE_IN']),
  deliveryAddress: z.string().optional(),
  notes: z.string().optional(),
  paymentMethod: z.string().default('CASH'),
});

export class PublicController {
  /**
   * Récupère un restaurant par son slug avec ses utilisateurs (sans mot de passe)
   */
  async getRestaurantBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;

      if (!slug) {
        return res.status(400).json({ error: 'Restaurant slug is required' });
      }

      const restaurant = await prisma.restaurant.findUnique({
        where: { slug },
        select: {
          id: true,
          name: true,
          slug: true, // S'assurer que le slug est inclus
          phone: true,
          email: true,
          address: true,
          logo: true,
          coverImage: true,
          description: true,
          currency: true,
          timezone: true,
          language: true,
          openingHours: true,
          deliveryZones: true,
          whatsappNumber: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          users: {
            select: {
              id: true,
              email: true,
              name: true,
              avatar: true,
              role: true,
              isActive: true,
              lastLoginAt: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      res.json(restaurant);
    } catch (error: any) {
      console.error('Error fetching restaurant:', error);
      console.error('Error stack:', error.stack);
      console.error('Error details:', JSON.stringify(error, null, 2));
      res.status(500).json({ 
        error: error.message || 'Failed to fetch restaurant',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Récupère le menu public d'un restaurant (catégories actives + items actifs/disponibles)
   */
  async getRestaurantMenu(req: Request, res: Response) {
    try {
      const { slug } = req.params;

      if (!slug) {
        return res.status(400).json({ error: 'Restaurant slug is required' });
      }

      // Vérifier que le restaurant existe
      const restaurant = await prisma.restaurant.findUnique({
        where: { slug },
        select: { id: true, isActive: true },
      });

      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      if (!restaurant.isActive) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      // Récupérer toutes les catégories actives du restaurant
      const categories = await prisma.category.findMany({
        where: {
          restaurantId: restaurant.id,
          isActive: true,
        },
        include: {
          items: {
            where: {
              isActive: true,
              isAvailable: true,
            },
            orderBy: {
              sortOrder: 'asc',
            },
          },
        },
        orderBy: {
          sortOrder: 'asc',
        },
      });

      // Formater la réponse avec les catégories et leurs items triés
      const menu = categories.map((category) => ({
        id: category.id,
        name: category.name,
        nameAr: category.nameAr,
        slug: category.slug,
        description: category.description,
        image: category.image,
        sortOrder: category.sortOrder,
        items: category.items.map((item) => ({
          id: item.id,
          name: item.name,
          nameAr: item.nameAr,
          slug: item.slug,
          description: item.description,
          descriptionAr: item.descriptionAr,
          price: item.price,
          compareAtPrice: item.compareAtPrice,
          image: item.image,
          images: item.images,
          variants: item.variants,
          modifiers: item.modifiers,
          isAvailable: item.isAvailable,
          isFeatured: item.isFeatured,
          calories: item.calories,
          preparationTime: item.preparationTime,
          tags: item.tags,
          allergens: item.allergens,
          sortOrder: item.sortOrder,
        })),
      }));

      res.json({
        restaurantId: restaurant.id,
        categories: menu,
      });
    } catch (error: any) {
      console.error('Error fetching restaurant menu:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch restaurant menu' });
    }
  }

  /**
   * Crée une commande depuis le checkout web (sans authentification)
   * Fonctionne avec ou sans WhatsApp Business API
   */
  async createOrder(req: Request, res: Response) {
    const startTime = Date.now();
    console.log('📥 [PUBLIC] Requête reçue pour créer une commande:', {
      method: req.method,
      path: req.path,
      slug: req.params.slug,
      customerPhone: req.body?.customerPhone,
      itemsCount: req.body?.items?.length,
      timestamp: new Date().toISOString(),
    });
    
    try {
      const { slug } = req.params;

      if (!slug) {
        console.error('❌ Slug manquant dans la requête');
        return res.status(400).json({
          error: 'Slug du restaurant requis',
        });
      }

      // Valider les données
      console.log('🔍 Validation des données de la commande...');
      const validationResult = createOrderSchema.safeParse(req.body);
      if (!validationResult.success) {
        console.error('❌ Validation échouée:', validationResult.error.issues);
        return res.status(400).json({
          error: 'Données invalides',
          details: validationResult.error.issues,
        });
      }
      console.log('✅ Validation réussie');

      const data = validationResult.data;

      // Trouver le restaurant
      console.log(`🔍 Recherche du restaurant avec le slug: ${slug}...`);
      const restaurant = await prisma.restaurant.findUnique({
        where: { slug },
        select: { 
          id: true, 
          name: true, 
          slug: true, 
          whatsappNumber: true,
          whatsappApiToken: true,
          whatsappBusinessId: true,
        },
      });

      if (!restaurant) {
        console.error(`❌ Restaurant non trouvé avec le slug: ${slug}`);
        return res.status(404).json({ error: 'Restaurant non trouvé' });
      }
      console.log(`✅ Restaurant trouvé: ${restaurant.name} (ID: ${restaurant.id})`);

      // Vérifier que WhatsApp est configuré AVANT de créer la commande
      if (!restaurant.whatsappNumber) {
        console.error(`❌ Numéro WhatsApp non configuré pour le restaurant ${restaurant.name}`);
        return res.status(400).json({ 
          error: 'Le restaurant n\'a pas configuré son numéro WhatsApp. Veuillez contacter le restaurant directement.',
          code: 'WHATSAPP_NOT_CONFIGURED'
        });
      }

      // Vérifier que les items existent, appartiennent au restaurant et sont disponibles
      // Cette validation se fait AVANT toute création pour éviter de créer un client si les items sont invalides
      console.log(`🔍 Validation de ${data.items.length} item(s) pour le restaurant ${restaurant.slug}...`);
      const menuItems = await Promise.all(
        data.items.map(async (item) => {
          const menuItem = await prisma.menuItem.findFirst({
            where: { 
              id: item.menuItemId,
              restaurantId: restaurant.id, // Vérifier que l'item appartient au restaurant
            },
            select: {
              id: true,
              name: true,
              price: true,
              isAvailable: true,
              isActive: true,
              restaurantId: true,
            },
          });

          if (!menuItem) {
            console.error(`❌ Menu item ${item.menuItemId} non trouvé pour le restaurant ${restaurant.slug} (ID: ${restaurant.id})`);
            // Vérifier si l'item existe ailleurs (pour debug)
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
            throw new Error(`Menu item "${menuItem.name}" n'est pas disponible`);
          }

          return {
            ...item,
            menuItem,
            // Utiliser le prix du menuItem si unitPrice n'est pas fourni
            unitPrice: item.unitPrice || menuItem.price,
          };
        })
      );
      console.log(`✅ ${menuItems.length} item(s) validé(s)`);

      // Calculer les totaux
      const subtotal = menuItems.reduce((sum, item) => {
        const price = item.unitPrice || item.menuItem.price;
        return sum + (price * item.quantity);
      }, 0);
      const deliveryFee = data.deliveryType === 'DELIVERY' ? 20 : 0;
      const total = subtotal + deliveryFee;

      // Générer un numéro de commande unique
      const orderNumber = await generateOrderNumber(restaurant.id);
      console.log(`📝 Numéro de commande généré: ${orderNumber}`);

      // Créer la commande ET le client dans une transaction atomique
      // Si la commande échoue, le client ne sera pas créé non plus
      console.log(`🔄 Début de la transaction pour créer la commande ${orderNumber}...`);
      const order = await prisma.$transaction(async (tx) => {
        // Trouver ou créer le client dans la transaction
        let customer = await tx.customer.findFirst({
          where: {
            phone: data.customerPhone,
            restaurantId: restaurant.id,
          },
        });

        if (!customer) {
          console.log(`👤 Création d'un nouveau client: ${data.customerName} (${data.customerPhone})`);
          customer = await tx.customer.create({
            data: {
              phone: data.customerPhone,
              name: data.customerName,
              email: data.customerEmail || null,
              restaurantId: restaurant.id,
            },
          });
        } else {
          // Mettre à jour le nom et email si fournis
          console.log(`👤 Mise à jour du client existant: ${customer.id}`);
          customer = await tx.customer.update({
            where: { id: customer.id },
            data: {
              name: data.customerName,
              email: data.customerEmail || customer.email || null,
            },
          });
        }

        // Créer la commande
        console.log(`📦 Création de la commande ${orderNumber} pour le client ${customer.id}...`);
        const newOrder = await tx.order.create({
          data: {
            orderNumber,
            restaurantId: restaurant.id,
            customerId: customer.id,
            status: 'PENDING',
            deliveryType: data.deliveryType,
            deliveryAddress: data.deliveryAddress || null,
            customerNotes: data.notes || null,
            subtotal,
            deliveryFee,
            discount: 0,
            tax: 0,
            total,
            paymentMethod: data.paymentMethod as any, // Validation Zod garantit le type
            paymentStatus: 'PENDING',
            source: 'WEBSITE', // Source: depuis le site web (utiliser WEBSITE au lieu de WEB)
            items: {
              create: menuItems.map((item) => {
                const unitPrice = item.unitPrice || item.menuItem.price;
                return {
                  menuItemId: item.menuItemId,
                  name: item.menuItem.name,
                  quantity: item.quantity,
                  unitPrice,
                  subtotal: unitPrice * item.quantity,
                  customization: item.customization || null,
                  notes: item.customization?.notes || null,
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

        console.log(`✅ Commande ${orderNumber} créée avec succès dans la transaction`);
        return newOrder;
      });

      // Émettre l'événement Socket.io pour mettre à jour le dashboard en temps réel
      const io = getIoInstance();
      if (io) {
        broadcastOrderUpdate(restaurant.id, 'new_order', {
          orderId: order.id,
          orderNumber: order.orderNumber,
          order: order,
        });
        console.log(`📡 [Socket] Événement émis pour la commande: ${order.orderNumber}`);
      }

      const duration = Date.now() - startTime;
      console.log(`✅ Commande créée avec succès: ${order.orderNumber} pour le restaurant ${restaurant.name} (${duration}ms)`);
      console.log(`📊 Détails de la commande:`, {
        orderId: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        itemsCount: (order as any).items?.length || 0,
        customerId: order.customerId,
        customerName: (order as any).customer?.name || data.customerName,
      });

      // Générer le message WhatsApp (utiliser les données de la commande créée)
      const orderWithRelations = order as any; // Type assertion car include garantit les relations
      const customerName = orderWithRelations.customer?.name || data.customerName;
      const customerPhone = orderWithRelations.customer?.phone || data.customerPhone;
      const itemsText = (orderWithRelations.items || []).map((item: any) => `• ${item.quantity}× ${item.name} - ${item.subtotal.toFixed(2)} EGP`).join('\n') || 'Aucun item';
      const message = `🍽️ Nouvelle Commande - ${restaurant.name}\n\n📝 Numéro de commande: ${order.orderNumber}\n\n👤 Client: ${customerName} (${customerPhone})\n🚚 Type: ${data.deliveryType === 'DELIVERY' ? 'Livraison' : data.deliveryType === 'PICKUP' ? 'À emporter' : 'Sur place'}\n💳 Paiement: ${data.paymentMethod}\n💰 Total: ${total.toFixed(2)} EGP\n\n📦 Commande:\n${itemsText}${data.notes ? `\n\n📝 Notes: ${data.notes}` : ''}`;

      // Vérifier si WhatsApp Business API est configuré
      const restaurantConfig = {
        whatsappApiToken: restaurant.whatsappApiToken,
        whatsappBusinessId: restaurant.whatsappBusinessId,
      };
      const whatsappApiEnabled = isWhatsAppEnabled(restaurantConfig);

      let whatsappMessageId: string | null = null;
      let whatsappError: string | null = null;

      // Essayer d'envoyer via l'API WhatsApp Business si disponible
      if (whatsappApiEnabled) {
        try {
          console.log(`📱 Tentative d'envoi du message via WhatsApp Business API...`);
          whatsappMessageId = await sendWhatsAppMessage(
            restaurant.whatsappNumber!,
            message,
            restaurantConfig
          );
          console.log(`✅ Message WhatsApp envoyé via API (ID: ${whatsappMessageId})`);
        } catch (error: any) {
          console.error(`❌ Erreur lors de l'envoi via WhatsApp API:`, error);
          whatsappError = error.message;
          // Ne pas faire échouer la création de commande si l'envoi WhatsApp échoue
        }
      } else {
        console.log(`⚠️ WhatsApp Business API non configuré, utilisation de wa.me`);
      }

      // Retourner la commande avec les informations WhatsApp
      // Structure de réponse: { success: true, order: {...}, restaurant: {...}, whatsapp: {...} }
      return res.status(201).json({
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
        whatsapp: {
          apiEnabled: whatsappApiEnabled,
          messageSent: whatsappMessageId !== null,
          messageId: whatsappMessageId,
          error: whatsappError,
          // Si l'API n'est pas disponible, retourner l'URL wa.me pour le frontend
          waMeUrl: !whatsappApiEnabled || whatsappError 
            ? `https://wa.me/${formatPhoneNumber(restaurant.whatsappNumber!)}?text=${encodeURIComponent(message)}`
            : null,
        },
      });
    } catch (error: any) {
      // Logs détaillés pour le débogage
      console.error('❌ Erreur lors de la création de la commande:', {
        error: error.message,
        stack: error.stack,
        slug: req.params.slug,
        customerPhone: req.body?.customerPhone,
        itemsCount: req.body?.items?.length,
        timestamp: new Date().toISOString(),
      });

      // Déterminer le code de statut HTTP approprié
      let statusCode = 500;
      let errorMessage = 'Erreur lors de la création de la commande';

      if (error.message.includes('non trouvé') || error.message.includes('n\'appartient pas')) {
        statusCode = 400; // Bad Request
        errorMessage = error.message;
      } else if (error.message.includes('n\'est pas disponible')) {
        statusCode = 400; // Bad Request
        errorMessage = error.message;
      } else if (error.message.includes('Données invalides')) {
        statusCode = 400; // Bad Request
        errorMessage = error.message;
      } else if (error.message.includes('Restaurant non trouvé')) {
        statusCode = 404; // Not Found
        errorMessage = error.message;
      } else {
        // Erreur serveur générique
        errorMessage = process.env.NODE_ENV === 'development' 
          ? error.message 
          : 'Une erreur est survenue lors de la création de votre commande. Veuillez réessayer.';
      }

      res.status(statusCode).json({ 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          stack: error.stack,
        } : undefined
      });
    }
  }
}

export const publicController = new PublicController();
