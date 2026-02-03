# 📱 Guide de Configuration WhatsApp Business Cloud API

**Date** : 11 janvier 2026  
**Version** : 1.0.0

---

## 🎯 Vue d'Ensemble

Ce guide explique comment configurer l'intégration WhatsApp Business Cloud API pour Whataybo. Une fois configurée, l'application pourra :
- ✅ Envoyer des notifications automatiques aux clients (statuts de commande)
- ✅ Recevoir des messages entrants des clients
- ✅ Gérer les conversations WhatsApp dans l'interface

---

## 📋 Prérequis

1. **Compte Meta Business** avec accès à WhatsApp Business API
2. **Application Meta** créée sur [Meta for Developers](https://developers.facebook.com/)
3. **Numéro de téléphone WhatsApp Business** vérifié
4. **Token d'accès** avec permissions `whatsapp_business_messaging` et `whatsapp_business_management`

---

## 🔧 Configuration

### Option 1 : Configuration Globale (Variables d'Environnement)

Ajoutez ces variables dans votre fichier `.env` ou sur votre plateforme de déploiement :

```bash
# WhatsApp Business Cloud API
WHATSAPP_PHONE_NUMBER_ID="123456789012345"  # ID du numéro WhatsApp Business
WHATSAPP_ACCESS_TOKEN="EAAxxxxxxxxxxxxx"     # Token d'accès permanent
WHATSAPP_API_URL="https://graph.facebook.com"  # Optionnel, valeur par défaut
WHATSAPP_API_VERSION="v18.0"                 # Optionnel, valeur par défaut
WHATSAPP_WEBHOOK_VERIFY_TOKEN="whataybo_webhook_token"  # Token pour vérifier le webhook
```

### Option 2 : Configuration par Restaurant (Recommandé)

Chaque restaurant peut avoir sa propre configuration WhatsApp dans la base de données :

1. Connectez-vous au dashboard Whataybo
2. Allez dans **Paramètres** > **Intégrations**
3. Remplissez :
   - **Numéro WhatsApp Business** : Le numéro WhatsApp Business
   - **WhatsApp Business ID** : L'ID du numéro (trouvable dans Meta Business Manager)
   - **WhatsApp API Token** : Le token d'accès

**Avantages** :
- ✅ Chaque restaurant peut avoir son propre compte WhatsApp
- ✅ Plus flexible pour les multi-restaurants
- ✅ Configuration indépendante par restaurant

---

## 🔑 Obtenir les Credentials

### 1. Créer une Application Meta

1. Allez sur [Meta for Developers](https://developers.facebook.com/)
2. Créez une nouvelle application
3. Sélectionnez **Business** comme type d'application
4. Ajoutez le produit **WhatsApp**

### 2. Obtenir le Phone Number ID

1. Dans votre application Meta, allez dans **WhatsApp** > **API Setup**
2. Copiez le **Phone number ID** (ex: `123456789012345`)

### 3. Obtenir l'Access Token

#### Token Temporaire (pour tests)
1. Dans **WhatsApp** > **API Setup**
2. Copiez le **Temporary access token**

#### Token Permanent (pour production)
1. Allez dans **WhatsApp** > **API Setup** > **Access Tokens**
2. Créez un nouveau token avec les permissions :
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
3. Copiez le token (commence par `EAA...`)

⚠️ **Important** : Le token permanent expire après 60 jours. Configurez un système de renouvellement automatique.

### 4. Configurer le Webhook

1. Dans **WhatsApp** > **Configuration** > **Webhooks**
2. Cliquez sur **Modifier** ou **Configurer**
3. **URL du callback** : `https://votre-domaine.com/api/webhooks/whatsapp`
4. **Token de vérification** : Utilisez le même que `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
5. **Abonnements** : Cochez `messages` et `message_status`
6. Cliquez sur **Vérifier et sauvegarder**

Meta enverra une requête GET pour vérifier le webhook. L'application répondra automatiquement.

---

## 🧪 Tester la Configuration

### 1. Vérifier la Configuration au Démarrage

Lors du démarrage de l'API, vous devriez voir :
```
✅ WhatsApp API configurée
```

Si vous voyez un warning, vérifiez vos variables d'environnement.

### 2. Tester l'Envoi d'un Message

Vous pouvez tester l'envoi via l'API directement :

```bash
curl -X POST http://localhost:4000/api/test/whatsapp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "phone": "201234567890",
    "message": "Test message depuis Whataybo"
  }'
```

### 3. Tester la Réception de Messages

1. Envoyez un message WhatsApp au numéro Business configuré
2. Vérifiez les logs de l'API :
   ```
   ✅ Message reçu de +201234567890 dans la conversation abc-123
   ```
3. Vérifiez dans l'interface **Inbox** que le message apparaît

---

## 📝 Format des Numéros de Téléphone

L'application formate automatiquement les numéros de téléphone au format international :

- `+20 12 3456 7890` → `201234567890`
- `00201234567890` → `201234567890`
- `01234567890` → `201234567890` (suppose Égypte +20)
- `201234567890` → `201234567890` (déjà formaté)

**Format requis** : Numéro international sans `+` ni espaces (ex: `201234567890`)

---

## 🔄 Fonctionnalités Implémentées

### ✅ Envoi de Messages

- **Notifications automatiques** : Envoyées lors des changements de statut de commande
- **Messages personnalisés** : Formatage automatique selon le statut
- **Gestion d'erreurs** : Les erreurs sont loggées mais n'interrompent pas le processus

### ✅ Réception de Messages

- **Webhook Meta** : Reçoit les messages entrants
- **Création automatique** : Crée les clients et conversations si nécessaire
- **Support multi-média** : Images, documents, audio

### ✅ Statuts de Messages

- **Suivi en temps réel** : `sent`, `delivered`, `read`, `failed`
- **Mise à jour automatique** : Les statuts sont mis à jour dans la base de données

---

## 🚨 Dépannage

### Erreur : "WhatsApp API non configurée"

**Cause** : Variables d'environnement manquantes ou incorrectes

**Solution** :
1. Vérifiez que `WHATSAPP_PHONE_NUMBER_ID` et `WHATSAPP_ACCESS_TOKEN` sont définis
2. Redémarrez l'API après modification des variables

### Erreur : "WhatsApp API error (401): Unauthorized"

**Cause** : Token d'accès invalide ou expiré

**Solution** :
1. Vérifiez que le token est correct
2. Régénérez le token dans Meta Business Manager
3. Mettez à jour la variable `WHATSAPP_ACCESS_TOKEN`

### Erreur : "WhatsApp API error (403): Forbidden"

**Cause** : Permissions insuffisantes ou numéro non vérifié

**Solution** :
1. Vérifiez que le numéro WhatsApp Business est vérifié
2. Vérifiez les permissions du token (`whatsapp_business_messaging`)
3. Vérifiez que le Phone Number ID est correct

### Messages non reçus

**Cause** : Webhook non configuré ou URL incorrecte

**Solution** :
1. Vérifiez que le webhook est configuré dans Meta Business Manager
2. Vérifiez que l'URL est accessible publiquement (pas `localhost`)
3. Vérifiez que le token de vérification correspond
4. Testez le webhook avec l'outil de test Meta

### Messages non envoyés

**Cause** : Numéro de téléphone invalide ou restrictions Meta

**Solution** :
1. Vérifiez le format du numéro (doit être international sans +)
2. Vérifiez que le numéro n'est pas bloqué par Meta
3. Vérifiez les limites de taux (80 messages/seconde)
4. Vérifiez les logs pour plus de détails

---

## 📊 Limites et Quotas

### Limites Meta

- **Messages par seconde** : 80 messages/seconde
- **Requêtes API** : 1000 requêtes/5 minutes
- **Conversations gratuites** : 1000 conversations/mois (tier gratuit)
- **Conversations payantes** : $0.005-$0.05 par conversation selon le pays

### Recommandations

- ✅ Utilisez un système de queue pour gérer les envois en masse
- ✅ Implémentez un rate limiting côté application
- ✅ Cachez les tokens pour éviter les appels API répétés
- ✅ Surveillez les quotas via Meta Business Manager

---

## 🔐 Sécurité

### Bonnes Pratiques

1. **Ne jamais exposer les tokens** :
   - ❌ Ne pas commiter les tokens dans Git
   - ✅ Utiliser des variables d'environnement
   - ✅ Utiliser un gestionnaire de secrets (Vercel, Railway, etc.)

2. **Valider les webhooks** :
   - ✅ Vérifier le token de vérification
   - ✅ Valider la signature Meta (optionnel mais recommandé)

3. **Limiter l'accès** :
   - ✅ Utiliser HTTPS pour les webhooks
   - ✅ Restreindre les IPs autorisées (si possible)

---

## 📚 Ressources

- [Documentation WhatsApp Business Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Meta for Developers](https://developers.facebook.com/)
- [Guide de démarrage WhatsApp](https://developers.facebook.com/docs/whatsapp/getting-started)
- [Référence API](https://developers.facebook.com/docs/whatsapp/cloud-api/reference)

---

## ✅ Checklist de Configuration

- [ ] Application Meta créée
- [ ] Produit WhatsApp ajouté
- [ ] Phone Number ID obtenu
- [ ] Access Token obtenu (permanent)
- [ ] Variables d'environnement configurées
- [ ] Webhook configuré dans Meta
- [ ] Webhook vérifié (statut "Vérifié" dans Meta)
- [ ] Test d'envoi réussi
- [ ] Test de réception réussi
- [ ] Configuration testée en production

---

**Fin du guide**
