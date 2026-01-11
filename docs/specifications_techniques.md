# 🏗️ Spécifications Techniques - WhatsOrder Clone

**Version** : 1.0.0  
**Date** : 11 janvier 2026  
**Mainteneur** : [Votre Nom]

---

## 📋 Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Stack Technologique](#stack-technologique)
3. [Architecture Système](#architecture-système)
4. [Services Externes](#services-externes)
5. [Base de Données](#base-de-données)
6. [Sécurité](#sécurité)
7. [Performance](#performance)
8. [Scalabilité](#scalabilité)

---

## 🎯 Vue d'Ensemble

### Objectif Technique
Construire une plateforme SaaS multi-tenant permettant aux restaurants de gérer commandes WhatsApp avec :
- Temps de réponse < 200ms (API)
- Support 1000+ requêtes/minute
- Uptime 99.9%
- Real-time via WebSocket

### Architecture Pattern
**Monorepo Fullstack** avec séparation frontend/backend :
- **Frontend** : Next.js 14 (SSR + Client Components)
- **Backend** : Express.js (API REST + WebSocket)
- **Database** : PostgreSQL (relationnel)
- **Cache** : Redis (sessions + cache)
- **Queue** : Bull (jobs asynchrones)

---

## 🛠️ Stack Technologique

### Frontend (apps/web)

| Technologie | Version | Rôle |
|-------------|---------|------|
| **Next.js** | 14.2.x | Framework React SSR/SSG |
| **React** | 18.3.x | Library UI |
| **TypeScript** | 5.4.x | Typage statique |
| **Tailwind CSS** | 3.4.x | Styling utility-first |
| **shadcn/ui** | latest | Composants UI (Radix) |
| **React Query** | 5.x | State management serveur |
| **Zustand** | 4.5.x | State management client |
| **React Hook Form** | 7.51.x | Gestion formulaires |
| **Zod** | 3.22.x | Validation schémas |
| **Socket.io Client** | 4.7.x | WebSocket real-time |
| **React Flow** | 11.11.x | Workflow builder visuel |
| **Recharts** | 2.12.x | Graphiques analytics |
| **date-fns** | 3.6.x | Manipulation dates |
| **lucide-react** | 0.363.x | Icons |
| **framer-motion** | 11.x | Animations |

**Installation Frontend** :
```bash
cd apps/web
pnpm add next@14 react@18 typescript tailwindcss
pnpm add @tanstack/react-query zustand react-hook-form zod
pnpm add socket.io-client reactflow recharts
pnpm add date-fns lucide-react framer-motion
pnpm add @radix-ui/react-dialog @radix-ui/react-dropdown-menu
```

### Backend (apps/api)

| Technologie | Version | Rôle |
|-------------|---------|------|
| **Node.js** | 20.x LTS | Runtime JavaScript |
| **Express.js** | 4.19.x | Framework web |
| **TypeScript** | 5.4.x | Typage statique |
| **Prisma** | 5.12.x | ORM base de données |
| **PostgreSQL** | 15.x | Base de données |
| **Redis** | 7.x | Cache + sessions |
| **Socket.io** | 4.7.x | WebSocket serveur |
| **Bull** | 4.12.x | Queue jobs |
| **JWT** | 9.0.x | Authentification |
| **bcrypt** | 5.1.x | Hash passwords |
| **Zod** | 3.22.x | Validation API |
| **Winston** | 3.13.x | Logging |
| **Axios** | 1.6.x | HTTP client |
| **Multer** | 1.4.x | Upload fichiers |

**Installation Backend** :
```bash
cd apps/api
pnpm add express typescript @types/express
pnpm add prisma @prisma/client
pnpm add socket.io bull redis
pnpm add jsonwebtoken bcrypt
pnpm add zod winston axios multer
```

### DevOps & Infrastructure

| Technologie | Version | Rôle |
|-------------|---------|------|
| **Docker** | 24.x | Containerisation |
| **Docker Compose** | 2.x | Orchestration dev |
| **pnpm** | 8.x | Package manager |
| **ESLint** | 8.x | Linting code |
| **Prettier** | 3.x | Formatage code |
| **Husky** | 9.x | Git hooks |
| **Jest** | 29.x | Tests unitaires |
| **Playwright** | 1.42.x | Tests E2E |

---

## 🏛️ Architecture Système

### Vue d'Ensemble (Diagramme)

```
┌─────────────────────────────────────────────────────────────┐
│                         UTILISATEURS                         │
├──────────────┬──────────────┬──────────────┬────────────────┤
│   Clients    │  Propriétaires│    Staff     │   Livreurs    │
│  Restaurant  │  Restaurant   │  Restaurant  │               │
└──────┬───────┴───────┬──────┴──────┬───────┴────────┬───────┘
       │               │              │                │
       │               │              │                │
┌──────▼───────────────▼──────────────▼────────────────▼───────┐
│                    LOAD BALANCER (Nginx)                      │
│                     HTTPS + SSL/TLS                           │
└──────┬────────────────────────────────────────────┬──────────┘
       │                                            │
       │                                            │
┌──────▼────────────────────────┐      ┌───────────▼──────────┐
│   FRONTEND (Next.js 14)       │      │   BACKEND (Express)  │
│   - SSR Pages                 │      │   - REST API         │
│   - Client Components         │◄────►│   - WebSocket        │
│   - Static Assets             │      │   - Auth JWT         │
└──────┬────────────────────────┘      └───────────┬──────────┘
       │                                            │
       │                                            │
       │              ┌─────────────────────────────┼──────────┐
       │              │                             │          │
┌──────▼──────┐  ┌───▼─────┐  ┌──────────┐  ┌─────▼─────┐ ┌─▼────┐
│  CDN        │  │PostgreSQL│  │  Redis   │  │   Bull    │ │Socket│
│ (Cloudinary)│  │ Database │  │  Cache   │  │  Queue    │ │  IO  │
└─────────────┘  └──────────┘  └──────────┘  └───────────┘ └──────┘
                                                     │
                                                     │
                              ┌──────────────────────┼────────────┐
                              │                      │            │
                        ┌─────▼─────┐    ┌──────────▼───┐  ┌────▼─────┐
                        │ WhatsApp  │    │   OpenAI     │  │ Paymob   │
                        │ Cloud API │    │   GPT-4      │  │ Payment  │
                        └───────────┘    └──────────────┘  └──────────┘
```

### Architecture par Couches

#### 1. Presentation Layer (Frontend)
```
apps/web/
├── app/
│   ├── (public)/          # Pages publiques (menu client)
│   │   └── [slug]/
│   │       ├── page.tsx              # Landing restaurant
│   │       └── menu/page.tsx         # Menu commande
│   │
│   ├── (dashboard)/       # Dashboard admin (protected)
│   │   ├── inbox/         # Conversations WhatsApp
│   │   ├── orders/        # Gestion commandes
│   │   ├── menu/          # Gestion menu
│   │   ├── analytics/     # Analytics
│   │   └── settings/      # Paramètres
│   │
│   ├── (auth)/            # Auth pages
│   │   ├── login/
│   │   └── register/
│   │
│   └── api/               # API Routes Next.js
│       └── webhooks/      # Webhooks publics
│
└── components/
    ├── public/            # Composants client
    └── dashboard/         # Composants admin
```

#### 2. Application Layer (Backend)
```
apps/api/src/
├── controllers/           # Route handlers
│   ├── auth.controller.ts
│   ├── restaurant.controller.ts
│   ├── menu.controller.ts
│   ├── order.controller.ts
│   └── whatsapp.controller.ts
│
├── services/              # Business logic
│   ├── whatsapp/
│   │   ├── connection.service.ts
│   │   ├── message.service.ts
│   │   └── webhook.service.ts
│   ├── order/
│   │   ├── order.service.ts
│   │   └── notification.service.ts
│   └── ai/
│       └── order-parser.service.ts
│
├── middleware/            # Middlewares Express
│   ├── auth.middleware.ts
│   ├── rate-limit.middleware.ts
│   └── error-handler.middleware.ts
│
├── jobs/                  # Background jobs (Bull)
│   ├── message-sender.job.ts
│   ├── workflow-executor.job.ts
│   └── analytics-aggregator.job.ts
│
└── websocket/             # Socket.io events
    ├── socket-handler.ts
    └── events.ts
```

#### 3. Data Layer (Database)
```
PostgreSQL Database
├── Tables (voir base_de_donnees.md)
├── Indexes (performance)
├── Triggers (auto-updates)
└── Views (queries complexes)

Redis Cache
├── Sessions utilisateurs
├── Rate limiting
├── Cache queries fréquentes
└── Queue Bull jobs
```

---

## 🔌 Services Externes

### 1. WhatsApp Cloud API (Meta)

**URL** : https://graph.facebook.com/v18.0

**Authentification** :
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Endpoints Utilisés** :
- `POST /{phone_number_id}/messages` - Envoyer message
- `GET /{phone_number_id}/media/{media_id}` - Télécharger media
- `POST /webhook` - Recevoir webhooks

**Configuration** :
```typescript
// apps/api/src/config/whatsapp.ts
export const whatsappConfig = {
  apiUrl: process.env.WHATSAPP_API_URL!,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN!,
  webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN!,
  version: 'v18.0'
};
```

**Rate Limits** :
- Messages : 80 messages/seconde
- API Calls : 1000 requêtes/5 minutes

**Pricing** :
- Gratuit : 1000 conversations/mois
- Payant : $0.005-$0.05 par conversation

---

### 2. OpenAI API (Parsing Commandes)

**URL** : https://api.openai.com/v1

**Modèle** : gpt-4-turbo (meilleur pour arabe)

**Configuration** :
```typescript
// apps/api/src/config/openai.ts
import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export const orderParserConfig = {
  model: 'gpt-4-turbo',
  temperature: 0.3, // Plus précis
  max_tokens: 500,
};
```

**Usage** :
```typescript
const response = await openai.chat.completions.create({
  model: orderParserConfig.model,
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: customerMessage }
  ],
  temperature: orderParserConfig.temperature,
});
```

**Pricing** :
- GPT-4 Turbo : $0.01/1K tokens input, $0.03/1K tokens output
- Budget estimé : ~$20-50/mois pour 1000 commandes

---

### 3. Cloudinary (Storage Images)

**Configuration** :
```typescript
// apps/api/src/config/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export default cloudinary;
```

**Usage Upload** :
```typescript
const result = await cloudinary.uploader.upload(filePath, {
  folder: 'restaurants/menu',
  transformation: [
    { width: 800, height: 600, crop: 'fill' },
    { quality: 'auto', fetch_format: 'auto' }
  ]
});
```

**Pricing** :
- Free : 25 GB stockage, 25 GB bande passante
- Paid : $99/mois pour 100 GB

---

### 4. Paymob (Paiements Égypte)

**URL** : https://accept.paymob.com/api

**Flow** :
1. Créer order → `POST /api/ecommerce/orders`
2. Obtenir token → `POST /api/auth/tokens`
3. Générer payment key → `POST /api/acceptance/payment_keys`
4. Rediriger client → `https://accept.paymob.com/api/acceptance/iframes/{iframe_id}?payment_token={token}`
5. Webhook callback → `POST /webhooks/paymob`

**Configuration** :
```typescript
// apps/api/src/config/paymob.ts
export const paymobConfig = {
  apiKey: process.env.PAYMOB_API_KEY!,
  integrationId: process.env.PAYMOB_INTEGRATION_ID!,
  iframeId: process.env.PAYMOB_IFRAME_ID!,
  hmacSecret: process.env.PAYMOB_HMAC_SECRET!,
};
```

**Pricing** :
- Commission : 2.75% + 1 EGP par transaction

---

## 🗄️ Base de Données

### PostgreSQL Configuration

**Version** : 15.x

**Extensions** :
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- Fuzzy search
CREATE EXTENSION IF NOT EXISTS "btree_gin";  -- Index performance
```

**Connection Pool** :
```prisma
// apps/api/prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Connection string format:
// postgresql://user:password@host:5432/database?schema=public&pool_timeout=60&connection_limit=10
```

**Backup Strategy** :
```bash
# Daily automated backups
0 2 * * * pg_dump -U postgres whatsorder > backup_$(date +\%Y\%m\%d).sql

# Retention: 7 jours local, 30 jours S3
```

### Redis Configuration

**Version** : 7.x

**Usage** :
```typescript
// apps/api/src/config/redis.ts
import Redis from 'ioredis';

export const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

// Namespaces
export const CACHE_PREFIX = 'cache:';
export const SESSION_PREFIX = 'session:';
export const RATELIMIT_PREFIX = 'ratelimit:';
```

**Eviction Policy** :
- `maxmemory-policy: allkeys-lru`
- `maxmemory: 256mb`

---

## 🔐 Sécurité

### 1. Authentification (JWT)

**Token Structure** :
```typescript
// Payload
interface JWTPayload {
  userId: string;
  restaurantId: string;
  role: UserRole;
  iat: number;  // Issued at
  exp: number;  // Expiration
}

// Generation
import jwt from 'jsonwebtoken';

const token = jwt.sign(
  { userId, restaurantId, role },
  process.env.JWT_SECRET!,
  { expiresIn: '7d' }
);

// Verification
const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
```

**Storage** :
- Frontend : httpOnly cookie (sécurisé)
- Mobile : Secure Storage (AsyncStorage encrypted)

---

### 2. Authorization (RBAC)

**Rôles** :
```typescript
enum UserRole {
  OWNER    = 'OWNER',    // Tous les droits
  MANAGER  = 'MANAGER',  // Gestion complète sauf billing
  STAFF    = 'STAFF',    // Vue commandes + inbox
  DELIVERY = 'DELIVERY', // Vue commandes assignées uniquement
}

// Middleware
const requireRole = (roles: UserRole[]) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

// Usage
router.delete('/menu/:id', requireRole([UserRole.OWNER, UserRole.MANAGER]), deleteMenuItem);
```

---

### 3. Rate Limiting

**Configuration** :
```typescript
// apps/api/src/middleware/rate-limit.middleware.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '@/config/redis';

// API général
export const apiLimiter = rateLimit({
  store: new RedisStore({ client: redis }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par IP
  message: 'Trop de requêtes, réessayez plus tard',
});

// Auth endpoints (plus strict)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 tentatives login
  message: 'Trop de tentatives, veuillez patienter',
});

// WhatsApp webhook (très permissif)
export const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 1000,
});
```

---

### 4. Input Validation (Zod)

**Schémas** :
```typescript
// apps/api/src/validation/order.schema.ts
import { z } from 'zod';

export const createOrderSchema = z.object({
  items: z.array(z.object({
    menuItemId: z.string().cuid(),
    quantity: z.number().int().min(1).max(99),
    variant: z.string().optional(),
    modifiers: z.array(z.string()).optional(),
  })).min(1),
  
  deliveryType: z.enum(['DELIVERY', 'PICKUP', 'DINE_IN']),
  
  address: z.string().min(10).optional(),
  
  customerInfo: z.object({
    name: z.string().min(2).max(100),
    phone: z.string().regex(/^\+20\d{10}$/), // Format EG
  }),
});

// Middleware validation
const validate = (schema: z.ZodSchema) => {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({ error: error.errors });
    }
  };
};

// Usage
router.post('/orders', validate(createOrderSchema), createOrder);
```

---

### 5. CORS

**Configuration** :
```typescript
// apps/api/src/app.ts
import cors from 'cors';

app.use(cors({
  origin: [
    process.env.FRONTEND_URL!,
    'https://whatsorder.com',
    'https://www.whatsorder.com',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

---

### 6. Helmet (Security Headers)

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
  },
}));
```

---

### 7. SQL Injection Prevention

**Prisma automatique** :
```typescript
// ✅ Safe (Prisma parameterized queries)
const user = await prisma.user.findUnique({
  where: { email: userEmail }
});

// ❌ Danger (raw SQL - éviter)
const users = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${userEmail}
`;
```

---

## ⚡ Performance

### 1. Database Optimization

**Indexes** :
```prisma
// prisma/schema.prisma

model Order {
  id           String @id @default(cuid())
  orderNumber  String @unique
  restaurantId String
  customerId   String
  status       OrderStatus
  createdAt    DateTime @default(now())
  
  @@index([restaurantId])           // Queries par restaurant
  @@index([customerId])              // Historique client
  @@index([status])                  // Filtres statut
  @@index([createdAt])               // Tri chronologique
  @@index([restaurantId, status])    // Composite frequent
}
```

**Query Optimization** :
```typescript
// ❌ N+1 Problem
const orders = await prisma.order.findMany();
for (const order of orders) {
  const customer = await prisma.customer.findUnique({ 
    where: { id: order.customerId } 
  });
}

// ✅ Solution: Include
const orders = await prisma.order.findMany({
  include: {
    customer: true,
    items: {
      include: { menuItem: true }
    }
  }
});
```

---

### 2. Caching Strategy

**Redis Layers** :
```typescript
// Layer 1: Cache queries fréquentes (5 min)
async function getRestaurantMenu(slug: string) {
  const cacheKey = `menu:${slug}`;
  
  // Check cache
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  // Query DB
  const menu = await prisma.restaurant.findUnique({
    where: { slug },
    include: {
      categories: {
        include: { menuItems: true }
      }
    }
  });
  
  // Set cache (5 min TTL)
  await redis.setex(cacheKey, 300, JSON.stringify(menu));
  
  return menu;
}

// Layer 2: Cache expensive computations (30 min)
async function getAnalytics(restaurantId: string, dateRange: DateRange) {
  const cacheKey = `analytics:${restaurantId}:${dateRange.start}:${dateRange.end}`;
  
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  const analytics = await computeAnalytics(restaurantId, dateRange);
  
  await redis.setex(cacheKey, 1800, JSON.stringify(analytics));
  
  return analytics;
}
```

**Cache Invalidation** :
```typescript
// Invalider cache quand menu modifié
async function updateMenuItem(id: string, data: any) {
  const item = await prisma.menuItem.update({ where: { id }, data });
  
  // Invalider cache restaurant
  await redis.del(`menu:${item.restaurant.slug}`);
  
  return item;
}
```

---

### 3. Asset Optimization

**Images** :
```typescript
// Upload avec compression automatique
import sharp from 'sharp';

async function uploadMenuImage(file: Express.Multer.File) {
  // Compress & resize
  const buffer = await sharp(file.buffer)
    .resize(800, 600, { fit: 'cover' })
    .jpeg({ quality: 85 })
    .toBuffer();
  
  // Upload to Cloudinary
  const result = await cloudinary.uploader.upload_stream({
    folder: 'menu',
    transformation: [
      { quality: 'auto', fetch_format: 'auto' } // Auto WebP
    ]
  });
  
  return result.secure_url;
}
```

**Next.js Image Optimization** :
```typescript
import Image from 'next/image';

<Image
  src={menuItem.image}
  alt={menuItem.name}
  width={400}
  height={300}
  loading="lazy"
  placeholder="blur"
  blurDataURL={menuItem.blurHash}
/>
```

---

### 4. API Response Time

**Target** : < 200ms p95

**Monitoring** :
```typescript
// Middleware timing
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('API Request', {
      method: req.method,
      path: req.path,
      duration,
      status: res.statusCode,
    });
    
    // Alert si > 1s
    if (duration > 1000) {
      logger.warn('Slow API request', { method: req.method, path: req.path, duration });
    }
  });
  
  next();
});
```

---

## 📈 Scalabilité

### 1. Horizontal Scaling

**Load Balancer** :
```nginx
# nginx.conf
upstream api_servers {
  least_conn;  # Load balancing strategy
  server api1:4000;
  server api2:4000;
  server api3:4000;
}

server {
  listen 80;
  location /api {
    proxy_pass http://api_servers;
  }
}
```

---

### 2. Database Scaling

**Read Replicas** :
```typescript
// Prisma avec read replicas
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL // Write
    }
  }
});

const prismaRead = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_READ_URL // Read replica
    }
  }
});

// Usage
async function getOrders() {
  return prismaRead.order.findMany(); // Read from replica
}

async function createOrder(data) {
  return prisma.order.create({ data }); // Write to master
}
```

---

### 3. Job Queue Scaling

**Bull Workers** :
```typescript
// Multiple workers
import Queue from 'bull';

const messageQueue = new Queue('messages', {
  redis: redisConfig,
});

// Worker 1 (messages)
messageQueue.process('send-message', 5, async (job) => {
  await sendWhatsAppMessage(job.data);
});

// Worker 2 (workflows)
const workflowQueue = new Queue('workflows', {
  redis: redisConfig,
});

workflowQueue.process('execute', 3, async (job) => {
  await executeWorkflow(job.data);
});
```

---

### 4. CDN

**Cloudflare** :
- Cache static assets
- DDoS protection
- Edge caching
- Auto minification

---

## 🔍 Monitoring & Logging

### Winston Logger

```typescript
// apps/api/src/utils/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
```

---

### Health Checks

```typescript
// apps/api/src/routes/health.ts
router.get('/health', async (req, res) => {
  const checks = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: 'checking',
      redis: 'checking',
      whatsapp: 'checking',
    }
  };
  
  // Check DB
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.services.database = 'up';
  } catch (error) {
    checks.services.database = 'down';
    checks.status = 'degraded';
  }
  
  // Check Redis
  try {
    await redis.ping();
    checks.services.redis = 'up';
  } catch (error) {
    checks.services.redis = 'down';
    checks.status = 'degraded';
  }
  
  // Check WhatsApp
  try {
    await whatsappService.getConnectionStatus();
    checks.services.whatsapp = 'connected';
  } catch (error) {
    checks.services.whatsapp = 'disconnected';
  }
  
  const statusCode = checks.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(checks);
});
```

---

## 📦 Déploiement

### Environments

| Env | URL | Database | Purpose |
|-----|-----|----------|---------|
| Development | localhost:3000 | Local PostgreSQL | Dev local |
| Staging | staging.whatsorder.com | Staging DB | Tests pré-prod |
| Production | whatsorder.com | Production DB | Prod live |

---

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        
      - name: Install dependencies
        run: pnpm install
        
      - name: Run tests
        run: pnpm test
        
      - name: Build
        run: pnpm build
        
      - name: Deploy to Railway
        run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

**Dernière mise à jour** : 11 janvier 2026  
**Mainteneur** : [Votre Nom]
