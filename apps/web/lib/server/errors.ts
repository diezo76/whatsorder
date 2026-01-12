import { NextApiResponse } from 'next';

export function handleError(res: NextApiResponse, error: any) {
  console.error('API Error:', error);

  if (error.code === 'P2002') {
    return res.status(409).json({
      success: false,
      error: 'Resource already exists'
    });
  }

  if (error.code === 'P2025') {
    return res.status(404).json({
      success: false,
      error: 'Resource not found'
    });
  }

  return res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}
