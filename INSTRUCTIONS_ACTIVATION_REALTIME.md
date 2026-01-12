# 🚀 Instructions : Activation Realtime sur Supabase

## 📋 Étapes à Suivre

### 1. Accéder au Dashboard Supabase

1. Ouvrez votre navigateur
2. Allez sur : https://mcp.supabase.com/mcp?project_ref=rvndgopsysdyycelmfuu
3. Connectez-vous si nécessaire

---

### 2. Activer Realtime pour les Tables

#### Navigation
1. Dans le menu de gauche, cliquez sur **"Database"**
2. Cliquez sur **"Replication"** (sous Database)

#### Table : `conversations`
1. Trouvez la ligne correspondant à la table `conversations`
2. Cliquez sur le toggle **"Enable Realtime"** → **ON**
3. Sélectionnez les événements :
   - ✅ **INSERT**
   - ✅ **UPDATE**
   - ✅ **DELETE**
4. Cliquez sur **"Save"**

#### Table : `messages`
1. Trouvez la ligne correspondant à la table `messages`
2. Cliquez sur le toggle **"Enable Realtime"** → **ON**
3. Sélectionnez les événements :
   - ✅ **INSERT**
   - ✅ **UPDATE**
   - ✅ **DELETE**
4. Cliquez sur **"Save"**

#### Table : `orders`
1. Trouvez la ligne correspondant à la table `orders`
2. Cliquez sur le toggle **"Enable Realtime"** → **ON**
3. Sélectionnez les événements :
   - ✅ **INSERT**
   - ✅ **UPDATE**
   - ✅ **DELETE**
4. Cliquez sur **"Save"**

---

### 3. Vérification

Après activation, vous devriez voir :

```
Replication
┌──────────────────┬─────────────┬────────────────────────┐
│ Table            │ Realtime    │ Events                 │
├──────────────────┼─────────────┼────────────────────────┤
│ conversations    │ ✅ Enabled  │ INSERT, UPDATE, DELETE │
│ messages         │ ✅ Enabled  │ INSERT, UPDATE, DELETE │
│ orders           │ ✅ Enabled  │ INSERT, UPDATE, DELETE │
└──────────────────┴─────────────┴────────────────────────┘
```

---

### 4. Configuration Variables d'Environnement

Assurez-vous que `apps/web/.env.local` contient :

```env
NEXT_PUBLIC_SUPABASE_URL=https://rvndgopsysdyycelmfuu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_supabase
```

**Où trouver ces valeurs** :
- **URL** : Dashboard Supabase → Settings → API → Project URL
- **Anon Key** : Dashboard Supabase → Settings → API → Project API keys → `anon` `public`

---

## ✅ Checklist

- [ ] Table `conversations` : Realtime activé (INSERT, UPDATE, DELETE)
- [ ] Table `messages` : Realtime activé (INSERT, UPDATE, DELETE)
- [ ] Table `orders` : Realtime activé (INSERT, UPDATE, DELETE)
- [ ] Variables d'environnement configurées dans `.env.local`
- [ ] Redémarrer l'application Next.js si nécessaire

---

## 🎉 C'est Fait !

Une fois ces étapes complétées, Supabase Realtime sera actif et les mises à jour en temps réel fonctionneront automatiquement dans l'application.
