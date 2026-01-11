# 🗄️ Guide de Setup Base de Données

## 📋 Options Disponibles

Vous avez plusieurs options pour installer PostgreSQL :

---

## Option 1 : Docker Desktop (Recommandé)

### Installation Docker Desktop

1. **Télécharger Docker Desktop** :
   - macOS : https://www.docker.com/products/docker-desktop/
   - Installez et lancez Docker Desktop

2. **Vérifier l'installation** :
   ```bash
   docker --version
   docker compose version
   ```

3. **Lancer PostgreSQL et Redis** :
   ```bash
   cd "/Users/diezowee/whatsapp order"
   docker compose -f docker/docker-compose.yml up -d
   ```

4. **Vérifier que les services tournent** :
   ```bash
   docker ps
   ```

5. **Exécuter les migrations** :
   ```bash
   cd apps/api
   pnpm prisma migrate dev --name init
   ```

---

## Option 2 : PostgreSQL via Homebrew

### Installation

```bash
# Installer PostgreSQL
brew install postgresql@15

# Lancer PostgreSQL au démarrage
brew services start postgresql@15

# Créer la base de données
createdb whatsorder

# Créer l'utilisateur (optionnel)
psql postgres
CREATE USER whatsorder WITH PASSWORD 'whatsorder_dev';
GRANT ALL PRIVILEGES ON DATABASE whatsorder TO whatsorder;
\q
```

### Mettre à jour `.env`

Mettre à jour `apps/api/.env` :

```env
DATABASE_URL="postgresql://whatsorder:whatsorder_dev@localhost:5432/whatsorder?schema=public"
```

Ou si vous utilisez l'utilisateur par défaut :

```env
DATABASE_URL="postgresql://$(whoami)@localhost:5432/whatsorder?schema=public"
```

### Installer Redis

```bash
brew install redis
brew services start redis
```

---

## Option 3 : Supabase (Cloud - Gratuit)

### Setup Supabase

1. **Créer un compte** : https://supabase.com
2. **Créer un nouveau projet**
3. **Récupérer la connection string** dans Settings > Database

### Mettre à jour `.env`

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

### Redis Cloud

Utiliser Redis Cloud gratuit : https://redis.com/try-free/

```env
REDIS_URL="redis://[YOUR-REDIS-URL]"
```

---

## Option 4 : Railway (Cloud - Gratuit)

### Setup Railway

1. **Créer un compte** : https://railway.app
2. **Créer un nouveau projet**
3. **Ajouter PostgreSQL** : New > Database > PostgreSQL
4. **Récupérer la connection string** dans Variables

### Mettre à jour `.env`

```env
DATABASE_URL="[VOTRE-CONNECTION-STRING-FROM-RAILWAY]"
```

---

## ✅ Vérification

Une fois PostgreSQL configuré, testez la connexion :

```bash
cd apps/api

# Tester la connexion
pnpm prisma db pull

# Créer les migrations
pnpm prisma migrate dev --name init

# Générer le client Prisma
pnpm prisma generate
```

---

## 🐛 Dépannage

### Erreur : "Can't reach database server"

1. Vérifiez que PostgreSQL tourne :
   ```bash
   # Docker
   docker ps
   
   # Homebrew
   brew services list
   ```

2. Vérifiez le port :
   ```bash
   lsof -i :5432
   ```

3. Vérifiez les credentials dans `.env`

### Erreur : "Database does not exist"

Créez la base de données :
```bash
createdb whatsorder
```

---

## 📝 Recommandation

Pour le développement local, **Docker Desktop** est la solution la plus simple car :
- ✅ Tout est isolé dans des containers
- ✅ Facile à démarrer/arrêter
- ✅ Configuration identique pour toute l'équipe
- ✅ Pas besoin d'installer PostgreSQL localement

---

**Dernière mise à jour** : 11 janvier 2026
