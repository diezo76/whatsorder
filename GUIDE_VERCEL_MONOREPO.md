# 🚀 Guide Déploiement Vercel - Monorepo Next.js

## ❌ Erreur Actuelle

```
Module not found: Can't resolve '@/lib/api'
Module not found: Can't resolve '@/components/public/RestaurantHeader'
Module not found: Can't resolve '@/components/public/MenuCategory'
```

---

## ✅ Solution : Configurer le Root Directory

### Pourquoi cette erreur ?

Votre projet est un **monorepo** :

```
whatsorder/
├── apps/
│   └── web/          ← Next.js est ICI
│       ├── app/
│       ├── components/
│       ├── lib/
│       └── tsconfig.json
└── package.json      ← Racine du repo
```

Vercel cherche les fichiers à la **racine** au lieu de **apps/web**.

---

## 📋 Instructions Étape par Étape

### Méthode 1 : Configurer le Projet Existant

#### 1. Ouvrez Vercel Dashboard
🔗 https://vercel.com/dashboard

#### 2. Sélectionnez votre projet
Cliquez sur **"whatsorder"**

#### 3. Allez dans Settings
Cliquez sur l'onglet **"Settings"** en haut

#### 4. Section General
Dans le menu à gauche, cliquez **"General"**

#### 5. Trouvez "Root Directory"
Scrollez jusqu'à voir cette section :

```
┌─────────────────────────────────────┐
│ Root Directory                      │
│                                     │
│ The directory within your project,  │
│ in which your code is located.      │
│                                     │
│ [ . ] ← Change this                 │
│                                     │
│ [Edit]                              │
└─────────────────────────────────────┘
```

#### 6. Cliquez "Edit"

#### 7. Tapez "apps/web"
```
┌─────────────────────────────────────┐
│ Root Directory                      │
│                                     │
│ [ apps/web ] ← Tapez ceci           │
│                                     │
│ [Save]                              │
└─────────────────────────────────────┘
```

#### 8. Cliquez "Save"

#### 9. Retournez dans "Deployments"
Cliquez sur l'onglet **"Deployments"**

#### 10. Redéployez
- Cliquez sur les **"..."** à droite du dernier déploiement
- Cliquez **"Redeploy"**
- **Décochez** "Use existing Build Cache"
- Cliquez **"Redeploy"**

---

### Méthode 2 : Recréer le Projet (Plus Simple)

#### 1. Supprimez le projet actuel
- Settings → Advanced → **Delete Project**
- Tapez le nom du projet pour confirmer

#### 2. Importez à nouveau depuis GitHub
- Dashboard → **"Add New..."** → **"Project"**
- Sélectionnez votre repo **"whatsorder"**

#### 3. Configurez AVANT l'import
```
┌─────────────────────────────────────────────┐
│ Configure Project                           │
│                                             │
│ Framework Preset: [Next.js ▼]              │
│                                             │
│ Root Directory: [apps/web] ← IMPORTANT !   │
│                                             │
│ Build and Output Settings                   │
│   ✓ Override (laissez décoché)             │
│                                             │
│ Environment Variables                       │
│   [Add +]                                   │
│                                             │
│ [Deploy]                                    │
└─────────────────────────────────────────────┘
```

#### 4. Ajoutez les variables d'environnement

Cliquez **"Add"** pour chaque variable :

```env
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
NEXT_PUBLIC_API_URL=https://votre-api.com
```

#### 5. Cliquez "Deploy"

---

## 🔍 Vérification

### Après configuration, vérifiez dans les logs :

Le build doit montrer :
```
✓ Detected Next.js
✓ Running "npm install" in /vercel/path0/apps/web
                                       ^^^^^^^^^ Doit contenir "apps/web"
✓ Build Succeeded
```

### Si vous voyez :
```
Running "npm install" in /vercel/path0
                          ^^^^^^^^^^^^^ PAS de "apps/web"
```
→ Le Root Directory n'est **PAS** configuré !

---

## ⚠️ Problèmes Courants

### Problème 1 : "Je ne trouve pas Root Directory"

**Solution** : Vous utilisez peut-être un plan Hobby
- Root Directory est disponible sur tous les plans
- Essayez de scroller dans Settings → General
- Ou supprimez et recréez le projet (Méthode 2)

### Problème 2 : "J'ai configuré mais ça ne marche pas"

**Solution** : Videz le cache
- Deployments → "..." → Redeploy
- **Décochez** "Use existing Build Cache"
- Redéployez

### Problème 3 : "Build réussit mais l'app ne fonctionne pas"

**Solution** : Variables d'environnement manquantes
- Settings → Environment Variables
- Ajoutez `DATABASE_URL`, `DIRECT_URL`, etc.
- Redéployez

---

## 📸 Captures d'Écran Attendues

### Dans Settings → General, vous devez voir :

```
Build & Development Settings
  Build Command: npm run build
  Output Directory: .next
  Install Command: npm install

Root Directory
  apps/web                    ← Doit être ici
  [Edit]

Node.js Version
  20.x (auto-detected)
```

---

## 🆘 Besoin d'Aide ?

### Si après tout ça, le build échoue encore :

1. **Copiez les logs complets** du build Vercel
2. **Vérifiez** que le chemin contient `apps/web`
3. **Vérifiez** que `tsconfig.json` existe dans `apps/web`
4. **Vérifiez** que les fichiers existent :
   - `apps/web/lib/api.ts`
   - `apps/web/components/public/RestaurantHeader.tsx`
   - `apps/web/components/public/MenuCategory.tsx`

---

## ✅ Checklist Finale

Avant de déployer, vérifiez :

- [ ] Root Directory = `apps/web` (configuré sur Vercel)
- [ ] Framework détecté = Next.js
- [ ] Variables d'environnement ajoutées
- [ ] Cache vidé avant déploiement
- [ ] Logs montrent `apps/web` dans les chemins

---

**Une fois le Root Directory configuré, le build devrait réussir immédiatement !** 🎉

**Date** : 12 janvier 2026
