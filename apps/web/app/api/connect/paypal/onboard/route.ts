// Route API pour démarrer l'onboarding PayPal
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { verifyToken } from '@/lib/server/auth';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// Configuration PayPal
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_SECRET = process.env.PAYPAL_SECRET || '';
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox';

// 🔒 Fonction pour générer un token de sécurité
function generateSecurityToken(restaurantId: string): string {
  if (!process.env.JWT_SECRET) return '';
  
  return crypto
    .createHmac('sha256', process.env.JWT_SECRET)
    .update(restaurantId)
    .digest('hex')
    .substring(0, 32);
}

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
    // Vérifier l'authentification
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.restaurantId) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // 🔒 SÉCURITÉ : Vérifier que l'utilisateur est OWNER ou MANAGER
    if (payload.role !== 'OWNER' && payload.role !== 'MANAGER') {
      return NextResponse.json(
        { error: 'Seuls les propriétaires et managers peuvent connecter PayPal' },
        { status: 403 }
      );
    }

    const restaurantId = payload.restaurantId;

    // Vérifier que PayPal est configuré
    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
      return NextResponse.json(
        { error: 'PayPal n\'est pas configuré sur cette plateforme' },
        { status: 500 }
      );
    }

    // Récupérer le restaurant
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant non trouvé' }, { status: 404 });
    }

    // URL de base
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://whataybo.com';

    // 🔒 Générer un token de sécurité pour le callback
    const securityToken = generateSecurityToken(restaurantId);

    // Obtenir le token PayPal
    const accessToken = await getPayPalAccessToken();

    // Créer un lien d'onboarding Partner Referrals
    const referralResponse = await fetch(`${PAYPAL_API_URL}/v2/customer/partner-referrals`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tracking_id: restaurantId,
        partner_config_override: {
          // 🔒 URL de callback avec token de sécurité
          return_url: `${baseUrl}/api/connect/paypal/callback?restaurantId=${restaurantId}&token=${securityToken}`,
          return_url_description: 'Retour après connexion PayPal',
          action_renewal_url: `${baseUrl}/dashboard/settings?tab=payments&paypal_refresh=true`,
        },
        operations: [
          {
            operation: 'API_INTEGRATION',
            api_integration_preference: {
              rest_api_integration: {
                integration_method: 'PAYPAL',
                integration_type: 'THIRD_PARTY',
                third_party_details: {
                  features: ['PAYMENT', 'REFUND'],
                },
              },
            },
          },
        ],
        products: ['EXPRESS_CHECKOUT'],
        legal_consents: [
          {
            type: 'SHARE_DATA_CONSENT',
            granted: true,
          },
        ],
        business_entity: {
          business_type: {
            type: 'INDIVIDUAL',
          },
          business_industry: {
            category: 'FOOD_AND_DRINK',
            subcategory: 'RESTAURANTS',
          },
        },
      }),
    });

    if (!referralResponse.ok) {
      const errorData = await referralResponse.json();
      console.error('Erreur PayPal referral:', errorData);
      throw new Error('Erreur lors de la création du lien PayPal');
    }

    const referralData = await referralResponse.json();
    
    // Trouver le lien d'action (pour l'onboarding)
    const actionUrl = referralData.links?.find((link: any) => link.rel === 'action_url')?.href;

    if (!actionUrl) {
      throw new Error('URL d\'onboarding PayPal non trouvée');
    }

    return NextResponse.json({
      url: actionUrl,
    });
  } catch (error: any) {
    console.error('❌ Erreur PayPal onboard:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création du lien d\'onboarding PayPal' },
      { status: 500 }
    );
  }
}
