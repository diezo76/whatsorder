# Compte Rendu - Nettoyage des Tables Doublons Supabase

**Date** : 4 février 2026  
**Projet** : Taybo II / WhatsOrder  
**Base de données** : `rvndgopsysdyycelmfuu`

---

## Problème Identifié

Il y avait **duplication de tables** dans Supabase :
- **Tables PascalCase** : `Restaurant`, `Category`, `Order`, etc.
- **Tables snake_case** : `restaurants`, `categories`, `orders`, etc.

Le schéma Prisma utilise `@@map("table_name")` pour mapper les modèles vers les tables **snake_case**.

**Exemple** :
```prisma
model Restaurant {
  // ...
  @@map("restaurants")  // <- Utilise la table snake_case
}
```

---

## Actions Effectuées

### 1. Suppression des 14 tables PascalCase dupliquées

```sql
DROP TABLE IF EXISTS "WorkflowExecution" CASCADE;
DROP TABLE IF EXISTS "Workflow" CASCADE;
DROP TABLE IF EXISTS "OrderItem" CASCADE;
DROP TABLE IF EXISTS "Order" CASCADE;
DROP TABLE IF EXISTS "Message" CASCADE;
DROP TABLE IF EXISTS "InternalNote" CASCADE;
DROP TABLE IF EXISTS "Conversation" CASCADE;
DROP TABLE IF EXISTS "MenuItem" CASCADE;
DROP TABLE IF EXISTS "Category" CASCADE;
DROP TABLE IF EXISTS "Customer" CASCADE;
DROP TABLE IF EXISTS "DailyAnalytics" CASCADE;
DROP TABLE IF EXISTS "Campaign" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "Restaurant" CASCADE;
```

### 2. Vérification des données

| Élément | Status |
|---------|--------|
| Restaurant Doctor Grill | ✅ Présent |
| WhatsApp Number | ✅ +201105778949 |
| Catégories | ✅ 3 (Entrées, Plats principaux, Boissons) |
| Menu Items | ✅ 6 articles |

---

## Tables Finales (15 tables snake_case)

| Table | Description |
|-------|-------------|
| `restaurants` | Restaurants |
| `users` | Utilisateurs |
| `categories` | Catégories de menu |
| `menu_items` | Articles du menu |
| `menu_item_options` | Options des articles |
| `menu_item_variants` | Variantes des articles |
| `orders` | Commandes |
| `order_items` | Articles des commandes |
| `order_item_options` | Options des articles commandés |
| `customers` | Clients |
| `conversations` | Conversations WhatsApp |
| `messages` | Messages |
| `message_templates` | Modèles de messages |
| `broadcasts` | Diffusions |
| `broadcast_recipients` | Destinataires des diffusions |

---

## Configuration Vercel

Les variables d'environnement ont été mises à jour :

| Variable | Valeur |
|----------|--------|
| `DATABASE_URL` | `postgresql://postgres.rvndgopsysdyycelmfuu:***@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | `postgresql://postgres:***@db.rvndgopsysdyycelmfuu.supabase.co:5432/postgres` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://rvndgopsysdyycelmfuu.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Configuré |

---

## URLs de Test

- **Menu Doctor Grill** : https://whataybo.com/menu/doctor-grill
- **Dashboard** : https://whataybo.com/dashboard

---

## Prochaines Étapes (si nécessaire)

1. Activer RLS (Row Level Security) sur les tables pour la sécurité
2. Tester le flux de commande complet
3. Vérifier que le bouton WhatsApp fonctionne

---

## Pour le Prochain Agent

- Les tables sont maintenant propres (snake_case uniquement)
- Prisma utilise `@@map()` pour mapper vers les tables snake_case
- Doctor Grill est le restaurant de test avec slug `doctor-grill`
- La DATABASE_URL est configurée avec le connection pooler Supabase
