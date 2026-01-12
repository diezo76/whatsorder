# 🔧 Solution : Erreurs dans le Script create-order.sh

## ❌ Problèmes Identifiés

### 1. Erreur `head: illegal line count -- -1`

**Cause** : Sur macOS, la commande `head` (BSD) ne supporte pas l'option `-n -1`.

**Solution** : Remplacé par `sed '$d'` qui est compatible macOS/Linux.

```bash
# Avant (ne fonctionne pas sur macOS)
HTTP_BODY=$(echo "$RESPONSE" | head -n -1)

# Après (compatible macOS/Linux)
HTTP_BODY=$(echo "$RESPONSE" | sed '$d')
```

---

### 2. Erreur 404 sur `/api/customers` et `/api/menu/items`

**Cause** : Ces endpoints n'existent pas dans Next.js (port 3000). Ils doivent être créés ou les IDs doivent être obtenus depuis la base de données.

**Solution** : Utiliser Prisma Studio ou Supabase Dashboard pour obtenir les IDs.

---

### 3. Erreur "Invalid or expired token"

**Cause** : Le token JWT n'est pas valide ou a expiré.

**Solution** : Obtenir un nouveau token via `/api/auth/login`.

---

## ✅ Solutions Appliquées

### 1. Script Corrigé

Le script `create-order.sh` a été corrigé pour fonctionner sur macOS :
- ✅ Utilise `sed '$d'` au lieu de `head -n -1`
- ✅ Compatible macOS (BSD) et Linux (GNU)

### 2. Nouveau Script : `get-ids.sh`

Créé un script pour obtenir les IDs depuis la base de données :
```bash
./scripts/get-ids.sh
```

### 3. Guide Mis à Jour

Le guide `GUIDE_CREER_COMMANDE.md` a été mis à jour avec :
- ✅ Instructions pour obtenir les IDs via Prisma Studio
- ✅ Instructions pour obtenir les IDs via Supabase Dashboard
- ✅ Instructions pour obtenir les IDs via SQL direct

---

## 🚀 Utilisation Correcte

### Étape 1 : Obtenir un Token Valide

```bash
# Via l'interface web
# 1. Allez sur http://localhost:3000/login
# 2. Connectez-vous
# 3. Ouvrez la console (F12)
# 4. Tapez: localStorage.getItem('token')
# 5. Copiez le token

export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Étape 2 : Obtenir les IDs

**Option A : Via Prisma Studio (Recommandé)**

```bash
cd apps/web
pnpm db:studio
```

Ouvrez http://localhost:5555 :
- Table `customers` → Copiez un `id`
- Table `menu_items` → Copiez un `id` (avec `isActive = true`)

**Option B : Via Script**

```bash
./scripts/get-ids.sh
```

**Option C : Via Supabase Dashboard**

1. Allez sur https://supabase.com/dashboard/project/rvndgopsysdyycelmfuu/editor
2. Ouvrez les tables `customers` et `menu_items`
3. Copiez les IDs

### Étape 3 : Créer la Commande

```bash
export TOKEN="votre_token"
export CUSTOMER_ID="uuid-customer"
export MENU_ITEM_ID="uuid-item"

./scripts/create-order.sh
```

---

## 📝 Exemple Complet

```bash
# 1. Login et obtenir token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@restaurant.com","password":"password123"}' \
  | jq -r '.token')

echo "Token obtenu: ${TOKEN:0:20}..."

# 2. Obtenir IDs depuis Prisma Studio ou Supabase
# Ouvrez http://localhost:5555 (Prisma Studio)
# Ou utilisez le script:
./scripts/get-ids.sh

# 3. Définir les variables
export TOKEN="$TOKEN"
export CUSTOMER_ID="uuid-customer"  # Remplacez par un vrai UUID
export MENU_ITEM_ID="uuid-item"     # Remplacez par un vrai UUID

# 4. Créer la commande
./scripts/create-order.sh
```

---

## 🔍 Vérification

Après création, vérifiez la commande :

```bash
# Lister les commandes
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/orders | jq '.'
```

---

## ✅ Checklist

- [x] Script corrigé pour macOS
- [x] Script `get-ids.sh` créé
- [x] Guide mis à jour
- [ ] Token valide obtenu
- [ ] Customer ID obtenu
- [ ] Menu Item ID obtenu
- [ ] Commande créée avec succès

---

**Les scripts sont maintenant prêts à être utilisés ! 🎉**
