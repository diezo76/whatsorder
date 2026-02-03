# 📋 Compte Rendu - Mise à Jour Schéma Prisma pour Inbox WhatsApp Avancée

**Date** : 11 janvier 2026  
**Agent** : Composer (Cursor AI)  
**Statut** : ✅ Schéma Prisma mis à jour avec succès pour inbox professionnelle inspirée de Take.app

---

## 🎯 Objectif

Transformer le schéma Prisma pour supporter une inbox WhatsApp professionnelle avec :
- Statuts de conversation avancés (Open, Closed, Resolved, Spam)
- Système d'assignation staff avec notifications
- Templates de messages réutilisables
- WhatsApp Broadcast (envoi groupé)
- Métadonnées enrichies (priorités, tags, notes internes)

---

## ✅ Modifications Effectuées

### 1. Nouveaux Enums Ajoutés ✅

**Fichier** : `apps/web/prisma/schema.prisma`

#### `ConversationStatus` ✅
```prisma
enum ConversationStatus {
  OPEN          // Conversation active
  CLOSED        // Conversation fermée
  RESOLVED      // Problème résolu
  SPAM          // Spam/indésirable
}
```

#### `ConversationPriority` ✅
```prisma
enum ConversationPriority {
  LOW
  NORMAL
  HIGH
  URGENT
}
```

#### `MessageType` ✅
```prisma
enum MessageType {
  TEXT
  IMAGE
  VIDEO
  AUDIO
  DOCUMENT
  LOCATION
  ORDER_LINK      // Lien vers une commande
  TEMPLATE        // Message template
}
```

#### `BroadcastStatus` ✅
```prisma
enum BroadcastStatus {
  DRAFT         // Brouillon
  SCHEDULED     // Planifié
  SENDING       // En cours d'envoi
  SENT          // Envoyé
  FAILED        // Échoué
}
```

#### `MessageSender` ✅
```prisma
enum MessageSender {
  CUSTOMER
  STAFF
  SYSTEM
}
```

---

### 2. Modèle Conversation - Mise à Jour Complète ✅

**Champs ajoutés** :
- ✅ `status: ConversationStatus` (défaut: OPEN)
- ✅ `priority: ConversationPriority` (défaut: NORMAL)
- ✅ `assignedToId: String?` - ID du staff assigné
- ✅ `assignedAt: DateTime?` - Date d'assignation
- ✅ `isUnread: Boolean` (défaut: true)
- ✅ `closedAt: DateTime?` - Date de fermeture
- ✅ `closedById: String?` - User qui a fermé
- ✅ `tags: String[]` - Tags/Labels pour organisation
- ✅ `internalNotes: String?` - Notes internes (staff uniquement)

**Champs modifiés** :
- ✅ `customerPhone: String` - Remplacé `whatsappPhone` (plus explicite)
- ✅ `customerId: String?` - Rendu optionnel (conversations sans client enregistré)

**Relations ajoutées** :
- ✅ `assignedTo: User?` - Staff assigné à la conversation
- ✅ `closedBy: User?` - User qui a fermé la conversation

**Index ajoutés** :
- ✅ `@@index([customerPhone])`
- ✅ `@@index([status])`
- ✅ `@@index([assignedToId])`
- ✅ `@@index([lastMessageAt])`

---

### 3. Modèle Message - Enrichissement ✅

**Champs ajoutés** :
- ✅ `type: MessageType` (défaut: TEXT)
- ✅ `sender: MessageSender` - **REQUIS** (CUSTOMER, STAFF, SYSTEM)
- ✅ `isRead: Boolean` (défaut: false)
- ✅ `readAt: DateTime?`
- ✅ `isSystemMessage: Boolean` (défaut: false)
- ✅ `metadata: Json?` - Données additionnelles (template, broadcast, etc.)

**Champs conservés pour compatibilité** :
- ✅ `direction: String?` - Déprécié mais conservé (utiliser `sender` à la place)
- ✅ `mediaUrl: String?`
- ✅ `status: String?` - Statut d'envoi WhatsApp

**Index ajoutés** :
- ✅ `@@index([createdAt])`

---

### 4. Nouveau Modèle : MessageTemplate ✅

**Fichier** : `apps/web/prisma/schema.prisma`

**Champs** :
- ✅ `id: String` (UUID)
- ✅ `restaurantId: String`
- ✅ `name: String` - Nom du template (ex: "Confirmation commande")
- ✅ `category: String` - Catégorie (ex: "Orders", "Support", "Marketing")
- ✅ `content: String` - Contenu avec variables {{nom}}, {{total}}, etc.
- ✅ `contentAr: String?` - Version arabe
- ✅ `variables: String[]` - Variables disponibles
- ✅ `usageCount: Int` - Statistiques d'utilisation
- ✅ `lastUsedAt: DateTime?`
- ✅ `isActive: Boolean` (défaut: true)

**Relations** :
- ✅ `restaurant: Restaurant`

**Index** :
- ✅ `@@index([restaurantId])`
- ✅ `@@index([category])`

---

### 5. Nouveau Modèle : Broadcast ✅

**Fichier** : `apps/web/prisma/schema.prisma`

**Champs** :
- ✅ `id: String` (UUID)
- ✅ `restaurantId: String`
- ✅ `name: String` - Nom du broadcast (ex: "Promo Weekend")
- ✅ `message: String` - Contenu du message
- ✅ `messageAr: String?` - Version arabe
- ✅ `targetAudience: Json` - Segmentation (filtres pour destinataires)
- ✅ `recipientCount: Int` - Nombre de destinataires
- ✅ `sentCount: Int` - Nombre envoyé
- ✅ `deliveredCount: Int` - Nombre livré
- ✅ `readCount: Int` - Nombre lu
- ✅ `respondedCount: Int` - Nombre de réponses
- ✅ `status: BroadcastStatus` (défaut: DRAFT)
- ✅ `scheduledAt: DateTime?` - Date de planification
- ✅ `sentAt: DateTime?` - Date d'envoi
- ✅ `createdById: String` - Créateur du broadcast

**Relations** :
- ✅ `restaurant: Restaurant`
- ✅ `createdBy: User`
- ✅ `recipients: BroadcastRecipient[]`

**Index** :
- ✅ `@@index([restaurantId])`
- ✅ `@@index([status])`

---

### 6. Nouveau Modèle : BroadcastRecipient ✅

**Fichier** : `apps/web/prisma/schema.prisma`

**Champs** :
- ✅ `id: String` (UUID)
- ✅ `broadcastId: String`
- ✅ `customerId: String`
- ✅ `customerPhone: String`
- ✅ `status: String` (défaut: "pending") - pending, sent, delivered, read, failed
- ✅ `sentAt: DateTime?`
- ✅ `deliveredAt: DateTime?`
- ✅ `readAt: DateTime?`
- ✅ `errorMessage: String?`

**Relations** :
- ✅ `broadcast: Broadcast`
- ✅ `customer: Customer`

**Index** :
- ✅ `@@index([broadcastId])`
- ✅ `@@index([customerId])`

---

### 7. Modèle User - Enrichissement ✅

**Champs ajoutés** :
- ✅ `notifyOnNewMessage: Boolean` (défaut: true)
- ✅ `notifyOnAssignment: Boolean` (défaut: true)
- ✅ `isActive: Boolean` (défaut: true)
- ✅ `lastLoginAt: DateTime?`

**Relations ajoutées** :
- ✅ `assignedConversations: Conversation[]` - Conversations assignées
- ✅ `closedConversations: Conversation[]` - Conversations fermées
- ✅ `broadcasts: Broadcast[]` - Broadcasts créés

**Index ajoutés** :
- ✅ `@@index([email])`

---

### 8. Modèle Restaurant - Relations Ajoutées ✅

**Relations ajoutées** :
- ✅ `messageTemplates: MessageTemplate[]`
- ✅ `broadcasts: Broadcast[]`

---

### 9. Modèle Customer - Relations Ajoutées ✅

**Relations ajoutées** :
- ✅ `broadcastRecipients: BroadcastRecipient[]`

---

## 📊 Résumé des Changements

### Nouveaux Modèles
- ✅ `MessageTemplate` - Templates de messages réutilisables
- ✅ `Broadcast` - Campagnes d'envoi groupé
- ✅ `BroadcastRecipient` - Suivi des destinataires

### Nouveaux Enums
- ✅ `ConversationStatus` (4 valeurs)
- ✅ `ConversationPriority` (4 valeurs)
- ✅ `MessageType` (8 valeurs)
- ✅ `BroadcastStatus` (5 valeurs)
- ✅ `MessageSender` (3 valeurs)

### Modèles Modifiés
- ✅ `Conversation` - 9 nouveaux champs + relations
- ✅ `Message` - 6 nouveaux champs
- ✅ `User` - 4 nouveaux champs + 3 relations
- ✅ `Restaurant` - 2 relations ajoutées
- ✅ `Customer` - 1 relation ajoutée

---

## 🔄 Prochaines Étapes

### ✅ Migrations Créées et Marquées

Les migrations ont été créées et marquées comme appliquées :
- ✅ `add_variants_options` - Migration existante marquée comme appliquée
- ✅ `add_advanced_inbox_features` - Nouvelle migration créée

### ⚠️ Application de la Migration SQL

**IMPORTANT** : La migration SQL doit être exécutée manuellement sur Supabase car `prisma migrate resolve` marque seulement la migration comme appliquée sans exécuter le SQL.

**Option 1 : Via Supabase Dashboard (Recommandé)**
1. Ouvrir Supabase Dashboard → SQL Editor
2. Copier le contenu de `apps/web/prisma/migrations/add_advanced_inbox_features/migration.sql`
3. Exécuter le SQL

**Option 2 : Via Prisma DB Push**
```bash
cd apps/web
npx prisma db push
```
⚠️ Attention : Cela peut essayer de modifier/supprimer des données existantes.

**Option 3 : Via psql**
```bash
cd apps/web
psql $DATABASE_URL -f prisma/migrations/add_advanced_inbox_features/migration.sql
```

### Génération Client Prisma
```bash
cd apps/web
npx prisma generate
```
✅ **Déjà exécuté** - Client Prisma généré avec succès

### Points d'Attention pour la Migration

1. **Champ `customerPhone` requis** : Les conversations existantes doivent avoir un `customerPhone`. Migration nécessaire pour remplir ce champ depuis `whatsappPhone` ou `customer.phone`.

2. **Champ `sender` requis dans Message** : Migration nécessaire pour remplir `sender` depuis `direction` existant.

3. **Relations optionnelles** : `customerId` dans Conversation est optionnel, permettant des conversations sans client enregistré.

---

## ✅ Validation

- ✅ Schéma Prisma formaté avec succès
- ✅ Tous les enums définis
- ✅ Toutes les relations configurées
- ✅ Tous les index ajoutés
- ✅ Compatibilité préservée (champs dépréciés conservés)

---

## 📝 Notes Techniques

### Relations avec `onDelete`
- `Conversation.customer` → `onDelete: SetNull` (optionnel)
- `Conversation.restaurant` → `onDelete: Cascade`
- `Conversation.assignedTo` → Pas de `onDelete` (SetNull par défaut)
- `Message.conversation` → `onDelete: Cascade`
- `Broadcast.restaurant` → `onDelete: Cascade`
- `BroadcastRecipient.broadcast` → `onDelete: Cascade`

### Champs JSON
- `Conversation.tags: String[]` - Array PostgreSQL
- `Message.metadata: Json?` - JSON PostgreSQL
- `Broadcast.targetAudience: Json` - JSON PostgreSQL

---

**Fin du compte rendu - Mise à jour Schéma Prisma Inbox Avancée**
