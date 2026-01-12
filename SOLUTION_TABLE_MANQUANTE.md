# 🔧 Solution - Table `Restaurant` Manquante

## ⚠️ Problème

L'erreur indique que la table `Restaurant` n'existe pas dans la base de données Supabase :

```
The table `public.Restaurant` does not exist in the current database.
```

Cela signifie que **les migrations Prisma n'ont pas été appliquées** à votre base de données Supabase.

---

## ✅ Solution en 3 Étapes

### Étape 1 : Vérifier la Connexion à Supabase

Assurez-vous que votre `DATABASE_URL` dans `apps/api/.env` est correcte :

```env
DATABASE_URL="postgresql://postgres:[VOTRE-MOT-DE-PASSE]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres"
```

**Note** : Utilisez le port **6543** (pooler) ou **5432** (direct) selon votre configuration Supabase.

---

### Étape 2 : Appliquer les Migrations

**Option A : Migration Deploy (Recommandé pour Production/Supabase)**

```bash
cd "/Users/diezowee/whatsapp order/apps/api"
pnpm prisma migrate deploy
```

Cette commande applique toutes les migrations en attente sans créer de nouvelles migrations.

**Option B : Migration Dev (Si vous développez localement)**

```bash
cd "/Users/diezowee/whatsapp order/apps/api"
pnpm prisma migrate dev
```

**Option C : Si les migrations échouent, réinitialiser (⚠️ ATTENTION : Supprime les données)**

```bash
cd "/Users/diezowee/whatsapp order/apps/api"
pnpm prisma migrate reset
```

Cette commande supprime toutes les données et réapplique les migrations.

---

### Étape 3 : Vérifier que les Tables sont Créées

**Option A : Via Prisma Studio**

```bash
cd "/Users/diezowee/whatsapp order/apps/api"
pnpm prisma studio
```

Ouvrez votre navigateur sur `http://localhost:5555` et vérifiez que la table `Restaurant` existe.

**Option B : Via Supabase Dashboard**

1. Allez sur https://supabase.com
2. Ouvrez votre projet
3. Allez dans **Table Editor**
4. Vérifiez que la table `Restaurant` existe

---

## 🔍 Dépannage

### Problème : Timeout lors de la Migration

Si la commande `prisma migrate deploy` timeout :

1. **Vérifiez votre connexion internet**
2. **Vérifiez que Supabase est accessible** :
   ```bash
   # Tester la connexion
   psql "postgresql://postgres:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres" -c "SELECT 1;"
   ```

3. **Utilisez le port direct au lieu du pooler** :
   - Changez le port de `6543` à `5432` dans votre `DATABASE_URL`
   - Réessayez la migration

### Problème : Erreur de Permissions

Si vous obtenez une erreur de permissions :

1. Vérifiez que votre utilisateur Supabase a les droits nécessaires
2. Dans Supabase Dashboard > Settings > Database, vérifiez les permissions

### Problème : Migrations en Conflit

Si vous avez des migrations en conflit :

```bash
cd "/Users/diezowee/whatsapp order/apps/api"

# Voir l'état des migrations
pnpm prisma migrate status

# Résoudre les conflits manuellement si nécessaire
```

---

## 📋 Liste des Tables à Créer

Les migrations devraient créer les tables suivantes :

- ✅ `Restaurant`
- ✅ `User`
- ✅ `Category`
- ✅ `MenuItem`
- ✅ `Customer`
- ✅ `Order`
- ✅ `OrderItem`
- ✅ `Conversation`
- ✅ `Message`
- ✅ `InternalNote`
- ✅ `Workflow`
- ✅ `WorkflowExecution`
- ✅ `Campaign`
- ✅ `DailyAnalytics`

---

## 🚀 Après les Migrations

Une fois les migrations appliquées :

1. **Générer le client Prisma** (si pas déjà fait) :
   ```bash
   pnpm prisma generate
   ```

2. **Optionnel : Seed la base de données** :
   ```bash
   pnpm db:seed
   ```

3. **Redémarrer le serveur API** :
   ```bash
   pnpm --filter api dev
   ```

4. **Tester la route** :
   ```bash
   curl http://localhost:4000/api/public/restaurants/nile-bites
   ```

---

## 📝 Note Importante

Si vous utilisez Supabase en production, assurez-vous de :
- ✅ Sauvegarder régulièrement votre base de données
- ✅ Ne pas utiliser `prisma migrate reset` en production
- ✅ Utiliser `prisma migrate deploy` pour appliquer les migrations

---

**Dernière mise à jour** : 11 janvier 2026
