import request from 'supertest';
import express from 'express';
import helmet from 'helmet';
import { apiLimiter, authLimiter } from '../middleware/rate-limit.middleware';
import authRoutes from '../routes/auth.routes';

const app = express();
app.use(helmet());
app.use(express.json());
app.use('/api/auth', authLimiter, authRoutes);

describe('Security Improvements Tests', () => {
  describe('Rate Limiting Headers', () => {
    it('devrait inclure les headers RateLimit', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.headers).toHaveProperty('ratelimit-limit');
      expect(response.headers).toHaveProperty('ratelimit-remaining');
      expect(response.headers).toHaveProperty('ratelimit-reset');
    });
  });

  describe('Helmet Headers', () => {
    it('devrait inclure tous les headers de sécurité Helmet', async () => {
      const response = await request(app).get('/api/auth/health');

      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers['x-frame-options']).toBe('DENY');
      
      expect(response.headers).toHaveProperty('x-xss-protection');
      expect(response.headers).toHaveProperty('content-security-policy');
    });
  });

  describe('Rate Limiting Behavior', () => {
    it('devrait bloquer après le nombre maximum de tentatives', async () => {
      // Faire plusieurs tentatives de login
      const attempts = Array(6).fill(null).map(() =>
        request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'wrongpassword',
          })
      );

      const responses = await Promise.all(attempts);
      
      // Au moins une réponse devrait être 429 (Too Many Requests)
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).toBe(true);
    }, 30000);
  });
});
