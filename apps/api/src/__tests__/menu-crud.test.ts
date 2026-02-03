import request from 'supertest';
import express from 'express';
import menuRoutes from '../routes/menu.routes';
import { authMiddleware } from '../middleware/auth.middleware';
import { generateToken } from '../utils/jwt';
import { prisma } from '../utils/prisma';

const app = express();
app.use(express.json());
app.use('/api/menu', authMiddleware, menuRoutes);

describe('Menu CRUD Tests', () => {
  let testUser: { id: string; email: string; role: string };
  let authToken: string;
  let testRestaurant: { id: string };
  let testCategory: { id: string };
  let testMenuItem: { id: string };

  beforeAll(async () => {
    const hashedPassword = await require('bcrypt').hash('TestPassword123!', 10);
    testUser = await prisma.user.create({
      data: {
        email: 'menu-test@example.com',
        password: hashedPassword,
        name: 'Menu Test User',
        role: 'OWNER',
      },
    });

    testRestaurant = await prisma.restaurant.create({
      data: {
        name: 'Menu Test Restaurant',
        slug: 'menu-test-restaurant',
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
      where: { email: 'menu-test@example.com' },
    });
    await prisma.$disconnect();
  });

  describe('Categories CRUD', () => {
    it('devrait créer une nouvelle catégorie', async () => {
      const response = await request(app)
        .post('/api/menu/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'New Category',
          description: 'A new category',
        });

      expect(response.status).toBe(201);
      expect(response.body.category).toBeTruthy();
      expect(response.body.category.name).toBe('New Category');
      expect(response.body.category.slug).toBeTruthy();

      // Nettoyer
      if (response.body.category?.id) {
        await prisma.category.delete({
          where: { id: response.body.category.id },
        });
      }
    });

    it('devrait lister toutes les catégories', async () => {
      const response = await request(app)
        .get('/api/menu/categories')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.categories).toBeInstanceOf(Array);
    });

    it('devrait récupérer une catégorie par ID', async () => {
      const response = await request(app)
        .get(`/api/menu/categories/${testCategory.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.category.id).toBe(testCategory.id);
    });

    it('devrait mettre à jour une catégorie', async () => {
      const response = await request(app)
        .put(`/api/menu/categories/${testCategory.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Category',
          description: 'Updated description',
        });

      expect(response.status).toBe(200);
      expect(response.body.category.name).toBe('Updated Category');

      // Restaurer
      await prisma.category.update({
        where: { id: testCategory.id },
        data: { name: 'Test Category', description: null },
      });
    });

    it('devrait supprimer une catégorie', async () => {
      const category = await prisma.category.create({
        data: {
          name: 'Category to Delete',
          slug: 'category-to-delete',
          restaurantId: testRestaurant.id,
          isActive: true,
        },
      });

      const response = await request(app)
        .delete(`/api/menu/categories/${category.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      // Vérifier que la catégorie est supprimée (soft delete)
      const deleted = await prisma.category.findUnique({
        where: { id: category.id },
      });
      expect(deleted?.isActive).toBe(false);
    });

    it('devrait réordonner les catégories', async () => {
      const cat1 = await prisma.category.create({
        data: {
          name: 'Category 1',
          slug: 'category-1',
          restaurantId: testRestaurant.id,
          sortOrder: 0,
          isActive: true,
        },
      });

      const cat2 = await prisma.category.create({
        data: {
          name: 'Category 2',
          slug: 'category-2',
          restaurantId: testRestaurant.id,
          sortOrder: 1,
          isActive: true,
        },
      });

      const response = await request(app)
        .patch('/api/menu/categories/reorder')
        .set('Authorization', `Bearer ${authToken}`)
        .send([
          { id: cat1.id, sortOrder: 1 },
          { id: cat2.id, sortOrder: 0 },
        ]);

      expect(response.status).toBe(200);

      // Nettoyer
      await prisma.category.deleteMany({
        where: { id: { in: [cat1.id, cat2.id] } },
      });
    });
  });

  describe('Menu Items CRUD', () => {
    it('devrait créer un nouvel item menu', async () => {
      const response = await request(app)
        .post('/api/menu/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'New Menu Item',
          categoryId: testCategory.id,
          price: 25.5,
          description: 'A new menu item',
        });

      expect(response.status).toBe(201);
      expect(response.body.item).toBeTruthy();
      expect(response.body.item.name).toBe('New Menu Item');
      expect(response.body.item.price).toBe(25.5);
      expect(response.body.item.slug).toBeTruthy();

      testMenuItem = response.body.item;
    });

    it('devrait créer un item avec variants', async () => {
      const response = await request(app)
        .post('/api/menu/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Item with Variants',
          categoryId: testCategory.id,
          price: 30.0,
          variants: [
            { name: 'Small', priceModifier: 0, isDefault: true },
            { name: 'Large', priceModifier: 10 },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body.item.variants).toBeTruthy();

      // Nettoyer
      if (response.body.item?.id) {
        await prisma.menuItem.delete({
          where: { id: response.body.item.id },
        });
      }
    });

    it('devrait créer un item avec modifiers', async () => {
      const response = await request(app)
        .post('/api/menu/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Item with Modifiers',
          categoryId: testCategory.id,
          price: 20.0,
          modifiers: [
            { name: 'Extra Cheese', priceModifier: 5 },
            { name: 'Extra Sauce', priceModifier: 3 },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body.item.modifiers).toBeTruthy();

      // Nettoyer
      if (response.body.item?.id) {
        await prisma.menuItem.delete({
          where: { id: response.body.item.id },
        });
      }
    });

    it('devrait lister tous les items menu', async () => {
      const response = await request(app)
        .get('/api/menu/items')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.items).toBeInstanceOf(Array);
    });

    it('devrait filtrer les items par catégorie', async () => {
      const response = await request(app)
        .get(`/api/menu/items?categoryId=${testCategory.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      if (response.body.items && response.body.items.length > 0) {
        response.body.items.forEach((item: any) => {
          expect(item.categoryId).toBe(testCategory.id);
        });
      }
    });

    it('devrait récupérer un item par ID', async () => {
      if (!testMenuItem?.id) return;

      const response = await request(app)
        .get(`/api/menu/items/${testMenuItem.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.item.id).toBe(testMenuItem.id);
    });

    it('devrait mettre à jour un item menu', async () => {
      if (!testMenuItem?.id) return;

      const response = await request(app)
        .put(`/api/menu/items/${testMenuItem.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Menu Item',
          price: 30.0,
        });

      expect(response.status).toBe(200);
      expect(response.body.item.name).toBe('Updated Menu Item');
      expect(response.body.item.price).toBe(30.0);
    });

    it('devrait basculer la disponibilité d\'un item', async () => {
      if (!testMenuItem?.id) return;

      const itemBefore = await prisma.menuItem.findUnique({
        where: { id: testMenuItem.id },
      });
      const initialAvailability = itemBefore?.isAvailable;

      const response = await request(app)
        .patch(`/api/menu/items/${testMenuItem.id}/toggle-availability`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.item.isAvailable).toBe(!initialAvailability);
    });

    it('devrait supprimer un item menu', async () => {
      if (!testMenuItem?.id) return;

      const response = await request(app)
        .delete(`/api/menu/items/${testMenuItem.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      // Vérifier que l'item est supprimé (soft delete)
      const deleted = await prisma.menuItem.findUnique({
        where: { id: testMenuItem.id },
      });
      expect(deleted?.isActive).toBe(false);
    });
  });

  describe('Slug Validation', () => {
    it('devrait générer un slug unique pour les catégories', async () => {
      const response = await request(app)
        .post('/api/menu/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Category Slug',
        });

      expect(response.status).toBe(201);
      expect(response.body.category.slug).toMatch(/^test-category-slug/);

      // Nettoyer
      if (response.body.category?.id) {
        await prisma.category.delete({
          where: { id: response.body.category.id },
        });
      }
    });

    it('devrait générer un slug unique pour les items', async () => {
      const response = await request(app)
        .post('/api/menu/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Item Slug',
          categoryId: testCategory.id,
          price: 25.5,
        });

      expect(response.status).toBe(201);
      expect(response.body.item.slug).toMatch(/^test-item-slug/);

      // Nettoyer
      if (response.body.item?.id) {
        await prisma.menuItem.delete({
          where: { id: response.body.item.id },
        });
      }
    });
  });
});
