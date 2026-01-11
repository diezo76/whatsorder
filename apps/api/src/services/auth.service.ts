import bcrypt from 'bcrypt';
import { prisma } from '@/utils/prisma';
import { generateToken } from '@/utils/jwt';

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

    // Créer l'utilisateur (sans restaurantId pour l'instant)
    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: passwordHash,
        name,
        phone: input.phone,
        role: 'OWNER', // Par défaut OWNER pour les nouveaux comptes
      },
    });

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
