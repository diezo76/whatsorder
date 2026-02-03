import { Request, Response, NextFunction } from 'express';

/**
 * Middleware de logging pour les requêtes
 * Log les requêtes importantes et les tentatives d'attaque potentielles
 */
export function loggerMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const { method, url, ip } = req;

  // Log après la réponse
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { statusCode } = res;

    // Logger les requêtes importantes
    if (statusCode >= 400) {
      // Erreurs client (4xx) ou serveur (5xx)
      console.error(`[${new Date().toISOString()}] ${method} ${url} - ${statusCode} - ${duration}ms - IP: ${ip}`);
      
      // Logger spécifiquement les tentatives d'authentification échouées
      if (url.includes('/api/auth/login') && statusCode === 401) {
        console.warn(`⚠️ [SECURITY] Tentative de connexion échouée depuis ${ip} - ${method} ${url}`);
      }
      
      // Logger les tentatives d'accès non autorisé
      if (statusCode === 403) {
        console.warn(`⚠️ [SECURITY] Accès refusé depuis ${ip} - ${method} ${url}`);
      }
      
      // Logger les erreurs serveur
      if (statusCode >= 500) {
        console.error(`❌ [ERROR] Erreur serveur ${statusCode} - ${method} ${url} - IP: ${ip}`);
      }
    } else {
      // Requêtes réussies (log seulement en développement ou pour endpoints critiques)
      if (process.env.NODE_ENV === 'development' || url.includes('/api/auth') || url.includes('/api/webhooks')) {
        console.log(`[${new Date().toISOString()}] ${method} ${url} - ${statusCode} - ${duration}ms`);
      }
    }
  });

  next();
}

/**
 * Logger spécifique pour les erreurs
 */
export function errorLogger(error: Error, req: Request) {
  const { method, url, ip, body } = req;
  
  console.error(`[${new Date().toISOString()}] ERROR: ${error.message}`);
  console.error(`  Method: ${method}`);
  console.error(`  URL: ${url}`);
  console.error(`  IP: ${ip}`);
  console.error(`  Body: ${JSON.stringify(body)}`);
  console.error(`  Stack: ${error.stack}`);
}
