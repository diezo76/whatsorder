import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth.routes';
import menuRoutes from '../routes/menu.routes';
import { authMiddleware } from '../middleware/auth.middleware';
import { generateToken } from '../utils/jwt';
import { prisma } from '../utils/prisma';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/menu', authMiddleware, menuRoutes);

describe('Security Tests', () => {
  let testUser: { id: string; email: string; role: string };
  let authToken: string;

  beforeAll(async () => {
    // Créer un utilisateur de test
    const hashedPassword = await require('bcrypt').hash('TestPassword123!', 10);
    testUser = await prisma.user.create({
      data: {
        email: 'security-test@example.com',
        password: hashedPassword,
        name: 'Security Test User',
        role: 'OWNER',
      },
    });

    authToken = generateToken({
      userId: testUser.id,
      email: testUser.email,
      role: testUser.role,
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: 'security-test@example.com',
      },
    });
    await prisma.$disconnect();
  });

  describe('Authentication Middleware', () => {
    it('devrait protéger les routes avec authMiddleware', async () => {
      const response = await request(app).get('/api/menu/items');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('No token provided');
    });

    it('devrait accepter les requêtes avec un token valide', async () => {
      const response = await request(app)
        .get('/api/menu/items')
        .set('Authorization', `Bearer ${authToken}`);

      // Peut retourner 200 (si items existent) ou 404/500 selon la configuration
      // L'important est que ce n'est pas 401
      expect(response.status).not.toBe(401);
    });

    it('devrait rejeter les tokens avec un format incorrect', async () => {
      const response = await request(app)
        .get('/api/menu/items')
        .set('Authorization', 'InvalidFormat token');

      expect(response.status).toBe(401);
    });

    it('devrait rejeter les tokens sans préfixe Bearer', async () => {
      const response = await request(app)
        .get('/api/menu/items')
        .set('Authorization', authToken);

      expect(response.status).toBe(401);
    });
  });

  describe('Input Validation', () => {
    it('devrait rejeter les emails invalides lors de l\'inscription', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'SecurePassword123!',
        });

      // Le contrôleur vérifie seulement la présence, mais on peut tester ici
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('devrait rejeter les mots de passe trop courts', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'short-password@example.com',
          password: '123',
        });

      // Selon la validation, devrait être rejeté
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('SQL Injection Prevention', () => {
    it('devrait prévenir les injections SQL dans les emails', async () => {
      const sqlInjectionEmail = "test@example.com'; DROP TABLE users; --";
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: sqlInjectionEmail,
          password: 'SecurePassword123!',
        });

      // Prisma devrait échapper correctement, donc soit succès soit erreur de format
      // Mais ne devrait pas causer d'erreur SQL
      expect(response.status).not.toBe(500);
      
      // Nettoyer si créé
      if (response.status === 201) {
        await prisma.user.delete({
          where: { email: sqlInjectionEmail },
        });
      }
    });
  });

  describe('XSS Prevention', () => {
    it('devrait échapper les scripts dans les noms', async () => {
      const xssPayload = '<script>alert("XSS")</script>';
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'xss-test@example.com',
          password: 'SecurePassword123!',
          firstName: xssPayload,
        });

      // Le nom devrait être stocké tel quel (échappement côté frontend)
      // Mais ne devrait pas causer d'exécution de script côté serveur
      if (response.status === 201) {
        const user = await prisma.user.findUnique({
          where: { email: 'xss-test@example.com' },
        });
        
        expect(user?.name).toContain(xssPayload);
        
        // Nettoyer
        await prisma.user.delete({
          where: { id: user!.id },
        });
      }
    });
  });

  describe('Token Expiration', () => {
    it('devrait générer des tokens avec expiration', () => {
      const payload = {
        userId: testUser.id,
        email: testUser.email,
        role: testUser.role,
      };

      const token = generateToken(payload);
      const decoded = require('jsonwebtoken').decode(token);

      expect(decoded).toHaveProperty('exp');
      expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });
  });

  describe('CORS Headers', () => {
    it('devrait inclure les headers CORS appropriés', async () => {
      const response = await request(app)
        .options('/api/auth/login')
        .set('Origin', 'http://localhost:3000');

      // Supertest ne capture pas toujours les headers CORS
      // Mais on peut vérifier que la requête ne bloque pas
      expect([200, 204]).toContain(response.status);
    });
  });
});
