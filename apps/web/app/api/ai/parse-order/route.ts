// apps/web/app/api/ai/parse-order/route.ts
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth-app';
import { prisma } from '@/lib/server/prisma';
import { handleError, AppError } from '@/lib/server/errors-app';
import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

/**
 * POST /api/ai/parse-order
 * Parser une commande depuis un message
 */
export async function POST(request: Request) {
  return withAuth(async (req) => {
    try {
      if (!openai) {
        throw new AppError('OpenAI API key not configured', 503);
      }

      const body = await req.json();
      const { conversationId, customerId, message } = body;

      if (!conversationId || !customerId || !message) {
        throw new AppError('conversationId, customerId et message requis', 400);
      }

      // Récupérer le menu
      const menuItems = await prisma.menuItem.findMany({
        where: {
          restaurantId: req.user!.restaurantId,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          nameAr: true,
          price: true,
        },
      });

      if (menuItems.length === 0) {
        throw new AppError('Aucun item dans le menu', 400);
      }

      // Construire le contexte pour OpenAI
      const menuText = menuItems
        .map((item) => `- ${item.name} (${item.nameAr || ''}) - ${item.price} EGP [ID: ${item.id}]`)
        .join('\n');

      const systemPrompt = `Tu es un assistant IA pour un restaurant égyptien.
Analyse le message ci-dessous et identifie les articles commandés.

MENU DISPONIBLE:
${menuText}

INSTRUCTIONS:
1. Identifie tous les articles mentionnés dans le message
2. Extrait les quantités, variantes, modificateurs et notes spéciales
3. Associe chaque article à un menuItemId du menu (si possible)
4. Détermine le type de livraison: DELIVERY, PICKUP ou DINE_IN
5. Extrait l'adresse de livraison si mentionnée
6. Note toute information supplémentaire (notes client)
7. Si des informations manquent ou sont ambiguës, pose des questions de clarification

Réponds en JSON avec cette structure exacte:
{
  "items": [
    {
      "name": "nom du plat",
      "quantity": 2,
      "variant": "Large" ou null,
      "modifiers": ["sans oignons"] ou [],
      "notes": "bien cuit" ou null,
      "matchedMenuItemId": "uuid" ou null
    }
  ],
  "deliveryType": "DELIVERY" | "PICKUP" | "DINE_IN",
  "deliveryAddress": "adresse complète" ou null,
  "customerNotes": "notes générales" ou null,
  "confidence": 0.95,
  "needsClarification": false,
  "clarificationQuestions": []
}`;

      // Appel OpenAI
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}');

      // Enrichir les items avec les données du menu
      const enrichedItems = await Promise.all(
        (result.items || []).map(async (item: any) => {
          if (item.matchedMenuItemId) {
            const menuItem = await prisma.menuItem.findUnique({
              where: { id: item.matchedMenuItemId },
              select: {
                id: true,
                name: true,
                nameAr: true,
                price: true,
                image: true,
              },
            });

            return {
              ...item,
              menuItem,
            };
          }
          return item;
        })
      );

      const parsedOrder = {
        ...result,
        items: enrichedItems,
        customerId,
        conversationId,
      };

      return NextResponse.json({
        success: true,
        parsedOrder,
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
