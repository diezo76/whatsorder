import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    const adminEmail = process.env.SUPER_ADMIN_EMAIL?.trim();
    const adminPassword = process.env.SUPER_ADMIN_PASSWORD?.trim();

    if (!adminEmail || !adminPassword) {
      console.error('SUPER_ADMIN env vars missing:', { hasEmail: !!process.env.SUPER_ADMIN_EMAIL, hasPassword: !!process.env.SUPER_ADMIN_PASSWORD });
      return NextResponse.json(
        { success: false, error: 'Admin non configuré' },
        { status: 500 }
      );
    }

    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Vérification directe contre les variables d'environnement
    if (email.trim().toLowerCase() !== adminEmail.toLowerCase() || password.trim() !== adminPassword) {
      return NextResponse.json(
        { success: false, error: 'Identifiants invalides' },
        { status: 401 }
      );
    }

    // Générer un JWT super admin
    const token = jwt.sign(
      {
        role: 'SUPER_ADMIN',
        email: adminEmail.toLowerCase(),
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      success: true,
      token,
      admin: {
        email: adminEmail.toLowerCase(),
        role: 'SUPER_ADMIN',
      },
    });
  } catch (error: any) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
