import { Request, Response, NextFunction } from 'express';
import { errorLogger } from './logger.middleware';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // Logger l'erreur avec détails
  errorLogger(err, req);

  // Déterminer le code de statut
  const statusCode = (err as any).statusCode || 500;

  res.status(statusCode).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
