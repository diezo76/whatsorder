# 🚀 Continuer le Déploiement Vercel + Supabase

**Date** : 12 janvier 2026  
**Situation** : Supabase déjà configuré, code prêt, besoin de finaliser Vercel

---

## ✅ Ce qui est Déjà Fait

1. ✅ **Supabase configuré**
   - Projet créé
   - Base de données migrée
   - Credentials dans `.env.local.supabase`

2. ✅ **Code prêt**
   - Hooks Realtime créés
   - Client Supabase configuré
   - Code commité sur `main`

3. ✅ **Tables créées**
   - Toutes les tables existent dans Supabase
   - Migrations appliquées

---

## 🎯 Étapes Restantes (15 minutes)

### Étape 1 : Se Connecter à Vercel (2 min)

```bash
cd "/Users/diezowee/whatsapp order"
vercel login
```

Choisissez la méthode de connexion :
- Email
- GitHub
- GitLab

---

### Étape 2 : Lier le Projet Vercel (3 min)

```bash
vercel link
```

Répondez aux questions :
- **Set up and deploy?** → Y
- **Which scope?** → Votre compte
- **Link to existing project?** → Y (si le projet existe déjà) ou N (nouveau)
- **What's your project's name?** → `whatsapp-order` (ou autre)
- **In which directory?** → `./`

---

### Étape 3 : Configurer les Variables d'Environnement (5 min)

#### Option A : Via CLI (Plus Rapide)

```bash
# Depuis apps/web/.env.local.supabase, extraire les valeurs et les ajouter :

# IMPORTANT : Remplacez [YOUR_VALUES] par vos vraies valeurs !

# Variables publiques
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Puis coller votre URL Supabase

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Puis coller votre clé anon

# Variables privées
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Puis coller votre clé service

vercel env add DATABASE_URL production
# Puis coller votre DATABASE_URL

vercel env add JWT_SECRET production
# Puis coller votre JWT_SECRET

vercel env add NODE_ENV production
# Puis taper : production
```

#### Option B : Via Dashboard (Plus Visuel)

1. Allez sur https://vercel.com/dashboard
2. Sélectionnez votre projet
3. **Settings** → **Environment Variables**
4. Ajoutez chaque variable :

```env
NEXT_PUBLIC_SUPABASE_URL=[Votre URL depuis .env.local.supabase]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[Votre clé anon depuis .env.local.supabase]
SUPABASE_SERVICE_ROLE_KEY=[Votre clé service depuis .env.local.supabase]
DATABASE_URL=[Votre DATABASE_URL depuis .env.local.supabase]
JWT_SECRET=[Votre JWT_SECRET depuis .env.local.supabase]
NODE_ENV=production
```

---

### Étape 4 : Déployer (3 min)

```bash
vercel --prod
```

Ou si le déploiement est déjà automatique via GitHub :
- Le push sur `main` a déjà déclenché un déploiement
- Vérifiez sur https://vercel.com/dashboard

---

### Étape 5 : Activer Realtime Supabase (2 min)

1. Allez sur https://supabase.com
2. Sélectionnez votre projet
3. **Database** → **Replication**
4. Activez la réplication pour ces tables :
   - ✅ `Message`
   - ✅ `Order`
   - ✅ `Conversation`

**OU** via SQL Editor :

```sql
-- Activer la réplication
ALTER TABLE "Message" REPLICA IDENTITY FULL;
ALTER TABLE "Order" REPLICA IDENTITY FULL;
ALTER TABLE "Conversation" REPLICA IDENTITY FULL;

-- Publier les tables
ALTER PUBLICATION supabase_realtime ADD TABLE "Message";
ALTER PUBLICATION supabase_realtime ADD TABLE "Order";
ALTER PUBLICATION supabase_realtime ADD TABLE "Conversation";
```

---

## ✅ Vérification Finale

### 1. Vérifier le Déploiement Vercel

```bash
vercel --prod
# Copier l'URL affichée
```

Ou ouvrir : https://vercel.com/dashboard

### 2. Tester le Site

Ouvrez l'URL Vercel et testez :
- ✅ Page d'accueil s'affiche
- ✅ Login fonctionne
- ✅ Dashboard accessible
- ✅ Inbox/Orders affichent les données

### 3. Tester Realtime (Optionnel)

1. Ouvrez 2 onglets avec l'URL Vercel
2. Connectez-vous sur les 2
3. Allez sur Inbox
4. Vérifiez l'indicateur "Temps réel actif" (vert)
5. Dans Supabase SQL Editor, insérez un message :

```sql
INSERT INTO "Message" ("id", "conversationId", "content", "direction", "type", "status")
VALUES (gen_random_uuid(), '[ID_CONVERSATION]', 'Test Realtime', 'inbound', 'text', 'delivered');
```

6. Le message devrait apparaître instantanément dans les 2 onglets

---

## 🔧 Script Automatique (Si Vous Préférez)

J'ai créé un script qui fait tout automatiquement :

```bash
cd "/Users/diezowee/whatsapp order"
./scripts/finaliser-deploiement.sh
```

Ce script va :
1. Se connecter à Vercel (si nécessaire)
2. Lier le projet
3. Lire les variables depuis `.env.local.supabase`
4. Les ajouter automatiquement sur Vercel
5. Déployer
6. Afficher l'URL

---

## 🆘 Dépannage

### "No existing credentials found"
```bash
vercel login
```

### "Cannot find .env.local.supabase"
Le fichier existe mais est filtré. Copiez manuellement les valeurs depuis Supabase Dashboard → Settings → API

### Variables manquantes sur Vercel
```bash
vercel env ls
```
Vérifiez que toutes les variables sont présentes.

### Build échoue
```bash
vercel logs
```
Vérifiez les logs pour identifier l'erreur.

---

## 📊 Checklist Finale

- [ ] Connecté à Vercel (`vercel login`)
- [ ] Projet lié (`vercel link`)
- [ ] Variables ajoutées (6 variables minimum)
- [ ] Déployé (`vercel --prod`)
- [ ] Realtime activé dans Supabase
- [ ] Site accessible via URL Vercel
- [ ] Login fonctionne
- [ ] Dashboard affiche les données
- [ ] (Optionnel) Realtime fonctionne

---

## 🎉 Une Fois Terminé

### Arrêter Railway (Si Ce N'est Pas Déjà Fait)

```bash
railway down
```

### Supprimer les Projets Railway (Après 1 Semaine de Tests)

1. https://railway.app/dashboard
2. Sélectionner chaque projet
3. Settings → Danger Zone → Delete Project

---

## 💰 Économies

| Avant (Railway) | Après (Vercel + Supabase) |
|-----------------|---------------------------|
| $10-20/mois | $0/mois |

**Économie annuelle : $120-240** 💸

---

**Commencez par l'Étape 1 ! 🚀**

*Durée estimée : 15 minutes*
