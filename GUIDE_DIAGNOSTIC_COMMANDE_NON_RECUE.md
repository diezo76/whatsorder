# 🔍 Guide de Diagnostic - Commande Non Reçue dans l'App Admin

## 🎯 Problème
Une commande a été passée depuis le checkout web mais n'apparaît pas dans l'app admin.

---

## ✅ Checklist de Diagnostic

### 1. Vérifier que la Commande a été Créée dans la Base de Données

**Option A : Via SQL**
```bash
psql $DATABASE_URL -f scripts/check-recent-orders.sql
```

**Option B : Via l'API directement**
```bash
# Vérifier les commandes récentes (nécessite authentification)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4000/api/orders?date=today
```

**Option C : Vérifier dans les logs du serveur**
Regardez les logs du serveur backend (terminal où `pnpm dev` tourne) pour voir :
- `✅ Commande créée: ORD-XXXXX pour le restaurant ...`
- `[Socket] New order created: ORD-XXXXX`

---

### 2. Vérifier les Erreurs dans la Console du Navigateur

1. Ouvrez la console du navigateur (F12)
2. Allez dans l'onglet "Console"
3. Regardez les erreurs lors du clic sur "Envoyer sur WhatsApp"
4. Vérifiez s'il y a des erreurs :
   - `ERR_CONNECTION_REFUSED` → Le serveur backend n'est pas démarré
   - `401 Unauthorized` → Problème d'authentification
   - `404 Not Found` → L'endpoint n'existe pas
   - `400 Bad Request` → Données invalides

---

### 3. Vérifier que le Serveur Backend est Démarré

```bash
# Vérifier si le serveur écoute sur le port 4000
lsof -ti:4000

# OU vérifier la santé du serveur
curl http://localhost:4000/health
```

**Si le serveur n'est pas démarré** :
```bash
cd apps/api
pnpm dev
```

---

### 4. Vérifier l'URL de l'API dans le Checkout

Le checkout utilise :
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
```

**Vérifier** :
1. Ouvrez la console du navigateur
2. Tapez : `process.env.NEXT_PUBLIC_API_URL`
3. Vérifiez que c'est bien `http://localhost:4000` ou votre URL de production

---

### 5. Vérifier que l'Utilisateur est Connecté dans l'App Admin

1. Ouvrez l'app admin (`http://localhost:3000/dashboard/orders`)
2. Vérifiez que vous êtes connecté (pas de redirection vers `/login`)
3. Vérifiez que `user.restaurantId` existe dans la console :
   ```javascript
   // Dans la console du navigateur
   localStorage.getItem('user')
   ```

---

### 6. Vérifier que le RestaurantId Correspond

**Problème possible** : La commande est créée pour un restaurant mais l'utilisateur connecté appartient à un autre restaurant.

**Vérification** :
1. Notez le `restaurantId` de la commande créée (dans les logs ou la DB)
2. Vérifiez le `restaurantId` de l'utilisateur connecté
3. Ils doivent correspondre !

---

### 7. Vérifier les Logs du Serveur Backend

Regardez les logs dans le terminal où le serveur backend tourne :

**Logs attendus lors de la création d'une commande** :
```
✅ Commande créée: ORD-20260111-001 pour le restaurant Nile Bites
[Socket] New order created: ORD-20260111-001
```

**Si vous voyez des erreurs** :
- `Error creating order:` → Vérifiez le message d'erreur complet
- `Menu item XXX non trouvé` → Les items du panier n'existent pas dans la DB
- `Restaurant non trouvé` → Le slug du restaurant est incorrect

---

### 8. Tester l'Endpoint Directement

**Test avec curl** :
```bash
# Remplacer "nile-bites" par le slug de votre restaurant
curl -X POST http://localhost:4000/api/public/restaurants/nile-bites/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "menuItemId": "VOTRE_MENU_ITEM_ID",
        "quantity": 1,
        "unitPrice": 50
      }
    ],
    "customerName": "Test Client",
    "customerPhone": "+201234567890",
    "deliveryType": "DELIVERY",
    "deliveryAddress": "123 Test Street"
  }'
```

**Réponse attendue** :
```json
{
  "success": true,
  "order": {
    "id": "uuid",
    "orderNumber": "ORD-20260111-001",
    "total": 70.00,
    "status": "PENDING"
  },
  "restaurant": {
    "name": "Nile Bites",
    "whatsappNumber": "+201234567890"
  }
}
```

---

### 9. Vérifier Socket.io

La commande devrait apparaître automatiquement via Socket.io. Vérifiez :

1. Dans la console du navigateur (app admin), vous devriez voir :
   ```
   📡 Orders status: SUBSCRIBED
   ```

2. Si vous voyez `New order received:` dans la console, Socket.io fonctionne.

3. Si Socket.io ne fonctionne pas, la commande apparaîtra quand vous rafraîchirez la page.

---

## 🔧 Solutions Courantes

### Problème 1 : Le Serveur Backend n'est pas Démarré
**Solution** :
```bash
cd apps/api
pnpm dev
```

### Problème 2 : CORS ou URL Incorrecte
**Solution** : Vérifiez que `NEXT_PUBLIC_API_URL` pointe vers `http://localhost:4000`

### Problème 3 : RestaurantId Ne Correspond Pas
**Solution** : Vérifiez que le slug du restaurant dans l'URL correspond au restaurant de l'utilisateur connecté

### Problème 4 : Items du Menu N'Existent Pas
**Solution** : Vérifiez que les `menuItemId` dans le panier existent dans la base de données

### Problème 5 : Erreur de Validation
**Solution** : Vérifiez les données envoyées (nom, téléphone, etc.) dans la console du navigateur

---

## 📝 Prochaines Étapes

1. ✅ Vérifier les logs du serveur backend
2. ✅ Vérifier la console du navigateur (erreurs)
3. ✅ Vérifier que la commande existe dans la DB
4. ✅ Vérifier que l'utilisateur est connecté
5. ✅ Vérifier que le restaurantId correspond
6. ✅ Tester l'endpoint directement avec curl

---

## 🆘 Si Rien ne Fonctionne

Envoyez-moi :
1. Les logs du serveur backend (dernières 50 lignes)
2. Les erreurs de la console du navigateur
3. Le résultat de `scripts/check-recent-orders.sql`
4. Le slug du restaurant utilisé dans le checkout
