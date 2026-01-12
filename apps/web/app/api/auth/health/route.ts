import { NextResponse } from 'next/server';

/**
 * GET /api/auth/health
 * Health check endpoint for auth service
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'auth',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
}
