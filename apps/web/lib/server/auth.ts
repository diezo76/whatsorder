import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  userId: string;
  restaurantId: string;
  role: string;
  email: string;
}

export interface AuthenticatedRequest extends NextApiRequest {
  user?: AuthUser;
}

export type AuthenticatedHandler = (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => Promise<void> | void;

export function withAuth(handler: AuthenticatedHandler) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: 'No token provided'
        });
      }

      const token = authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token format'
        });
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as AuthUser;

      req.user = decoded;

      return handler(req, res);
    } catch (error: any) {
      console.error('Auth error:', error);
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
  };
}

export function requireRole(roles: string[]) {
  return (handler: AuthenticatedHandler): AuthenticatedHandler => {
    return withAuth(async (req, res) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
      }
      return handler(req, res);
    });
  };
}

// Fonction pour vérifier un token JWT et retourner le payload
export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthUser;
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}
