import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Rate limiter général pour l'API
 * 100 requêtes par 15 minutes par IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 10000 : 100, // Beaucoup plus permissif en test
  message: {
    error: 'Trop de requêtes, réessayez plus tard',
    retryAfter: '15 minutes',
  },
  standardHeaders: true, // Retourne rate limit info dans les headers `RateLimit-*`
  legacyHeaders: true, // Active aussi les headers `X-RateLimit-*` pour compatibilité
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Trop de requêtes, réessayez plus tard',
      retryAfter: '15 minutes',
    });
  },
});

/**
 * Rate limiter strict pour les endpoints d'authentification
 * 5 tentatives par 15 minutes par IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 100 : 5, // Plus permissif en test
  message: {
    error: 'Trop de tentatives de connexion, veuillez patienter 15 minutes',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: true, // Active aussi les headers `X-RateLimit-*` pour compatibilité
  skipSuccessfulRequests: true, // Ne compte que les requêtes échouées
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Trop de tentatives de connexion, veuillez patienter 15 minutes',
      retryAfter: '15 minutes',
    });
  },
});

/**
 * Rate limiter pour les endpoints de register
 * 3 inscriptions par heure par IP
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: process.env.NODE_ENV === 'test' ? 100 : 3, // Plus permissif en test
  message: {
    error: 'Trop de tentatives d\'inscription, réessayez plus tard',
    retryAfter: '1 heure',
  },
  standardHeaders: true,
  legacyHeaders: true, // Active aussi les headers `X-RateLimit-*` pour compatibilité
  skipFailedRequests: true, // Ne compte pas les requêtes qui échouent (400, 409, etc.)
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Trop de tentatives d\'inscription, réessayez plus tard',
      retryAfter: '1 heure',
    });
  },
});

/**
 * Rate limiter permissif pour les webhooks WhatsApp
 * 1000 requêtes par minute (Meta peut envoyer beaucoup de webhooks)
 */
export const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // 1000 requêtes par minute
  message: {
    error: 'Trop de requêtes webhook',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

/**
 * Rate limiter pour les endpoints publics (menu, restaurant)
 * 200 requêtes par 15 minutes par IP
 */
export const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 10000 : 200, // Beaucoup plus permissif en test
  message: {
    error: 'Trop de requêtes, réessayez plus tard',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: true, // Active aussi les headers `X-RateLimit-*` pour compatibilité
});
