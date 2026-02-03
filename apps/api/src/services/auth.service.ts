import bcrypt from 'bcrypt';
import { prisma } from '@/utils/prisma';
import { generateToken } from '@/utils/jwt';
import { emailService } from './email.service';

export interface RegisterInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
  };
  token: string;
}

export class AuthService {
  /**
   * Génère un slug unique pour le restaurant
   */
  private async generateUniqueSlug(baseName: string): Promise<string> {
    const baseSlug = baseName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 50); // Limiter la longueur
    
    let slug = baseSlug || `restaurant-${Date.now()}`;
    let counter = 1;
    
    // Vérifier l'unicité du slug
    while (await prisma.restaurant.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    return slug;
  }

  async register(input: RegisterInput): Promise<AuthResponse> {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(input.password, 10);

    // Créer le nom complet
    const name = input.firstName && input.lastName 
      ? `${input.firstName} ${input.lastName}`.trim()
      : input.firstName || input.lastName || input.email.split('@')[0];

    // Générer un slug unique pour le restaurant
    const restaurantSlug = await this.generateUniqueSlug(
      input.firstName || input.lastName || input.email.split('@')[0] || 'restaurant'
    );

    // Créer le restaurant avec des valeurs par défaut
    const restaurant = await prisma.restaurant.create({
      data: {
        name: 'Mon Restaurant', // Sera mis à jour lors de l'onboarding
        slug: restaurantSlug,
        phone: input.phone || '0000000000', // Sera mis à jour lors de l'onboarding
        email: input.email,
        isActive: true,
      },
    });

    // Créer l'utilisateur lié au restaurant
    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: passwordHash,
        name,
        phone: input.phone,
        role: 'OWNER', // Par défaut OWNER pour les nouveaux comptes
        restaurantId: restaurant.id,
      },
    });

    // Envoyer l'email de confirmation (ne pas faire échouer l'inscription si l'email échoue)
    try {
      const frontendUrl = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.whataybo.com';
      await emailService.sendRestaurantConfirmationEmail({
        restaurantName: restaurant.name,
        ownerName: name,
        ownerEmail: input.email,
        restaurantSlug: restaurant.slug,
        dashboardUrl: `${frontendUrl}/dashboard`,
      });
    } catch (error: any) {
      console.error('⚠️ Failed to send confirmation email:', error.message);
      // Ne pas faire échouer l'inscription si l'email échoue
    }

    // Générer le token JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: null, // Pas dans le nouveau schéma
        lastName: null,  // Pas dans le nouveau schéma
        role: user.role,
      },
      token,
    };
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(input.password, user.password);

    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Générer le token JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: null, // Pas dans le nouveau schéma
        lastName: null,  // Pas dans le nouveau schéma
        role: user.role,
      },
      token,
    };
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}

export const authService = new AuthService();
