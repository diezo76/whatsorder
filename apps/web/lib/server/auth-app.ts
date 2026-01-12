import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  userId: string;
  restaurantId: string;
  role: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export type AuthenticatedHandler = (
  req: AuthenticatedRequest
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

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
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
