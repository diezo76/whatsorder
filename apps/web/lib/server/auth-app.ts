import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  userId: string;
  restaurantId: string;
  role: string;
  email: string;
}

export interface SuperAdminUser {
  role: 'SUPER_ADMIN';
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export interface SuperAdminRequest extends Request {
  admin?: SuperAdminUser;
}

export type AuthenticatedHandler = (
  req: AuthenticatedRequest
) => Promise<NextResponse> | NextResponse;

export type SuperAdminHandler = (
  req: SuperAdminRequest
) => Promise<NextResponse> | NextResponse;

export function withAuth(handler: AuthenticatedHandler) {
  return async (request: Request): Promise<NextResponse> => {
    try {
      const authHeader = request.headers.get('authorization');

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          {
            success: false,
            error: 'No token provided'
          },
          { status: 401 }
        );
      }

      const token = authHeader.split(' ')[1];

      if (!token) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid token format'
          },
          { status: 401 }
        );
      }

      if (!process.env.JWT_SECRET) {
        console.error('❌ JWT_SECRET is not defined in auth-app.ts');
        return NextResponse.json(
          {
            success: false,
            error: 'Server configuration error'
          },
          { status: 500 }
        );
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      ) as AuthUser;

      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.user = decoded;

      return handler(authenticatedRequest);
    } catch (error: any) {
      console.error('Auth error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or expired token'
        },
        { status: 401 }
      );
    }
  };
}

export function withSuperAdmin(handler: SuperAdminHandler) {
  return async (request: Request): Promise<NextResponse> => {
    try {
      const authHeader = request.headers.get('authorization');

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { success: false, error: 'No token provided' },
          { status: 401 }
        );
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        return NextResponse.json(
          { success: false, error: 'Invalid token format' },
          { status: 401 }
        );
      }

      if (!process.env.JWT_SECRET) {
        return NextResponse.json(
          { success: false, error: 'Server configuration error' },
          { status: 500 }
        );
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;

      if (decoded.role !== 'SUPER_ADMIN') {
        return NextResponse.json(
          { success: false, error: 'Access denied' },
          { status: 403 }
        );
      }

      const adminRequest = request as SuperAdminRequest;
      adminRequest.admin = { role: 'SUPER_ADMIN', email: decoded.email };

      return handler(adminRequest);
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
  };
}
