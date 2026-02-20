import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { withSuperAdmin } from '@/lib/server/auth-app';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withSuperAdmin(async () => {
    try {
      const { id } = params;

      const restaurant = await prisma.restaurant.findUnique({
        where: { id },
        select: { id: true, name: true },
      });

      if (!restaurant) {
        return NextResponse.json(
          { success: false, error: 'Restaurant non trouvé' },
          { status: 404 }
        );
      }

      await prisma.restaurant.update({
        where: { id },
        data: { isApproved: true },
      });

      console.log(`✅ Restaurant approuvé: ${restaurant.name} (${id})`);

      return NextResponse.json({
        success: true,
        message: `Restaurant "${restaurant.name}" approuvé`,
      });
    } catch (error: any) {
      console.error('Admin approve error:', error);
      return NextResponse.json(
        { success: false, error: 'Erreur serveur' },
        { status: 500 }
      );
    }
  })(request);
}
