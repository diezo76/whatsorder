# 🔧 Guide de Dépannage - Erreur Connexion Supabase

## ❌ Problème : "Can't reach database server at `db.rvndgopsysdyycelmfuu.supabase.co:5432`"

### Symptômes
- Erreur Prisma : `Can't reach database server`
- L'application essaie de se connecter à Supabase mais la connexion échoue
- Le backend ne peut pas démarrer ou fonctionner correctement

### Causes possibles
1. **La base de données Supabase n'est plus accessible** (projet suspendu, supprimé, ou credentials expirés)
2. **Problème de réseau** (firewall, VPN, connexion internet)
3. **Configuration incorrecte** dans le fichier `.env`
4. **Base de données locale non configurée** (recommandé pour le développement)

---

## ✅ Solution : Utiliser une Base de Données Locale

### Étape 1 : Vérifier que PostgreSQL est démarré

```bash
# Vérifier que PostgreSQL tourne
pg_isready -h localhost -p 5432

# Si PostgreSQL n'est pas démarré, le démarrer
brew services start postgresql@15
```

### Étape 2 : Créer la base de données locale (si elle n'existe pas)

```bash
# Créer la base de données whatsorder
createdb whatsorder

# Vérifier que la base de données existe
psql -l | grep whatsorder
```

### Étape 3 : Mettre à jour le fichier `.env`

Ouvrez le fichier `apps/api/.env` et modifiez la ligne `DATABASE_URL` :

**Remplacez :**
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.rvndgopsysdyycelmfuu.supabase.co:5432/postgres
```

**Par (option 1 - utilisateur par défaut) :**
```env
DATABASE_URL=postgresql://$(whoami)@localhost:5432/whatsorder?schema=public
```

**Ou par (option 2 - utilisateur spécifique) :**
```env
DATABASE_URL=postgresql://whatsorder:whatsorder_dev@localhost:5432/whatsorder?schema=public
```

**Note :** Si vous utilisez l'option 2, créez d'abord l'utilisateur :
```bash
psql postgres
CREATE USER whatsorder WITH PASSWORD 'whatsorder_dev';
GRANT ALL PRIVILEGES ON DATABASE whatsorder TO whatsorder;
\q
```

### Étape 4 : Exécuter les migrations Prisma

```bash
cd apps/api

# Générer le client Prisma
pnpm prisma generate

# Appliquer les migrations
pnpm prisma migrate dev

# (Optionnel) Ajouter des données de test
pnpm prisma db seed
```

### Étape 5 : Vérifier la connexion

```bash
# Tester la connexion avec Prisma Studio
pnpm prisma studio
# Ouvre http://localhost:5555 - si ça fonctionne, la connexion est OK
```

### Étape 6 : Redémarrer le backend

```bash
# Depuis la racine du projet
pnpm --filter api dev

# OU depuis apps/api
cd apps/api
pnpm dev
```

---

## 🔄 Alternative : Utiliser Docker (Recommandé)

Si vous préférez utiliser Docker pour isoler la base de données :

### Étape 1 : Installer Docker Desktop

Téléchargez depuis : https://www.docker.com/products/docker-desktop/

### Étape 2 : Démarrer PostgreSQL via Docker

```bash
cd "/Users/diezowee/whatsapp order"
docker compose -f docker/docker-compose.yml up -d postgres
```

### Étape 3 : Mettre à jour `.env`

```env
DATABASE_URL=postgresql://whatsorder:whatsorder_dev@localhost:5432/whatsorder?schema=public
```

### Étape 4 : Exécuter les migrations

```bash
cd apps/api
pnpm prisma migrate dev
pnpm prisma generate
```

---

## 🆘 Si le Problème Persiste

### Vérifier les logs détaillés

```bash
cd apps/api
pnpm prisma db pull  # Teste la connexion
```

### Vérifier les variables d'environnement

Assurez-vous que le fichier `apps/api/.env` contient bien :
- `DATABASE_URL` avec la bonne valeur
- Pas d'espaces avant/après les valeurs
- Pas de guillemets supplémentaires

### Vérifier que le port 5432 n'est pas bloqué

```bash
# Vérifier qui utilise le port 5432
lsof -i :5432

# Vérifier la connexion PostgreSQL
psql -h localhost -p 5432 -U $(whoami) -d postgres -c "SELECT version();"
```

---

## 📝 Checklist de Résolution

- [ ] PostgreSQL est démarré et accessible (`pg_isready` retourne OK)
- [ ] La base de données `whatsorder` existe localement
- [ ] Le fichier `apps/api/.env` contient `DATABASE_URL` pointant vers `localhost`
- [ ] Les migrations Prisma sont appliquées (`pnpm prisma migrate dev`)
- [ ] Prisma Client est généré (`pnpm prisma generate`)
- [ ] La connexion fonctionne (`pnpm prisma studio` s'ouvre)
- [ ] Le backend démarre sans erreur

---

## 💡 Recommandation

Pour le développement local, **utilisez toujours une base de données locale** plutôt qu'une base de données cloud (Supabase, Railway, etc.) car :

- ✅ Plus rapide (pas de latence réseau)
- ✅ Plus fiable (pas de dépendance internet)
- ✅ Plus sécurisé (données restent locales)
- ✅ Plus facile à réinitialiser
- ✅ Fonctionne hors ligne

Réservez les bases de données cloud pour la production uniquement.

---

**Dernière mise à jour** : 11 janvier 2026
