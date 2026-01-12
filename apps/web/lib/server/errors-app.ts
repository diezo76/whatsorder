import { NextResponse } from 'next/server';

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleError(error: any): NextResponse {
  console.error('API Error:', error);

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: error.statusCode }
    );
  }

  if (error.code === 'P2002') {
    return NextResponse.json(
      {
        success: false,
        error: 'Resource already exists'
      },
      { status: 409 }
    );
  }

  if (error.code === 'P2025') {
    return NextResponse.json(
      {
        success: false,
        error: 'Resource not found'
      },
      { status: 404 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    },
    { status: 500 }
  );
}
