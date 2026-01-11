import { Request, Response } from 'express';
import { authService } from '@/services/auth.service';
import { AuthRequest } from '@/middleware/auth.middleware';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName, phone } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const result = await authService.register({
        email,
        password,
        firstName,
        lastName,
        phone,
      });

      res.status(201).json(result);
    } catch (error: any) {
      if (error.message === 'Email already registered') {
        return res.status(409).json({ error: error.message });
      }
      res.status(500).json({ error: error.message || 'Registration failed' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const result = await authService.login({ email, password });

      res.json(result);
    } catch (error: any) {
      if (error.message === 'Invalid email or password') {
        return res.status(401).json({ error: error.message });
      }
      res.status(500).json({ error: error.message || 'Login failed' });
    }
  }

  async me(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const user = await authService.getUserById(req.user.userId);
      // Adapter le format pour le frontend
      res.json({ 
        user: {
          ...user,
          firstName: user.name?.split(' ')[0] || null,
          lastName: user.name?.split(' ').slice(1).join(' ') || null,
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to get user' });
    }
  }
}

export const authController = new AuthController();
