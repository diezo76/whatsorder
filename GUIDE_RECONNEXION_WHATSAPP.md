# 🔌 Guide de Reconnexion WhatsApp - Restaurant Déconnecté

**Date** : 11 janvier 2026  
**Problème** : Le restaurant est déconnecté de WhatsApp Business API

---

## 🎯 Diagnostic Rapide

Pour vérifier le statut de connexion WhatsApp de votre restaurant, exécutez :

```bash
# Option 1: Via script SQL
psql $DATABASE_URL -f scripts/check-whatsapp-connection.sql

# Option 2: Via l'interface web
# Allez dans Dashboard > Paramètres > Intégrations
# Vérifiez si les champs WhatsApp sont remplis
```

---

## ✅ Solution 1 : Reconnexion via l'Interface Web (Recommandé)

### Étapes :

1. **Connectez-vous au dashboard**
   - URL : `http://localhost:3000/dashboard/settings` (ou votre URL de production)
   - Connectez-vous avec votre compte (ex: `admin@whatsorder.com`)

2. **Allez dans Paramètres > Intégrations**
   - Cliquez sur l'onglet "WhatsApp & Intégrations"

3. **Remplissez les champs WhatsApp** :
   - **Numéro WhatsApp Business** : `+201276921081` (ou votre numéro)
   - **WhatsApp Business ID** : Votre Phone Number ID depuis Meta Business Manager
   - **WhatsApp API Token** : Votre Access Token depuis Meta Business Manager

4. **Cliquez sur "Enregistrer les modifications"**

5. **Vérifiez la connexion** :
   - Le statut devrait passer à "✅ CONNECTÉ"
   - Vous pouvez tester en envoyant un message de test

---

## ✅ Solution 2 : Reconnexion via SQL (Avancé)

Si vous préférez utiliser SQL directement :

### Étape 1 : Vérifier le statut actuel

```sql
SELECT 
    name,
    CASE 
        WHEN ("whatsappApiToken" IS NULL OR "whatsappApiToken" = '') 
          OR ("whatsappBusinessId" IS NULL OR "whatsappBusinessId" = '') 
        THEN '❌ DÉCONNECTÉ'
        ELSE '✅ CONNECTÉ'
    END as status_connexion
FROM restaurants
WHERE LOWER(name) LIKE '%nile%bites%' OR slug = 'nile-bites';
```

### Étape 2 : Obtenir vos credentials WhatsApp

1. Allez sur [Meta Business Manager](https://business.facebook.com/)
2. Accédez à votre compte Meta Business
3. Allez dans **WhatsApp** > **API Setup**
4. Copiez :
   - **Phone number ID** → C'est votre `whatsappBusinessId`
   - **Temporary access token** ou créez un token permanent → C'est votre `whatsappApiToken`

### Étape 3 : Mettre à jour via SQL

**Option A : Utiliser le script fourni**

```bash
# 1. Ouvrez le fichier scripts/reconnect-whatsapp-restaurant.sql
# 2. Remplacez les valeurs placeholder :
#    - VOTRE_ACCESS_TOKEN_ICI → Votre vrai token
#    - VOTRE_PHONE_NUMBER_ID_ICI → Votre vrai Phone Number ID
# 3. Exécutez le script
psql $DATABASE_URL -f scripts/reconnect-whatsapp-restaurant.sql
```

**Option B : Requête SQL directe**

```sql
UPDATE restaurants
SET 
    "whatsappApiToken" = 'VOTRE_ACCESS_TOKEN_ICI',  -- Ex: 'EAAxxxxxxxxxxxxx'
    "whatsappBusinessId" = 'VOTRE_PHONE_NUMBER_ID_ICI',  -- Ex: '123456789012345'
    "whatsappNumber" = '+201276921081',
    "updatedAt" = NOW()
WHERE LOWER(name) LIKE '%nile%bites%' OR slug = 'nile-bites';
```

### Étape 4 : Vérifier la reconnexion

```sql
SELECT 
    name,
    CASE 
        WHEN ("whatsappApiToken" IS NOT NULL AND "whatsappApiToken" != '') 
          AND ("whatsappBusinessId" IS NOT NULL AND "whatsappBusinessId" != '') 
        THEN '✅ CONNECTÉ'
        ELSE '❌ DÉCONNECTÉ'
    END as status_connexion,
    "whatsappNumber",
    LEFT("whatsappApiToken", 10) || '...' as token_preview,
    "whatsappBusinessId"
FROM restaurants
WHERE LOWER(name) LIKE '%nile%bites%' OR slug = 'nile-bites';
```

---

## 🔍 Vérification de la Connexion

Après la reconnexion, testez que tout fonctionne :

### Test 1 : Vérifier la configuration dans l'application

```bash
# Dans le terminal du backend
cd apps/api
pnpm dev

# Vérifiez les logs au démarrage :
# ✅ WhatsApp API configurée
# ou
# ⚠️ WhatsApp API non configurée
```

### Test 2 : Envoyer un message de test

1. Allez dans l'inbox WhatsApp (`/dashboard/inbox`)
2. Sélectionnez une conversation
3. Envoyez un message de test
4. Vérifiez que le message est bien envoyé

### Test 3 : Vérifier les webhooks

1. Envoyez un message WhatsApp au numéro du restaurant
2. Vérifiez que le message apparaît dans l'inbox
3. Vérifiez les logs du backend pour voir les webhooks reçus

---

## ⚠️ Problèmes Courants

### Problème 1 : "WhatsApp API non configurée"

**Cause** : Les champs `whatsappApiToken` ou `whatsappBusinessId` sont vides ou NULL

**Solution** : Suivez la Solution 1 ou 2 ci-dessus pour remplir ces champs

### Problème 2 : "WhatsApp API error (401): Invalid access token"

**Cause** : Le token d'accès est expiré ou invalide

**Solution** :
1. Allez dans Meta Business Manager
2. Générez un nouveau token d'accès
3. Mettez à jour le `whatsappApiToken` dans la base de données

### Problème 3 : "WhatsApp API error (404): Phone number not found"

**Cause** : Le `whatsappBusinessId` (Phone Number ID) est incorrect

**Solution** :
1. Vérifiez le Phone Number ID dans Meta Business Manager
2. Mettez à jour le `whatsappBusinessId` dans la base de données

### Problème 4 : Les messages ne sont pas reçus

**Cause** : Le webhook n'est pas configuré correctement

**Solution** :
1. Vérifiez que le webhook est configuré dans Meta Business Manager
2. Vérifiez que l'URL du webhook est accessible publiquement
3. Vérifiez que le token de vérification correspond

---

## 📚 Ressources

- [Guide de Configuration WhatsApp Complet](./GUIDE_CONFIGURATION_WHATSAPP.md)
- [Documentation Meta WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [Meta Business Manager](https://business.facebook.com/)

---

## 📝 Notes Importantes

1. **Sécurité** : Ne partagez jamais vos tokens d'accès WhatsApp publiquement
2. **Expiration** : Les tokens temporaires expirent après 24 heures. Utilisez des tokens permanents pour la production
3. **Renouvellement** : Les tokens permanents expirent après 60 jours. Configurez un système de renouvellement automatique
4. **Test** : Testez toujours la connexion après avoir mis à jour les credentials

---

**Dernière mise à jour** : 11 janvier 2026
