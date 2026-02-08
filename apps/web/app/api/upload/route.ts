import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/server/auth-app';
import { handleError, AppError } from '@/lib/server/errors-app';
import { createClient } from '@supabase/supabase-js';

// Marquer la route comme dynamique
export const dynamic = 'force-dynamic';

// Créer un client Supabase avec la clé service pour l'upload
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * POST /api/upload
 * Upload une image vers Supabase Storage
 */
export async function POST(request: Request) {
  return withAuth(async (req) => {
    try {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const folder = formData.get('folder') as string || 'items';

      if (!file) {
        throw new AppError('Aucun fichier fourni', 400);
      }

      // Vérifier le type de fichier
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        throw new AppError('Type de fichier non autorisé. Utilisez JPG, PNG, WebP ou GIF.', 400);
      }

      // Vérifier la taille (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        throw new AppError('Fichier trop volumineux. Maximum 5MB.', 400);
      }

      // Générer un nom de fichier unique
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const fileName = `${req.user!.restaurantId}/${folder}/${timestamp}-${randomString}.${fileExtension}`;

      // Convertir le fichier en buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      // Upload vers Supabase Storage
      const { data, error } = await supabaseAdmin.storage
        .from('menu-images')
        .upload(fileName, buffer, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Supabase upload error:', error);
        throw new AppError(`Erreur lors de l'upload: ${error.message}`, 500);
      }

      // Construire l'URL publique
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('menu-images')
        .getPublicUrl(fileName);

      return NextResponse.json({
        success: true,
        url: publicUrl,
        path: data.path,
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}

/**
 * DELETE /api/upload
 * Supprime une image de Supabase Storage
 */
export async function DELETE(request: Request) {
  return withAuth(async (req) => {
    try {
      const { searchParams } = new URL(req.url);
      const path = searchParams.get('path');

      if (!path) {
        throw new AppError('Chemin du fichier requis', 400);
      }

      // Vérifier que le fichier appartient au restaurant de l'utilisateur
      if (!path.startsWith(req.user!.restaurantId)) {
        throw new AppError('Non autorisé à supprimer ce fichier', 403);
      }

      const { error } = await supabaseAdmin.storage
        .from('menu-images')
        .remove([path]);

      if (error) {
        console.error('Supabase delete error:', error);
        throw new AppError(`Erreur lors de la suppression: ${error.message}`, 500);
      }

      return NextResponse.json({
        success: true,
        message: 'Fichier supprimé',
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
