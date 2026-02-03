# 📋 Compte Rendu - Correction Bug Webhook WhatsApp

**Date** : 12 janvier 2026  
**Agent** : Composer (Cursor AI)  
**Statut** : ✅ Bug corrigé - Identification du restaurant améliorée

---

## 🐛 Problème Identifié

### Bug Critique dans le Webhook WhatsApp

**Fichier** : `apps/api/src/routes/whatsapp.routes.ts`

**Problème** : Le code cherchait le restaurant avec le numéro du **CLIENT** au lieu du numéro du **RESTAURANT**.

```typescript
// ❌ AVANT (INCORRECT)
const restaurant = await prisma.restaurant.findFirst({
  where: {
    isActive: true,
    whatsappNumber: phone, // phone = numéro du CLIENT, pas du restaurant !
  },
});
```

**Conséquence** :
- Les messages WhatsApp entrants ne trouvaient jamais le restaurant
- Les conversations n'étaient pas créées correctement
- Les messages étaient ignorés silencieusement

---

## ✅ Solution Implémentée

### Correction Basée sur Jasper's Market

**Référence** : `jaspers-market-example/app.js` ligne 53

**Solution** : Utiliser le `phone_number_id` depuis les métadonnées du webhook pour identifier le restaurant.

```typescript
// ✅ APRÈS (CORRECT)
const phoneNumberId = value.metadata?.phone_number_id;

const restaurant = await prisma.restaurant.findFirst({
  where: {
    isActive: true,
    whatsappBusinessId: phoneNumberId, // Correspondance par WhatsApp Business ID
  },
});
```

### Améliorations Apportées

1. ✅ **Identification correcte du restaurant** via `phone_number_id`
2. ✅ **Fallback** : Si `phone_number_id` manque, utilise le premier restaurant actif
3. ✅ **Création de client améliorée** : Prend maintenant le `restaurantId` en paramètre
4. ✅ **Logs améliorés** : Affichage du restaurant et client trouvés

---

## 📝 Modifications Effectuées

### 1. Fonction `handleIncomingMessages` ✅

**Changements** :
- ✅ Récupération du `phone_number_id` depuis `value.metadata`
- ✅ Recherche du restaurant via `whatsappBusinessId` au lieu de `whatsappNumber`
- ✅ Fallback si `phone_number_id` manque
- ✅ Logs améliorés pour diagnostic

### 2. Fonction `findOrCreateCustomer` ✅

**Changements** :
- ✅ Ajout du paramètre `restaurantId` obligatoire
- ✅ Recherche du client dans le contexte du restaurant spécifique
- ✅ Création du client dans le bon restaurant
- ✅ Logs pour nouveaux clients créés

---

## 🔍 Diagnostic du Problème Utilisateur

### Scénario Testé

1. ✅ Commande passée sur le site web Nile Bites
2. ✅ Message envoyé sur WhatsApp
3. ❌ Pas de retour WhatsApp
4. ❌ Commande non reçue dans l'app admin

### Causes Identifiées

1. **Bug principal** : Restaurant non trouvé → Messages ignorés
2. **Webhook peut-être non configuré** : Vérifier dans Meta Business Manager
3. **Restaurant peut-être déconnecté** : Vérifier `whatsappApiToken` et `whatsappBusinessId`

---

## ✅ Checklist de Vérification

### 1. Vérifier la Connexion WhatsApp

```sql
-- Exécuter scripts/check-whatsapp-connection.sql
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

### 2. Vérifier que le Serveur est Démarré

```bash
curl http://localhost:4000/health
```

### 3. Vérifier les Logs du Serveur

Après avoir envoyé un message WhatsApp, vérifier les logs :

**Logs attendus** :
```
✅ Webhook signature verified
✅ Message reçu de +201276921081 dans la conversation xxx
   Restaurant: Nile Bites (xxx)
   Customer: Nom Client (+201276921081) (xxx)
   Content: Message du client...
```

**Si pas de logs** :
- Webhook non configuré dans Meta Business Manager
- Serveur backend non démarré
- Erreur de signature (en production)

### 4. Vérifier les Conversations dans l'Inbox

Allez dans `/dashboard/inbox` et vérifiez si la conversation apparaît.

---

## 🚨 Problèmes Restants Possibles

### Problème 1 : Restaurant Déconnecté

**Symptôme** : `whatsappApiToken` ou `whatsappBusinessId` vides

**Solution** : Suivre `GUIDE_RECONNEXION_WHATSAPP.md`

### Problème 2 : Webhook Non Configuré

**Symptôme** : Aucun log de webhook reçu

**Solution** :
1. Configurer le webhook dans Meta Business Manager
2. URL : `https://votre-domaine.com/api/webhooks/whatsapp`
3. Token : Utiliser `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
4. Abonnements : `messages` et `message_status`

### Problème 3 : Messages Reçus mais Pas de Commande

**Symptôme** : Conversation visible dans l'inbox mais pas de commande

**Cause** : Normal ! Les commandes ne sont pas créées automatiquement depuis les messages

**Solution** :
- Créer la commande manuellement depuis l'inbox
- Ou activer le parsing IA automatique

---

## 📚 Documentation Créée

1. ✅ `GUIDE_DIAGNOSTIC_COMMANDES_WHATSAPP.md` - Guide complet de diagnostic
2. ✅ `scripts/diagnostic-whatsapp-commande.sql` - Script SQL de diagnostic
3. ✅ `COMPTE_RENDU_CORRECTION_WEBHOOK.md` - Ce compte rendu

---

## 🎯 Prochaines Étapes

1. ✅ **Bug corrigé** - Le restaurant est maintenant correctement identifié
2. ⏳ **Tester** - Envoyer un nouveau message WhatsApp et vérifier les logs
3. ⏳ **Vérifier** - S'assurer que le restaurant est connecté
4. ⏳ **Configurer** - Vérifier que le webhook est configuré dans Meta

---

**Statut Final** : ✅ Bug corrigé - Prêt pour tests  
**Action Requise** : Tester avec un nouveau message WhatsApp et vérifier les logs
