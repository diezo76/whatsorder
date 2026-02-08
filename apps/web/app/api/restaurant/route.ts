// apps/web/app/api/restaurant/route.ts
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth-app';
import { prisma } from '@/lib/server/prisma';
import { handleError, AppError } from '@/lib/server/errors-app';

// Marquer la route comme dynamique car elle utilise request.headers pour l'authentification
export const dynamic = 'force-dynamic';

/**
 * GET /api/restaurant
 * Récupérer les paramètres du restaurant
 */
export async function GET(request: Request) {
  return withAuth(async (req) => {
    try {
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: req.user!.restaurantId },
      });

      if (!restaurant) {
        throw new AppError('Restaurant non trouvé', 404);
      }

      // Normaliser les données pour s'assurer que tous les champs sont présents
      // même s'ils sont NULL dans la base de données
      const normalizedRestaurant = {
        ...restaurant,
        timezone: restaurant.timezone ?? 'Africa/Cairo',
        language: restaurant.language ?? 'ar',
        email: restaurant.email ?? null,
        coverImage: restaurant.coverImage ?? null,
        description: restaurant.description ?? null,
        logo: restaurant.logo ?? null,
        address: restaurant.address ?? null,
        whatsappNumber: restaurant.whatsappNumber ?? null,
        whatsappApiToken: restaurant.whatsappApiToken ?? null,
        whatsappBusinessId: restaurant.whatsappBusinessId ?? null,
        openingHours: restaurant.openingHours ?? null,
        deliveryZones: restaurant.deliveryZones ?? null,
      };

      return NextResponse.json({
        success: true,
        restaurant: normalizedRestaurant,
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}

/**
 * PUT /api/restaurant
 * Mettre à jour les paramètres
 */
export async function PUT(request: Request) {
  return withAuth(async (req) => {
    try {
      // Seuls OWNER et MANAGER peuvent modifier
      if (!['OWNER', 'MANAGER'].includes(req.user!.role)) {
        throw new AppError('Accès refusé', 403);
      }

      const body = await req.json();
      const {
        name,
        description,
        phone,
        email,
        address,
        logo,
        coverImage,
        currency,
        timezone,
        language,
        openingHours,
        deliveryZones,
        whatsappNumber,
        whatsappApiToken,
        whatsappBusinessId,
      } = body;

      // Construire l'objet de mise à jour avec seulement les champs fournis
      const updateData: any = {};
      
      if (body.isBusy !== undefined) updateData.isBusy = body.isBusy;
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description || null;
      if (phone !== undefined) updateData.phone = phone;
      if (email !== undefined) updateData.email = email || null;
      if (address !== undefined) updateData.address = address || null;
      if (logo !== undefined) updateData.logo = logo || null;
      if (coverImage !== undefined) updateData.coverImage = coverImage || null;
      if (currency !== undefined) updateData.currency = currency;
      if (timezone !== undefined) updateData.timezone = timezone;
      if (language !== undefined) updateData.language = language;
      if (openingHours !== undefined) updateData.openingHours = openingHours;
      if (deliveryZones !== undefined) updateData.deliveryZones = deliveryZones;
      if (whatsappNumber !== undefined) updateData.whatsappNumber = whatsappNumber || null;
      if (whatsappApiToken !== undefined) updateData.whatsappApiToken = whatsappApiToken || null;
      if (whatsappBusinessId !== undefined) updateData.whatsappBusinessId = whatsappBusinessId || null;

      const restaurant = await prisma.restaurant.update({
        where: { id: req.user!.restaurantId },
        data: updateData,
      });

      // Normaliser les données retournées pour s'assurer que tous les champs sont présents
      const normalizedRestaurant = {
        ...restaurant,
        timezone: restaurant.timezone ?? 'Africa/Cairo',
        language: restaurant.language ?? 'ar',
        email: restaurant.email ?? null,
        coverImage: restaurant.coverImage ?? null,
        description: restaurant.description ?? null,
        logo: restaurant.logo ?? null,
        address: restaurant.address ?? null,
        whatsappNumber: restaurant.whatsappNumber ?? null,
        whatsappApiToken: restaurant.whatsappApiToken ?? null,
        whatsappBusinessId: restaurant.whatsappBusinessId ?? null,
        openingHours: restaurant.openingHours ?? null,
        deliveryZones: restaurant.deliveryZones ?? null,
      };

      return NextResponse.json({
        success: true,
        restaurant: normalizedRestaurant,
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
