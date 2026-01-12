import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Restaurant slug is required' },
        { status: 400 }
      );
    }

    // Vérifier que supabaseAdmin est disponible
    if (!supabaseAdmin) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Récupérer le restaurant depuis Supabase
    // Note: Supabase utilise les noms exacts de Prisma
    const { data: restaurant, error: restaurantError } = await supabaseAdmin
      .from('Restaurant')
      .select('*')
      .eq('slug', slug)
      .eq('isActive', true)
      .single();

    if (restaurantError) {
      console.error('Error fetching restaurant:', restaurantError);
      // Si c'est une erreur "not found", retourner 404
      if (restaurantError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Restaurant not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: restaurantError.message || 'Failed to fetch restaurant' },
        { status: 500 }
      );
    }

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    // Récupérer les utilisateurs séparément (optionnel)
    let users: any[] = [];
    try {
      const { data: usersData, error: usersError } = await supabaseAdmin
        .from('User')
        .select('id, email, name, avatar, role, isActive, lastLoginAt, createdAt, updatedAt')
        .eq('restaurantId', restaurant.id);
      
      if (!usersError && usersData) {
        users = usersData;
      }
    } catch (usersErr) {
      // Ignorer les erreurs pour les users, ce n'est pas critique
      console.warn('Could not fetch users:', usersErr);
    }

    // Formater la réponse pour correspondre au format attendu par le frontend
    const formattedRestaurant = {
      ...restaurant,
      users: users || [],
    };

    return NextResponse.json(formattedRestaurant);
  } catch (error: any) {
    console.error('Error in getRestaurantBySlug:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to fetch restaurant',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
