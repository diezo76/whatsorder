# 📋 Compte Rendu - Diagnostic Commande Non Reçue

**Date** : 11 janvier 2026  
**Agent** : Composer (Cursor AI)  
**Statut** : 🔍 Diagnostic en cours

---

## 🎯 Problème Signalé

L'utilisateur a testé le système de création de commande depuis le checkout web mais n'a rien reçu dans l'app admin.

---

## ✅ Actions Effectuées

### 1. Création d'un Script de Diagnostic SQL ✅

**Fichier créé** : `scripts/check-recent-orders.sql`

**Fonctionnalités** :
- Vérifie les commandes créées dans les dernières 24 heures
- Affiche les détails complets (restaurant, client, items)
- Compte les commandes par restaurant
- Liste les dernières commandes avec leurs items

**Usage** :
```bash
psql $DATABASE_URL -f scripts/check-recent-orders.sql
```

### 2. Guide de Diagnostic Complet ✅

**Fichier créé** : `GUIDE_DIAGNOSTIC_COMMANDE_NON_RECUE.md`

**Contenu** :
- Checklist de diagnostic étape par étape
- Vérification de la base de données
- Vérification des logs serveur
- Vérification de la console navigateur
- Vérification de l'authentification
- Vérification du restaurantId
- Solutions courantes aux problèmes

### 3. Amélioration des Logs dans le Checkout ✅

**Fichier modifié** : `apps/web/components/checkout/CheckoutStepConfirmation.tsx`

**Ajouts** :
- Logs détaillés avant l'appel API (endpoint, données)
- Logs de la réponse API (status, statusText)
- Logs d'erreur détaillés avec le contenu de l'erreur
- Vérification que le numéro de commande est présent dans la réponse

**Logs ajoutés** :
```typescript
console.log('📤 Création de commande:', { endpoint, restaurantSlug, itemsCount, ... });
console.log('📥 Réponse API:', { status, statusText, ok });
console.log('✅ Commande créée avec succès:', result);
console.error('❌ Erreur API:', errorData);
```

---

## 🔍 Points à Vérifier

### 1. Vérifier les Logs du Serveur Backend

**À faire** :
1. Ouvrir le terminal où le serveur backend tourne (`pnpm dev` dans `apps/api`)
2. Regarder les logs lors du clic sur "Envoyer sur WhatsApp"
3. Chercher :
   - `✅ Commande créée: ORD-XXXXX pour le restaurant ...`
   - `[Socket] New order created: ORD-XXXXX`
   - `Error creating order:` (si erreur)

### 2. Vérifier la Console du Navigateur

**À faire** :
1. Ouvrir la console du navigateur (F12)
2. Aller dans l'onglet "Console"
3. Cliquer sur "Envoyer sur WhatsApp"
4. Regarder les logs :
   - `📤 Création de commande:` (données envoyées)
   - `📥 Réponse API:` (réponse du serveur)
   - `✅ Commande créée avec succès:` (succès)
   - `❌ Erreur API:` (erreur)

### 3. Vérifier la Base de Données

**À faire** :
```bash
psql $DATABASE_URL -f scripts/check-recent-orders.sql
```

**Vérifier** :
- Si la commande existe dans la table `Order`
- Si le `restaurantId` correspond au restaurant de l'utilisateur connecté
- Si les items de la commande existent

### 4. Vérifier l'Authentification dans l'App Admin

**À faire** :
1. Ouvrir l'app admin (`http://localhost:3000/dashboard/orders`)
2. Vérifier que vous êtes connecté
3. Dans la console du navigateur, taper :
   ```javascript
   JSON.parse(localStorage.getItem('user'))
   ```
4. Vérifier que `restaurantId` existe et correspond au restaurant utilisé dans le checkout

### 5. Vérifier que le Serveur Backend est Démarré

**À faire** :
```bash
# Vérifier si le serveur écoute sur le port 4000
lsof -ti:4000

# OU tester la santé du serveur
curl http://localhost:4000/health
```

**Si le serveur n'est pas démarré** :
```bash
cd apps/api
pnpm dev
```

---

## 🐛 Causes Possibles

### 1. Serveur Backend Non Démarré
**Symptôme** : Erreur `ERR_CONNECTION_REFUSED` dans la console
**Solution** : Démarrer le serveur avec `pnpm dev` dans `apps/api`

### 2. URL API Incorrecte
**Symptôme** : Erreur 404 ou CORS
**Solution** : Vérifier que `NEXT_PUBLIC_API_URL` pointe vers `http://localhost:4000`

### 3. RestaurantId Ne Correspond Pas
**Symptôme** : La commande est créée mais n'apparaît pas dans l'app admin
**Solution** : Vérifier que le slug du restaurant dans le checkout correspond au restaurant de l'utilisateur connecté

### 4. Items du Menu N'Existent Pas
**Symptôme** : Erreur "Menu item XXX non trouvé"
**Solution** : Vérifier que les `menuItemId` dans le panier existent dans la base de données

### 5. Erreur de Validation
**Symptôme** : Erreur 400 avec détails de validation
**Solution** : Vérifier les données envoyées (nom, téléphone, etc.)

---

## 📝 Prochaines Étapes

1. ✅ Demander à l'utilisateur de vérifier les logs du serveur backend
2. ✅ Demander à l'utilisateur de vérifier la console du navigateur
3. ✅ Demander à l'utilisateur d'exécuter le script SQL de diagnostic
4. ✅ Vérifier que le serveur backend est démarré
5. ✅ Vérifier que l'utilisateur est connecté dans l'app admin

---

## 🆘 Informations Nécessaires pour le Diagnostic

Pour diagnostiquer le problème, j'ai besoin de :

1. **Logs du serveur backend** (dernières 50 lignes après avoir cliqué sur "Envoyer sur WhatsApp")
2. **Console du navigateur** (capture d'écran ou copier les logs)
3. **Résultat du script SQL** : `psql $DATABASE_URL -f scripts/check-recent-orders.sql`
4. **Slug du restaurant** utilisé dans le checkout
5. **Email de l'utilisateur** connecté dans l'app admin

---

**Statut** : ⏳ En attente des informations de diagnostic de l'utilisateur
