import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '@/lib/server/prisma';
import { handleError } from '@/lib/server/errors';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const validatedData = loginSchema.parse(req.body);

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      include: {
        restaurant: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Vérifier le mot de passe
    const isValid = await bcrypt.compare(
      validatedData.password,
      user.password
    );

    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Générer le token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        restaurantId: user.restaurantId,
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        restaurant: user.restaurant
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
