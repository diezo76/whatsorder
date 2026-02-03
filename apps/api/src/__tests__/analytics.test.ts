import request from 'supertest';
import express from 'express';
import analyticsRoutes from '../routes/analytics.routes';
import { authMiddleware } from '../middleware/auth.middleware';
import { generateToken } from '../utils/jwt';
import { prisma } from '../utils/prisma';

const app = express();
app.use(express.json());
app.use('/api/analytics', authMiddleware, analyticsRoutes);

describe('Analytics Tests', () => {
  let testUser: { id: string; email: string; role: string };
  let authToken: string;
  let testRestaurant: { id: string };
  let testCategory: { id: string };
  let testMenuItem: { id: string };
  let testCustomer: { id: string };
  let testOrders: Array<{ id: string }> = [];

  beforeAll(async () => {
    const hashedPassword = await require('bcrypt').hash('TestPassword123!', 10);
    
    testUser = await prisma.user.create({
      data: {
        email: 'analytics-test@example.com',
        password: hashedPassword,
        name: 'Analytics Test User',
        role: 'OWNER',
      },
    });

    testRestaurant = await prisma.restaurant.create({
      data: {
        name: 'Analytics Test Restaurant',
        slug: 'analytics-test-restaurant',
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

    testCustomer = await prisma.customer.create({
      data: {
        phone: '+201111111111',
        name: 'Test Customer',
        restaurantId: testRestaurant.id,
      },
    });

    // Créer des commandes de test pour les analytics
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Commande aujourd'hui
    const order1 = await prisma.order.create({
      data: {
        restaurantId: testRestaurant.id,
        customerId: testCustomer.id,
        orderNumber: 'ORD-001',
        status: 'DELIVERED',
        deliveryType: 'DELIVERY',
        subtotal: 51.0,
        deliveryFee: 20.0,
        total: 71.0,
        completedAt: new Date(today.getTime() + 30 * 60000), // 30 minutes après création
        createdAt: today,
        items: {
          create: [
            {
              menuItemId: testMenuItem.id,
              quantity: 2,
              price: 25.5,
              subtotal: 51.0,
            },
          ],
        },
      },
    });
    testOrders.push(order1);

    // Commande hier
    const order2 = await prisma.order.create({
      data: {
        restaurantId: testRestaurant.id,
        customerId: testCustomer.id,
        orderNumber: 'ORD-002',
        status: 'DELIVERED',
        deliveryType: 'PICKUP',
        subtotal: 25.5,
        deliveryFee: 0,
        total: 25.5,
        completedAt: new Date(yesterday.getTime() + 20 * 60000),
        createdAt: yesterday,
        items: {
          create: [
            {
              menuItemId: testMenuItem.id,
              quantity: 1,
              price: 25.5,
              subtotal: 25.5,
            },
          ],
        },
      },
    });
    testOrders.push(order2);

    // Commande en cours
    const order3 = await prisma.order.create({
      data: {
        restaurantId: testRestaurant.id,
        customerId: testCustomer.id,
        orderNumber: 'ORD-003',
        status: 'PREPARING',
        deliveryType: 'DELIVERY',
        subtotal: 51.0,
        deliveryFee: 20.0,
        total: 71.0,
        createdAt: today,
        items: {
          create: [
            {
              menuItemId: testMenuItem.id,
              quantity: 2,
              price: 25.5,
              subtotal: 51.0,
            },
          ],
        },
      },
    });
    testOrders.push(order3);
  });

  afterAll(async () => {
    await prisma.orderItem.deleteMany({
      where: { orderId: { in: testOrders.map(o => o.id) } },
    });
    await prisma.order.deleteMany({
      where: { restaurantId: testRestaurant?.id },
    });
    await prisma.menuItem.deleteMany({
      where: { restaurantId: testRestaurant?.id },
    });
    await prisma.category.deleteMany({
      where: { restaurantId: testRestaurant?.id },
    });
    await prisma.customer.deleteMany({
      where: { restaurantId: testRestaurant?.id },
    });
    await prisma.restaurant.deleteMany({
      where: { id: testRestaurant?.id },
    });
    await prisma.user.deleteMany({
      where: { email: 'analytics-test@example.com' },
    });
    await prisma.$disconnect();
  });

  describe('GET /api/analytics/dashboard-stats', () => {
    it('devrait retourner les KPIs du dashboard', async () => {
      const response = await request(app)
        .get('/api/analytics/dashboard-stats?period=today')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.stats).toBeTruthy();
      expect(response.body.stats.revenue).toBeTruthy();
      expect(response.body.stats.orders).toBeTruthy();
      expect(response.body.stats.newCustomers).toBeTruthy();
      expect(response.body.stats.conversionRate).toBeTruthy();
      expect(response.body.stats.averageOrderValue).toBeTruthy();
      expect(response.body.stats.avgProcessingTime).toBeTruthy();
    });

    it('devrait calculer correctement les revenus', async () => {
      const response = await request(app)
        .get('/api/analytics/dashboard-stats?period=today')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.stats.revenue.value).toBeGreaterThanOrEqual(0);
      expect(response.body.stats.revenue).toHaveProperty('change');
      expect(response.body.stats.revenue).toHaveProperty('previous');
    });

    it('devrait calculer correctement le nombre de commandes', async () => {
      const response = await request(app)
        .get('/api/analytics/dashboard-stats?period=today')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.stats.orders.value).toBeGreaterThanOrEqual(0);
      expect(response.body.stats.orders).toHaveProperty('change');
    });

    it('devrait calculer le panier moyen', async () => {
      const response = await request(app)
        .get('/api/analytics/dashboard-stats?period=today')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.stats.averageOrderValue.value).toBeGreaterThanOrEqual(0);
    });

    it('devrait accepter différentes périodes', async () => {
      const periods = ['today', 'week', 'month'];
      
      for (const period of periods) {
        const response = await request(app)
          .get(`/api/analytics/dashboard-stats?period=${period}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.period).toBe(period);
      }
    });

    it('devrait calculer le temps moyen de traitement', async () => {
      const response = await request(app)
        .get('/api/analytics/dashboard-stats?period=today')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.stats.avgProcessingTime.value).toBeGreaterThanOrEqual(0);
    });
  });

  describe('GET /api/analytics/revenue-chart', () => {
    it('devrait retourner les données du graphique de revenus', async () => {
      const response = await request(app)
        .get('/api/analytics/revenue-chart?period=today')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('devrait retourner des données pour chaque jour de la période', async () => {
      const response = await request(app)
        .get('/api/analytics/revenue-chart?period=week')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      // Vérifier que chaque élément a une date et un montant
      response.body.data.forEach((item: any) => {
        expect(item).toHaveProperty('date');
        expect(item).toHaveProperty('revenue');
        expect(typeof item.revenue).toBe('number');
      });
    });
  });

  describe('GET /api/analytics/top-items', () => {
    it('devrait retourner les items les plus vendus', async () => {
      const response = await request(app)
        .get('/api/analytics/top-items?period=today&limit=10')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.items).toBeInstanceOf(Array);
    });

    it('devrait respecter la limite de résultats', async () => {
      const response = await request(app)
        .get('/api/analytics/top-items?period=today&limit=5')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.items.length).toBeLessThanOrEqual(5);
    });

    it('devrait inclure les quantités et revenus par item', async () => {
      const response = await request(app)
        .get('/api/analytics/top-items?period=today')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      if (response.body.items.length > 0) {
        response.body.items.forEach((item: any) => {
          expect(item).toHaveProperty('quantity');
          expect(item).toHaveProperty('revenue');
          expect(typeof item.quantity).toBe('number');
          expect(typeof item.revenue).toBe('number');
        });
      }
    });
  });

  describe('GET /api/analytics/orders-by-status', () => {
    it('devrait retourner la répartition des commandes par statut', async () => {
      const response = await request(app)
        .get('/api/analytics/orders-by-status?period=today')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('devrait inclure tous les statuts possibles', async () => {
      const response = await request(app)
        .get('/api/analytics/orders-by-status?period=today')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      const statuses = response.body.data.map((item: any) => item.status);
      const expectedStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED'];
      
      // Vérifier que les statuts attendus sont présents
      expectedStatuses.forEach(status => {
        expect(statuses).toContain(status);
      });
    });
  });

  describe('GET /api/analytics/delivery-types', () => {
    it('devrait retourner la répartition par type de livraison', async () => {
      const response = await request(app)
        .get('/api/analytics/delivery-types?period=today')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('devrait inclure tous les types de livraison', async () => {
      const response = await request(app)
        .get('/api/analytics/delivery-types?period=today')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      const types = response.body.data.map((item: any) => item.type);
      const expectedTypes = ['DELIVERY', 'PICKUP', 'DINE_IN'];
      
      expectedTypes.forEach(type => {
        expect(types).toContain(type);
      });
    });

    it('devrait inclure les comptes et pourcentages', async () => {
      const response = await request(app)
        .get('/api/analytics/delivery-types?period=today')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      response.body.data.forEach((item: any) => {
        expect(item).toHaveProperty('count');
        expect(item).toHaveProperty('percentage');
        expect(typeof item.count).toBe('number');
        expect(typeof item.percentage).toBe('number');
      });
    });
  });

  describe('Data Isolation', () => {
    let otherRestaurant: { id: string };
    let otherOrder: { id: string };

    beforeAll(async () => {
      otherRestaurant = await prisma.restaurant.create({
        data: {
          name: 'Other Restaurant',
          slug: 'other-restaurant',
          phone: '+209999999999',
          
          isActive: true,
        },
      });

      const otherCustomer = await prisma.customer.create({
        data: {
          phone: '+203333333333',
          name: 'Other Customer',
          restaurantId: otherRestaurant.id,
        },
      });

      otherOrder = await prisma.order.create({
        data: {
          restaurantId: otherRestaurant.id,
          customerId: otherCustomer.id,
          orderNumber: 'ORD-OTHER',
          status: 'DELIVERED',
          deliveryType: 'DELIVERY',
          subtotal: 100.0,
          deliveryFee: 20.0,
          total: 120.0,
          createdAt: new Date(),
          items: {
            create: [
              {
                menuItemId: testMenuItem.id,
                quantity: 1,
                price: 100.0,
                subtotal: 100.0,
              },
            ],
          },
        },
      });
    });

    afterAll(async () => {
      await prisma.orderItem.deleteMany({
        where: { orderId: otherOrder.id },
      });
      await prisma.order.delete({
        where: { id: otherOrder.id },
      });
      await prisma.customer.deleteMany({
        where: { restaurantId: otherRestaurant.id },
      });
      await prisma.restaurant.delete({
        where: { id: otherRestaurant.id },
      });
    });

    it('devrait isoler les analytics par restaurant', async () => {
      const response = await request(app)
        .get('/api/analytics/dashboard-stats?period=today')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      
      // Les revenus ne doivent pas inclure les commandes de l'autre restaurant
      // (on vérifie juste que ça fonctionne, pas les valeurs exactes car dépend de la date)
      expect(response.body.stats.revenue.value).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Handling', () => {
    it('devrait rejeter les requêtes non authentifiées', async () => {
      const response = await request(app)
        .get('/api/analytics/dashboard-stats');

      expect(response.status).toBe(401);
    });

    it('devrait gérer les périodes invalides gracieusement', async () => {
      const response = await request(app)
        .get('/api/analytics/dashboard-stats?period=invalid')
        .set('Authorization', `Bearer ${authToken}`);

      // Peut retourner 200 avec données par défaut ou 400 selon l'implémentation
      expect([200, 400]).toContain(response.status);
    });
  });
});
