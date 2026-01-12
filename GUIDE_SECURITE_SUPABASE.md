# 🔒 Guide de Sécurité Supabase - Activation RLS

## ⚠️ Problème Actuel

Toutes vos tables sont marquées comme **"UNRESTRICTED"** avec **RLS (Row Level Security) désactivé**.

Cela signifie que **n'importe qui** avec votre `DATABASE_URL` peut :
- ✅ Lire toutes les données
- ✅ Modifier toutes les données
- ✅ Supprimer toutes les données

**C'est un risque de sécurité majeur !** 🔴

---

## ✅ Solution : Activer Row Level Security (RLS)

### Qu'est-ce que RLS ?

**Row Level Security (RLS)** est un système de sécurité PostgreSQL qui permet de contrôler l'accès aux lignes d'une table en fonction des politiques définies.

Avec RLS activé :
- ✅ Seules les lignes autorisées sont accessibles
- ✅ Les politiques définissent qui peut faire quoi
- ✅ La sécurité est gérée au niveau de la base de données

---

## 🚀 Étapes pour Activer RLS

### Étape 1 : Exécuter le Script SQL

1. **Ouvrez Supabase SQL Editor**
   - Allez sur https://supabase.com
   - Ouvrez votre projet
   - Cliquez sur **SQL Editor** > **New Query**

2. **Copiez le fichier SQL**
   - Ouvrez : `apps/api/prisma/migrations/ENABLE_RLS.sql`
   - Copiez tout le contenu (Cmd+A puis Cmd+C)
   - Collez dans l'éditeur SQL de Supabase

3. **Exécutez le script**
   - Cliquez sur **Run** (ou Cmd+Enter)
   - Vérifiez qu'il n'y a pas d'erreurs

### Étape 2 : Vérifier dans Supabase Dashboard

Après l'exécution :

1. Allez dans **Table Editor**
2. Sélectionnez une table (ex: `Order`)
3. Vous devriez voir **"RLS enabled"** au lieu de **"RLS disabled"**
4. Les tables ne devraient plus être marquées "UNRESTRICTED"

---

## 📋 Politiques RLS Créées

Le script crée des politiques pour chaque table :

### 🔓 Accès Public (Lecture)

- ✅ **Restaurant** : Lecture des restaurants actifs uniquement
- ✅ **Category** : Lecture des catégories actives uniquement
- ✅ **MenuItem** : Lecture des items actifs et disponibles uniquement

### 🔐 Accès Authentifié (Lecture/Écriture)

- ✅ **User** : Les utilisateurs voient uniquement les utilisateurs de leur restaurant
- ✅ **Order** : Les utilisateurs voient uniquement les commandes de leur restaurant
- ✅ **Customer** : Les utilisateurs voient uniquement les clients de leur restaurant
- ✅ **Conversation** : Les utilisateurs voient uniquement les conversations de leur restaurant
- ✅ **Message** : Les utilisateurs voient uniquement les messages de leur restaurant
- ✅ **InternalNote** : Les utilisateurs voient uniquement les notes de leur restaurant
- ✅ **Workflow** : Les utilisateurs voient uniquement les workflows de leur restaurant
- ✅ **Campaign** : Les utilisateurs voient uniquement les campagnes de leur restaurant
- ✅ **DailyAnalytics** : Les utilisateurs voient uniquement les analytics de leur restaurant

### 🌐 Accès Public (Création uniquement)

Ces tables permettent la création sans authentification (nécessaire pour le fonctionnement) :

- ✅ **Customer** : Création lors des commandes publiques
- ✅ **Order** : Création depuis le site public
- ✅ **OrderItem** : Création avec les commandes
- ✅ **Conversation** : Création pour nouveaux clients
- ✅ **Message** : Création via webhooks WhatsApp

---

## ⚠️ Points Importants

### 1. Supabase Auth vs JWT Custom

Le script utilise `auth.uid()` qui fonctionne avec **Supabase Auth**.

Si vous utilisez votre propre système JWT (comme dans votre API actuelle), vous devrez :

1. **Créer une fonction personnalisée** pour obtenir l'utilisateur depuis le JWT
2. **Adapter les politiques** pour utiliser cette fonction

**Exemple de fonction personnalisée** :

```sql
CREATE OR REPLACE FUNCTION get_user_id_from_jwt()
RETURNS TEXT AS $$
BEGIN
  -- Extraire l'ID utilisateur depuis le JWT dans les headers
  -- Cette fonction doit être adaptée selon votre système d'auth
  RETURN current_setting('request.jwt.claim.user_id', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. Service Role Key

Pour les opérations backend (via votre API), utilisez la **Service Role Key** qui bypass RLS :

```env
# Dans votre .env backend
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[SERVICE_ROLE_KEY]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
```

⚠️ **Ne jamais exposer la Service Role Key côté client !**

### 3. Tests Après Activation

Après avoir activé RLS, testez :

```bash
# Test API publique (devrait fonctionner)
curl http://localhost:4000/api/public/restaurants/nile-bites

# Test API authentifiée (devrait fonctionner avec token)
curl http://localhost:4000/api/restaurant \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🔍 Vérification des Politiques

Pour voir les politiques actives sur une table :

```sql
-- Dans Supabase SQL Editor
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'Order';
```

---

## 🛠️ Personnalisation des Politiques

Si vous avez besoin de modifier les politiques :

1. **Voir les politiques existantes** :
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'Order';
   ```

2. **Supprimer une politique** :
   ```sql
   DROP POLICY "nom_de_la_politique" ON "Order";
   ```

3. **Créer une nouvelle politique** :
   ```sql
   CREATE POLICY "nom_politique"
   ON "Order"
   FOR SELECT
   USING (condition);
   ```

---

## 📝 Checklist de Sécurité

- [ ] RLS activé sur toutes les tables
- [ ] Politiques créées et testées
- [ ] Service Role Key configurée dans le backend (pas exposée)
- [ ] Tests API effectués (publique et authentifiée)
- [ ] Documentation des politiques créée
- [ ] Équipe informée des changements

---

## 🚨 En Cas de Problème

Si après activation RLS, votre API ne fonctionne plus :

1. **Vérifiez les logs Supabase** : Dashboard > Logs
2. **Vérifiez les politiques** : Voir section "Vérification des Politiques"
3. **Testez avec Service Role Key** : Devrait bypass RLS
4. **Désactivez temporairement RLS** si nécessaire :
   ```sql
   ALTER TABLE "Order" DISABLE ROW LEVEL SECURITY;
   ```

---

## 📚 Ressources

- [Documentation Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

---

**Dernière mise à jour** : 11 janvier 2026
