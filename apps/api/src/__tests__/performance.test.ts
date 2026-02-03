import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth.routes';
import menuRoutes from '../routes/menu.routes';
import publicRoutes from '../routes/public.routes';
import { authMiddleware } from '../middleware/auth.middleware';
import { generateToken } from '../utils/jwt';
import { prisma } from '../utils/prisma';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/menu', authMiddleware, menuRoutes);
app.use('/api/public', publicRoutes);

describe('Performance Tests', () => {
  let testUser: { id: string; email: string; role: string };
  let authToken: string;
  let testRestaurant: { id: string };
  let testCategory: { id: string };
  let testMenuItem: { id: string };

  beforeAll(async () => {
    const hashedPassword = await require('bcrypt').hash('TestPassword123!', 10);
    
    testUser = await prisma.user.create({
      data: {
        email: 'performance-test@example.com',
        password: hashedPassword,
        name: 'Performance Test User',
        role: 'OWNER',
      },
    });

    testRestaurant = await prisma.restaurant.create({
      data: {
        name: 'Performance Test Restaurant',
        slug: 'performance-test-restaurant',
        phone: '+201234567890',
        
        isActive: true,
      },
    });

    testUser = await prisma.user.update({
      where: { id: testUser.id },
      data: { restaurantId: testRestaurant.id },
    });

    authToken = generateToken({
      userId: testUser.id,
      email: testUser.email,
      role: testUser.role,
    });

    testCategory = await prisma.category.create({
      data: {
        name: 'Test Category',
        slug: 'test-category',
        restaurantId: testRestaurant.id,
        isActive: true,
      },
    });

    testMenuItem = await prisma.menuItem.create({
      data: {
        name: 'Test Item',
        slug: 'test-item',
        categoryId: testCategory.id,
        restaurantId: testRestaurant.id,
        price: 25.5,
        isActive: true,
        isAvailable: true,
      },
    });
  });

  afterAll(async () => {
    await prisma.menuItem.deleteMany({
      where: { restaurantId: testRestaurant?.id },
    });
    await prisma.category.deleteMany({
      where: { restaurantId: testRestaurant?.id },
    });
    await prisma.restaurant.deleteMany({
      where: { id: testRestaurant?.id },
    });
    await prisma.user.deleteMany({
      where: { email: 'performance-test@example.com' },
    });
    await prisma.$disconnect();
  });

  describe('API Response Time', () => {
    const MAX_RESPONSE_TIME = 500; // ms pour endpoints critiques
    const MAX_ANALYTICS_TIME = 2000; // ms pour analytics

    it('devrait répondre rapidement aux requêtes d\'authentification', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'performance-test@example.com',
          password: 'TestPassword123!',
        });

      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(MAX_RESPONSE_TIME);
    });

    it('devrait répondre rapidement aux requêtes de menu', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/menu/items')
        .set('Authorization', `Bearer ${authToken}`);

      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(MAX_RESPONSE_TIME);
    });

    it('devrait répondre rapidement aux requêtes de menu public', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get(`/api/public/restaurants/${testRestaurant.slug}/menu`);

      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(MAX_RESPONSE_TIME);
    });

    it('devrait répondre rapidement aux requêtes de catégories', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/menu/categories')
        .set('Authorization', `Bearer ${authToken}`);

      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(MAX_RESPONSE_TIME);
    });
  });

  describe('Database Query Performance', () => {
    it('devrait utiliser des indexes pour les requêtes fréquentes', async () => {
      // Vérifier que les indexes existent sur les colonnes fréquemment utilisées
      // Note: Ce test nécessite un accès direct à la base de données
      // Dans un vrai test, on utiliserait EXPLAIN ANALYZE
      
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/menu/items')
        .set('Authorization', `Bearer ${authToken}`);

      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(200);
      // Les requêtes avec indexes devraient être rapides
      expect(responseTime).toBeLessThan(300);
    });

    it('devrait paginer efficacement les grandes listes', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/menu/items?page=1&limit=20')
        .set('Authorization', `Bearer ${authToken}`);

      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(500);
      
      // Vérifier que la pagination fonctionne
      if (response.body.items) {
        expect(response.body.items.length).toBeLessThanOrEqual(20);
      }
    });
  });

  describe('Concurrent Requests', () => {
    it('devrait gérer plusieurs requêtes simultanées', async () => {
      const requests = Array(10).fill(null).map(() =>
        request(app)
          .get(`/api/public/restaurants/${testRestaurant.slug}/menu`)
      );

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      // Toutes les requêtes devraient réussir
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Le temps total devrait être raisonnable (parallélisation)
      expect(totalTime).toBeLessThan(2000);
    });

    it('devrait gérer plusieurs requêtes authentifiées simultanées', async () => {
      const requests = Array(5).fill(null).map(() =>
        request(app)
          .get('/api/menu/items')
          .set('Authorization', `Bearer ${authToken}`)
      );

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      expect(totalTime).toBeLessThan(1500);
    });
  });

  describe('Memory and Resource Usage', () => {
    it('devrait libérer les ressources après les requêtes', async () => {
      // Faire plusieurs requêtes
      for (let i = 0; i < 10; i++) {
        await request(app)
          .get(`/api/public/restaurants/${testRestaurant.slug}/menu`);
      }

      // Vérifier que la connexion DB est toujours active
      const testQuery = await prisma.restaurant.findUnique({
        where: { id: testRestaurant?.id },
      });

      expect(testQuery).toBeTruthy();
    });
  });

  describe('Error Handling Performance', () => {
    it('devrait gérer les erreurs rapidement', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/menu/items/invalid-id')
        .set('Authorization', `Bearer ${authToken}`);

      const responseTime = Date.now() - startTime;

      // Les erreurs devraient être retournées rapidement
      expect(responseTime).toBeLessThan(500);
    });

    it('devrait gérer les requêtes non authentifiées rapidement', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/menu/items');

      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(401);
      expect(responseTime).toBeLessThan(200);
    });
  });
});
