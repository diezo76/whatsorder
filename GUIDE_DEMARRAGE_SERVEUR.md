# 🚀 Guide de Démarrage du Serveur Backend

## ❌ Erreur : `ERR_CONNECTION_REFUSED`

Cette erreur signifie que **le serveur backend n'est pas démarré** ou n'écoute pas sur le port 4000.

---

## ✅ Solution : Démarrer le Serveur Backend

### Option 1 : Depuis la racine du projet

```bash
cd "/Users/diezowee/whatsapp order"
pnpm --filter api dev
```

### Option 2 : Depuis le dossier API

```bash
cd "/Users/diezowee/whatsapp order/apps/api"
pnpm dev
```

---

## 🔍 Vérification

Après avoir démarré le serveur, vous devriez voir dans le terminal :

```
🚀 API server running on http://localhost:4000
📚 Health check: http://localhost:4000/health
🔐 Auth endpoints: http://localhost:4000/api/auth
🌐 Public endpoints: http://localhost:4000/api/public
🍽️  Menu endpoints: http://localhost:4000/api/menu
🏪 Restaurant endpoints: http://localhost:4000/api/restaurant
📦 Order endpoints: http://localhost:4000/api/orders
🤖 AI endpoints: http://localhost:4000/api/ai
📊 Analytics endpoints: http://localhost:4000/api/analytics
🔌 Socket.io server ready
```

---

## ✅ Test de Santé

Une fois le serveur démarré, testez :

```bash
curl http://localhost:4000/health
```

**Réponse attendue** :
```json
{"status":"ok","timestamp":"...","service":"whataybo-api"}
```

---

## 📝 Notes Importantes

1. **Le serveur backend doit être démarré** pour que le checkout fonctionne
2. **Gardez le terminal ouvert** où le serveur tourne
3. **Si vous modifiez le code**, le serveur se redémarre automatiquement (si vous utilisez `pnpm dev` avec watch mode)

---

## 🐛 Si le Serveur Ne Démarre Pas

### Vérifier PostgreSQL

```bash
# Vérifier si PostgreSQL est démarré
pg_isready -h localhost -p 5432

# Si non démarré :
brew services start postgresql@15
```

### Vérifier les Variables d'Environnement

Assurez-vous que le fichier `apps/api/.env` existe et contient :

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/whatsorder
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Vérifier les Dépendances

```bash
cd apps/api
pnpm install
```

---

**Une fois le serveur démarré, réessayez de passer une commande depuis le checkout !** 🎉
