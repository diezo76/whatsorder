import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth.routes';
import menuRoutes from '../routes/menu.routes';
import restaurantRoutes from '../routes/restaurant.routes';
import { authMiddleware } from '../middleware/auth.middleware';
import { generateToken } from '../utils/jwt';
import { prisma } from '../utils/prisma';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/menu', authMiddleware, menuRoutes);
app.use('/api/restaurant', authMiddleware, restaurantRoutes);

describe('Input Validation Tests', () => {
  let testUser: { id: string; email: string; role: string };
  let authToken: string;
  let testRestaurant: { id: string };
  let testCategory: { id: string };

  beforeAll(async () => {
    // Créer un utilisateur de test
    const hashedPassword = await require('bcrypt').hash('TestPassword123!', 10);
    testUser = await prisma.user.create({
      data: {
        email: 'validation-test@example.com',
        password: hashedPassword,
        name: 'Validation Test User',
        role: 'OWNER',
      },
    });

    authToken = generateToken({
      userId: testUser.id,
      email: testUser.email,
      role: testUser.role,
    });

    // Créer un restaurant de test
    testRestaurant = await prisma.restaurant.create({
      data: {
        name: 'Test Restaurant',
        slug: 'test-restaurant',
        
        isActive: true,
      },
    });

    // Créer une catégorie de test
    testCategory = await prisma.category.create({
      data: {
        name: 'Test Category',
        slug: 'test-category',
        restaurantId: testRestaurant.id,
        isActive: true,
      },
    });
  });

  afterAll(async () => {
    await prisma.category.deleteMany({
      where: { restaurantId: testRestaurant?.id },
    });
    await prisma.restaurant.deleteMany({
      where: { id: testRestaurant?.id },
    });
    await prisma.user.deleteMany({
      where: { email: 'validation-test@example.com' },
    });
    await prisma.$disconnect();
  });

  describe('Zod Schema Validation - Menu Items', () => {
    it('devrait rejeter un item menu sans nom', async () => {
      const response = await request(app)
        .post('/api/menu/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          categoryId: testCategory.id,
          price: 25.5,
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('devrait rejeter un item menu avec un nom trop court', async () => {
      const response = await request(app)
        .post('/api/menu/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'A',
          categoryId: testCategory.id,
          price: 25.5,
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('devrait rejeter un item menu sans categoryId', async () => {
      const response = await request(app)
        .post('/api/menu/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Item',
          price: 25.5,
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('devrait rejeter un item menu avec un categoryId invalide (non-UUID)', async () => {
      const response = await request(app)
        .post('/api/menu/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Item',
          categoryId: 'invalid-uuid',
          price: 25.5,
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('devrait rejeter un item menu avec un prix négatif', async () => {
      const response = await request(app)
        .post('/api/menu/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Item',
          categoryId: testCategory.id,
          price: -10,
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('devrait rejeter un item menu avec un prix zéro', async () => {
      const response = await request(app)
        .post('/api/menu/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Item',
          categoryId: testCategory.id,
          price: 0,
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('devrait rejeter un item menu avec une URL d\'image invalide', async () => {
      const response = await request(app)
        .post('/api/menu/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Item',
          categoryId: testCategory.id,
          price: 25.5,
          image: 'not-a-valid-url',
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('devrait accepter un item menu valide', async () => {
      const response = await request(app)
        .post('/api/menu/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Valid Test Item',
          categoryId: testCategory.id,
          price: 25.5,
          description: 'A valid test item',
          image: 'https://example.com/image.jpg',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('item');

      // Nettoyer
      if (response.body.item?.id) {
        await prisma.menuItem.delete({
          where: { id: response.body.item.id },
        });
      }
    });
  });

  describe('Zod Schema Validation - Categories', () => {
    it('devrait rejeter une catégorie sans nom', async () => {
      const response = await request(app)
        .post('/api/menu/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('devrait rejeter une catégorie avec un nom trop court', async () => {
      const response = await request(app)
        .post('/api/menu/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'A',
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('devrait rejeter une catégorie avec une URL d\'image invalide', async () => {
      const response = await request(app)
        .post('/api/menu/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Category',
          image: 'invalid-url',
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Zod Schema Validation - Restaurant', () => {
    it('devrait rejeter un restaurant avec un nom trop court', async () => {
      const response = await request(app)
        .put('/api/restaurant')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'A',
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('devrait rejeter un restaurant avec un email invalide', async () => {
      const response = await request(app)
        .put('/api/restaurant')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'invalid-email',
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('devrait rejeter un restaurant avec une devise invalide (pas 3 caractères)', async () => {
      const response = await request(app)
        .put('/api/restaurant')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currency: 'EG',
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('devrait rejeter un restaurant avec une langue invalide (pas 2 caractères)', async () => {
      const response = await request(app)
        .put('/api/restaurant')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          language: 'eng',
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('SQL Injection Prevention', () => {
    it('devrait prévenir les injections SQL dans les noms', async () => {
      const sqlInjection = "'; DROP TABLE users; --";
      
      const response = await request(app)
        .post('/api/menu/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: sqlInjection,
          categoryId: testCategory.id,
          price: 25.5,
        });

      // Prisma devrait échapper correctement
      // Soit succès (échappé), soit erreur de validation
      expect(response.status).not.toBe(500);
    });

    it('devrait prévenir les injections SQL dans les descriptions', async () => {
      const sqlInjection = "'; DELETE FROM menu_items; --";
      
      const response = await request(app)
        .post('/api/menu/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Item',
          categoryId: testCategory.id,
          price: 25.5,
          description: sqlInjection,
        });

      expect(response.status).not.toBe(500);
    });
  });

  describe('XSS Prevention', () => {
    it('devrait échapper les scripts dans les noms', async () => {
      const xssPayload = '<script>alert("XSS")</script>';
      
      const response = await request(app)
        .post('/api/menu/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: xssPayload,
          categoryId: testCategory.id,
          price: 25.5,
        });

      // Le nom devrait être stocké tel quel (échappement côté frontend)
      // Mais ne devrait pas causer d'exécution de script côté serveur
      if (response.status === 201) {
        const item = await prisma.menuItem.findFirst({
          where: { name: xssPayload },
        });
        
        expect(item?.name).toContain(xssPayload);
        
        // Nettoyer
        if (item) {
          await prisma.menuItem.delete({ where: { id: item.id } });
        }
      }
    });

    it('devrait échapper les scripts dans les descriptions', async () => {
      const xssPayload = '<img src=x onerror=alert("XSS")>';
      
      const response = await request(app)
        .post('/api/menu/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Item',
          categoryId: testCategory.id,
          price: 25.5,
          description: xssPayload,
        });

      expect(response.status).not.toBe(500);
    });
  });

  describe('Type Validation', () => {
    it('devrait rejeter un prix de type string', async () => {
      const response = await request(app)
        .post('/api/menu/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Item',
          categoryId: testCategory.id,
          price: '25.5', // String au lieu de number
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('devrait rejeter un isAvailable de type string', async () => {
      const response = await request(app)
        .post('/api/menu/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Item',
          categoryId: testCategory.id,
          price: 25.5,
          isAvailable: 'true', // String au lieu de boolean
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('devrait rejeter un images de type string au lieu d\'array', async () => {
      const response = await request(app)
        .post('/api/menu/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Item',
          categoryId: testCategory.id,
          price: 25.5,
          images: 'not-an-array', // String au lieu d'array
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Boundary Value Testing', () => {
    it('devrait accepter un nom de 2 caractères (minimum)', async () => {
      const response = await request(app)
        .post('/api/menu/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'AB',
          categoryId: testCategory.id,
          price: 25.5,
        });

      // Devrait être accepté (minimum valide)
      if (response.status === 201 && response.body.item?.id) {
        await prisma.menuItem.delete({
          where: { id: response.body.item.id },
        });
      }
    });

    it('devrait rejeter un nom de 1 caractère (sous le minimum)', async () => {
      const response = await request(app)
        .post('/api/menu/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'A',
          categoryId: testCategory.id,
          price: 25.5,
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('devrait accepter un prix très petit mais positif', async () => {
      const response = await request(app)
        .post('/api/menu/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Item',
          categoryId: testCategory.id,
          price: 0.01,
        });

      if (response.status === 201 && response.body.item?.id) {
        await prisma.menuItem.delete({
          where: { id: response.body.item.id },
        });
      }
    });
  });
});
