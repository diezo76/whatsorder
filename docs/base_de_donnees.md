# 🗄️ Base de Données - WhatsOrder Clone

**Version** : 1.0.0  
**Date** : 11 janvier 2026  
**SGBD** : PostgreSQL 15.x

---

## 📋 Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Schéma Prisma Complet](#schéma-prisma-complet)
3. [Diagramme ERD](#diagramme-erd)
4. [Explications des Relations](#explications-des-relations)
5. [Exemples de Queries](#exemples-de-queries)
6. [Stratégie d'Indexation](#stratégie-dindexation)
7. [Migrations](#migrations)
8. [Seed Data](#seed-data)

---

## 🎯 Vue d'Ensemble

### Principes de Design

1. **Multi-tenant** : Chaque restaurant = tenant isolé
2. **Soft Deletes** : Pas de suppression physique (traçabilité)
3. **Audit Trail** : Timestamps (createdAt, updatedAt) partout
4. **JSON Flexibility** : Champs JSON pour données variables (modifiers, variants)
5. **Indexes Stratégiques** : Performance queries fréquentes

### Tables Principales (12)

| Table | Rôle | Relations |
|-------|------|-----------|
| `Restaurant` | Info restaurant | → Users, MenuItems, Orders |
| `User` | Utilisateurs (admin/staff) | → Restaurant, Orders, Notes |
| `Category` | Catégories menu | → Restaurant, MenuItems |
| `MenuItem` | Produits menu | → Category, OrderItems |
| `Customer` | Clients finaux | → Restaurant, Orders, Conversations |
| `Order` | Commandes | → Customer, Restaurant, OrderItems |
| `OrderItem` | Lignes de commande | → Order, MenuItem |
| `Conversation` | Conversations WhatsApp | → Customer, Messages |
| `Message` | Messages WhatsApp | → Conversation |
| `InternalNote` | Notes internes équipe | → Order/Conversation, User |
| `Workflow` | Workflows automatiques | → Restaurant, Executions |
| `Campaign` | Campagnes marketing | → Restaurant |

---

## 📄 Schéma Prisma Complet

### Fichier : `apps/api/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// 🏢 RESTAURANT & USERS
// ============================================

model Restaurant {
  id            String   @id @default(cuid())
  slug          String   @unique
  name          String
  description   String?  @db.Text
  logo          String?
  coverImage    String?
  
  // Contact
  phone         String
  email         String?
  address       String
  city          String
  country       String   @default("EG")
  
  // Horaires (JSON format)
  // Exemple: { "monday": { "open": "09:00", "close": "22:00" }, ... }
  openingHours  Json
  
  // Zones livraison (JSON array)
  // Exemple: [{ "name": "Zone 1", "radius": 5, "fee": 15 }, ...]
  deliveryZones Json
  
  minOrderAmount Decimal @db.Decimal(10, 2) @default(0)
  
  // Branding
  primaryColor  String   @default("#25D366")
  accentColor   String   @default("#128C7E")
  
  // WhatsApp
  whatsappNumber     String
  whatsappAccountId  String?
  whatsappToken      String?  @db.Text
  
  // Status
  isActive      Boolean  @default(true)
  isPremium     Boolean  @default(false)
  
  // Relations
  users         User[]
  categories    Category[]
  menuItems     MenuItem[]
  orders        Order[]
  customers     Customer[]
  workflows     Workflow[]
  campaigns     Campaign[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([slug])
  @@index([isActive])
  @@index([country])
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String
  password      String   // Hashed with bcrypt
  role          UserRole @default(STAFF)
  avatar        String?
  phone         String?
  
  restaurantId  String
  restaurant    Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  
  // Relations
  assignedOrders Order[]  @relation("AssignedOrders")
  notes         InternalNote[]
  
  lastActiveAt  DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([restaurantId])
  @@index([email])
  @@index([role])
}

enum UserRole {
  OWNER     // Tous droits
  MANAGER   // Gestion complète sauf billing
  STAFF     // Vue commandes + inbox
  DELIVERY  // Vue commandes assignées
}

// ============================================
// 🍽️ MENU
// ============================================

model Category {
  id            String   @id @default(cuid())
  name          String
  nameAr        String?
  description   String?
  icon          String?
  sortOrder     Int      @default(0)
  isActive      Boolean  @default(true)
  
  restaurantId  String
  restaurant    Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  
  menuItems     MenuItem[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([restaurantId])
  @@index([sortOrder])
  @@index([isActive])
}

model MenuItem {
  id            String   @id @default(cuid())
  name          String
  nameAr        String?
  description   String?  @db.Text
  descriptionAr String?  @db.Text
  
  image         String?
  price         Decimal  @db.Decimal(10, 2)
  
  // Badges
  isPopular     Boolean  @default(false)
  isNew         Boolean  @default(false)
  isVegetarian  Boolean  @default(false)
  isSpicy       Boolean  @default(false)
  
  // Disponibilité
  isAvailable   Boolean  @default(true)
  
  // Modificateurs & Variantes (JSON)
  // Exemple modifiers: { "Size": ["Small", "Medium", "Large"] }
  // Exemple variants: { "Small": 30, "Medium": 45, "Large": 60 }
  modifiers     Json?
  variants      Json?
  
  categoryId    String
  category      Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  
  restaurantId  String
  restaurant    Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  
  orderItems    OrderItem[]
  
  sortOrder     Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([restaurantId])
  @@index([categoryId])
  @@index([isAvailable])
  @@index([isPopular])
}

// ============================================
// 👥 CUSTOMERS
// ============================================

model Customer {
  id            String   @id @default(cuid())
  phone         String
  name          String?
  email         String?
  
  // Profil
  language      String   @default("ar")
  tags          String[]
  notes         String?  @db.Text
  
  // Stats (denormalized pour performance)
  totalOrders   Int      @default(0)
  totalSpent    Decimal  @db.Decimal(10, 2) @default(0)
  avgOrderValue Decimal  @db.Decimal(10, 2) @default(0)
  lastOrderAt   DateTime?
  
  restaurantId  String
  restaurant    Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  
  orders        Order[]
  conversations Conversation[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@unique([phone, restaurantId])
  @@index([restaurantId])
  @@index([phone])
  @@index([lastOrderAt])
}

// ============================================
// 📦 ORDERS
// ============================================

model Order {
  id            String   @id @default(cuid())
  orderNumber   String   @unique
  
  customerId    String
  customer      Customer @relation(fields: [customerId], references: [id])
  
  restaurantId  String
  restaurant    Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  
  // Items
  items         OrderItem[]
  
  // Montants
  subtotal      Decimal  @db.Decimal(10, 2)
  deliveryFee   Decimal  @db.Decimal(10, 2) @default(0)
  serviceFee    Decimal  @db.Decimal(10, 2) @default(0)
  discount      Decimal  @db.Decimal(10, 2) @default(0)
  total         Decimal  @db.Decimal(10, 2)
  
  // Livraison
  deliveryType  DeliveryType
  address       String?
  instructions  String?  @db.Text
  
  // Statut
  status        OrderStatus @default(PENDING)
  // Timeline statuts (JSON array)
  // Exemple: [{ "status": "CONFIRMED", "timestamp": "...", "by": "userId" }]
  statusHistory Json     @default("[]")
  
  // Assignment
  assignedToId  String?
  assignedTo    User?    @relation("AssignedOrders", fields: [assignedToId], references: [id])
  
  // Paiement
  paymentMethod PaymentMethod @default(CASH_ON_DELIVERY)
  paymentStatus PaymentStatus @default(PENDING)
  paymentId     String?
  paidAt        DateTime?
  
  // Source
  source        OrderSource @default(WHATSAPP)
  conversationId String?
  conversation  Conversation? @relation(fields: [conversationId], references: [id])
  
  // Notes internes
  notes         InternalNote[]
  
  // Timestamps
  confirmedAt   DateTime?
  preparingAt   DateTime?
  readyAt       DateTime?
  deliveredAt   DateTime?
  cancelledAt   DateTime?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([restaurantId])
  @@index([customerId])
  @@index([orderNumber])
  @@index([status])
  @@index([createdAt])
  @@index([restaurantId, status])
  @@index([restaurantId, createdAt])
}

model OrderItem {
  id            String   @id @default(cuid())
  
  orderId       String
  order         Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  menuItemId    String
  menuItem      MenuItem @relation(fields: [menuItemId], references: [id])
  
  quantity      Int
  unitPrice     Decimal  @db.Decimal(10, 2)
  totalPrice    Decimal  @db.Decimal(10, 2)
  
  // Personnalisation (JSON)
  // Exemple: { "variant": "Medium", "modifiers": ["Extra Cheese"], "notes": "No onions" }
  customization Json?
  
  @@index([orderId])
  @@index([menuItemId])
}

enum DeliveryType {
  DELIVERY
  PICKUP
  DINE_IN
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PREPARING
  READY
  OUT_FOR_DELIVERY
  DELIVERED
  CANCELLED
  REFUNDED
}

enum PaymentMethod {
  CASH_ON_DELIVERY
  CARD_ON_DELIVERY
  ONLINE_CARD
  FAWRY
  VODAFONE_CASH
  MOBILE_WALLET
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

enum OrderSource {
  WHATSAPP
  WEB
  QR_CODE
  PHONE
  WALK_IN
}

// ============================================
// 💬 CONVERSATIONS (WhatsApp)
// ============================================

model Conversation {
  id            String   @id @default(cuid())
  waConversationId String @unique
  
  customerId    String
  customer      Customer @relation(fields: [customerId], references: [id])
  
  restaurantId  String
  
  status        ConversationStatus @default(OPEN)
  
  messages      Message[]
  orders        Order[]
  notes         InternalNote[]
  
  lastMessageAt DateTime @default(now())
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([customerId])
  @@index([restaurantId])
  @@index([status])
  @@index([lastMessageAt])
}

model Message {
  id            String   @id @default(cuid())
  waMessageId   String   @unique
  
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  
  direction     Direction
  type          MessageType @default(TEXT)
  
  content       String?  @db.Text
  mediaUrl      String?
  
  status        MessageStatus @default(SENT)
  
  timestamp     DateTime
  deliveredAt   DateTime?
  readAt        DateTime?
  
  createdAt     DateTime @default(now())
  
  @@index([conversationId])
  @@index([waMessageId])
  @@index([timestamp])
}

enum ConversationStatus {
  OPEN
  PENDING
  RESOLVED
}

enum Direction {
  INBOUND
  OUTBOUND
}

enum MessageType {
  TEXT
  IMAGE
  VIDEO
  AUDIO
  DOCUMENT
  ORDER
  TEMPLATE
}

enum MessageStatus {
  SENT
  DELIVERED
  READ
  FAILED
}

model InternalNote {
  id            String   @id @default(cuid())
  content       String   @db.Text
  
  orderId       String?
  order         Order?   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  conversationId String?
  conversation   Conversation? @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  
  authorId      String
  author        User     @relation(fields: [authorId], references: [id])
  
  createdAt     DateTime @default(now())
  
  @@index([orderId])
  @@index([conversationId])
  @@index([authorId])
}

// ============================================
// ⚙️ AUTOMATION
// ============================================

model Workflow {
  id            String   @id @default(cuid())
  name          String
  description   String?
  
  restaurantId  String
  restaurant    Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  
  // Configuration (JSON)
  // trigger: { type: "new_order", conditions: {...} }
  // actions: [{ type: "send_message", config: {...} }, ...]
  trigger       Json
  conditions    Json?
  actions       Json
  
  isActive      Boolean  @default(true)
  
  executions    WorkflowExecution[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([restaurantId])
  @@index([isActive])
}

model WorkflowExecution {
  id            String   @id @default(cuid())
  
  workflowId    String
  workflow      Workflow @relation(fields: [workflowId], references: [id], onDelete: Cascade)
  
  status        ExecutionStatus
  error         String?  @db.Text
  logs          Json?
  
  startedAt     DateTime @default(now())
  completedAt   DateTime?
  
  @@index([workflowId])
  @@index([status])
  @@index([startedAt])
}

enum ExecutionStatus {
  RUNNING
  COMPLETED
  FAILED
}

model Campaign {
  id            String   @id @default(cuid())
  name          String
  
  restaurantId  String
  restaurant    Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  
  message       String   @db.Text
  mediaUrl      String?
  
  // Filtres audience (JSON)
  // Exemple: { "tags": ["VIP"], "minOrders": 5, "lastOrderDays": 30 }
  targetFilter  Json
  
  status        CampaignStatus @default(DRAFT)
  scheduledAt   DateTime?
  sentAt        DateTime?
  
  // Stats
  totalSent     Int      @default(0)
  totalDelivered Int     @default(0)
  totalRead     Int      @default(0)
  totalFailed   Int      @default(0)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([restaurantId])
  @@index([status])
  @@index([scheduledAt])
}

enum CampaignStatus {
  DRAFT
  SCHEDULED
  SENDING
  SENT
  PAUSED
}

// ============================================
// 📊 ANALYTICS
// ============================================

model DailyAnalytics {
  id            String   @id @default(cuid())
  date          DateTime @db.Date
  
  restaurantId  String
  
  // Orders
  totalOrders   Int      @default(0)
  completedOrders Int    @default(0)
  cancelledOrders Int    @default(0)
  
  // Revenue
  totalRevenue  Decimal  @db.Decimal(10, 2) @default(0)
  avgOrderValue Decimal  @db.Decimal(10, 2) @default(0)
  
  // Customers
  newCustomers  Int      @default(0)
  returningCustomers Int @default(0)
  
  // Messages
  totalMessages Int      @default(0)
  inboundMessages Int    @default(0)
  outboundMessages Int   @default(0)
  
  // Performance
  avgPreparationTime Int @default(0) // minutes
  avgDeliveryTime Int    @default(0) // minutes
  
  createdAt     DateTime @default(now())
  
  @@unique([restaurantId, date])
  @@index([restaurantId])
  @@index([date])
}
```

---

## 📊 Diagramme ERD (Entity-Relationship)

```
┌─────────────────┐
│   Restaurant    │
│─────────────────│
│ id (PK)         │
│ slug (UNIQUE)   │
│ name            │
│ ...             │
└────┬────────────┘
     │
     │ 1:N
     │
     ├──────────────────┬──────────────────┬──────────────────┬──────────────
     │                  │                  │                  │
     ▼                  ▼                  ▼                  ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐
│    User     │  │  Category   │  │  Customer   │  │   Workflow   │
│─────────────│  │─────────────│  │─────────────│  │──────────────│
│ id (PK)     │  │ id (PK)     │  │ id (PK)     │  │ id (PK)      │
│ email       │  │ name        │  │ phone       │  │ name         │
│ role        │  │ ...         │  │ ...         │  │ trigger(JSON)│
│ ...         │  └──┬──────────┘  └──┬──────────┘  └──────────────┘
└─────────────┘     │                │
                    │ 1:N            │ 1:N
                    ▼                ▼
              ┌─────────────┐  ┌─────────────┐
              │  MenuItem   │  │    Order    │
              │─────────────│  │─────────────│
              │ id (PK)     │  │ id (PK)     │
              │ name        │  │ orderNumber │
              │ price       │  │ status      │
              │ variants    │◄─┤ ...         │
              │ ...         │  └──┬──────────┘
              └──┬──────────┘     │
                 │                │ 1:N
                 │ N:M            ▼
                 │          ┌──────────────┐
                 └─────────►│  OrderItem   │
                            │──────────────│
                            │ id (PK)      │
                            │ quantity     │
                            │ unitPrice    │
                            └──────────────┘

┌──────────────┐
│ Conversation │
│──────────────│
│ id (PK)      │
│ customerId   ├──┐
│ ...          │  │ 1:N
└──┬───────────┘  │
   │              ▼
   │ 1:N    ┌──────────────┐
   └───────►│   Message    │
            │──────────────│
            │ id (PK)      │
            │ content      │
            │ direction    │
            └──────────────┘
```

---

## 🔗 Explications des Relations

### 1. Restaurant → Users (1:N)
**Pourquoi** : Un restaurant a plusieurs utilisateurs (propriétaire, managers, staff).

**Cascade Delete** : Si restaurant supprimé → tous users supprimés.

**Query Exemple** :
```typescript
const restaurant = await prisma.restaurant.findUnique({
  where: { id: restaurantId },
  include: {
    users: {
      where: { role: 'STAFF' }
    }
  }
});
```

---

### 2. Restaurant → Categories → MenuItems (1:N → 1:N)
**Pourquoi** : Menu organisé en catégories, chaque catégorie contient plusieurs items.

**Cascade Delete** : Si restaurant supprimé → catégories et items supprimés.

**Query Exemple** :
```typescript
const menu = await prisma.restaurant.findUnique({
  where: { slug: 'nile-bites' },
  include: {
    categories: {
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        menuItems: {
          where: { isAvailable: true },
          orderBy: { sortOrder: 'asc' }
        }
      }
    }
  }
});
```

---

### 3. Customer → Orders (1:N)
**Pourquoi** : Un client peut passer plusieurs commandes.

**Pas de Cascade** : Si customer supprimé, orders conservées (historique).

**Query Exemple** :
```typescript
const customer = await prisma.customer.findUnique({
  where: { phone_restaurantId: { phone: '+201234567890', restaurantId } },
  include: {
    orders: {
      orderBy: { createdAt: 'desc' },
      take: 10
    }
  }
});
```

---

### 4. Order → OrderItems → MenuItem (1:N → N:1)
**Pourquoi** : Une commande contient plusieurs lignes (items). Chaque ligne référence un item du menu.

**Snapshot Prix** : unitPrice dans OrderItem préserve le prix au moment de la commande.

**Query Exemple** :
```typescript
const order = await prisma.order.findUnique({
  where: { id: orderId },
  include: {
    items: {
      include: {
        menuItem: {
          select: { name, image }
        }
      }
    }
  }
});
```

---

### 5. Conversation → Messages (1:N)
**Pourquoi** : Une conversation WhatsApp contient plusieurs messages.

**Cascade Delete** : Si conversation supprimée → messages supprimés.

**Query Exemple** :
```typescript
const conversation = await prisma.conversation.findUnique({
  where: { id: conversationId },
  include: {
    messages: {
      orderBy: { timestamp: 'asc' },
      take: 50
    }
  }
});
```

---

### 6. Workflow → WorkflowExecutions (1:N)
**Pourquoi** : Chaque exécution d'un workflow est loggée.

**Audit Trail** : Permet de tracer toutes les exécutions et débugger.

**Query Exemple** :
```typescript
const workflow = await prisma.workflow.findUnique({
  where: { id: workflowId },
  include: {
    executions: {
      orderBy: { startedAt: 'desc' },
      take: 20
    }
  }
});
```

---

## 🔎 Exemples de Queries Courantes

### 1. Menu Complet d'un Restaurant

```typescript
async function getRestaurantMenu(slug: string) {
  return prisma.restaurant.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      description: true,
      logo: true,
      openingHours: true,
      categories: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          name: true,
          nameAr: true,
          icon: true,
          menuItems: {
            where: { isAvailable: true },
            orderBy: { sortOrder: 'asc' },
            select: {
              id: true,
              name: true,
              nameAr: true,
              description: true,
              image: true,
              price: true,
              isPopular: true,
              isNew: true,
              variants: true,
              modifiers: true,
            }
          }
        }
      }
    }
  });
}
```

---

### 2. Commandes du Jour d'un Restaurant

```typescript
async function getTodayOrders(restaurantId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return prisma.order.findMany({
    where: {
      restaurantId,
      createdAt: { gte: today }
    },
    include: {
      customer: {
        select: { name: true, phone: true }
      },
      items: {
        include: {
          menuItem: {
            select: { name: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}
```

---

### 3. Top 10 Produits Vendus

```typescript
async function getTopProducts(restaurantId: string, days: number = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  
  const items = await prisma.orderItem.groupBy({
    by: ['menuItemId'],
    where: {
      order: {
        restaurantId,
        createdAt: { gte: since },
        status: { in: ['DELIVERED', 'COMPLETED'] }
      }
    },
    _sum: {
      quantity: true,
      totalPrice: true
    },
    orderBy: {
      _sum: {
        quantity: 'desc'
      }
    },
    take: 10
  });
  
  // Enrichir avec infos item
  const itemsWithDetails = await Promise.all(
    items.map(async (item) => {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: item.menuItemId },
        select: { name: true, image: true }
      });
      return {
        ...menuItem,
        quantitySold: item._sum.quantity,
        revenue: item._sum.totalPrice
      };
    })
  );
  
  return itemsWithDetails;
}
```

---

### 4. Clients Inactifs (> 30 jours)

```typescript
async function getInactiveCustomers(restaurantId: string, days: number = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  
  return prisma.customer.findMany({
    where: {
      restaurantId,
      lastOrderAt: { lt: since },
      totalOrders: { gt: 0 } // Au moins 1 commande avant
    },
    select: {
      id: true,
      name: true,
      phone: true,
      lastOrderAt: true,
      totalOrders: true,
      totalSpent: true
    },
    orderBy: { lastOrderAt: 'asc' }
  });
}
```

---

### 5. Analytics du Jour

```typescript
async function getDailyAnalytics(restaurantId: string, date: Date) {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);
  
  const [orders, revenue, newCustomers] = await Promise.all([
    // Total commandes
    prisma.order.count({
      where: {
        restaurantId,
        createdAt: { gte: dayStart, lte: dayEnd }
      }
    }),
    
    // Revenue total
    prisma.order.aggregate({
      where: {
        restaurantId,
        createdAt: { gte: dayStart, lte: dayEnd },
        status: { in: ['DELIVERED', 'COMPLETED'] }
      },
      _sum: { total: true }
    }),
    
    // Nouveaux clients
    prisma.customer.count({
      where: {
        restaurantId,
        createdAt: { gte: dayStart, lte: dayEnd }
      }
    })
  ]);
  
  return {
    date,
    totalOrders: orders,
    totalRevenue: revenue._sum.total || 0,
    newCustomers
  };
}
```

---

## 🚀 Stratégie d'Indexation

### Indexes Critiques (Performance)

```prisma
// Restaurant
@@index([slug])                    // Lookup by URL
@@index([isActive])                // Filter actifs
@@index([country])                 // Multi-country queries

// User
@@index([restaurantId])            // Scope par restaurant
@@index([email])                   // Login lookup
@@index([role])                    // Filter by role

// MenuItem
@@index([restaurantId])            // Scope restaurant
@@index([categoryId])              // List by category
@@index([isAvailable])             // Filter disponibles
@@index([isPopular])               // Featured items

// Customer
@@unique([phone, restaurantId])    // Unicité par restaurant
@@index([restaurantId])
@@index([phone])
@@index([lastOrderAt])             // Inactive customers

// Order
@@index([restaurantId])
@@index([customerId])
@@index([orderNumber])             // Lookup par numéro
@@index([status])                  // Kanban filters
@@index([createdAt])               // Timeline
@@index([restaurantId, status])    // Composite frequent
@@index([restaurantId, createdAt]) // Dashboard queries

// Message
@@index([conversationId])
@@index([waMessageId])
@@index([timestamp])
```

### Pourquoi ces Indexes ?

**Règle** : Indexer les colonnes fréquemment utilisées dans WHERE, ORDER BY, JOIN.

**Trade-off** : Index accélèrent lectures mais ralentissent écritures. Équilibre selon usage.

---

## 🔄 Migrations

### Créer Migration

```bash
# Après modification schema.prisma
pnpm prisma migrate dev --name add_workflow_table

# Appliquer en production
pnpm prisma migrate deploy
```

### Migration Exemple

```sql
-- Migration: 20260111000000_add_workflow_table

CREATE TABLE "Workflow" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "restaurantId" TEXT NOT NULL,
  "trigger" JSONB NOT NULL,
  "actions" JSONB NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Workflow_restaurantId_idx" ON "Workflow"("restaurantId");
CREATE INDEX "Workflow_isActive_idx" ON "Workflow"("isActive");

ALTER TABLE "Workflow" 
ADD CONSTRAINT "Workflow_restaurantId_fkey" 
FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") 
ON DELETE CASCADE ON UPDATE CASCADE;
```

---

## 🌱 Seed Data

### Fichier : `apps/api/prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');
  
  // 1. Créer Restaurant
  const restaurant = await prisma.restaurant.create({
    data: {
      slug: 'nile-bites',
      name: 'Nile Bites',
      description: 'Authentic Egyptian cuisine in Cairo',
      phone: '+201234567890',
      address: '123 Tahrir Street, Cairo',
      city: 'Cairo',
      country: 'EG',
      openingHours: {
        monday: { open: '09:00', close: '22:00' },
        tuesday: { open: '09:00', close: '22:00' },
        wednesday: { open: '09:00', close: '22:00' },
        thursday: { open: '09:00', close: '22:00' },
        friday: { open: '09:00', close: '23:00' },
        saturday: { open: '09:00', close: '23:00' },
        sunday: { open: '10:00', close: '21:00' }
      },
      deliveryZones: [
        { name: 'Zone 1 (< 3km)', radius: 3, fee: 10 },
        { name: 'Zone 2 (3-5km)', radius: 5, fee: 15 },
        { name: 'Zone 3 (5-10km)', radius: 10, fee: 25 }
      ],
      whatsappNumber: '+201234567890',
      isActive: true,
    }
  });
  
  console.log('✅ Restaurant created:', restaurant.name);
  
  // 2. Créer Admin User
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@nilebites.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'OWNER',
      restaurantId: restaurant.id,
    }
  });
  
  console.log('✅ Admin user created:', admin.email);
  
  // 3. Créer Catégories
  const categories = await prisma.category.createMany({
    data: [
      { name: 'Appetizers', nameAr: 'المقبلات', icon: '🥗', sortOrder: 1, restaurantId: restaurant.id },
      { name: 'Main Courses', nameAr: 'الأطباق الرئيسية', icon: '🍽️', sortOrder: 2, restaurantId: restaurant.id },
      { name: 'Grills', nameAr: 'المشويات', icon: '🍖', sortOrder: 3, restaurantId: restaurant.id },
      { name: 'Desserts', nameAr: 'الحلويات', icon: '🍰', sortOrder: 4, restaurantId: restaurant.id },
      { name: 'Beverages', nameAr: 'المشروبات', icon: '🥤', sortOrder: 5, restaurantId: restaurant.id },
    ]
  });
  
  console.log('✅ Categories created');
  
  // 4. Récupérer IDs catégories
  const appetizersCat = await prisma.category.findFirst({
    where: { name: 'Appetizers', restaurantId: restaurant.id }
  });
  const mainCoursesCat = await prisma.category.findFirst({
    where: { name: 'Main Courses', restaurantId: restaurant.id }
  });
  
  // 5. Créer Menu Items
  const menuItems = [
    // Appetizers
    {
      name: 'Hummus',
      nameAr: 'حمص',
      description: 'Creamy chickpea dip with tahini',
      descriptionAr: 'حمص كريمي مع الطحينة',
      image: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8',
      price: 25,
      isPopular: true,
      categoryId: appetizersCat!.id,
      restaurantId: restaurant.id,
    },
    {
      name: 'Baba Ganoush',
      nameAr: 'بابا غنوج',
      description: 'Smoky grilled eggplant dip',
      descriptionAr: 'باذنجان مشوي مدخن',
      image: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9',
      price: 28,
      categoryId: appetizersCat!.id,
      restaurantId: restaurant.id,
    },
    
    // Main Courses
    {
      name: 'Koshary',
      nameAr: 'كشري',
      description: 'Traditional Egyptian rice, pasta & lentils',
      descriptionAr: 'أرز وعدس ومكرونة مصري تقليدي',
      image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0',
      price: 35,
      isPopular: true,
      variants: {
        Small: 35,
        Medium: 45,
        Large: 55
      },
      categoryId: mainCoursesCat!.id,
      restaurantId: restaurant.id,
    },
    {
      name: 'Ful Medames',
      nameAr: 'فول مدمس',
      description: 'Slow-cooked fava beans',
      descriptionAr: 'فول مصري أصيل',
      image: 'https://images.unsplash.com/photo-1599484743008-33a5a2f37c82',
      price: 20,
      categoryId: mainCoursesCat!.id,
      restaurantId: restaurant.id,
    },
  ];
  
  for (const item of menuItems) {
    await prisma.menuItem.create({ data: item });
  }
  
  console.log('✅ Menu items created');
  
  // 6. Créer Customer de test
  const customer = await prisma.customer.create({
    data: {
      phone: '+201111111111',
      name: 'Ahmed Hassan',
      restaurantId: restaurant.id,
    }
  });
  
  console.log('✅ Test customer created');
  
  console.log('🎉 Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Exécuter Seed

```bash
pnpm prisma db seed
```

---

**Dernière mise à jour** : 11 janvier 2026  
**Version** : 1.0.0
