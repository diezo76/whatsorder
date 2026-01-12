import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '@/lib/server/prisma';
import { handleError } from '@/lib/server/errors';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  restaurantName: z.string().min(2)
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const validatedData = registerSchema.parse(req.body);

    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User already exists'
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Créer le restaurant et l'utilisateur
    const restaurant = await prisma.restaurant.create({
      data: {
        name: validatedData.restaurantName,
        slug: validatedData.restaurantName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-'),
        users: {
          create: {
            name: validatedData.name,
            email: validatedData.email,
            password: hashedPassword,
            role: 'OWNER'
          }
        }
      },
      include: {
        users: true
      }
    });

    const user = restaurant.users[0];

    // Générer le token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        restaurantId: restaurant.id,
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
          slug: restaurant.slug
        }
      }
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }
    return handleError(res, error);
  }
}
