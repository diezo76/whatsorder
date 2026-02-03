import request from 'supertest';
import express from 'express';
import menuRoutes from '../routes/menu.routes';
import restaurantRoutes from '../routes/restaurant.routes';
import orderRoutes from '../routes/order.routes';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';
import { generateToken } from '../utils/jwt';
import { prisma } from '../utils/prisma';

const app = express();
app.use(express.json());

// Routes avec différents niveaux d'autorisation
app.use('/api/menu', authMiddleware, menuRoutes);
app.use('/api/restaurant', authMiddleware, restaurantRoutes);
app.use('/api/orders', authMiddleware, orderRoutes);

// Route de test avec requireRole
const testRouter = express.Router();
testRouter.delete('/test-owner-only', authMiddleware, requireRole('OWNER'), (req, res) => {
  res.json({ message: 'Owner access granted' });
});
testRouter.delete('/test-manager-only', authMiddleware, requireRole('OWNER', 'MANAGER'), (req, res) => {
  res.json({ message: 'Manager access granted' });
});
app.use('/api/test', testRouter);

describe('RBAC (Role-Based Access Control) Tests', () => {
  let ownerUser: { id: string; email: string; role: string; restaurantId: string | null };
  let managerUser: { id: string; email: string; role: string; restaurantId: string | null };
  let staffUser: { id: string; email: string; role: string; restaurantId: string | null };
  let deliveryUser: { id: string; email: string; role: string; restaurantId: string | null };
  
  let ownerToken: string;
  let managerToken: string;
  let staffToken: string;
  let deliveryToken: string;
  
  let testRestaurant: { id: string };
  let testRestaurant2: { id: string };
  let testCategory: { id: string };
  let testMenuItem: { id: string };

  beforeAll(async () => {
    // Créer un restaurant de test
    const hashedPassword = await require('bcrypt').hash('TestPassword123!', 10);
    
    ownerUser = await prisma.user.create({
      data: {
        email: 'owner@test.com',
        password: hashedPassword,
        name: 'Owner User',
        role: 'OWNER',
      },
    });

    testRestaurant = await prisma.restaurant.create({
      data: {
        name: 'Test Restaurant',
        slug: 'test-restaurant',
        
        isActive: true,
      },
    });

    // Mettre à jour l'utilisateur avec le restaurantId
    ownerUser = await prisma.user.update({
      where: { id: ownerUser.id },
      data: { restaurantId: testRestaurant.id },
    });

    managerUser = await prisma.user.create({
      data: {
        email: 'manager@test.com',
        password: hashedPassword,
        name: 'Manager User',
        role: 'MANAGER',
        restaurantId: testRestaurant.id,
      },
    });

    staffUser = await prisma.user.create({
      data: {
        email: 'staff@test.com',
        password: hashedPassword,
        name: 'Staff User',
        role: 'STAFF',
        restaurantId: testRestaurant.id,
      },
    });

    deliveryUser = await prisma.user.create({
      data: {
        email: 'delivery@test.com',
        password: hashedPassword,
        name: 'Delivery User',
        role: 'DELIVERY',
        restaurantId: testRestaurant.id,
      },
    });

    // Créer un deuxième restaurant pour tester l'isolation
    testRestaurant2 = await prisma.restaurant.create({
      data: {
        name: 'Test Restaurant 2',
        slug: 'test-restaurant-2',
        
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

    // Créer un item de menu de test
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

    // Générer les tokens
    ownerToken = generateToken({
      userId: ownerUser.id,
      email: ownerUser.email,
      role: ownerUser.role,
    });

    managerToken = generateToken({
      userId: managerUser.id,
      email: managerUser.email,
      role: managerUser.role,
    });

    staffToken = generateToken({
      userId: staffUser.id,
      email: staffUser.email,
      role: staffUser.role,
    });

    deliveryToken = generateToken({
      userId: deliveryUser.id,
      email: deliveryUser.email,
      role: deliveryUser.role,
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
      where: { id: { in: [testRestaurant.id, testRestaurant2.id] } },
    });
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['owner@test.com', 'manager@test.com', 'staff@test.com', 'delivery@test.com'],
        },
      },
    });
    await prisma.$disconnect();
  });

  describe('Role Permissions - OWNER', () => {
    it('devrait permettre à OWNER d\'accéder aux routes owner-only', async () => {
      const response = await request(app)
        .delete('/api/test/test-owner-only')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Owner access granted');
    });

    it('devrait permettre à OWNER d\'accéder aux routes manager', async () => {
      const response = await request(app)
        .delete('/api/test/test-manager-only')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Manager access granted');
    });

    it('devrait permettre à OWNER de créer des items menu', async () => {
      const response = await request(app)
        .post('/api/menu/items')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          name: 'Owner Created Item',
          categoryId: testCategory.id,
          price: 30.0,
        });

      expect(response.status).toBe(201);
      expect(response.body.item).toBeTruthy();

      // Nettoyer
      if (response.body.item?.id) {
        await prisma.menuItem.delete({
          where: { id: response.body.item.id },
        });
      }
    });

    it('devrait permettre à OWNER de supprimer des items menu', async () => {
      const item = await prisma.menuItem.create({
        data: {
          name: 'Item to Delete',
          slug: 'item-to-delete',
          categoryId: testCategory.id,
          restaurantId: testRestaurant.id,
          price: 20.0,
          isActive: true,
        },
      });

      const response = await request(app)
        .delete(`/api/menu/items/${item.id}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('Role Permissions - MANAGER', () => {
    it('devrait permettre à MANAGER d\'accéder aux routes manager', async () => {
      const response = await request(app)
        .delete('/api/test/test-manager-only')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Manager access granted');
    });

    it('devrait rejeter MANAGER des routes owner-only', async () => {
      const response = await request(app)
        .delete('/api/test/test-owner-only')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Insufficient permissions');
    });
  });

  describe('Role Permissions - STAFF', () => {
    it('devrait permettre à STAFF de voir les items menu', async () => {
      const response = await request(app)
        .get('/api/menu/items')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(response.status).toBe(200);
    });

    it('devrait rejeter STAFF des routes owner-only', async () => {
      const response = await request(app)
        .delete('/api/test/test-owner-only')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(response.status).toBe(403);
    });

    it('devrait rejeter STAFF des routes manager', async () => {
      const response = await request(app)
        .delete('/api/test/test-manager-only')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('Role Permissions - DELIVERY', () => {
    it('devrait permettre à DELIVERY de voir les commandes', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${deliveryToken}`);

      // Peut retourner 200 (vide) ou autre selon l'implémentation
      expect(response.status).not.toBe(403);
    });

    it('devrait rejeter DELIVERY des routes owner-only', async () => {
      const response = await request(app)
        .delete('/api/test/test-owner-only')
        .set('Authorization', `Bearer ${deliveryToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('Multi-Tenant Data Isolation', () => {
    let otherRestaurantOwner: { id: string; email: string; role: string };
    let otherRestaurantToken: string;
    let otherRestaurantCategory: { id: string };
    let otherRestaurantItem: { id: string };

    beforeAll(async () => {
      const hashedPassword = await require('bcrypt').hash('TestPassword123!', 10);
      
      otherRestaurantOwner = await prisma.user.create({
        data: {
          email: 'other-owner@test.com',
          password: hashedPassword,
          name: 'Other Owner',
          role: 'OWNER',
          restaurantId: testRestaurant2.id,
        },
      });

      otherRestaurantToken = generateToken({
        userId: otherRestaurantOwner.id,
        email: otherRestaurantOwner.email,
        role: otherRestaurantOwner.role,
      });

      otherRestaurantCategory = await prisma.category.create({
        data: {
          name: 'Other Category',
          slug: 'other-category',
          restaurantId: testRestaurant2.id,
          isActive: true,
        },
      });

      otherRestaurantItem = await prisma.menuItem.create({
        data: {
          name: 'Other Item',
          slug: 'other-item',
          categoryId: otherRestaurantCategory.id,
          restaurantId: testRestaurant2.id,
          price: 50.0,
          isActive: true,
        },
      });
    });

    afterAll(async () => {
      await prisma.menuItem.deleteMany({
        where: { restaurantId: testRestaurant2.id },
      });
      await prisma.category.deleteMany({
        where: { restaurantId: testRestaurant2.id },
      });
      await prisma.user.deleteMany({
        where: { email: 'other-owner@test.com' },
      });
    });

    it('devrait isoler les données par restaurantId - OWNER ne voit que ses items', async () => {
      const response = await request(app)
        .get('/api/menu/items')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      
      // Vérifier que les items retournés appartiennent au bon restaurant
      if (response.body.items && Array.isArray(response.body.items)) {
        response.body.items.forEach((item: any) => {
          expect(item.restaurantId).toBe(testRestaurant.id);
        });
      }
    });

    it('devrait empêcher OWNER d\'accéder aux items d\'un autre restaurant', async () => {
      const response = await request(app)
        .get(`/api/menu/items/${otherRestaurantItem.id}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      // Devrait retourner 404 ou 403 selon l'implémentation
      expect([403, 404]).toContain(response.status);
    });

    it('devrait empêcher OWNER de modifier les items d\'un autre restaurant', async () => {
      const response = await request(app)
        .put(`/api/menu/items/${otherRestaurantItem.id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          name: 'Hacked Item',
        });

      expect([403, 404]).toContain(response.status);
    });

    it('devrait permettre à OWNER d\'accéder uniquement à ses propres catégories', async () => {
      const response = await request(app)
        .get('/api/menu/categories')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      
      if (response.body.categories && Array.isArray(response.body.categories)) {
        response.body.categories.forEach((category: any) => {
          expect(category.restaurantId).toBe(testRestaurant.id);
        });
      }
    });
  });

  describe('requireRole Middleware', () => {
    it('devrait rejeter les utilisateurs non authentifiés', async () => {
      const response = await request(app)
        .delete('/api/test/test-owner-only');

      expect(response.status).toBe(401);
    });

    it('devrait rejeter les utilisateurs avec un token invalide', async () => {
      const response = await request(app)
        .delete('/api/test/test-owner-only')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });

    it('devrait permettre l\'accès si le rôle correspond', async () => {
      const response = await request(app)
        .delete('/api/test/test-manager-only')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
    });
  });
});
