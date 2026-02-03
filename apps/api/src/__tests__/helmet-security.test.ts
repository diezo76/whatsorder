import request from 'supertest';
import express from 'express';
import helmet from 'helmet';

const app = express();
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.get('/test', (_req, res) => {
  res.json({ message: 'test' });
});

describe('Helmet Security Headers Tests', () => {
  it('devrait inclure les headers de sécurité Helmet', async () => {
    const response = await request(app).get('/test');

    expect(response.status).toBe(200);
    
    // Vérifier les headers de sécurité
    expect(response.headers).toHaveProperty('x-content-type-options');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    
    expect(response.headers).toHaveProperty('x-frame-options');
    expect(response.headers['x-frame-options']).toBe('DENY');
    
    expect(response.headers).toHaveProperty('x-xss-protection');
  });

  it('devrait inclure Content-Security-Policy', async () => {
    const response = await request(app).get('/test');

    expect(response.headers).toHaveProperty('content-security-policy');
  });

  it('devrait inclure Strict-Transport-Security en production', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const prodApp = express();
    prodApp.use(helmet({
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
      },
    }));
    prodApp.get('/test', (_req, res) => res.json({ message: 'test' }));

    const response = await request(prodApp).get('/test');

    expect(response.headers).toHaveProperty('strict-transport-security');

    process.env.NODE_ENV = originalEnv;
  });
});
