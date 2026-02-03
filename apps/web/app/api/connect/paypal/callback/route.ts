// Callback PayPal après onboarding - SÉCURISÉ
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// Fonction pour vérifier le token de sécurité
function verifySecurityToken(restaurantId: string, token: string | null): boolean {
  if (!token || !process.env.JWT_SECRET) return false;
  
  // Le token attendu est un hash de restaurantId + secret
  const expectedToken = crypto
    .createHmac('sha256', process.env.JWT_SECRET)
    .update(restaurantId)
    .digest('hex')
    .substring(0, 32);
  
  return token === expectedToken;
}


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const merchantId = searchParams.get('merchantId') || searchParams.get('merchantIdInPayPal');
    const permissionsGranted = searchParams.get('permissionsGranted') === 'true';
    const securityToken = searchParams.get('token');

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://whataybo.com';

    if (!restaurantId) {
      console.error('❌ PayPal callback: restaurantId manquant');
      return NextResponse.redirect(`${baseUrl}/dashboard/settings?tab=payments&paypal_error=missing_data`);
    }

    // 🔒 SÉCURITÉ : Vérifier le token de sécurité
    if (!verifySecurityToken(restaurantId, securityToken)) {
      console.error('❌ PayPal callback: Token de sécurité invalide');
      return NextResponse.redirect(`${baseUrl}/dashboard/settings?tab=payments&paypal_error=invalid_token`);
    }

    // 🔒 SÉCURITÉ : Vérifier que le restaurant existe
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { id: true, slug: true },
    });

    if (!restaurant) {
      console.error('❌ PayPal callback: Restaurant non trouvé');
      return NextResponse.redirect(`${baseUrl}/dashboard/settings?tab=payments&paypal_error=not_found`);
    }

    if (merchantId && permissionsGranted) {
      // 🔒 SÉCURITÉ : Validation du merchantId (format PayPal)
      if (!/^[A-Z0-9]{13,}$/.test(merchantId)) {
        console.error('❌ PayPal callback: Format merchantId invalide');
        return NextResponse.redirect(`${baseUrl}/dashboard/settings?tab=payments&paypal_error=invalid_merchant`);
      }

      // Onboarding réussi - sauvegarder les infos
      await prisma.restaurant.update({
        where: { id: restaurantId },
        data: {
          paypalMerchantId: merchantId,
          paypalOnboardingComplete: true,
          paypalConnectedAt: new Date(),
          enablePaypalPayment: true,
        },
      });

      console.log(`✅ PayPal connecté pour restaurant ${restaurant.slug}`);
      return NextResponse.redirect(`${baseUrl}/dashboard/settings?tab=payments&paypal_success=true`);
    } else {
      // Onboarding échoué ou annulé
      console.log(`⚠️ PayPal onboarding annulé pour restaurant ${restaurant.slug}`);
      return NextResponse.redirect(`${baseUrl}/dashboard/settings?tab=payments&paypal_cancelled=true`);
    }
  } catch (error: any) {
    console.error('❌ Erreur PayPal callback:', error);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://whataybo.com';
    return NextResponse.redirect(`${baseUrl}/dashboard/settings?tab=payments&paypal_error=true`);
  }
}
