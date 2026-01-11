# 🚀 Statut des Services - WhatsOrder

**Date** : 11 janvier 2026  
**Heure** : 21:32 UTC

---

## ✅ Services Démarrés

### Backend API
- **URL** : http://localhost:4000
- **Health Check** : http://localhost:4000/health
- **Statut** : ✅ **ACTIF**
- **Réponse** : `{"status":"ok","timestamp":"2026-01-11T21:32:35.544Z","service":"whatsorder-api"}`

### Frontend Web
- **URL** : http://localhost:3000
- **Statut** : ⏳ **En cours de démarrage**
- **Note** : Next.js peut prendre 30-60 secondes pour compiler au premier démarrage

### Base de Données
- **PostgreSQL** : ✅ Port 5432 (actif)
- **Redis** : ✅ Port 6379 (actif)

---

## 📋 Commandes Utiles

### Vérifier les services
```bash
# Vérifier l'API
curl http://localhost:4000/health

# Vérifier le frontend
curl http://localhost:3000

# Vérifier les ports
lsof -i :3000
lsof -i :4000
lsof -i :5432
lsof -i :6379
```

### Arrêter les services
```bash
# Arrêter tous les processus Node
pkill -f "next dev"
pkill -f "tsx.*index.ts"

# Ou arrêter spécifiquement
pnpm --filter web dev --kill
pnpm --filter api dev --kill
```

### Relancer les services
```bash
cd "/Users/diezowee/whatsapp order"
pnpm dev
```

---

## 🧪 Tests à Effectuer

Voir le fichier `TEST_CHECKLIST.md` pour la liste complète des tests.

### Tests Rapides

1. **API Health** :
   ```bash
   curl http://localhost:4000/health
   ```

2. **Frontend** :
   - Ouvrir http://localhost:3000 dans le navigateur
   - Vérifier que la page se charge

3. **Login** :
   - Aller sur http://localhost:3000/login
   - Tester la connexion

---

## 📝 Notes

- Les services sont lancés en arrière-plan avec `pnpm dev`
- Le frontend Next.js peut prendre du temps à compiler au premier démarrage
- Les logs sont disponibles dans les terminaux où les commandes ont été lancées
- Pour voir les logs en temps réel, utiliser les terminaux séparés

---

## 🔍 Dépannage

### Frontend ne démarre pas
1. Vérifier les erreurs dans le terminal
2. Vérifier que le port 3000 n'est pas déjà utilisé
3. Vérifier les variables d'environnement dans `apps/web/.env.local`

### API ne démarre pas
1. Vérifier la connexion à la base de données
2. Vérifier les variables d'environnement dans `apps/api/.env`
3. Vérifier que Prisma est généré : `pnpm --filter api prisma:generate`

### Base de données
1. Vérifier que PostgreSQL tourne : `brew services list` ou `docker ps`
2. Vérifier la connection string dans `.env`
3. Exécuter les migrations : `pnpm --filter api prisma migrate dev`

---

**Dernière mise à jour** : 11 janvier 2026 - 21:32 UTC
