# 🔧 Guide de Dépannage - Erreurs de Connexion API

## ❌ Problème : ERR_CONNECTION_REFUSED sur le port 4000

### Symptômes
- Erreurs dans la console du navigateur : `ERR_CONNECTION_REFUSED`
- Les requêtes vers `http://localhost:4000/api/*` échouent
- L'application frontend ne peut pas charger les données

### Causes possibles
1. **Le serveur backend n'est pas démarré** (cause la plus fréquente)
2. **PostgreSQL n'est pas démarré** (le backend nécessite une base de données)
3. **Les variables d'environnement ne sont pas configurées**
4. **Le port 4000 est utilisé par un autre processus**

---

## ✅ Solution Étape par Étape

### Étape 1 : Vérifier l'état des services

```bash
# Vérifier si PostgreSQL est démarré
pg_isready -h localhost -p 5432

# Vérifier si le port 4000 est utilisé
lsof -ti:4000
```

### Étape 2 : Démarrer PostgreSQL

#### Option A : Via Homebrew (recommandé sur macOS)

```bash
# Démarrer PostgreSQL
brew services start postgresql@15

# OU utiliser le script fourni
./scripts/start-services.sh
```

#### Option B : Via Docker (si Docker est installé)

```bash
cd docker
docker compose up -d postgres redis
```

### Étape 3 : Vérifier la configuration de la base de données

Assurez-vous que le fichier `apps/api/.env` existe et contient :

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/whatsorder
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Note** : Si la base de données n'existe pas encore, créez-la :

```bash
createdb whatsorder
```

### Étape 4 : Exécuter les migrations Prisma

```bash
cd apps/api
pnpm prisma migrate dev
pnpm prisma generate
```

### Étape 5 : Démarrer le serveur backend

```bash
# Depuis la racine du projet
pnpm --filter api dev

# OU depuis apps/api
cd apps/api
pnpm dev
```

Vous devriez voir :
```
🚀 API server running on http://localhost:4000
📚 Health check: http://localhost:4000/health
```

### Étape 6 : Vérifier que le backend fonctionne

Ouvrez votre navigateur et allez sur :
- http://localhost:4000/health (devrait retourner `{"status":"ok"}`)
- http://localhost:4000/ (devrait afficher les endpoints disponibles)

### Étape 7 : Démarrer le frontend (si pas déjà démarré)

```bash
# Depuis la racine du projet
pnpm --filter web dev

# OU depuis apps/web
cd apps/web
pnpm dev
```

---

## 🚀 Démarrage Rapide (Tout en une fois)

Si vous avez déjà configuré PostgreSQL et les migrations :

```bash
# 1. Démarrer PostgreSQL
brew services start postgresql@15

# 2. Démarrer le backend ET le frontend
pnpm dev
```

---

## 🔍 Vérifications Avancées

### Vérifier les logs du backend

```bash
# Si le backend est démarré via pnpm dev
# Les logs apparaissent dans le terminal

# Pour voir les logs détaillés
cd apps/api
pnpm dev
```

### Vérifier la connexion à la base de données

```bash
cd apps/api
pnpm prisma studio
# Ouvre Prisma Studio sur http://localhost:5555
```

### Tester l'API directement

```bash
# Test de santé
curl http://localhost:4000/health

# Test des endpoints publics
curl http://localhost:4000/api/public/restaurants/nile-bites
```

---

## ⚠️ Problèmes Courants

### Problème : "Port 4000 already in use"

**Solution** :
```bash
# Trouver le processus qui utilise le port 4000
lsof -ti:4000

# Arrêter le processus (remplacez PID par le numéro du processus)
kill -9 PID

# OU utiliser un autre port en modifiant PORT dans apps/api/.env
```

### Problème : "Cannot connect to PostgreSQL"

**Solutions** :
1. Vérifier que PostgreSQL est démarré : `brew services list`
2. Vérifier la DATABASE_URL dans `apps/api/.env`
3. Vérifier que la base de données existe : `psql -l | grep whatsorder`

### Problème : "Prisma Client not generated"

**Solution** :
```bash
cd apps/api
pnpm prisma generate
```

### Problème : "Migration failed"

**Solution** :
```bash
cd apps/api
pnpm prisma migrate reset  # ⚠️ Supprime toutes les données
pnpm prisma migrate dev
pnpm prisma db seed
```

---

## 📝 Checklist de Démarrage

- [ ] PostgreSQL est démarré (`pg_isready` retourne OK)
- [ ] La base de données `whatsorder` existe
- [ ] Le fichier `apps/api/.env` est configuré
- [ ] Les migrations Prisma sont à jour (`pnpm prisma migrate dev`)
- [ ] Prisma Client est généré (`pnpm prisma generate`)
- [ ] Le backend démarre sans erreur (`pnpm --filter api dev`)
- [ ] Le backend répond sur http://localhost:4000/health
- [ ] Le frontend peut se connecter au backend

---

## 🆘 Besoin d'Aide ?

Si le problème persiste après avoir suivi ce guide :

1. Vérifiez les logs du backend dans le terminal
2. Vérifiez la console du navigateur (F12) pour les erreurs détaillées
3. Vérifiez que les deux serveurs (frontend et backend) sont démarrés
4. Vérifiez les variables d'environnement dans `apps/api/.env` et `apps/web/.env.local`

---

**Dernière mise à jour** : 11 janvier 2026
