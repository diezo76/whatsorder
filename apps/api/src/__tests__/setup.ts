import 'dotenv/config';

// Configuration de l'environnement de test
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-jwt';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

// Mock des services externes si nécessaire
jest.mock('../config/whatsapp', () => ({
  getWhatsAppConfig: jest.fn(() => ({
    apiUrl: 'https://graph.facebook.com/v18.0',
    phoneNumberId: 'test-phone-id',
    accessToken: 'test-access-token',
    webhookVerifyToken: 'test-webhook-token',
    appSecret: 'test-app-secret',
  })),
}));

jest.mock('../config/openai', () => ({
  openai: {
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  },
}));

// Timeout global pour les tests
jest.setTimeout(10000);
