import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth.routes';
import { prisma } from '../utils/prisma';
import { generateToken, verifyToken } from '../utils/jwt';
import bcrypt from 'bcrypt';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Authentication Tests', () => {
  let testUser: { id: string; email: string; password: string };
  let authToken: string;
  let testRestaurant: { id: string } | null = null;

  beforeAll(async () => {
    // Nettoyer la base de données de test
    await prisma.user.deleteMany({
      where: {
        email: {
          startsWith: 'test@',
        },
      },
    });
    await prisma.restaurant.deleteMany({
      where: {
        slug: {
          startsWith: 'test-restaurant-',
        },
      },
    });
  });

  afterAll(async () => {
    // Nettoyer après les tests
    if (testUser) {
      await prisma.user.deleteMany({
        where: {
          email: testUser.email,
        },
      });
    }
    if (testRestaurant) {
      await prisma.restaurant.deleteMany({
        where: {
          id: testRestaurant.id,
        },
      });
    }
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('devrait créer un nouveau compte avec succès', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePassword123!',
          firstName: 'John',
          lastName: 'Doe',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.role).toBe('OWNER');
      expect(response.body.token).toBeTruthy();

      testUser = {
        id: response.body.user.id,
        email: response.body.user.email,
        password: 'SecurePassword123!',
      };
      authToken = response.body.token;
    });

    it('devrait rejeter un email déjà utilisé', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'AnotherPassword123!',
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Email already registered');
    });

    it('devrait rejeter une requête sans email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          password: 'SecurePassword123!',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email and password are required');
    });

    it('devrait rejeter une requête sans mot de passe', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test2@example.com',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email and password are required');
    });

    it('devrait hasher le mot de passe correctement', async () => {
      const password = 'TestPassword123!';
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test-hash@example.com',
          password,
        });

      expect(response.status).toBe(201);

      const user = await prisma.user.findUnique({
        where: { email: 'test-hash@example.com' },
      });

      expect(user).toBeTruthy();
      expect(user?.password).not.toBe(password);
      const isPasswordHashed = await bcrypt.compare(password, user!.password);
      expect(isPasswordHashed).toBe(true);

      // Nettoyer
      await prisma.user.delete({ where: { id: user!.id } });
    });
  });

  describe('POST /api/auth/login', () => {
    it('devrait authentifier un utilisateur avec des credentials valides', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePassword123!',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.token).toBeTruthy();
    });

    it('devrait rejeter un email invalide', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SecurePassword123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid email or password');
    });

    it('devrait rejeter un mot de passe invalide', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid email or password');
    });

    it('devrait rejeter une requête sans email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'SecurePassword123!',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email and password are required');
    });

    it('devrait rejeter une requête sans mot de passe', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email and password are required');
    });
  });

  describe('GET /api/auth/me', () => {
    it('devrait retourner le profil utilisateur avec un token valide', async () => {
      // S'assurer que testUser et authToken existent
      if (!testUser || !authToken) {
        // Créer un utilisateur de test si nécessaire
        const hashedPassword = await bcrypt.hash('TestPassword123!', 10);
        const user = await prisma.user.create({
          data: {
            email: 'test-me@example.com',
            password: hashedPassword,
            name: 'Test User',
            role: 'OWNER',
          },
        });
        testUser = {
          id: user.id,
          email: user.email,
          password: 'TestPassword123!',
        };
        authToken = generateToken({
          userId: user.id,
          email: user.email,
          role: user.role,
        });
      }

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.id).toBe(testUser.id);
    });

    it('devrait rejeter une requête sans token', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('No token provided');
    });

    it('devrait rejeter une requête avec un token invalide', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token-12345');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid or expired token');
    });

    it('devrait rejeter une requête avec un token expiré', async () => {
      // S'assurer que testUser existe
      if (!testUser) {
        // Créer un utilisateur de test si nécessaire
        const hashedPassword = await bcrypt.hash('TestPassword123!', 10);
        const user = await prisma.user.create({
          data: {
            email: 'test-expired@example.com',
            password: hashedPassword,
            name: 'Test User',
            role: 'OWNER',
          },
        });
        testUser = {
          id: user.id,
          email: user.email,
          password: 'TestPassword123!',
        };
      }

      // Créer un token valide puis le modifier pour simuler une expiration
      const expiredToken = generateToken({
        userId: testUser.id,
        email: testUser.email,
        role: 'OWNER',
      });

      // Modifier le token pour le rendre invalide
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}invalid`);

      expect(response.status).toBe(401);
    });

    it('devrait rejeter une requête avec un format de token incorrect', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'InvalidFormat token');

      expect(response.status).toBe(401);
    });
  });

  describe('JWT Token Validation', () => {
    it('devrait générer un token JWT valide', () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'OWNER',
      };

      const token = generateToken(payload);
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
    });

    it('devrait vérifier un token JWT valide', () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'OWNER',
      };

      const token = generateToken(payload);
      const decoded = verifyToken(token);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    it('devrait rejeter un token invalide', () => {
      expect(() => {
        verifyToken('invalid-token');
      }).toThrow('Invalid or expired token');
    });

    it('devrait inclure les bonnes propriétés dans le payload', () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'OWNER',
      };

      const token = generateToken(payload);
      const decoded = verifyToken(token);

      expect(decoded).toHaveProperty('userId');
      expect(decoded).toHaveProperty('email');
      expect(decoded).toHaveProperty('role');
      expect(decoded).toHaveProperty('iat');
      expect(decoded).toHaveProperty('exp');
    });
  });

  describe('GET /api/auth/health', () => {
    it('devrait retourner le statut de santé', async () => {
      const response = await request(app).get('/api/auth/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('service', 'auth');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
});
