# Guide de Vérification et Configuration - Domaine Whataybo

**Date** : $(date)  
**Domaine** : whataybo.com  
**Application** : Whataybo

## 🔒 ÉTAPE 1 : VÉRIFIER LE SSL

### 1. Ouvrir le Domaine
👉 **https://whataybo.com**

### 2. Vérifier le Certificat SSL
1. Cliquez sur le **cadenas 🔒** dans la barre d'adresse
2. Vérifiez que vous voyez :
   - ✅ **"Connection is secure"**
   - ✅ **"Valid"** (certificat valide)
   - ✅ **"Let's Encrypt"** (ou le nom du certificat)
   - ✅ **"Issued to: whataybo.com"**

### 3. Vérifier le Renouvellement Automatique
- Vercel renouvelle automatiquement les certificats SSL
- Pas d'action requise de votre part
- Le certificat est valide pour 90 jours et se renouvelle automatiquement

## ✅ ÉTAPE 2 : TESTER TOUTES LES URLS

Testez ces URLs et vérifiez qu'elles fonctionnent correctement :

### URLs Principales

1. **Landing Page** :
   - ✅ **https://whataybo.com** → Landing page avec toutes les sections
   - Vérifier :
     - Header avec logo "Whataybo"
     - Hero section
     - Features (6 cartes)
     - Demo (vidéo + screenshots)
     - Pricing (3 plans)
     - Testimonials
     - Footer CTA
     - Footer complet

2. **Page de Connexion** :
   - ✅ **https://whataybo.com/login** → Page de connexion
   - Vérifier :
     - Formulaire de connexion fonctionne
     - Redirection après connexion vers `/dashboard`

3. **Page d'Inscription** :
   - ✅ **https://whataybo.com/register** → Page d'inscription
   - Vérifier :
     - Formulaire d'inscription fonctionne
     - Création de compte fonctionne

4. **Dashboard** (après connexion) :
   - ✅ **https://whataybo.com/dashboard** → Dashboard principal
   - Vérifier :
     - Sidebar avec "Whataybo"
     - Navigation fonctionne
     - Toutes les pages du dashboard accessibles

5. **Menu Public** :
   - ✅ **https://whataybo.com/nile-bites** → Menu public exemple
   - Vérifier :
     - Menu s'affiche correctement
     - Panier fonctionne
     - Checkout fonctionne

### URLs du Dashboard

6. **Analytics** :
   - ✅ **https://whataybo.com/dashboard/analytics** → Page analytics
   
7. **Inbox** :
   - ✅ **https://whataybo.com/dashboard/inbox** → Inbox WhatsApp
   
8. **Commandes** :
   - ✅ **https://whataybo.com/dashboard/orders** → Kanban des commandes
   
9. **Menu** :
   - ✅ **https://whataybo.com/dashboard/menu** → Gestion du menu
   
10. **Paramètres** :
    - ✅ **https://whataybo.com/dashboard/settings** → Paramètres

### Redirection www

11. **Redirection www** :
    - ✅ **https://www.whataybo.com** → Redirige vers **https://whataybo.com**
    - OU inversement selon votre configuration Vercel

## 🔧 ÉTAPE 3 : METTRE À JOUR LES VARIABLES D'ENVIRONNEMENT

### Variables à Vérifier dans Vercel

1. **Accéder aux Variables d'Environnement** :
   - Vercel Dashboard → Votre projet → **Settings** → **Environment Variables**

2. **Variables à Vérifier/Modifier** :

#### Variables Frontend (Production)

```env
# URL de l'API (si vous utilisez une API séparée)
NEXT_PUBLIC_API_URL=https://whataybo.com

# Supabase (si utilisé)
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_supabase

# Autres variables publiques
NEXT_PUBLIC_APP_URL=https://whataybo.com
```

#### Variables Backend (si API séparée)

```env
# URL du frontend
FRONTEND_URL=https://whataybo.com

# CORS (si nécessaire)
CORS_ORIGIN=https://whataybo.com
```

### Note Importante

Le code utilise automatiquement `window.location.origin` en priorité, donc si votre API est sur le même domaine, vous n'avez **pas besoin** de modifier `NEXT_PUBLIC_API_URL` en production. Le code s'adaptera automatiquement :

```typescript
// apps/web/lib/api.ts
const API_URL = typeof window !== 'undefined' 
  ? window.location.origin  // Utilise automatiquement le domaine actuel
  : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
```

### Redéploiement

Si vous modifiez des variables d'environnement :
1. Sauvegardez les modifications
2. Vercel redéploie automatiquement
3. Attendez 2-3 minutes
4. Vérifiez que tout fonctionne

## 📊 ÉTAPE 4 : CONFIGURER ANALYTICS (OPTIONNEL)

### Vercel Analytics

1. **Accéder à Analytics** :
   - Vercel Dashboard → Votre projet → **Analytics**

2. **Activer Web Analytics** :
   - Cliquez sur **"Enable Web Analytics"**
   - Le code est automatiquement injecté
   - Pas besoin de modifier le code

3. **Voir les Statistiques** :
   - Visiteurs uniques
   - Pages vues
   - Top pages
   - Référents
   - Pays d'origine
   - Appareils utilisés

### Google Analytics (Alternative)

Si vous préférez Google Analytics :

1. Créez un compte Google Analytics
2. Obtenez votre **Measurement ID** (G-XXXXXXXXXX)
3. Ajoutez dans Vercel → Environment Variables :
   ```env
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```
4. Ajoutez le script dans `apps/web/app/layout.tsx` :
   ```tsx
   {process.env.NEXT_PUBLIC_GA_ID && (
     <>
       <script
         async
         src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
       />
       <script
         dangerouslySetInnerHTML={{
           __html: `
             window.dataLayer = window.dataLayer || [];
             function gtag(){dataLayer.push(arguments);}
             gtag('js', new Date());
             gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
           `,
         }}
       />
     </>
   )}
   ```

## ✅ ÉTAPE 5 : CHECKLIST DE VÉRIFICATION COMPLÈTE

### SSL et Sécurité
- [ ] HTTPS fonctionne (https://whataybo.com)
- [ ] Certificat SSL valide (cadenas vert)
- [ ] Certificat émis par Let's Encrypt
- [ ] Pas d'avertissements de sécurité dans le navigateur
- [ ] Redirection HTTP → HTTPS fonctionne

### Landing Page
- [ ] Page d'accueil s'affiche correctement
- [ ] Logo "Whataybo" visible
- [ ] Toutes les sections présentes (Hero, Features, Demo, Pricing, Testimonials)
- [ ] Navigation smooth scroll fonctionne
- [ ] Menu burger mobile fonctionne
- [ ] Responsive (mobile/tablet/desktop)

### Authentification
- [ ] Page `/login` fonctionne
- [ ] Page `/register` fonctionne
- [ ] Connexion fonctionne
- [ ] Redirection après connexion fonctionne
- [ ] Déconnexion fonctionne

### Dashboard
- [ ] Dashboard accessible après connexion
- [ ] Sidebar affiche "Whataybo"
- [ ] Toutes les pages du dashboard accessibles
- [ ] Navigation entre pages fonctionne
- [ ] Analytics fonctionne
- [ ] Inbox fonctionne
- [ ] Commandes (Kanban) fonctionne
- [ ] Menu fonctionne
- [ ] Paramètres fonctionne

### Menu Public
- [ ] Page `/nile-bites` (ou votre slug) fonctionne
- [ ] Menu s'affiche correctement
- [ ] Panier fonctionne
- [ ] Checkout fonctionne
- [ ] Intégration WhatsApp fonctionne

### Redirections
- [ ] www.whataybo.com → whataybo.com (ou inversement)
- [ ] HTTP → HTTPS fonctionne
- [ ] Routes 404 gérées correctement

### Performance
- [ ] Temps de chargement acceptable (< 3 secondes)
- [ ] Images se chargent correctement
- [ ] Pas d'erreurs dans la console du navigateur
- [ ] Pas d'erreurs dans les logs Vercel

### Variables d'Environnement
- [ ] Variables configurées dans Vercel
- [ ] Pas de références à l'ancien domaine
- [ ] API fonctionne correctement

### Analytics (Optionnel)
- [ ] Vercel Analytics activé
- [ ] OU Google Analytics configuré
- [ ] Données collectées correctement

## 🐛 Dépannage

### Problème : Certificat SSL non valide

**Solutions** :
1. Attendre quelques minutes (propagation DNS)
2. Vérifier que le domaine est bien "Active" dans Vercel
3. Vérifier les enregistrements DNS dans Vercel
4. Contacter le support Vercel si le problème persiste

### Problème : Certaines pages ne se chargent pas

**Solutions** :
1. Vérifier les logs Vercel (Dashboard → Deployments → Logs)
2. Vérifier les variables d'environnement
3. Vérifier que le build a réussi
4. Vider le cache du navigateur (Ctrl+Shift+R / Cmd+Shift+R)

### Problème : Erreurs CORS

**Solutions** :
1. Vérifier que `FRONTEND_URL` est bien configuré dans l'API
2. Vérifier que `CORS_ORIGIN` inclut `https://whataybo.com`
3. Vérifier que l'API accepte les requêtes depuis le domaine

### Problème : Redirection www ne fonctionne pas

**Solutions** :
1. Vérifier la configuration dans Vercel → Settings → Domains
2. Ajouter la redirection manuellement si nécessaire
3. Attendre la propagation DNS (jusqu'à 24h)

## 📝 Notes Importantes

1. **Domaine Principal** : Utilisez toujours `https://whataybo.com` comme domaine principal
2. **Redirection** : Configurez `www.whataybo.com` pour rediriger vers `whataybo.com` (ou inversement)
3. **Variables d'Environnement** : Le code utilise automatiquement `window.location.origin`, donc pas besoin de modifier `NEXT_PUBLIC_API_URL` si l'API est sur le même domaine
4. **SSL** : Vercel gère automatiquement le SSL, pas besoin de configuration manuelle
5. **Analytics** : Vercel Analytics est gratuit et facile à activer

## 🔗 Liens Utiles

- **Dashboard Vercel** : https://vercel.com/dashboard
- **Documentation Vercel Domains** : https://vercel.com/docs/concepts/projects/domains
- **Documentation Vercel Analytics** : https://vercel.com/docs/analytics
- **Support Vercel** : https://vercel.com/support

---

**Status** : ✅ Guide Complet  
**Domaine** : whataybo.com  
**Prochaine Étape** : Suivre les étapes ci-dessus pour vérifier et configurer le domaine
