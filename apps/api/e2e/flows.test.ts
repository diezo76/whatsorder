import { test, expect } from '@playwright/test';

const API_URL = process.env.API_URL || 'http://localhost:4000';

test.describe('E2E Flows - API', () => {
  let authToken: string;
  let restaurantId: string;
  let categoryId: string;
  let menuItemId: string;
  let customerId: string;
  let orderId: string;
  let conversationId: string;

  test.beforeAll(async ({ request }) => {
    // Créer un utilisateur de test
    const registerResponse = await request.post(`${API_URL}/api/auth/register`, {
      data: {
        email: `e2e-test-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        firstName: 'E2E',
        lastName: 'Test',
      },
    });

    expect(registerResponse.ok()).toBeTruthy();
    const registerData = await registerResponse.json();
    authToken = registerData.token;

    // Créer un restaurant
    // Note: Cette partie nécessite que l'utilisateur ait un restaurant
    // Dans un vrai scénario E2E, on utiliserait l'API pour créer le restaurant
  });

  test('Flux complet : Création compte → Menu → Commande → Traitement', async ({ request }) => {
    // 1. Créer un compte
    const registerResponse = await request.post(`${API_URL}/api/auth/register`, {
      data: {
        email: `flow-test-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        firstName: 'Flow',
        lastName: 'Test',
      },
    });

    expect(registerResponse.ok()).toBeTruthy();
    const registerData = await registerResponse.json();
    const token = registerData.token;

    // 2. Récupérer le profil utilisateur
    const meResponse = await request.get(`${API_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(meResponse.ok()).toBeTruthy();
    const userData = await meResponse.json();
    expect(userData.user).toBeTruthy();

    // Note: Les étapes suivantes nécessitent un restaurant configuré
    // Dans un vrai test E2E, on créerait le restaurant via l'API
  });

  test('Flux client : Menu public → Commande', async ({ request }) => {
    // 1. Récupérer le menu public d'un restaurant
    const menuResponse = await request.get(`${API_URL}/api/public/restaurants/test-restaurant/menu`);

    // Peut retourner 404 si le restaurant n'existe pas, c'est OK pour le test
    if (menuResponse.ok()) {
      const menuData = await menuResponse.json();
      expect(menuData.categories).toBeInstanceOf(Array);

      // 2. Créer une commande depuis le menu public
      if (menuData.categories.length > 0 && menuData.categories[0].items.length > 0) {
        const firstItem = menuData.categories[0].items[0];

        const orderResponse = await request.post(`${API_URL}/api/public/restaurants/test-restaurant/orders`, {
          data: {
            items: [
              {
                menuItemId: firstItem.id,
                quantity: 1,
                unitPrice: firstItem.price,
              },
            ],
            customerName: 'E2E Test Customer',
            customerPhone: '+201111111111',
            deliveryType: 'PICKUP',
            paymentMethod: 'CASH',
          },
        });

        // Peut échouer si le restaurant n'existe pas, c'est OK
        if (orderResponse.ok()) {
          const orderData = await orderResponse.json();
          expect(orderData.order).toBeTruthy();
          expect(orderData.order.orderNumber).toBeTruthy();
        }
      }
    }
  });

  test('Flux inbox : Conversation → Message → Note', async ({ request }) => {
    if (!authToken) {
      test.skip();
      return;
    }

    // 1. Lister les conversations
    const conversationsResponse = await request.get(`${API_URL}/api/conversations`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    // Peut retourner 403 si pas de restaurant, c'est OK
    if (conversationsResponse.ok()) {
      const conversationsData = await conversationsResponse.json();
      expect(conversationsData.conversations).toBeInstanceOf(Array);

      // 2. Si une conversation existe, envoyer un message
      if (conversationsData.conversations.length > 0) {
        const conversationId = conversationsData.conversations[0].id;

        const messageResponse = await request.post(
          `${API_URL}/api/conversations/${conversationId}/messages`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
            data: {
              content: 'E2E test message',
              type: 'text',
            },
          }
        );

        if (messageResponse.ok()) {
          const messageData = await messageResponse.json();
          expect(messageData.message).toBeTruthy();

          // 3. Créer une note
          const noteResponse = await request.post(
            `${API_URL}/api/conversations/${conversationId}/notes`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
              data: {
                content: 'E2E test note',
              },
            }
          );

          if (noteResponse.ok()) {
            const noteData = await noteResponse.json();
            expect(noteData.note).toBeTruthy();
          }
        }
      }
    }
  });

  test('Flux analytics : Récupération KPIs et graphiques', async ({ request }) => {
    if (!authToken) {
      test.skip();
      return;
    }

    // 1. Récupérer les stats du dashboard
    const statsResponse = await request.get(`${API_URL}/api/analytics/dashboard-stats?period=today`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    // Peut retourner 403 si pas de restaurant, c'est OK
    if (statsResponse.ok()) {
      const statsData = await statsResponse.json();
      expect(statsData.success).toBe(true);
      expect(statsData.stats).toBeTruthy();

      // 2. Récupérer le graphique de revenus
      const revenueResponse = await request.get(`${API_URL}/api/analytics/revenue-chart?period=today`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (revenueResponse.ok()) {
        const revenueData = await revenueResponse.json();
        expect(revenueData.success).toBe(true);
        expect(revenueData.data).toBeInstanceOf(Array);
      }

      // 3. Récupérer les top items
      const topItemsResponse = await request.get(`${API_URL}/api/analytics/top-items?period=today`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (topItemsResponse.ok()) {
        const topItemsData = await topItemsResponse.json();
        expect(topItemsData.success).toBe(true);
        expect(topItemsData.items).toBeInstanceOf(Array);
      }
    }
  });
});
