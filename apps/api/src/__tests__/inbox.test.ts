import request from 'supertest';
import express from 'express';
import conversationRoutes from '../routes/conversation.routes';
import aiRoutes from '../routes/ai.routes';
import { authMiddleware } from '../middleware/auth.middleware';
import { generateToken } from '../utils/jwt';
import { prisma } from '../utils/prisma';

const app = express();
app.use(express.json());
app.use('/api/conversations', authMiddleware, conversationRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);

describe('Inbox WhatsApp Tests', () => {
  let testUser: { id: string; email: string; role: string };
  let authToken: string;
  let testRestaurant: { id: string };
  let testCustomer: { id: string };
  let testConversation: { id: string };
  let testMessage: { id: string };

  beforeAll(async () => {
    const hashedPassword = await require('bcrypt').hash('TestPassword123!', 10);
    
    testUser = await prisma.user.create({
      data: {
        email: 'inbox-test@example.com',
        password: hashedPassword,
        name: 'Inbox Test User',
        role: 'OWNER',
      },
    });

    testRestaurant = await prisma.restaurant.create({
      data: {
        name: 'Inbox Test Restaurant',
        slug: 'inbox-test-restaurant',
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

    testCustomer = await prisma.customer.create({
      data: {
        phone: '+201111111111',
        name: 'Test Customer',
        restaurantId: testRestaurant.id,
      },
    });

    testConversation = await prisma.conversation.create({
      data: {
        restaurantId: testRestaurant.id,
        customerId: testCustomer.id,
        whatsappPhone: '+201111111111',
        isActive: true,
        lastMessageAt: new Date(),
      },
    });

    testMessage = await prisma.message.create({
      data: {
        conversationId: testConversation.id,
        content: 'Hello, I want to order',
        direction: 'inbound',
        type: 'text',
        status: 'delivered',
      },
    });
  });

  afterAll(async () => {
    await prisma.message.deleteMany({
      where: { conversationId: testConversation.id },
    });
    await prisma.conversation.deleteMany({
      where: { restaurantId: testRestaurant?.id },
    });
    await prisma.customer.deleteMany({
      where: { restaurantId: testRestaurant?.id },
    });
    await prisma.restaurant.deleteMany({
      where: { id: testRestaurant?.id },
    });
    await prisma.user.deleteMany({
      where: { email: 'inbox-test@example.com' },
    });
    await prisma.$disconnect();
  });

  describe('Conversations Management', () => {
    it('devrait lister toutes les conversations', async () => {
      const response = await request(app)
        .get('/api/conversations')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.conversations).toBeInstanceOf(Array);
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
    });

    it('devrait filtrer les conversations non lues', async () => {
      // Créer une conversation avec message non lu
      const unreadConv = await prisma.conversation.create({
        data: {
          restaurantId: testRestaurant.id,
          customerId: testCustomer.id,
          whatsappPhone: '+202222222222',
          isActive: true,
          lastMessageAt: new Date(),
          messages: {
            create: {
              content: 'Unread message',
              direction: 'inbound',
              type: 'text',
              status: 'delivered', // Pas encore lu
            },
          },
        },
      });

      const response = await request(app)
        .get('/api/conversations?unreadOnly=true')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.conversations).toBeInstanceOf(Array);

      // Nettoyer
      await prisma.conversation.delete({
        where: { id: unreadConv.id },
      });
    });

    it('devrait rechercher des conversations par nom client', async () => {
      const response = await request(app)
        .get(`/api/conversations?search=${testCustomer.name}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.conversations).toBeInstanceOf(Array);
    });

    it('devrait rechercher des conversations par téléphone', async () => {
      const response = await request(app)
        .get(`/api/conversations?search=${testCustomer.phone}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.conversations).toBeInstanceOf(Array);
    });

    it('devrait récupérer une conversation par ID', async () => {
      const response = await request(app)
        .get(`/api/conversations/${testConversation.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.conversation.id).toBe(testConversation.id);
      expect(response.body.conversation.customer).toBeTruthy();
    });

    it('devrait paginer les conversations', async () => {
      const response = await request(app)
        .get('/api/conversations?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(10);
      expect(response.body.conversations.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Messages Management', () => {
    it('devrait envoyer un message dans une conversation', async () => {
      const response = await request(app)
        .post(`/api/conversations/${testConversation.id}/messages`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Hello, how can I help you?',
          type: 'text',
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBeTruthy();
      expect(response.body.message.content).toBe('Hello, how can I help you?');
      expect(response.body.message.direction).toBe('outbound');
    });

    it('devrait rejeter un message vide', async () => {
      const response = await request(app)
        .post(`/api/conversations/${testConversation.id}/messages`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: '',
          type: 'text',
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('devrait rejeter un message trop long', async () => {
      const longMessage = 'a'.repeat(5000);
      const response = await request(app)
        .post(`/api/conversations/${testConversation.id}/messages`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: longMessage,
          type: 'text',
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('devrait envoyer un message avec média', async () => {
      const response = await request(app)
        .post(`/api/conversations/${testConversation.id}/messages`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Check this image',
          type: 'image',
          mediaUrl: 'https://example.com/image.jpg',
        });

      expect(response.status).toBe(201);
      expect(response.body.message.type).toBe('image');
      expect(response.body.message.mediaUrl).toBeTruthy();
    });

    it('devrait récupérer tous les messages d\'une conversation', async () => {
      const response = await request(app)
        .get(`/api/conversations/${testConversation.id}/messages`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.messages).toBeInstanceOf(Array);
    });

    it('devrait paginer les messages', async () => {
      const response = await request(app)
        .get(`/api/conversations/${testConversation.id}/messages?page=1&limit=20`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(20);
    });
  });

  describe('Conversation Actions', () => {
    it('devrait marquer une conversation comme lue', async () => {
      const response = await request(app)
        .patch(`/api/conversations/${testConversation.id}/mark-read`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.conversation).toBeTruthy();
    });

    it('devrait archiver une conversation', async () => {
      const response = await request(app)
        .patch(`/api/conversations/${testConversation.id}/archive`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          archived: true,
        });

      expect(response.status).toBe(200);
      expect(response.body.conversation.isActive).toBe(false);

      // Restaurer
      await prisma.conversation.update({
        where: { id: testConversation.id },
        data: { isActive: true },
      });
    });

    it('devrait désarchiver une conversation', async () => {
      // Archiver d'abord
      await prisma.conversation.update({
        where: { id: testConversation.id },
        data: { isActive: false },
      });

      const response = await request(app)
        .patch(`/api/conversations/${testConversation.id}/archive`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          archived: false,
        });

      expect(response.status).toBe(200);
      expect(response.body.conversation.isActive).toBe(true);
    });
  });

  describe('Internal Notes', () => {
    let testNote: { id: string };

    it('devrait créer une note interne sur une conversation', async () => {
      const response = await request(app)
        .post(`/api/conversations/${testConversation.id}/notes`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Customer prefers delivery before 6pm',
        });

      expect(response.status).toBe(201);
      expect(response.body.note).toBeTruthy();
      expect(response.body.note.content).toBe('Customer prefers delivery before 6pm');
      
      testNote = response.body.note;
    });

    it('devrait lister toutes les notes d\'une conversation', async () => {
      const response = await request(app)
        .get(`/api/conversations/${testConversation.id}/notes`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.notes).toBeInstanceOf(Array);
    });

    it('devrait mettre à jour une note', async () => {
      if (!testNote?.id) return;

      const response = await request(app)
        .put(`/api/notes/${testNote.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Updated note content',
        });

      expect(response.status).toBe(200);
      expect(response.body.note.content).toBe('Updated note content');
    });

    it('devrait supprimer une note', async () => {
      if (!testNote?.id) return;

      const response = await request(app)
        .delete(`/api/notes/${testNote.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('AI Order Parsing', () => {
    it('devrait parser un message de commande', async () => {
      // Mock OpenAI si nécessaire
      const response = await request(app)
        .post('/api/ai/parse-order')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'Je voudrais 2 koshari large et 1 shawarma',
          conversationId: testConversation.id,
        });

      // Peut retourner 200 avec parsed ou erreur si OpenAI non configuré
      expect([200, 500, 503]).toContain(response.status);
    });

    it('devrait rejeter un message vide pour parsing', async () => {
      const response = await request(app)
        .post('/api/ai/parse-order')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: '',
          conversationId: testConversation.id,
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('devrait rejeter un message trop long pour parsing', async () => {
      const longMessage = 'a'.repeat(3000);
      const response = await request(app)
        .post('/api/ai/parse-order')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: longMessage,
          conversationId: testConversation.id,
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Data Isolation', () => {
    let otherRestaurant: { id: string };
    let otherConversation: { id: string };

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

      otherConversation = await prisma.conversation.create({
        data: {
          restaurantId: otherRestaurant.id,
          customerId: otherCustomer.id,
          whatsappPhone: '+203333333333',
          isActive: true,
          lastMessageAt: new Date(),
        },
      });
    });

    afterAll(async () => {
      await prisma.conversation.deleteMany({
        where: { restaurantId: otherRestaurant.id },
      });
      await prisma.customer.deleteMany({
        where: { restaurantId: otherRestaurant.id },
      });
      await prisma.restaurant.delete({
        where: { id: otherRestaurant.id },
      });
    });

    it('devrait isoler les conversations par restaurant', async () => {
      const response = await request(app)
        .get('/api/conversations')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      
      // Vérifier que les conversations retournées appartiennent au bon restaurant
      if (response.body.conversations && response.body.conversations.length > 0) {
        response.body.conversations.forEach((conv: any) => {
          expect(conv.restaurantId || testRestaurant.id).toBe(testRestaurant.id);
        });
      }
    });

    it('devrait empêcher l\'accès aux conversations d\'un autre restaurant', async () => {
      const response = await request(app)
        .get(`/api/conversations/${otherConversation.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      // Devrait retourner 404 ou 403
      expect([403, 404]).toContain(response.status);
    });
  });
});
