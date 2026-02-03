import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.routes';
import publicRoutes from './routes/public.routes';
import menuRoutes from './routes/menu.routes';
import restaurantRoutes from './routes/restaurant.routes';
import conversationRoutes from './routes/conversation.routes';
import noteRoutes from './routes/note.routes';
import orderRoutes from './routes/order.routes';
import aiRoutes from './routes/ai.routes';
import analyticsRoutes from './routes/analytics.routes';
import whatsappRoutes from './routes/whatsapp.routes';
import { errorHandler } from './middleware/error-handler.middleware';
import { authMiddleware } from './middleware/auth.middleware';
import { apiLimiter, publicLimiter } from './middleware/rate-limit.middleware';
import { loggerMiddleware } from './middleware/logger.middleware';
import { setupSocketHandlers } from './socket';
import { setIoInstance } from './utils/socket';
import { ClientToServerEvents, ServerToClientEvents } from './types/socket';
// Import configs pour initialiser et afficher les warnings si nécessaire
import './config/openai';
import './config/whatsapp';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 4000;

// Security Headers avec Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://api.openai.com", "https://graph.facebook.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
  hsts: {
    maxAge: 31536000, // 1 an
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: 'deny',
  },
  noSniff: true,
  xssFilter: true,
}));

// Rate limiting global
app.use('/api', apiLimiter);

// Logging middleware
app.use(loggerMiddleware);

// Middleware CORS - Autoriser plusieurs origines
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'https://www.whataybo.com',
  'https://whataybo.com',
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origine (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // Vérifier si l'origine est autorisée
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // En développement, autoriser toutes les origines pour faciliter le debug
      if (process.env.NODE_ENV === 'development') {
        console.warn(`⚠️ [CORS] Origine non autorisée autorisée en dev: ${origin}`);
        callback(null, true);
      } else {
        console.error(`❌ [CORS] Origine non autorisée: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Routes
app.get('/', (_req, res) => {
  res.json({
    service: 'Whataybo API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me'
      },
      public: {
        restaurant: 'GET /api/public/restaurants/:slug',
        menu: 'GET /api/public/restaurants/:slug/menu'
      },
      menu: {
        items: {
          list: 'GET /api/menu/items',
          get: 'GET /api/menu/items/:id',
          create: 'POST /api/menu/items',
          update: 'PUT /api/menu/items/:id',
          delete: 'DELETE /api/menu/items/:id',
          toggleAvailability: 'PATCH /api/menu/items/:id/toggle-availability'
        },
        categories: {
          list: 'GET /api/menu/categories',
          get: 'GET /api/menu/categories/:id',
          create: 'POST /api/menu/categories',
          update: 'PUT /api/menu/categories/:id',
          delete: 'DELETE /api/menu/categories/:id',
          reorder: 'PATCH /api/menu/categories/reorder'
        }
      },
      restaurant: {
        get: 'GET /api/restaurant',
        update: 'PUT /api/restaurant'
      },
      conversations: {
        list: 'GET /api/conversations',
        get: 'GET /api/conversations/:id',
        messages: {
          list: 'GET /api/conversations/:id/messages',
          send: 'POST /api/conversations/:id/messages'
        },
        notes: {
          list: 'GET /api/conversations/:conversationId/notes',
          create: 'POST /api/conversations/:conversationId/notes'
        },
        markRead: 'PATCH /api/conversations/:id/mark-read',
        archive: 'PATCH /api/conversations/:id/archive'
      },
      notes: {
        update: 'PUT /api/notes/:id',
        delete: 'DELETE /api/notes/:id'
      },
      orders: {
        list: 'GET /api/orders',
        get: 'GET /api/orders/:id',
        updateStatus: 'PATCH /api/orders/:id/status',
        assign: 'PATCH /api/orders/:id/assign',
        cancel: 'PATCH /api/orders/:id/cancel'
      },
      ai: {
        parseOrder: 'POST /api/ai/parse-order',
        createOrder: 'POST /api/ai/create-order'
      },
      analytics: {
        dashboardStats: 'GET /api/analytics/dashboard-stats',
        revenueChart: 'GET /api/analytics/revenue-chart',
        topItems: 'GET /api/analytics/top-items',
        ordersByStatus: 'GET /api/analytics/orders-by-status',
        deliveryTypes: 'GET /api/analytics/delivery-types'
      }
    }
  });
});

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'whataybo-api'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/public', publicLimiter, publicRoutes); // Routes publiques avec rate limiting
app.use('/api/menu', authMiddleware, menuRoutes);
app.use('/api/restaurant', authMiddleware, restaurantRoutes);
app.use('/api/conversations', authMiddleware, conversationRoutes);
app.use('/api/orders', authMiddleware, orderRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);
app.use('/api/notes', authMiddleware, noteRoutes); // Changé de /api à /api/notes pour éviter les conflits
app.use('/api', whatsappRoutes);

// Route pour Chrome DevTools (évite les erreurs CSP dans la console)
app.get('/.well-known/appspecific/com.chrome.devtools.json', (_req, res) => {
  res.status(204).send();
});

// Error handler (doit être le dernier middleware)
app.use(errorHandler);

// Initialize Socket.io with TypeScript types
const socketAllowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'https://www.whataybo.com',
  'https://whataybo.com',
  'http://localhost:3000',
];

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'development' 
      ? true // Autoriser toutes les origines en développement
      : socketAllowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Set global io instance for use in controllers
setIoInstance(io);

// Setup Socket.io handlers (includes authentication and all event handlers)
setupSocketHandlers(io);

httpServer.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
  console.log(`📚 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`🌐 Public endpoints: http://localhost:${PORT}/api/public`);
  console.log(`🍽️  Menu endpoints: http://localhost:${PORT}/api/menu`);
  console.log(`🏪 Restaurant endpoints: http://localhost:${PORT}/api/restaurant`);
  console.log(`📦 Order endpoints: http://localhost:${PORT}/api/orders`);
  console.log(`🤖 AI endpoints: http://localhost:${PORT}/api/ai`);
  console.log(`📊 Analytics endpoints: http://localhost:${PORT}/api/analytics`);
  console.log(`🔌 Socket.io server ready`);
});

export { io };
