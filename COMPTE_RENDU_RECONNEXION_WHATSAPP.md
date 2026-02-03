# 📋 Compte Rendu - Diagnostic et Reconnexion WhatsApp Restaurant

**Date** : 11 janvier 2026  
**Agent** : Composer (Cursor AI)  
**Statut** : ✅ Scripts et guides créés pour reconnecter le restaurant WhatsApp

---

## 🎯 Problème Identifié

Le restaurant "nile bites" est **déconnecté** de WhatsApp Business API. Cela signifie que les champs `whatsappApiToken` et/ou `whatsappBusinessId` sont vides ou NULL dans la base de données, empêchant l'application d'envoyer et recevoir des messages WhatsApp.

---

## ✅ Actions Effectuées

### 1. Script de Diagnostic Créé ✅

**Fichier créé** : `scripts/check-whatsapp-connection.sql`

**Fonctionnalités** :
- ✅ Vérification du statut de connexion WhatsApp du restaurant
- ✅ Affichage des champs `whatsappApiToken` et `whatsappBusinessId`
- ✅ Vérification de l'utilisateur admin associé
- ✅ Statistiques des conversations existantes
- ✅ Instructions détaillées pour reconnecter le restaurant

**Utilisation** :
```bash
psql $DATABASE_URL -f scripts/check-whatsapp-connection.sql
```

### 2. Script de Reconnexion Créé ✅

**Fichier créé** : `scripts/reconnect-whatsapp-restaurant.sql`

**Fonctionnalités** :
- ✅ Vérification pré-connexion du statut actuel
- ✅ Script SQL sécurisé avec vérifications
- ✅ Mise à jour des credentials WhatsApp
- ✅ Vérification post-connexion automatique
- ✅ Messages d'erreur clairs si les valeurs ne sont pas remplacées

**Utilisation** :
1. Ouvrir le fichier `scripts/reconnect-whatsapp-restaurant.sql`
2. Remplacer les placeholders par les vraies valeurs :
   - `VOTRE_ACCESS_TOKEN_ICI` → Token WhatsApp réel
   - `VOTRE_PHONE_NUMBER_ID_ICI` → Phone Number ID réel
3. Exécuter le script

### 3. Guide de Reconnexion Créé ✅

**Fichier créé** : `GUIDE_RECONNEXION_WHATSAPP.md`

**Contenu** :
- ✅ Diagnostic rapide du problème
- ✅ Solution 1 : Reconnexion via l'interface web (recommandé)
- ✅ Solution 2 : Reconnexion via SQL (avancé)
- ✅ Vérification de la connexion après reconnexion
- ✅ Dépannage des problèmes courants
- ✅ Ressources et documentation

---

## 📊 Structure des Fichiers Créés

```
scripts/
├── check-whatsapp-connection.sql      # Diagnostic du statut WhatsApp
└── reconnect-whatsapp-restaurant.sql   # Script de reconnexion

GUIDE_RECONNEXION_WHATSAPP.md           # Guide complet de reconnexion
```

---

## 🔍 Diagnostic du Problème

### Cause Racine

Le restaurant est déconnecté car les champs suivants sont vides ou NULL :
- `restaurants.whatsappApiToken` : Token d'accès WhatsApp Business API
- `restaurants.whatsappBusinessId` : Phone Number ID du compte WhatsApp Business

### Impact

Sans ces credentials :
- ❌ Impossible d'envoyer des messages WhatsApp aux clients
- ❌ Impossible de recevoir des messages WhatsApp des clients
- ❌ Les notifications de commande ne fonctionnent pas
- ❌ L'inbox WhatsApp ne peut pas fonctionner

---

## 🛠️ Solutions Proposées

### Solution 1 : Via l'Interface Web (Recommandé)

**Avantages** :
- ✅ Interface utilisateur conviviale
- ✅ Validation des champs en temps réel
- ✅ Pas besoin de connaître SQL
- ✅ Sécurisé (pas d'accès direct à la base de données)

**Étapes** :
1. Se connecter au dashboard : `/dashboard/settings`
2. Aller dans l'onglet "WhatsApp & Intégrations"
3. Remplir les 3 champs :
   - Numéro WhatsApp Business
   - WhatsApp Business ID
   - WhatsApp API Token
4. Cliquer sur "Enregistrer les modifications"

### Solution 2 : Via SQL (Avancé)

**Avantages** :
- ✅ Rapide pour les administrateurs techniques
- ✅ Peut être automatisé
- ✅ Utile pour plusieurs restaurants

**Étapes** :
1. Obtenir les credentials depuis Meta Business Manager
2. Exécuter le script `reconnect-whatsapp-restaurant.sql`
3. Vérifier la connexion avec `check-whatsapp-connection.sql`

---

## 📝 Comment Obtenir les Credentials WhatsApp

### 1. Accéder à Meta Business Manager

- URL : https://business.facebook.com/
- Se connecter avec un compte ayant accès au compte WhatsApp Business

### 2. Obtenir le Phone Number ID

1. Aller dans **WhatsApp** > **API Setup**
2. Copier le **Phone number ID** (ex: `123456789012345`)
3. C'est votre `whatsappBusinessId`

### 3. Obtenir l'Access Token

**Option A : Token Temporaire (pour tests)**
1. Dans **WhatsApp** > **API Setup**
2. Copier le **Temporary access token**
3. ⚠️ Expire après 24 heures

**Option B : Token Permanent (pour production)**
1. Aller dans **WhatsApp** > **API Setup** > **Access Tokens**
2. Créer un nouveau token avec permissions :
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
3. Copier le token (commence par `EAA...`)
4. ⚠️ Expire après 60 jours (renouvellement nécessaire)

---

## ✅ Vérification Post-Reconnexion

Après avoir reconnecté le restaurant, vérifiez :

### 1. Vérification dans la Base de Données

```sql
SELECT 
    name,
    CASE 
        WHEN ("whatsappApiToken" IS NOT NULL AND "whatsappApiToken" != '') 
          AND ("whatsappBusinessId" IS NOT NULL AND "whatsappBusinessId" != '') 
        THEN '✅ CONNECTÉ'
        ELSE '❌ DÉCONNECTÉ'
    END as status_connexion
FROM restaurants
WHERE slug = 'nile-bites';
```

### 2. Vérification dans l'Application

- ✅ Les logs du backend devraient afficher : `✅ WhatsApp API configurée`
- ✅ L'interface web devrait afficher le statut "Connecté"
- ✅ Test d'envoi de message dans l'inbox devrait fonctionner

### 3. Test Fonctionnel

1. Envoyer un message WhatsApp au numéro du restaurant
2. Vérifier que le message apparaît dans l'inbox
3. Répondre depuis l'inbox
4. Vérifier que le message est bien envoyé

---

## ⚠️ Problèmes Courants et Solutions

| Problème | Cause | Solution |
|----------|-------|----------|
| "WhatsApp API non configurée" | Champs vides | Remplir `whatsappApiToken` et `whatsappBusinessId` |
| "Invalid access token (401)" | Token expiré | Générer un nouveau token dans Meta Business Manager |
| "Phone number not found (404)" | Business ID incorrect | Vérifier le Phone Number ID dans Meta Business Manager |
| Messages non reçus | Webhook mal configuré | Vérifier la configuration du webhook dans Meta |

---

## 📚 Fichiers de Référence

- **Guide complet** : `GUIDE_RECONNEXION_WHATSAPP.md`
- **Configuration initiale** : `GUIDE_CONFIGURATION_WHATSAPP.md`
- **Script de diagnostic** : `scripts/check-whatsapp-connection.sql`
- **Script de reconnexion** : `scripts/reconnect-whatsapp-restaurant.sql`

---

## 🎯 Prochaines Étapes Recommandées

1. ✅ **Exécuter le diagnostic** : Utiliser `check-whatsapp-connection.sql` pour confirmer le statut
2. ✅ **Reconnecter le restaurant** : Utiliser l'interface web ou le script SQL
3. ✅ **Vérifier la connexion** : Tester l'envoi/réception de messages
4. ✅ **Configurer le webhook** : S'assurer que les webhooks sont bien configurés dans Meta
5. ✅ **Documenter les credentials** : Stocker les credentials de manière sécurisée (variables d'environnement ou base de données chiffrée)

---

## 📝 Notes Importantes

1. **Sécurité** : Ne jamais commiter les tokens WhatsApp dans le code source
2. **Expiration** : Les tokens expirent (24h pour temporaires, 60 jours pour permanents)
3. **Renouvellement** : Mettre en place un système de renouvellement automatique pour les tokens permanents
4. **Test** : Toujours tester la connexion après avoir mis à jour les credentials

---

**Statut Final** : ✅ Scripts et guides créés - Prêt pour reconnexion  
**Action Requise** : L'utilisateur doit maintenant reconnecter le restaurant en suivant le guide
