# 🔍 Guide de Debug - Checkout WhatsApp

## 🐛 Problème : "Rien ne se passe" quand on clique sur "Envoyer sur WhatsApp"

---

## ✅ Vérifications à Faire

### 1. Ouvrir la Console du Navigateur

1. Ouvrez votre site web
2. Appuyez sur `F12` ou `Cmd+Option+I` (Mac) pour ouvrir les outils de développement
3. Allez dans l'onglet **Console**

### 2. Cliquer sur "Envoyer sur WhatsApp"

Après avoir cliqué, vous devriez voir dans la console :

**Si tout va bien** :
```
🔵 [CHECKOUT] Clic sur "Envoyer sur WhatsApp" { restaurant: {...}, hasSlug: true, ... }
📤 Création de commande: { endpoint: "...", restaurantSlug: "nile-bites", ... }
📥 Réponse API: { status: 201, statusText: "Created", ok: true }
✅ Commande créée avec succès: { success: true, order: {...} }
```

**Si problème** :
```
❌ [CHECKOUT] Slug du restaurant manquant { restaurant: {...} }
OU
❌ Erreur API: { error: "..." }
```

---

## 🔍 Causes Possibles

### 1. Slug du Restaurant Manquant

**Symptôme** : Message `"Slug du restaurant manquant"` dans la console

**Solution** :
- Vérifier que vous êtes sur une page avec un slug valide (ex: `/nile-bites`)
- Rafraîchir la page
- Vérifier que l'API retourne bien le slug : `curl http://localhost:4000/api/public/restaurants/nile-bites`

### 2. Numéro WhatsApp Manquant

**Symptôme** : Message `"Numéro WhatsApp du restaurant non configuré"`

**Solution** :
- Configurer le numéro WhatsApp dans les paramètres du restaurant
- Vérifier que `restaurant.whatsappNumber` existe

### 3. Panier Vide

**Symptôme** : Message `"Votre panier est vide"`

**Solution** :
- Ajouter des items au panier avant de passer commande

### 4. Erreur de Connexion

**Symptôme** : `ERR_CONNECTION_REFUSED` dans la console

**Solution** :
- Vérifier que le serveur backend est démarré : `curl http://localhost:4000/health`
- Si non démarré : `cd apps/api && pnpm dev`

### 5. Erreur API

**Symptôme** : Erreur dans `📥 Réponse API` ou `❌ Erreur API`

**Solution** :
- Regarder le message d'erreur dans la console
- Vérifier les logs du serveur backend
- Vérifier que les `menuItemId` dans le panier existent dans la base de données

---

## 🛠️ Améliorations Apportées

### 1. Logs Détaillés ✅

Ajout de logs dans `CheckoutStepConfirmation.tsx` :
- `🔵 [CHECKOUT] Clic sur "Envoyer sur WhatsApp"` - Au clic
- `📤 Création de commande` - Avant l'appel API
- `📥 Réponse API` - Réponse du serveur
- `✅ Commande créée avec succès` - Succès
- `❌ Erreur API` - Erreur

### 2. Validation Améliorée ✅

- Vérification du slug avant l'appel API
- Vérification du numéro WhatsApp
- Vérification que le panier n'est pas vide
- Messages d'erreur clairs

### 3. Bouton Désactivé ✅

Le bouton est maintenant désactivé si :
- Le slug est manquant
- Le numéro WhatsApp est manquant
- Le panier est vide

Le texte du bouton change pour indiquer le problème.

### 4. Slug Garanti dans l'API ✅

L'API `/api/public/restaurants/:slug` retourne maintenant explicitement le `slug` dans la réponse.

---

## 📝 Prochaines Étapes

1. **Ouvrir la console du navigateur** (F12)
2. **Cliquer sur "Envoyer sur WhatsApp"**
3. **Regarder les logs** dans la console
4. **Partager les logs** avec moi pour diagnostic

Les logs vous diront exactement où le problème se situe !

---

**Statut** : ✅ Logs et validations améliorés - Prêt pour diagnostic
