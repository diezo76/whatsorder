# 🚀 Guide Complet - Application des Migrations

## ⚠️ Problème Actuel

La table `Restaurant` n'existe pas dans votre base de données Supabase car les migrations Prisma n'ont pas été appliquées.

---

## ✅ Solution Recommandée : Via Supabase SQL Editor

C'est la méthode la plus fiable si la connexion Prisma timeout.

### Étape 1 : Ouvrir Supabase SQL Editor

1. Allez sur https://supabase.com
2. Connectez-vous à votre compte
3. Ouvrez votre projet
4. Cliquez sur **SQL Editor** dans le menu de gauche
5. Cliquez sur **New Query**

### Étape 2 : Copier le Fichier SQL

1. Ouvrez le fichier : `apps/api/prisma/migrations/APPLY_MIGRATIONS.sql`
2. Copiez **tout le contenu** (Cmd+A puis Cmd+C)
3. Collez-le dans l'éditeur SQL de Supabase
4. Cliquez sur **Run** (ou appuyez sur Cmd+Enter)

### Étape 3 : Vérifier

Après l'exécution, vous devriez voir :
- ✅ Tous les types ENUM créés
- ✅ Toutes les tables créées
- ✅ Tous les index créés
- ✅ Toutes les contraintes de clés étrangères créées

Vérifiez dans **Table Editor** que la table `Restaurant` existe.

---

## 🔄 Solution Alternative : Via Prisma CLI

Si votre connexion internet est stable, essayez :

### Option A : migrate deploy (Production)

```bash
cd "/Users/diezowee/whatsapp order/apps/api"
pnpm prisma migrate deploy
```

### Option B : migrate dev (Développement)

```bash
cd "/Users/diezowee/whatsapp order/apps/api"
pnpm prisma migrate dev --name apply_migrations
```

**Note** : Si ces commandes timeout, utilisez la méthode Supabase SQL Editor ci-dessus.

---

## 🔍 Vérification Post-Migration

### 1. Vérifier avec Prisma Studio

```bash
cd "/Users/diezowee/whatsapp order/apps/api"
pnpm prisma studio
```

Ouvrez `http://localhost:5555` et vérifiez que toutes les tables existent.

### 2. Vérifier avec Supabase Dashboard

Dans Supabase Dashboard > Table Editor, vous devriez voir :
- ✅ Restaurant
- ✅ User
- ✅ Category
- ✅ MenuItem
- ✅ Customer
- ✅ Order
- ✅ OrderItem
- ✅ Conversation
- ✅ Message
- ✅ InternalNote
- ✅ Workflow
- ✅ WorkflowExecution
- ✅ Campaign
- ✅ DailyAnalytics

### 3. Tester l'API

```bash
# Redémarrer le serveur API
cd "/Users/diezowee/whatsapp order"
pnpm --filter api dev

# Dans un autre terminal, tester la route
curl http://localhost:4000/api/public/restaurants/nile-bites
```

---

## 🌱 Optionnel : Seed la Base de Données

Après avoir appliqué les migrations, vous pouvez remplir la base avec des données de test :

```bash
cd "/Users/diezowee/whatsapp order/apps/api"
pnpm db:seed
```

Cela créera :
- Un restaurant de test (slug: `nile-bites`)
- Des utilisateurs de test
- Des catégories et items de menu de test

---

## 🐛 Dépannage

### Erreur : "relation already exists"

Si vous obtenez cette erreur, certaines tables existent déjà. C'est normal si vous avez déjà essayé d'appliquer les migrations. Le fichier SQL utilise `CREATE TABLE IF NOT EXISTS` pour éviter les erreurs.

### Erreur : "type already exists"

Si les types ENUM existent déjà, vous pouvez les ignorer ou les supprimer d'abord :

```sql
-- Dans Supabase SQL Editor
DROP TYPE IF EXISTS "UserRole" CASCADE;
DROP TYPE IF EXISTS "DeliveryType" CASCADE;
DROP TYPE IF EXISTS "OrderStatus" CASCADE;
DROP TYPE IF EXISTS "PaymentMethod" CASCADE;
DROP TYPE IF EXISTS "PaymentStatus" CASCADE;
DROP TYPE IF EXISTS "OrderSource" CASCADE;
```

Puis réexécutez le fichier `APPLY_MIGRATIONS.sql`.

### Erreur de Connexion

Si Prisma ne peut pas se connecter à Supabase :

1. Vérifiez votre `DATABASE_URL` dans `apps/api/.env`
2. Vérifiez que Supabase est accessible
3. Essayez avec le port direct (5432) au lieu du pooler (6543)
4. Utilisez Supabase SQL Editor directement

---

## ✅ Checklist Finale

- [ ] Migrations appliquées (via SQL Editor ou Prisma CLI)
- [ ] Tables vérifiées dans Supabase Dashboard
- [ ] Client Prisma régénéré : `pnpm prisma generate`
- [ ] Serveur API redémarré
- [ ] Route API testée et fonctionnelle
- [ ] (Optionnel) Base de données seedée avec des données de test

---

**Une fois toutes ces étapes complétées, votre API devrait fonctionner correctement !** 🎉
