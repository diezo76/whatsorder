# 🔧 Instructions de Configuration Vercel - Supabase

## Variables à Ajouter

### 1. NEXT_PUBLIC_SUPABASE_URL
```
https://rvndgopsysdyycelmfuu.supabase.co
```

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2bmRnb3BzeXNkeXljZWxtZnV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNjM5OTAsImV4cCI6MjA4MzczOTk5MH0.9OIfvAHb9CkRuX93ncifZYwlkTOkLFaiVfPjQ66gd_c
```

---

## Étapes de Configuration

### Étape 1 : Aller sur Vercel Dashboard
1. Ouvrir https://vercel.com/dashboard
2. Cliquer sur le projet **whatsorder-web**

### Étape 2 : Accéder aux Variables d'Environnement
1. Cliquer sur **Settings** (⚙️)
2. Cliquer sur **Environment Variables** dans le menu de gauche

### Étape 3 : Ajouter NEXT_PUBLIC_SUPABASE_URL
1. Cliquer sur **Add New**
2. **Name** : `NEXT_PUBLIC_SUPABASE_URL`
3. **Value** : `https://rvndgopsysdyycelmfuu.supabase.co`
4. **Environments** : Cocher ✅ Production, ✅ Preview, ✅ Development
5. Cliquer sur **Save**

### Étape 4 : Ajouter NEXT_PUBLIC_SUPABASE_ANON_KEY
1. Cliquer sur **Add New**
2. **Name** : `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Value** : (copier la clé ci-dessus)
4. **Environments** : Cocher ✅ Production, ✅ Preview, ✅ Development
5. Cliquer sur **Save**

### Étape 5 : Redéployer
1. Aller dans **Deployments**
2. Cliquer sur les **⋮** (3 points) du dernier déploiement
3. Cliquer sur **Redeploy**
4. Confirmer en cliquant sur **Redeploy**

### Étape 6 : Attendre (~2-3 minutes)
Le déploiement va se faire automatiquement.

---

## Test du Realtime

Après le redéploiement :

1. Ouvrir https://whatsorder-web.vercel.app/login
2. Se connecter
3. Aller sur https://whatsorder-web.vercel.app/dashboard/inbox
4. Vérifier l'indicateur en haut : 🟢 "Temps réel actif"

### Test avec 2 onglets
1. Ouvrir 2 onglets sur /dashboard/inbox
2. Sélectionner la même conversation
3. Envoyer un message dans l'onglet 1
4. ✅ Le message doit apparaître dans l'onglet 2 instantanément !

---

**Variables configurées localement** : ✅ Oui (dans `.env.local`)
**Variables configurées sur Vercel** : ⏳ À faire manuellement

