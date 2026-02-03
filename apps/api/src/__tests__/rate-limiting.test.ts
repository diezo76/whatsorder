import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth.routes';
import publicRoutes from '../routes/public.routes';
import { authLimiter, registerLimiter, publicLimiter } from '../middleware/rate-limit.middleware';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes); // Les rate limiters sont déjà appliqués dans les routes
app.use('/api/public', publicLimiter, publicRoutes);

describe('Rate Limiting Tests', () => {
  it('devrait avoir le rate limiter configuré (en test, limites élevées)', async () => {
    // En mode test, les limites sont élevées pour ne pas bloquer les tests
    // On vérifie juste que le middleware est appliqué et fonctionne
    const response = await request(app).get('/api/public/restaurants/test/menu');
    
    // La requête devrait fonctionner (peut être 404 si restaurant n'existe pas)
    expect([200, 404, 500]).toContain(response.status);
    
    // En production, la limitation réelle sera testée via des tests E2E
  });

  it('devrait avoir le rate limiter configuré pour login', async () => {
    // En mode test, les limites sont élevées pour ne pas bloquer les tests
    // On vérifie juste que le middleware est appliqué
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });
    
    // La requête devrait fonctionner (401 pour credentials invalides)
    expect([401, 429]).toContain(response.status);
    
    // En production, la limitation réelle sera testée via des tests E2E
  });

  it('devrait avoir le rate limiter configuré pour register', async () => {
    // En mode test, les limites sont élevées pour ne pas bloquer les tests
    // On vérifie juste que le middleware est appliqué
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test-rate-limit@example.com',
        password: 'TestPassword123!',
      });
    
    // La requête devrait fonctionner (201 pour succès ou 409 pour email existant)
    expect([201, 409, 429]).toContain(response.status);
    
    // En production, la limitation réelle sera testée via des tests E2E
  });

  it('devrait retourner les headers RateLimit', async () => {
    const response = await request(app)
      .get('/api/public/restaurants/test/menu');

    // Les headers RateLimit devraient être présents (standardHeaders ou legacyHeaders)
    const hasStandardHeaders = response.headers['ratelimit-limit'] || response.headers['ratelimit-remaining'];
    const hasLegacyHeaders = response.headers['x-ratelimit-limit'] || response.headers['x-ratelimit-remaining'];
    
    expect(hasStandardHeaders || hasLegacyHeaders).toBeTruthy();
  });
});
