import request from 'supertest';
import express from 'express';
import orderRoutes from '../routes/order.routes';
import publicRoutes from '../routes/public.routes';
import { authMiddleware } from '../middleware/auth.middleware';
import { generateToken } from '../utils/jwt';
import { prisma } from '../utils/prisma';

const app = express();
app.use(express.json());
app.use('/api/orders', authMiddleware, orderRoutes);
app.use('/api/public', publicRoutes);

describe('Orders Flow Tests', () => {
  let testUser: { id: string; email: string; role: string };
  let staffUser: { id: string; email: string; role: string };
  let authToken: string;
  let staffToken: string;
  let testRestaurant: { id: string };
  let testCategory: { id: string };
  let testMenuItem: { id: string };
  let testCustomer: { id: string };
  let testOrder: { id: string; orderNumber: string };

  beforeAll(async () => {
    const hashedPassword = await require('bcrypt').hash('TestPassword123!', 10);
    
    testUser = await prisma.user.create({
      data: {
        email: 'orders-test@example.com',
        password: hashedPassword,
        name: 'Orders Test User',
        role: 'OWNER',
      },
    });

    testRestaurant = await prisma.restaurant.create({
      data: {
        name: 'Orders Test Restaurant',
        slug: 'orders-test-restaurant',
        phone: '+201234567890',
        
        isActive: true,
      },
    });

    testUser = await prisma.user.update({
      where: { id: testUser.id },
      data: { restaurantId: testRestaurant.id },
    });

    staffUser = await prisma.user.create({
      data: {
        email: 'staff-orders@example.com',
        password: hashedPassword,
        name: 'Staff User',
        role: 'STAFF',
        restaurantId: testRestaurant.id,
      },
    });

    authToken = generateToken({
      userId: testUser.id,
      email: testUser.email,
      role: testUser.role,
    });

    staffToken = generateToken({
      userId: staffUser.id,
      email: staffUser.email,
      role: staffUser.role,
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
        phone: '+201234567890',
        name: 'Test Customer',
        restaurantId: testRestaurant.id,
      },
    });
  });

  afterAll(async () => {
    await prisma.orderItem.deleteMany({
      where: { order: { restaurantId: testRestaurant.id } },
    });
    await prisma.order.deleteMany({
      where: { restaurantId: testRestaurant?.id },
    });
    await prisma.customer.deleteMany({
      where: { restaurantId: testRestaurant?.id },
    });
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
      where: {
        email: {
          in: ['orders-test@example.com', 'staff-orders@example.com'],
        },
      },
    });
    await prisma.$disconnect();
  });

  describe('Order Creation from Public API', () => {
    it('devrait créer une commande depuis l\'API publique', async () => {
      const response = await request(app)
        .post(`/api/public/restaurants/${testRestaurant.slug}/orders`)
        .send({
          items: [
            {
              menuItemId: testMenuItem.id,
              quantity: 2,
            },
          ],
          customerInfo: {
            name: 'Public Customer',
            phone: '+201111111111',
          },
          deliveryType: 'DELIVERY',
          address: '123 Test Street',
        });

      expect(response.status).toBe(201);
      expect(response.body.order).toBeTruthy();
      expect(response.body.order.orderNumber).toBeTruthy();
      expect(response.body.order.status).toBe('PENDING');

      testOrder = response.body.order;
    });
  });

  describe('Order Management', () => {
    beforeEach(async () => {
      // Créer une commande de test avant chaque test
      if (!testOrder) {
        const order = await prisma.order.create({
          data: {
            restaurantId: testRestaurant.id,
            customerId: testCustomer.id,
            orderNumber: `ORD-${Date.now()}`,
            status: 'PENDING',
            deliveryType: 'DELIVERY',
            subtotal: 51.0,
            deliveryFee: 20.0,
            total: 71.0,
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
        testOrder = order;
      }
    });

    it('devrait lister toutes les commandes', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.orders).toBeInstanceOf(Array);
    });

    it('devrait filtrer les commandes par statut', async () => {
      const response = await request(app)
        .get('/api/orders?status=PENDING')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      if (response.body.orders && response.body.orders.length > 0) {
        response.body.orders.forEach((order: any) => {
          expect(order.status).toBe('PENDING');
        });
      }
    });

    it('devrait récupérer une commande par ID', async () => {
      if (!testOrder?.id) return;

      const response = await request(app)
        .get(`/api/orders/${testOrder.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.order.id).toBe(testOrder.id);
      expect(response.body.order.items).toBeInstanceOf(Array);
    });

    it('devrait mettre à jour le statut d\'une commande', async () => {
      if (!testOrder?.id) return;

      const response = await request(app)
        .patch(`/api/orders/${testOrder.id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'CONFIRMED',
        });

      expect(response.status).toBe(200);
      expect(response.body.order.status).toBe('CONFIRMED');
    });

    it('devrait assigner une commande à un staff', async () => {
      if (!testOrder?.id) return;

      const response = await request(app)
        .patch(`/api/orders/${testOrder.id}/assign`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          assignedToId: staffUser.id,
        });

      expect(response.status).toBe(200);
      expect(response.body.order.assignedToId).toBe(staffUser.id);
    });

    it('devrait annuler une commande', async () => {
      if (!testOrder?.id) return;

      const response = await request(app)
        .patch(`/api/orders/${testOrder.id}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          cancellationReason: 'Customer requested cancellation',
        });

      expect(response.status).toBe(200);
      expect(response.body.order.status).toBe('CANCELLED');
      expect(response.body.order.cancellationReason).toBeTruthy();
    });

    it('devrait suivre le workflow des statuts', async () => {
      if (!testOrder?.id) return;

      // Réinitialiser le statut
      await prisma.order.update({
        where: { id: testOrder.id },
        data: { status: 'PENDING' },
      });

      const statuses = ['CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED'];

      for (const status of statuses) {
        const response = await request(app)
          .patch(`/api/orders/${testOrder.id}/status`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ status });

        expect(response.status).toBe(200);
        expect(response.body.order.status).toBe(status);
      }
    });
  });

  describe('Order Search and Filters', () => {
    it('devrait rechercher une commande par numéro', async () => {
      if (!testOrder?.orderNumber) return;

      const response = await request(app)
        .get(`/api/orders?search=${testOrder.orderNumber}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.orders).toBeInstanceOf(Array);
    });

    it('devrait filtrer les commandes par date (today)', async () => {
      const response = await request(app)
        .get('/api/orders?date=today')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });

    it('devrait filtrer les commandes par staff assigné', async () => {
      const response = await request(app)
        .get(`/api/orders?assignedToId=${staffUser.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });
  });
});
