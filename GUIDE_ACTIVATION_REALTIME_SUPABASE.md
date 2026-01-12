# Guide - Activation Realtime dans Supabase Dashboard

**Date** : Guide pour activer Realtime dans Supabase  
**Objectif** : Activer la synchronisation en temps réel pour les tables messages, conversations et orders

## ✅ ÉTAPE 10 : Activer Realtime dans Supabase Dashboard

### Procédure détaillée

1. **Accéder au Dashboard Supabase**
   - Aller sur : https://supabase.com/dashboard
   - Se connecter avec vos identifiants

2. **Sélectionner le projet**
   - Cliquer sur votre projet dans la liste
   - Projet actuel : `Taybo II` (ou votre projet)

3. **Accéder à la section Replication**
   - Dans le menu gauche : **Database** → **Replication**
   - Vous verrez la liste des tables de votre base de données

4. **Activer Realtime pour les tables**

   Activez Realtime pour ces 3 tables avec les événements suivants :

   #### Table `conversations`
   - ✅ **INSERT** : Nouvelle conversation créée
   - ✅ **UPDATE** : Conversation mise à jour (statut, lastMessageAt, etc.)
   - ✅ **DELETE** : Conversation supprimée (optionnel)

   #### Table `messages`
   - ✅ **INSERT** : Nouveau message reçu/envoyé
   - ✅ **UPDATE** : Message mis à jour (statut, isRead, etc.)
   - ✅ **DELETE** : Message supprimé (optionnel)

   #### Table `orders`
   - ✅ **INSERT** : Nouvelle commande créée
   - ✅ **UPDATE** : Commande mise à jour (statut, assignedTo, etc.)
   - ✅ **DELETE** : Commande supprimée (optionnel)

5. **Sauvegarder**
   - Cliquer sur **"Save"** ou **"Enable"** pour chaque table
   - Attendre la confirmation que Realtime est activé

---

## ✅ ÉTAPE 11 : Vérifier que c'est activé

### Dans Supabase Dashboard

1. **Aller dans Database → Replication**
2. **Vérifier les 3 lignes** :
   - ✅ `conversations` → **Realtime: Enabled**
   - ✅ `messages` → **Realtime: Enabled**
   - ✅ `orders` → **Realtime: Enabled**

### Vérification via SQL (alternative)

Si vous avez accès à l'éditeur SQL dans Supabase :

```sql
-- Vérifier que les tables sont dans la publication Realtime
SELECT 
  schemaname,
  tablename,
  '✅ Activé' as realtime_status
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename IN ('messages', 'conversations', 'orders')
ORDER BY tablename;
```

**Résultat attendu** :
```
schemaname | tablename     | realtime_status
-----------|---------------|----------------
public     | conversations | ✅ Activé
public     | messages      | ✅ Activé
public     | orders        | ✅ Activé
```

---

## 📋 État actuel (vérifié via API)

D'après la vérification effectuée via l'API Supabase, les tables sont **déjà activées** :

- ✅ `public.conversations` - Dans la publication `supabase_realtime`
- ✅ `public.messages` - Dans la publication `supabase_realtime`
- ✅ `public.orders` - Dans la publication `supabase_realtime`

**Cependant**, il est recommandé de vérifier dans le Dashboard pour s'assurer que :
- Les événements sont bien configurés (INSERT, UPDATE, DELETE)
- L'interface utilisateur confirme l'activation
- Aucun problème de configuration n'est présent

---

## 🔍 Vérification dans le Dashboard

### Ce que vous devriez voir

Dans la page **Database → Replication**, chaque table activée devrait afficher :

```
Table: conversations
├─ Realtime: ✅ Enabled
├─ Events: INSERT, UPDATE, DELETE
└─ Status: Active

Table: messages
├─ Realtime: ✅ Enabled
├─ Events: INSERT, UPDATE, DELETE
└─ Status: Active

Table: orders
├─ Realtime: ✅ Enabled
├─ Events: INSERT, UPDATE, DELETE
└─ Status: Active
```

### Si une table n'est pas activée

1. Cliquer sur la table dans la liste
2. Activer le toggle **"Enable Realtime"**
3. Sélectionner les événements souhaités (INSERT, UPDATE, DELETE)
4. Cliquer sur **"Save"**

---

## 🧪 Test après activation

Une fois Realtime activé dans le Dashboard :

1. **Lancer le serveur** : `pnpm dev`
2. **Ouvrir** : `http://localhost:3000/dashboard/orders`
3. **Vérifier l'indicateur** : "Temps réel actif" avec point vert qui pulse
4. **Tester** : Créer une commande via `./test-realtime.sh`
5. **Vérifier** : La commande apparaît automatiquement dans le navigateur

---

## 📝 Notes importantes

### Événements Realtime

- **INSERT** : Nécessaire pour détecter les nouvelles données
- **UPDATE** : Nécessaire pour détecter les modifications
- **DELETE** : Optionnel, mais recommandé pour la cohérence

### Performance

- Realtime utilise la réplication logique de PostgreSQL
- Les événements sont filtrés par `restaurantId` côté client
- Limite de débit : 10 événements/seconde (configuré dans le client)

### Sécurité

- Les politiques RLS (Row Level Security) s'appliquent aussi à Realtime
- Seules les données autorisées par RLS sont envoyées aux clients
- Les filtres dans les hooks ajoutent une couche supplémentaire de sécurité

---

## ✅ Checklist de vérification

- [ ] Accès au Dashboard Supabase
- [ ] Projet sélectionné
- [ ] Section Database → Replication ouverte
- [ ] Table `conversations` activée avec INSERT, UPDATE, DELETE
- [ ] Table `messages` activée avec INSERT, UPDATE, DELETE
- [ ] Table `orders` activée avec INSERT, UPDATE, DELETE
- [ ] Toutes les tables affichent "Realtime: Enabled"
- [ ] Test effectué : commande créée et apparaît en temps réel

---

## 🐛 Problèmes possibles

### Problème 1 : Les tables n'apparaissent pas dans Replication
**Solution** : Vérifier que vous êtes dans le bon projet et que les tables existent

### Problème 2 : Impossible d'activer Realtime
**Solution** : Vérifier que vous avez les permissions nécessaires (Owner ou Admin)

### Problème 3 : Realtime activé mais ne fonctionne pas
**Solution** : 
- Vérifier les variables d'environnement (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- Vérifier les logs dans la console du navigateur
- Vérifier que les hooks Realtime sont bien intégrés

---

**Statut** : ✅ **Tables déjà activées via SQL, vérification Dashboard recommandée**

Les tables sont déjà dans la publication `supabase_realtime`, mais il est recommandé de vérifier dans le Dashboard pour s'assurer que tout est correctement configuré.
