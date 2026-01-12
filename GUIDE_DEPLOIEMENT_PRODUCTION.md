# 🚀 Guide de Déploiement en Production - Realtime Supabase

**Date** : 11 janvier 2026  
**Objectif** : Déployer les fonctionnalités realtime Supabase en production et valider le fonctionnement

---

## 📋 Checklist Pré-Déploiement

### ✅ Vérifications Requises

- [ ] **Supabase Realtime activé** dans le dashboard Supabase
- [ ] **Variables d'environnement** configurées dans Vercel
- [ ] **RLS (Row Level Security)** activé sur les tables `Message`, `Order`, `Conversation`
- [ ] **Politiques RLS** configurées pour permettre la lecture/écriture
- [ ] **Code testé en local** avec succès (2 onglets)

---

## 🔧 Étape 1 : Configuration Supabase

### 1.1 Activer Realtime dans Supabase Dashboard

1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. Aller dans **Database** > **Replication**
4. Activer la réplication pour les tables :
   - ✅ `messages`
   - ✅ `orders`
   - ✅ `conversations`

### 1.2 Vérifier RLS (Row Level Security)

1. Aller dans **Authentication** > **Policies**
2. Pour chaque table (`Message`, `Order`, `Conversation`), vérifier :
   - ✅ RLS est activé
   - ✅ Politiques de lecture existent
   - ✅ Politiques d'écriture existent

**Exemple de politique pour `Message`** :
```sql
-- Permettre la lecture des messages pour les utilisateurs du restaurant
CREATE POLICY "Users can read messages"
ON messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversations c
    JOIN restaurants r ON r.id = c."restaurantId"
    JOIN users u ON u."restaurantId" = r.id
    WHERE c.id = messages."conversationId"
    AND u.id = auth.uid()
  )
);
```

---

## 🔧 Étape 2 : Configuration Vercel

### 2.1 Variables d'Environnement

Dans le dashboard Vercel, aller dans **Settings** > **Environment Variables** et ajouter :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon
```

**Important** :
- ✅ Ces variables doivent être définies pour **Production**, **Preview**, et **Development**
- ✅ Redéployer après avoir ajouté les variables

### 2.2 Vérifier la Configuration

Dans Vercel, aller dans **Settings** > **General** et vérifier :
- ✅ Framework Preset : Next.js
- ✅ Build Command : `pnpm build` (ou `npm run build`)
- ✅ Output Directory : `.next` (par défaut)

---

## 📦 Étape 3 : Commit et Push

### 3.1 Ajouter les Fichiers

```bash
cd ~/whatsapp-order

# Ajouter tous les fichiers modifiés et nouveaux
git add .

# Vérifier ce qui sera commité
git status
```

### 3.2 Commit

```bash
git commit -m "feat: Add Supabase Realtime for Inbox and Orders

- Add useRealtimeMessages hook for real-time message updates
- Add useRealtimeOrders hook for real-time order updates
- Add useRealtimeConversations hook for conversation updates
- Integrate realtime hooks in Inbox page
- Integrate realtime hooks in Orders Kanban page
- Add Supabase client configuration
- Add realtime connection indicators
- Update inbox page spacing (pt-24)
- Add comprehensive test guide (GUIDE_TEST_REALTIME.md)
- Add deployment guide (GUIDE_DEPLOIEMENT_PRODUCTION.md)"
```

### 3.3 Push

```bash
git push origin main
```

**Note** : Si vous utilisez une branche différente :
```bash
git push origin votre-branche
```

---

## 🚀 Étape 4 : Déploiement Vercel

### 4.1 Déploiement Automatique

Vercel va automatiquement :
1. Détecter le push sur `main`
2. Déclencher un nouveau déploiement
3. Build l'application (~2-3 minutes)
4. Déployer en production

### 4.2 Suivre le Déploiement

1. Aller sur https://vercel.com/dashboard
2. Sélectionner votre projet
3. Voir le statut du déploiement en temps réel
4. Attendre que le statut passe à **"Ready"**

### 4.3 Vérifier les Logs

Dans Vercel Dashboard :
- Aller dans **Deployments** > **Latest Deployment** > **Build Logs**
- Vérifier qu'il n'y a pas d'erreurs
- Vérifier que les variables d'environnement sont bien chargées

---

## ✅ Étape 5 : Tests en Production

### 5.1 Test Inbox Realtime

1. **Ouvrir 2 onglets** :
   - Onglet 1 : https://ton-projet.vercel.app/dashboard/inbox
   - Onglet 2 : https://ton-projet.vercel.app/dashboard/inbox

2. **Se connecter** avec le même compte dans les 2 onglets

3. **Vérifier l'indicateur de connexion** :
   - ✅ Doit afficher "Temps réel actif" avec un point vert 🟢
   - ✅ Si rouge 🔴, voir section "Dépannage" ci-dessous

4. **Sélectionner la même conversation** dans les 2 onglets

5. **Envoyer un message dans l'onglet 1** :
   - ✅ Le message doit apparaître instantanément dans l'onglet 2
   - ✅ Sans rafraîchir la page

### 5.2 Test Kanban Realtime

1. **Ouvrir 2 onglets** :
   - Onglet 1 : https://ton-projet.vercel.app/dashboard/orders
   - Onglet 2 : https://ton-projet.vercel.app/dashboard/orders

2. **Se connecter** avec le même compte dans les 2 onglets

3. **Vérifier l'indicateur de connexion** :
   - ✅ Doit afficher "Temps réel actif" avec un point vert 🟢

4. **Dans l'onglet 1** :
   - Drag & drop une commande d'une colonne à une autre

5. **Dans l'onglet 2** :
   - ✅ La commande doit changer de colonne automatiquement
   - ✅ Un toast de notification doit apparaître

---

## 📊 Checklist Complète

### Configuration
- [ ] Supabase Realtime activé pour `messages`, `orders`, `conversations`
- [ ] RLS activé sur les tables
- [ ] Politiques RLS configurées
- [ ] Variables d'environnement configurées dans Vercel
- [ ] Variables disponibles pour Production, Preview, Development

### Code
- [ ] `@supabase/supabase-js` installé (`pnpm add @supabase/supabase-js`)
- [ ] `lib/supabase/client.ts` créé
- [ ] Hooks realtime créés (`useRealtimeMessages`, `useRealtimeOrders`, `useRealtimeConversations`)
- [ ] Hooks intégrés dans Inbox page
- [ ] Hooks intégrés dans Orders page
- [ ] Indicateurs de connexion ajoutés

### Tests Locaux
- [ ] Test Inbox : 2 onglets → message apparaît ✅
- [ ] Test Kanban : 2 onglets → drag&drop synchro ✅

### Déploiement
- [ ] Code commité et pushé
- [ ] Vercel déploiement automatique déclenché
- [ ] Build réussi sans erreurs
- [ ] Déploiement en production réussi

### Tests Production
- [ ] Indicateur "Connecté" (vert) sur Inbox
- [ ] Indicateur "Connecté" (vert) sur Orders
- [ ] Messages synchronisés en temps réel (2 onglets)
- [ ] Commandes synchronisées en temps réel (2 onglets)

---

## 🐛 Dépannage

### Erreur : "Missing Supabase environment variables"

**Symptôme** : L'application crash au chargement avec l'erreur "Missing Supabase environment variables"

**Solution** :

1. **Vérifier les variables dans Vercel** :
   ```bash
   # Dans Vercel Dashboard > Settings > Environment Variables
   # Vérifier que ces variables existent :
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

2. **Vérifier les valeurs** :
   - `NEXT_PUBLIC_SUPABASE_URL` doit commencer par `https://`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` doit être une clé JWT valide

3. **Redéployer** :
   - Après avoir ajouté/modifié les variables, redéployer manuellement dans Vercel

4. **Vérifier dans les logs** :
   ```bash
   # Dans Vercel Dashboard > Deployments > Build Logs
   # Chercher les erreurs liées aux variables d'environnement
   ```

---

### Erreur : "Failed to subscribe"

**Symptôme** : L'indicateur reste rouge 🔴 "Déconnecté"

**Solutions** :

1. **Vérifier que Realtime est activé** :
   - Aller dans Supabase Dashboard > Database > Replication
   - Vérifier que les tables `messages`, `orders`, `conversations` ont la réplication activée

2. **Vérifier les logs WebSocket** :
   - Ouvrir la console du navigateur (F12)
   - Aller dans l'onglet **Network** > **WS** (WebSocket)
   - Vérifier qu'il y a une connexion WebSocket vers Supabase
   - Si erreur 401, vérifier la clé `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Vérifier RLS** :
   - Les politiques RLS doivent permettre la lecture des données
   - Tester avec une requête directe dans Supabase SQL Editor

4. **Vérifier les filtres** :
   - Les hooks utilisent des filtres (`conversationId=eq.XXX`, `restaurantId=eq.XXX`)
   - Vérifier que les IDs correspondent bien

---

### Messages ne s'affichent pas en temps réel

**Symptôme** : Les messages sont envoyés mais n'apparaissent pas dans l'autre onglet

**Solutions** :

1. **Ajouter des logs de debug** :
   ```typescript
   // Dans useRealtimeMessages.ts
   channel.on('postgres_changes', {...}, (payload) => {
     console.log('📡 Realtime payload:', payload);
     console.log('📡 New message:', payload.new);
     onNewMessage?.(payload.new as Message);
   });
   ```

2. **Vérifier que le backend crée bien les messages** :
   - Vérifier les logs du backend lors de l'envoi d'un message
   - Vérifier dans Supabase Dashboard > Table Editor > `messages` que le message est créé

3. **Vérifier le filtre de subscription** :
   - Le hook s'abonne à `conversationId=eq.{conversationId}`
   - Vérifier que le `conversationId` correspond bien

4. **Vérifier la connexion WebSocket** :
   - Dans la console, chercher `📡 Realtime status: SUBSCRIBED`
   - Si vous voyez `TIMED_OUT` ou `CHANNEL_ERROR`, il y a un problème de connexion

---

### Erreur : "Cannot read property 'channel' of undefined"

**Symptôme** : Erreur JavaScript dans la console

**Solution** :

1. **Vérifier que Supabase client est bien initialisé** :
   ```typescript
   // Dans lib/supabase/client.ts
   // Vérifier que les variables d'environnement sont bien chargées
   console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
   console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20));
   ```

2. **Vérifier que le client est importé correctement** :
   ```typescript
   import { supabase } from '@/lib/supabase/client';
   ```

---

### Build Vercel échoue

**Symptôme** : Le déploiement échoue avec des erreurs de build

**Solutions** :

1. **Vérifier les logs de build** :
   - Aller dans Vercel Dashboard > Deployments > Build Logs
   - Chercher les erreurs spécifiques

2. **Erreurs communes** :
   - **"Module not found"** : Vérifier que `@supabase/supabase-js` est dans `package.json`
   - **"Type errors"** : Vérifier que TypeScript compile sans erreurs en local
   - **"Environment variables"** : Vérifier que les variables sont bien définies

3. **Tester le build en local** :
   ```bash
   cd apps/web
   pnpm build
   ```

---

## 📝 Notes Techniques

### Architecture Realtime

```
Frontend (Vercel)
    ↓
Supabase Realtime (WebSocket)
    ↓
PostgreSQL (Triggers)
    ↓
Backend API (Création/Mise à jour)
```

### Canaux Realtime

- **Messages** : `messages:{conversationId}`
- **Commandes** : `orders:{restaurantId}`
- **Conversations** : `conversations:{restaurantId}`

### Événements Écoutés

- **INSERT** : Nouveaux messages/commandes/conversations
- **UPDATE** : Mises à jour de statut, contenu, etc.
- **DELETE** : Suppression (pour les commandes)

---

## 🎯 Résultats Attendus

### ✅ Déploiement Réussi

- [ ] Build Vercel réussi sans erreurs
- [ ] Application déployée et accessible
- [ ] Variables d'environnement chargées correctement
- [ ] Indicateurs realtime verts dans l'application

### ✅ Tests Production Réussis

- [ ] Messages synchronisés en temps réel (2 onglets)
- [ ] Commandes synchronisées en temps réel (2 onglets)
- [ ] Pas d'erreurs dans la console
- [ ] Connexions WebSocket actives

---

**Dernière mise à jour** : 11 janvier 2026
