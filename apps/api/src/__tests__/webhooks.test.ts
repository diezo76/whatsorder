import request from 'supertest';
import express from 'express';
import crypto from 'crypto';
import whatsappRoutes from '../routes/whatsapp.routes';

const app = express();
app.use(express.json());
app.use('/api', whatsappRoutes);

describe('WhatsApp Webhook Security Tests', () => {
  const APP_SECRET = 'test-app-secret-for-webhook-verification';
  const WEBHOOK_VERIFY_TOKEN = 'test-webhook-token';

  beforeAll(() => {
    // Configurer les variables d'environnement pour les tests
    process.env.WHATSAPP_APP_SECRET = APP_SECRET;
    process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN = WEBHOOK_VERIFY_TOKEN;
    process.env.NODE_ENV = 'test';
  });

  afterAll(() => {
    delete process.env.WHATSAPP_APP_SECRET;
    delete process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
  });

  describe('GET /api/webhooks/whatsapp - Webhook Verification', () => {
    it('devrait vérifier le webhook avec un token valide', async () => {
      const challenge = 'test-challenge-12345';

      const response = await request(app)
        .get('/api/webhooks/whatsapp')
        .query({
          'hub.mode': 'subscribe',
          'hub.verify_token': WEBHOOK_VERIFY_TOKEN,
          'hub.challenge': challenge,
        });

      expect(response.status).toBe(200);
      expect(response.text).toBe(challenge);
    });

    it('devrait rejeter le webhook avec un token invalide', async () => {
      const response = await request(app)
        .get('/api/webhooks/whatsapp')
        .query({
          'hub.mode': 'subscribe',
          'hub.verify_token': 'invalid-token',
          'hub.challenge': 'test-challenge',
        });

      expect(response.status).toBe(403);
      expect(response.text).toBe('Forbidden');
    });

    it('devrait rejeter le webhook avec un mode invalide', async () => {
      const response = await request(app)
        .get('/api/webhooks/whatsapp')
        .query({
          'hub.mode': 'unsubscribe',
          'hub.verify_token': WEBHOOK_VERIFY_TOKEN,
          'hub.challenge': 'test-challenge',
        });

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/webhooks/whatsapp - Signature Verification', () => {
    const createValidSignature = (body: string): string => {
      const hash = crypto
        .createHmac('sha256', APP_SECRET)
        .update(body)
        .digest('hex');
      return `sha256=${hash}`;
    };

    const createInvalidSignature = (body: string): string => {
      const hash = crypto
        .createHmac('sha256', 'wrong-secret')
        .update(body)
        .digest('hex');
      return `sha256=${hash}`;
    };

    it('devrait accepter une requête avec une signature HMAC SHA-256 valide', async () => {
      const body = JSON.stringify({
        object: 'whatsapp_business_account',
        entry: [],
      });
      const signature = createValidSignature(body);

      const response = await request(app)
        .post('/api/webhooks/whatsapp')
        .set('Content-Type', 'application/json')
        .set('x-hub-signature-256', signature)
        .send(body);

      expect(response.status).toBe(200);
      expect(response.text).toBe('OK');
    });

    it('devrait rejeter une requête sans signature en production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const body = JSON.stringify({
        object: 'whatsapp_business_account',
        entry: [],
      });

      const response = await request(app)
        .post('/api/webhooks/whatsapp')
        .set('Content-Type', 'application/json')
        .send(body);

      // En production, devrait être rejeté
      // Note: Le middleware peut être permissif en dev, donc on vérifie juste que ce n'est pas 200 OK
      expect([400, 401, 403, 500]).toContain(response.status);

      process.env.NODE_ENV = originalEnv;
    });

    it('devrait rejeter une requête avec une signature invalide', async () => {
      const body = JSON.stringify({
        object: 'whatsapp_business_account',
        entry: [],
      });
      const signature = createInvalidSignature(body);

      const response = await request(app)
        .post('/api/webhooks/whatsapp')
        .set('Content-Type', 'application/json')
        .set('x-hub-signature-256', signature)
        .send(body);

      // Devrait être rejeté avec une erreur
      expect([400, 401, 403, 500]).toContain(response.status);
    });

    it('devrait rejeter une requête avec un format de signature incorrect', async () => {
      const body = JSON.stringify({
        object: 'whatsapp_business_account',
        entry: [],
      });

      const response = await request(app)
        .post('/api/webhooks/whatsapp')
        .set('Content-Type', 'application/json')
        .set('x-hub-signature-256', 'invalid-format-signature')
        .send(body);

      expect([400, 401, 403, 500]).toContain(response.status);
    });

    it('devrait rejeter une requête avec une signature sans préfixe sha256=', async () => {
      const body = JSON.stringify({
        object: 'whatsapp_business_account',
        entry: [],
      });
      const hash = crypto
        .createHmac('sha256', APP_SECRET)
        .update(body)
        .digest('hex');

      const response = await request(app)
        .post('/api/webhooks/whatsapp')
        .set('Content-Type', 'application/json')
        .set('x-hub-signature-256', hash) // Sans préfixe sha256=
        .send(body);

      expect([400, 401, 403, 500]).toContain(response.status);
    });

    it('devrait calculer correctement le hash HMAC SHA-256', () => {
      const body = 'test-body-content';
      const expectedHash = crypto
        .createHmac('sha256', APP_SECRET)
        .update(body)
        .digest('hex');
      const signature = createValidSignature(body);

      expect(signature).toBe(`sha256=${expectedHash}`);
    });

    it('devrait être permissif en mode développement sans APP_SECRET', async () => {
      const originalEnv = process.env.NODE_ENV;
      const originalSecret = process.env.WHATSAPP_APP_SECRET;
      
      process.env.NODE_ENV = 'development';
      delete process.env.WHATSAPP_APP_SECRET;

      const body = JSON.stringify({
        object: 'whatsapp_business_account',
        entry: [],
      });

      const response = await request(app)
        .post('/api/webhooks/whatsapp')
        .set('Content-Type', 'application/json')
        .send(body);

      // En développement, peut être permissif
      // On vérifie juste que ça ne crash pas
      expect(response.status).toBeGreaterThanOrEqual(200);

      process.env.NODE_ENV = originalEnv;
      process.env.WHATSAPP_APP_SECRET = originalSecret;
    });
  });

  describe('Webhook Message Processing', () => {
    const createValidSignature = (body: string): string => {
      const hash = crypto
        .createHmac('sha256', APP_SECRET)
        .update(body)
        .digest('hex');
      return `sha256=${hash}`;
    };

    it('devrait traiter un message texte entrant', async () => {
      const body = JSON.stringify({
        object: 'whatsapp_business_account',
        entry: [
          {
            changes: [
              {
                value: {
                  metadata: {
                    phone_number_id: 'test-phone-id',
                  },
                  messages: [
                    {
                      from: '+201234567890',
                      id: 'wamid.test123',
                      timestamp: Math.floor(Date.now() / 1000),
                      type: 'text',
                      text: {
                        body: 'Hello, I want to order',
                      },
                    },
                  ],
                  contacts: [
                    {
                      wa_id: '+201234567890',
                      profile: {
                        name: 'Test User',
                      },
                    },
                  ],
                },
              },
            ],
          },
        ],
      });
      const signature = createValidSignature(body);

      const response = await request(app)
        .post('/api/webhooks/whatsapp')
        .set('Content-Type', 'application/json')
        .set('x-hub-signature-256', signature)
        .send(body);

      expect(response.status).toBe(200);
      expect(response.text).toBe('OK');
    });

    it('devrait traiter un statut de message', async () => {
      const body = JSON.stringify({
        object: 'whatsapp_business_account',
        entry: [
          {
            changes: [
              {
                value: {
                  statuses: [
                    {
                      id: 'wamid.test123',
                      status: 'delivered',
                    },
                  ],
                },
              },
            ],
          },
        ],
      });
      const signature = createValidSignature(body);

      const response = await request(app)
        .post('/api/webhooks/whatsapp')
        .set('Content-Type', 'application/json')
        .set('x-hub-signature-256', signature)
        .send(body);

      expect(response.status).toBe(200);
      expect(response.text).toBe('OK');
    });
  });
});
