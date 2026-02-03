import request from 'supertest';
import express from 'express';
import publicRoutes from '../routes/public.routes';
import { prisma } from '../utils/prisma';

const app = express();
app.use(express.json());
app.use('/api/public', publicRoutes);

describe('Public Pages Tests', () => {
  let testRestaurant: { id: string; slug: string };
  let testCategory: { id: string };
  let testMenuItem: { id: string };
  let testMenuItemUnavailable: { id: string };

  beforeAll(async () => {
    // Créer un utilisateur et restaurant de test
    const hashedPassword = await require('bcrypt').hash('TestPassword123!', 10);
    const testUser = await prisma.user.create({
      data: {
        email: 'public-test@example.com',
        password: hashedPassword,
        name: 'Public Test User',
        role: 'OWNER',
      },
    });

    testRestaurant = await prisma.restaurant.create({
      data: {
        name: 'Public Test Restaurant',
        slug: 'public-test-restaurant',
        phone: '+201234567890',
        
        isActive: true,
        description: 'A test restaurant',
        logo: 'https://example.com/logo.jpg',
        coverImage: 'https://example.com/cover.jpg',
      },
    });

    await prisma.user.update({
      where: { id: testUser.id },
      data: { restaurantId: testRestaurant.id },
    });

    testCategory = await prisma.category.create({
      data: {
        name: 'Public Category',
        slug: 'public-category',
        restaurantId: testRestaurant.id,
        isActive: true,
        sortOrder: 0,
      },
    });

    testMenuItem = await prisma.menuItem.create({
      data: {
        name: 'Available Item',
        slug: 'available-item',
        categoryId: testCategory.id,
        restaurantId: testRestaurant.id,
        price: 25.5,
        description: 'An available item',
        isActive: true,
        isAvailable: true,
        sortOrder: 0,
      },
    });

    testMenuItemUnavailable = await prisma.menuItem.create({
      data: {
        name: 'Unavailable Item',
        slug: 'unavailable-item',
        categoryId: testCategory.id,
        restaurantId: testRestaurant.id,
        price: 30.0,
        description: 'An unavailable item',
        isActive: true,
        isAvailable: false, // Non disponible
        sortOrder: 1,
      },
    });
  });

  afterAll(async () => {
    if (testRestaurant) {
      await prisma.menuItem.deleteMany({
        where: { restaurantId: testRestaurant.id },
      });
      await prisma.category.deleteMany({
        where: { restaurantId: testRestaurant.id },
      });
      await prisma.restaurant.deleteMany({
        where: { id: testRestaurant.id },
      });
    }
    await prisma.user.deleteMany({
      where: { email: 'public-test@example.com' },
    });
    await prisma.$disconnect();
  });

  describe('GET /api/public/restaurants/:slug', () => {
    it('devrait récupérer un restaurant par slug', async () => {
      const response = await request(app)
        .get(`/api/public/restaurants/${testRestaurant.slug}`);

      expect(response.status).toBe(200);
      expect(response.body.slug).toBe(testRestaurant.slug);
      expect(response.body.name).toBe('Public Test Restaurant');
      expect(response.body.isActive).toBe(true);
    });

    it('devrait retourner 404 pour un restaurant inexistant', async () => {
      const response = await request(app)
        .get('/api/public/restaurants/non-existent-slug');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Restaurant not found');
    });

    it('devrait retourner les informations du restaurant sans mot de passe', async () => {
      const response = await request(app)
        .get(`/api/public/restaurants/${testRestaurant.slug}`);

      expect(response.status).toBe(200);
      expect(response.body).not.toHaveProperty('password');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('phone');
      expect(response.body).toHaveProperty('description');
    });

    it('devrait retourner les utilisateurs sans mot de passe', async () => {
      const response = await request(app)
        .get(`/api/public/restaurants/${testRestaurant.slug}`);

      expect(response.status).toBe(200);
      if (response.body.users && response.body.users.length > 0) {
        response.body.users.forEach((user: any) => {
          expect(user).not.toHaveProperty('password');
        });
      }
    });
  });

  describe('GET /api/public/restaurants/:slug/menu', () => {
    it('devrait récupérer le menu public d\'un restaurant', async () => {
      const response = await request(app)
        .get(`/api/public/restaurants/${testRestaurant.slug}/menu`);

      expect(response.status).toBe(200);
      expect(response.body.categories).toBeInstanceOf(Array);
      expect(response.body.categories.length).toBeGreaterThan(0);
    });

    it('devrait retourner uniquement les catégories actives', async () => {
      // Créer une catégorie inactive
      const inactiveCategory = await prisma.category.create({
        data: {
          name: 'Inactive Category',
          slug: 'inactive-category',
          restaurantId: testRestaurant.id,
          isActive: false,
        },
      });

      const response = await request(app)
        .get(`/api/public/restaurants/${testRestaurant.slug}/menu`);

      expect(response.status).toBe(200);
      const categoryIds = response.body.categories.map((c: any) => c.id);
      expect(categoryIds).not.toContain(inactiveCategory.id);

      // Nettoyer
      await prisma.category.delete({
        where: { id: inactiveCategory.id },
      });
    });

    it('devrait retourner uniquement les items actifs et disponibles', async () => {
      const response = await request(app)
        .get(`/api/public/restaurants/${testRestaurant.slug}/menu`);

      expect(response.status).toBe(200);
      
      // Vérifier que l'item disponible est présent
      let foundAvailable = false;
      let foundUnavailable = false;

      response.body.categories.forEach((category: any) => {
        category.items.forEach((item: any) => {
          if (item.id === testMenuItem.id) {
            foundAvailable = true;
            expect(item.isAvailable).toBe(true);
            expect(item.isActive).toBe(true);
          }
          if (item.id === testMenuItemUnavailable.id) {
            foundUnavailable = true;
          }
        });
      });

      expect(foundAvailable).toBe(true);
      expect(foundUnavailable).toBe(false); // L'item non disponible ne doit pas apparaître
    });

    it('devrait trier les catégories par sortOrder', async () => {
      // Créer une deuxième catégorie avec un sortOrder différent
      const category2 = await prisma.category.create({
        data: {
          name: 'Category 2',
          slug: 'category-2',
          restaurantId: testRestaurant.id,
          isActive: true,
          sortOrder: 1,
        },
      });

      const response = await request(app)
        .get(`/api/public/restaurants/${testRestaurant.slug}/menu`);

      expect(response.status).toBe(200);
      const categories = response.body.categories;
      
      // Vérifier que les catégories sont triées par sortOrder
      for (let i = 1; i < categories.length; i++) {
        expect(categories[i].sortOrder).toBeGreaterThanOrEqual(categories[i - 1].sortOrder);
      }

      // Nettoyer
      await prisma.category.delete({
        where: { id: category2.id },
      });
    });

    it('devrait retourner 404 pour un restaurant inactif', async () => {
      // Désactiver le restaurant
      await prisma.restaurant.update({
        where: { id: testRestaurant.id },
        data: { isActive: false },
      });

      const response = await request(app)
        .get(`/api/public/restaurants/${testRestaurant.slug}/menu`);

      expect(response.status).toBe(404);

      // Réactiver
      await prisma.restaurant.update({
        where: { id: testRestaurant.id },
        data: { isActive: true },
      });
    });
  });

  describe('POST /api/public/restaurants/:slug/orders', () => {
    it('devrait créer une commande depuis l\'API publique', async () => {
      const response = await request(app)
        .post(`/api/public/restaurants/${testRestaurant.slug}/orders`)
        .send({
          items: [
            {
              menuItemId: testMenuItem.id,
              quantity: 2,
              unitPrice: 25.5,
            },
          ],
          customerName: 'Test Customer',
          customerPhone: '+201111111111',
          customerEmail: 'customer@example.com',
          deliveryType: 'DELIVERY',
          deliveryAddress: '123 Test Street',
          notes: 'Please deliver before 6pm',
          paymentMethod: 'CASH',
        });

      expect(response.status).toBe(201);
      expect(response.body.order).toBeTruthy();
      expect(response.body.order.orderNumber).toBeTruthy();
      expect(response.body.order.status).toBe('PENDING');
      expect(response.body.order.items).toBeInstanceOf(Array);
      expect(response.body.order.items.length).toBe(1);

      // Nettoyer
      if (response.body.order?.id) {
        await prisma.orderItem.deleteMany({
          where: { orderId: response.body.order.id },
        });
        await prisma.order.delete({
          where: { id: response.body.order.id },
        });
      }
    });

    it('devrait créer un client automatiquement si inexistant', async () => {
      const newPhone = '+209999999999';
      
      const response = await request(app)
        .post(`/api/public/restaurants/${testRestaurant.slug}/orders`)
        .send({
          items: [
            {
              menuItemId: testMenuItem.id,
              quantity: 1,
              unitPrice: 25.5,
            },
          ],
          customerName: 'New Customer',
          customerPhone: newPhone,
          deliveryType: 'PICKUP',
          paymentMethod: 'CASH',
        });

      expect(response.status).toBe(201);
      
      // Vérifier que le client a été créé
      const customer = await prisma.customer.findFirst({
        where: {
          phone: newPhone,
          restaurantId: testRestaurant.id,
        },
      });

      expect(customer).toBeTruthy();
      expect(customer?.name).toBe('New Customer');

      // Nettoyer
      if (response.body.order?.id) {
        await prisma.orderItem.deleteMany({
          where: { orderId: response.body.order.id },
        });
        await prisma.order.delete({
          where: { id: response.body.order.id },
        });
      }
      if (customer) {
        await prisma.customer.delete({
          where: { id: customer.id },
        });
      }
    });

    it('devrait rejeter une commande sans items', async () => {
      const response = await request(app)
        .post(`/api/public/restaurants/${testRestaurant.slug}/orders`)
        .send({
          items: [],
          customerName: 'Test Customer',
          customerPhone: '+201111111111',
          deliveryType: 'DELIVERY',
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('devrait rejeter une commande sans nom client', async () => {
      const response = await request(app)
        .post(`/api/public/restaurants/${testRestaurant.slug}/orders`)
        .send({
          items: [
            {
              menuItemId: testMenuItem.id,
              quantity: 1,
              unitPrice: 25.5,
            },
          ],
          customerPhone: '+201111111111',
          deliveryType: 'DELIVERY',
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('devrait rejeter une commande sans téléphone client', async () => {
      const response = await request(app)
        .post(`/api/public/restaurants/${testRestaurant.slug}/orders`)
        .send({
          items: [
            {
              menuItemId: testMenuItem.id,
              quantity: 1,
              unitPrice: 25.5,
            },
          ],
          customerName: 'Test Customer',
          deliveryType: 'DELIVERY',
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('devrait rejeter une commande avec un email invalide', async () => {
      const response = await request(app)
        .post(`/api/public/restaurants/${testRestaurant.slug}/orders`)
        .send({
          items: [
            {
              menuItemId: testMenuItem.id,
              quantity: 1,
              unitPrice: 25.5,
            },
          ],
          customerName: 'Test Customer',
          customerPhone: '+201111111111',
          customerEmail: 'invalid-email',
          deliveryType: 'DELIVERY',
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('devrait calculer correctement le total de la commande', async () => {
      const response = await request(app)
        .post(`/api/public/restaurants/${testRestaurant.slug}/orders`)
        .send({
          items: [
            {
              menuItemId: testMenuItem.id,
              quantity: 2,
              unitPrice: 25.5,
            },
          ],
          customerName: 'Test Customer',
          customerPhone: '+201111111111',
          deliveryType: 'DELIVERY',
          deliveryAddress: '123 Test Street',
        });

      expect(response.status).toBe(201);
      expect(response.body.order.subtotal).toBe(51.0); // 2 * 25.5
      expect(response.body.order.deliveryFee).toBeGreaterThanOrEqual(0);
      expect(response.body.order.total).toBeGreaterThanOrEqual(response.body.order.subtotal);

      // Nettoyer
      if (response.body.order?.id) {
        await prisma.orderItem.deleteMany({
          where: { orderId: response.body.order.id },
        });
        await prisma.order.delete({
          where: { id: response.body.order.id },
        });
      }
    });

    it('devrait accepter une commande PICKUP sans adresse', async () => {
      const response = await request(app)
        .post(`/api/public/restaurants/${testRestaurant.slug}/orders`)
        .send({
          items: [
            {
              menuItemId: testMenuItem.id,
              quantity: 1,
              unitPrice: 25.5,
            },
          ],
          customerName: 'Test Customer',
          customerPhone: '+201111111111',
          deliveryType: 'PICKUP',
        });

      expect(response.status).toBe(201);

      // Nettoyer
      if (response.body.order?.id) {
        await prisma.orderItem.deleteMany({
          where: { orderId: response.body.order.id },
        });
        await prisma.order.delete({
          where: { id: response.body.order.id },
        });
      }
    });

    it('devrait générer un numéro de commande unique', async () => {
      const response1 = await request(app)
        .post(`/api/public/restaurants/${testRestaurant.slug}/orders`)
        .send({
          items: [
            {
              menuItemId: testMenuItem.id,
              quantity: 1,
              unitPrice: 25.5,
            },
          ],
          customerName: 'Customer 1',
          customerPhone: '+201111111111',
          deliveryType: 'PICKUP',
        });

      const response2 = await request(app)
        .post(`/api/public/restaurants/${testRestaurant.slug}/orders`)
        .send({
          items: [
            {
              menuItemId: testMenuItem.id,
              quantity: 1,
              unitPrice: 25.5,
            },
          ],
          customerName: 'Customer 2',
          customerPhone: '+202222222222',
          deliveryType: 'PICKUP',
        });

      expect(response1.status).toBe(201);
      expect(response2.status).toBe(201);
      expect(response1.body.order.orderNumber).not.toBe(response2.body.order.orderNumber);

      // Nettoyer
      if (response1.body.order?.id) {
        await prisma.orderItem.deleteMany({
          where: { orderId: response1.body.order.id },
        });
        await prisma.order.delete({
          where: { id: response1.body.order.id },
        });
      }
      if (response2.body.order?.id) {
        await prisma.orderItem.deleteMany({
          where: { orderId: response2.body.order.id },
        });
        await prisma.order.delete({
          where: { id: response2.body.order.id },
        });
      }
    });
  });
});
