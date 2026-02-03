# 🔍 Guide de Diagnostic - Commandes WhatsApp Non Reçues

**Date** : 12 janvier 2026  
**Problème** : Commande passée sur Nile Bites mais pas reçue dans l'app admin

---

## 🎯 Scénario de Test

1. ✅ Commande passée sur le site web Nile Bites
2. ✅ Message envoyé sur WhatsApp
3. ❌ Pas de retour WhatsApp
4. ❌ Commande non reçue dans l'app admin@whatsorder.com

---

## 🔍 Points de Vérification

### 1. Vérifier la Connexion WhatsApp du Restaurant

**Script SQL** : `scripts/check-whatsapp-connection.sql`

```sql
SELECT 
    name,
    CASE 
        WHEN ("whatsappApiToken" IS NULL OR "whatsappApiToken" = '' OR "whatsappApiToken" = 'your-access-token') 
          OR ("whatsappBusinessId" IS NULL OR "whatsappBusinessId" = '' OR "whatsappBusinessId" = 'your-phone-number-id')
        THEN '❌ DÉCONNECTÉ'
        ELSE '✅ CONNECTÉ'
    END as whatsapp_status
FROM restaurants
WHERE slug = 'nile-bites';
```

**Résultat attendu** : `✅ CONNECTÉ`

**Si déconnecté** : Suivre `GUIDE_RECONNEXION_WHATSAPP.md`

---

### 2. Vérifier que le Serveur Backend est Démarré

```bash
# Vérifier si le serveur tourne
curl http://localhost:4000/health

# Ou vérifier les processus
ps aux | grep "tsx.*index.ts" | grep -v grep
```

**Résultat attendu** : `{"status":"ok"}` ou processus actif

**Si non démarré** :
```bash
cd apps/api
pnpm dev
```

---

### 3. Vérifier la Configuration du Webhook dans Meta Business Manager

**Problème fréquent** : Le webhook n'est pas configuré ou mal configuré

**Vérifications** :
1. Allez sur [Meta Business Manager](https://business.facebook.com/)
2. Sélectionnez votre application WhatsApp
3. **WhatsApp** > **Configuration** > **Webhooks**
4. Vérifiez :
   - ✅ URL du webhook : `https://votre-domaine.com/api/webhooks/whatsapp`
   - ✅ Token de vérification : Même que `WHATSAPP_WEBHOOK_VERIFY_TOKEN` dans `.env`
   - ✅ Abonnements : `messages` et `message_status` cochés

**Si webhook non configuré** :
- En développement local, utilisez **ngrok** pour exposer votre serveur
- Configurez l'URL ngrok dans Meta Business Manager

---

### 4. Vérifier les Logs du Serveur

**Pendant le test** :
1. Ouvrez le terminal où tourne le serveur backend
2. Envoyez un message WhatsApp au numéro du restaurant
3. Observez les logs

**Logs attendus** :
```
✅ Webhook signature verified
✅ Message reçu de +201276921081 dans la conversation xxx
```

**Si aucun log** :
- Le webhook n'est pas reçu → Vérifier la configuration Meta
- Erreur de signature → Vérifier `WHATSAPP_APP_SECRET`
- Erreur de traitement → Vérifier les logs d'erreur

---

### 5. Comprendre le Flux de Commande

#### Flux Actuel (Checkout Web)

1. **Client passe commande sur le site** :
   - Le checkout génère un message WhatsApp formaté
   - Ouvre WhatsApp avec le message pré-rempli
   - ⚠️ **IMPORTANT** : La commande n'est PAS créée automatiquement dans la DB

2. **Client envoie le message sur WhatsApp** :
   - Meta envoie un webhook à votre serveur
   - Le webhook crée/update la conversation et le message
   - ⚠️ **IMPORTANT** : La commande n'est PAS créée automatiquement depuis le message

3. **Création de commande** :
   - Soit manuellement depuis le dashboard admin
   - Soit automatiquement via l'IA qui parse le message (si configuré)

#### Problème Identifié

**Le système actuel ne crée PAS automatiquement les commandes depuis les messages WhatsApp entrants.**

Il faut soit :
- Créer la commande manuellement depuis l'inbox
- Activer le parsing IA pour créer automatiquement les commandes

---

### 6. Vérifier les Messages Reçus dans l'Inbox

**Dans l'app admin** :
1. Allez dans `/dashboard/inbox`
2. Vérifiez si vous voyez la conversation avec le client
3. Vérifiez si le message est bien reçu

**Si pas de conversation** :
- Le webhook n'est pas reçu ou mal traité
- Vérifier les logs du serveur
- Vérifier la configuration du webhook

**Si conversation mais pas de commande** :
- Normal ! Il faut créer la commande manuellement ou activer le parsing IA

---

### 7. Vérifier les Commandes dans la Base de Données

**Script SQL** : `scripts/diagnostic-whatsapp-commande.sql`

```sql
-- Vérifier les commandes récentes
SELECT 
    o."orderNumber",
    o.status,
    o.total,
    o."createdAt",
    c.phone as customer_phone,
    c.name as customer_name
FROM orders o
LEFT JOIN customers c ON c.id = o."customerId"
LEFT JOIN restaurants r ON r.id = o."restaurantId"
WHERE r.slug = 'nile-bites'
ORDER BY o."createdAt" DESC
LIMIT 10;
```

**Si aucune commande** :
- Normal si vous n'avez créé que le message WhatsApp
- Il faut créer la commande manuellement depuis l'inbox

---

## 🔧 Solutions

### Solution 1 : Créer la Commande Manuellement depuis l'Inbox

1. Allez dans `/dashboard/inbox`
2. Ouvrez la conversation avec le client
3. Cliquez sur "Créer commande" (si disponible)
4. Remplissez les détails de la commande

### Solution 2 : Activer le Parsing IA Automatique

Si le parsing IA est activé, les commandes seront créées automatiquement depuis les messages.

**Vérifier** :
```sql
SELECT 
    "enableAiParsing"
FROM restaurants
WHERE slug = 'nile-bites';
```

**Activer** :
- Via l'interface admin dans les paramètres du restaurant
- Ou directement en DB

### Solution 3 : Améliorer le Flux (Recommandé)

**Option A** : Créer la commande automatiquement lors du checkout web
- Modifier le checkout pour créer la commande dans la DB
- Envoyer ensuite le message WhatsApp avec le numéro de commande

**Option B** : Créer la commande automatiquement lors de la réception du message WhatsApp
- Parser le message WhatsApp avec l'IA
- Créer automatiquement la commande si détectée

---

## 📋 Checklist de Diagnostic

- [ ] Restaurant connecté à WhatsApp (`whatsappApiToken` et `whatsappBusinessId` configurés)
- [ ] Serveur backend démarré sur le port 4000
- [ ] Webhook configuré dans Meta Business Manager
- [ ] `WHATSAPP_APP_SECRET` configuré dans `.env`
- [ ] Messages WhatsApp reçus dans l'inbox (vérifier `/dashboard/inbox`)
- [ ] Logs du serveur montrent la réception des webhooks
- [ ] Commandes créées (manuellement ou automatiquement)

---

## 🚨 Problèmes Courants

### Problème 1 : "Aucun message reçu"

**Causes possibles** :
- Webhook non configuré dans Meta
- Serveur backend non démarré
- URL webhook incorrecte
- Signature webhook invalide (en production)

**Solution** :
1. Vérifier la configuration du webhook dans Meta
2. Vérifier que le serveur est démarré
3. Vérifier les logs du serveur

### Problème 2 : "Messages reçus mais pas de commande"

**Cause** : Normal ! Les commandes ne sont pas créées automatiquement depuis les messages

**Solution** :
- Créer la commande manuellement depuis l'inbox
- Ou activer le parsing IA automatique

### Problème 3 : "Restaurant déconnecté"

**Solution** : Suivre `GUIDE_RECONNEXION_WHATSAPP.md`

---

## 📝 Prochaines Étapes Recommandées

1. ✅ Vérifier la connexion WhatsApp du restaurant
2. ✅ Vérifier que les messages sont bien reçus dans l'inbox
3. ✅ Créer la commande manuellement depuis l'inbox pour tester
4. 🔄 Améliorer le flux pour créer automatiquement les commandes

---

**Dernière mise à jour** : 12 janvier 2026
