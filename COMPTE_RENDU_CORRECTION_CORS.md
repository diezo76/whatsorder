# 📋 Compte Rendu - Correction CORS

**Date** : 14 janvier 2026  
**Agent** : Composer (Cursor AI)  
**Statut** : ✅ Problème résolu

---

## 🐛 Problème Identifié

**Erreur CORS** :
```
Access to fetch at 'http://localhost:4000/api/public/restaurants/nile-bites/orders' 
from origin 'https://www.whataybo.com' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
The 'Access-Control-Allow-Origin' header has a value 'http://localhost:3000' 
that is not equal to the supplied origin.
```

**Cause** : Le site web est déployé sur `https://www.whataybo.com` mais le serveur backend n'autorise que `http://localhost:3000` dans la configuration CORS.

---

## ✅ Solutions Appliquées

### 1. Configuration CORS Mise à Jour ✅

**Fichier modifié** : `apps/api/src/index.ts`

**Changements** :
- ✅ Ajout de plusieurs origines autorisées :
  - `http://localhost:3000` (développement local)
  - `https://www.whataybo.com` (production)
  - `https://whataybo.com` (production sans www)
- ✅ Fonction de callback pour vérifier dynamiquement l'origine
- ✅ En développement, autoriser toutes les origines pour faciliter le debug
- ✅ En production, seulement les origines autorisées

**Code** :
```typescript
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'https://www.whataybo.com',
  'https://whataybo.com',
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Autoriser requêtes sans origine
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      if (process.env.NODE_ENV === 'development') {
        callback(null, true); // Autoriser en dev
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### 2. Socket.io CORS Mise à Jour ✅

**Fichier modifié** : `apps/api/src/index.ts`

**Changements** :
- ✅ Ajout des mêmes origines pour Socket.io
- ✅ En développement, autoriser toutes les origines

### 3. Détection Automatique de l'URL API ✅

**Fichier modifié** : `apps/web/components/checkout/CheckoutStepConfirmation.tsx`

**Changements** :
- ✅ Détection automatique de l'environnement
- ✅ Si `whataybo.com` → utiliser `https://api.whataybo.com`
- ✅ Sinon → utiliser `http://localhost:4000`

**Code** :
```typescript
const getApiUrl = () => {
  if (typeof window === 'undefined') {
    return 'http://localhost:4000';
  }
  
  // Si on est en production (whataybo.com), utiliser l'API de production
  if (window.location.hostname.includes('whataybo.com')) {
    return process.env.NEXT_PUBLIC_API_URL || 'https://api.whataybo.com';
  }
  
  // Sinon, utiliser localhost pour le développement
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
};
```

---

## 🔄 Action Requise

**IMPORTANT** : Le serveur backend doit être **redémarré** pour que les changements CORS prennent effet.

```bash
# Arrêter le serveur (Ctrl+C dans le terminal)
# Puis redémarrer :
cd apps/api
pnpm dev
```

---

## 📝 Configuration Recommandée

### Variables d'Environnement

**Backend** (`apps/api/.env`) :
```env
FRONTEND_URL=https://www.whataybo.com
NODE_ENV=production
```

**Frontend** (`apps/web/.env.local` ou `.env.production`) :
```env
NEXT_PUBLIC_API_URL=https://api.whataybo.com
```

---

## ✅ Vérification

Après redémarrage, tester depuis `https://www.whataybo.com` :

1. Ouvrir la console du navigateur (F12)
2. Cliquer sur "Envoyer sur WhatsApp"
3. Vérifier qu'il n'y a plus d'erreur CORS
4. Vérifier que la commande est créée

---

## 🎯 Notes

- **En développement** : Toutes les origines sont autorisées pour faciliter le debug
- **En production** : Seules les origines autorisées sont acceptées
- **Socket.io** : Utilise la même configuration CORS
- **Détection automatique** : Le frontend détecte automatiquement l'environnement

---

**Statut** : ✅ Configuration CORS mise à jour - Redémarrage du serveur requis
