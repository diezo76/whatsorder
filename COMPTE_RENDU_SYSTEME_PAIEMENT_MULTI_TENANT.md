# 📋 Compte Rendu - Système de Paiement Multi-Tenant

**Date** : 14 janvier 2026  
**Agent** : Cursor AI  
**Statut** : ✅ Implémenté et déployé sur whataybo.com

---

## 🎯 Objectif

Implémenter un système de paiement **multi-tenant** où chaque restaurant peut :
- Connecter son propre compte **Stripe** (via Stripe Connect)
- Connecter son propre compte **PayPal** (via PayPal Partner Referrals)
- Activer/désactiver les méthodes de paiement qu'il souhaite proposer
- Recevoir les paiements **directement sur son compte**

---

## ✅ Ce qui a été implémenté

### 1. Nouveau modèle de données Restaurant

Les champs suivants ont été ajoutés au modèle `Restaurant` :

```prisma
// Stripe Connect
stripeAccountId         String?   // ID du compte Stripe Connect (acct_xxx)
stripeAccountStatus     String?   // "pending", "active", "restricted"
stripeOnboardingComplete Boolean @default(false)
stripeConnectedAt       DateTime?

// PayPal
paypalMerchantId        String?   // ID du marchand PayPal
paypalEmail             String?   // Email PayPal
paypalOnboardingComplete Boolean @default(false)
paypalConnectedAt       DateTime?

// Options de paiement
enableCashPayment       Boolean @default(true)
enableCardPayment       Boolean @default(true)
enableStripePayment     Boolean @default(false)
enablePaypalPayment     Boolean @default(false)
```

### 2. Routes API Stripe Connect

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/connect/stripe/onboard` | POST | Démarre l'onboarding Stripe Connect |
| `/api/connect/stripe/status` | GET | Vérifie le statut du compte Stripe |
| `/api/connect/stripe/disconnect` | POST | Déconnecte le compte Stripe |

### 3. Routes API PayPal

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/connect/paypal/onboard` | POST | Démarre l'onboarding PayPal |
| `/api/connect/paypal/callback` | GET | Callback après approbation PayPal |
| `/api/connect/paypal/status` | GET | Vérifie le statut PayPal |
| `/api/connect/paypal/disconnect` | POST | Déconnecte PayPal |

### 4. Nouvel onglet "Paiements" dans le Dashboard

**Fichier créé** : `components/settings/SettingsPaymentsTab.tsx`

Le restaurant peut :
- ✅ Voir les modes de paiement à la livraison (espèces, carte TPE)
- ✅ Connecter/déconnecter son compte Stripe
- ✅ Connecter/déconnecter son compte PayPal
- ✅ Activer/désactiver chaque méthode de paiement
- ✅ Voir le statut de ses comptes connectés

### 5. Routes de paiement mises à jour

Les routes de paiement utilisent maintenant le compte du restaurant :

**Stripe** (`/api/payments/stripe/create-checkout`)
- Vérifie que le restaurant a un compte Stripe connecté
- Crée la session avec `stripeAccount: restaurant.stripeAccountId`
- Les paiements vont directement sur le compte du restaurant

**PayPal** (`/api/payments/paypal/create-order`)
- Vérifie que le restaurant a un compte PayPal connecté
- Utilise le `payee.merchant_id` du restaurant
- Les paiements vont directement sur le compte du restaurant

### 6. Checkout dynamique

Le composant `CheckoutStepPayment` affiche maintenant :
- Uniquement les méthodes de paiement **activées** par le restaurant
- Un message si aucune méthode n'est configurée

---

## 📁 Fichiers créés/modifiés

### Nouveaux fichiers

| Fichier | Description |
|---------|-------------|
| `app/api/connect/stripe/onboard/route.ts` | Onboarding Stripe Connect |
| `app/api/connect/stripe/status/route.ts` | Statut Stripe |
| `app/api/connect/stripe/disconnect/route.ts` | Déconnexion Stripe |
| `app/api/connect/paypal/onboard/route.ts` | Onboarding PayPal |
| `app/api/connect/paypal/callback/route.ts` | Callback PayPal |
| `app/api/connect/paypal/status/route.ts` | Statut PayPal |
| `app/api/connect/paypal/disconnect/route.ts` | Déconnexion PayPal |
| `components/settings/SettingsPaymentsTab.tsx` | Tab configuration paiements |

### Fichiers modifiés

| Fichier | Modification |
|---------|--------------|
| `prisma/schema.prisma` | Ajout des champs Stripe/PayPal au Restaurant |
| `app/dashboard/settings/page.tsx` | Ajout de l'onglet Paiements |
| `app/api/payments/stripe/create-checkout/route.ts` | Utilise le compte du restaurant |
| `app/api/payments/paypal/create-order/route.ts` | Utilise le compte du restaurant |
| `components/checkout/CheckoutStepPayment.tsx` | Filtre les méthodes disponibles |
| `lib/server/auth.ts` | Ajout fonction `verifyToken` |

---

## 🔧 Configuration requise pour la plateforme

Pour que le système fonctionne, vous devez configurer ces variables **sur Vercel** (côté plateforme, pas côté restaurant) :

### Variables Stripe (Plateforme)

```env
STRIPE_SECRET_KEY=sk_live_...   # Clé secrète de VOTRE compte Stripe Platform
JWT_SECRET=...                  # Pour l'authentification
```

### Variables PayPal (Plateforme)

```env
PAYPAL_CLIENT_ID=...           # Client ID de VOTRE app PayPal Platform
PAYPAL_SECRET=...              # Secret de VOTRE app PayPal Platform
PAYPAL_MODE=live               # ou "sandbox" pour les tests
```

### Variable Application

```env
NEXT_PUBLIC_APP_URL=https://whataybo.com
```

---

## 🔄 Flux d'onboarding pour un restaurant

### Stripe Connect

```
1. Restaurant clique "Connecter Stripe" dans Dashboard → Paramètres → Paiements
2. Redirection vers le formulaire Stripe Express Onboarding
3. Restaurant remplit ses infos bancaires sur Stripe
4. Redirection retour vers /dashboard/settings?tab=payments&stripe_success=true
5. Le compte est vérifié et les paiements sont activés
```

### PayPal

```
1. Restaurant clique "Connecter PayPal" dans Dashboard → Paramètres → Paiements
2. Redirection vers PayPal pour autoriser l'application
3. Restaurant connecte son compte PayPal Business
4. Redirection retour via /api/connect/paypal/callback
5. Les paiements PayPal sont activés
```

---

## 💰 Flux de paiement client

```
Client visite whataybo.com/{restaurant}
        ↓
Ajoute des articles au panier
        ↓
Checkout → Étape 3 : Paiement
        ↓
Voit UNIQUEMENT les méthodes activées par ce restaurant
        ↓
    ┌── Si Espèces/Carte TPE : WhatsApp
    │
    ├── Si Stripe : Redirection Stripe Checkout
    │              → Paiement va sur le compte Stripe du restaurant
    │
    └── Si PayPal : Redirection PayPal
                   → Paiement va sur le compte PayPal du restaurant
```

---

## 🧪 Comment tester

### 1. Côté Restaurant (Dashboard)

1. Se connecter au dashboard : `whataybo.com/login`
2. Aller dans **Paramètres** → **Paiements**
3. Cliquer sur **Connecter Stripe** ou **Connecter PayPal**
4. Suivre le processus d'onboarding

### 2. Côté Client

1. Aller sur la page du restaurant : `whataybo.com/{slug}`
2. Ajouter des articles au panier
3. Passer au checkout
4. L'étape 3 montrera uniquement les méthodes de paiement activées

---

## 📝 Notes importantes

1. **Stripe Connect Express** : 
   - Les restaurants créent un compte "Express" qui est plus simple
   - Stripe gère la vérification d'identité et la conformité

2. **PayPal Partner Referrals** :
   - Nécessite un compte PayPal Business pour le restaurant
   - Les fonds vont directement au restaurant

3. **Sécurité** :
   - Les clés secrètes restent côté serveur
   - Chaque restaurant ne peut accéder qu'à ses propres données

4. **Migration base de données** :
   - Les nouveaux champs ont des valeurs par défaut
   - Aucune migration manuelle requise pour Supabase (gérée automatiquement)

---

## 📊 Résumé

| Fonctionnalité | État |
|----------------|------|
| Stripe Connect (onboarding) | ✅ Implémenté |
| Stripe Connect (paiements) | ✅ Implémenté |
| PayPal (onboarding) | ✅ Implémenté |
| PayPal (paiements) | ✅ Implémenté |
| Dashboard configuration | ✅ Implémenté |
| Checkout dynamique | ✅ Implémenté |
| Déploiement | ✅ Déployé sur whataybo.com |

---

## 🚀 Prochaines étapes

Pour activer le système :

1. **Créer un compte Stripe Platform** sur stripe.com
2. **Activer Stripe Connect** dans le dashboard Stripe
3. **Créer une app PayPal Platform** sur developer.paypal.com
4. **Ajouter les variables d'environnement** dans Vercel
5. Les restaurants pourront alors connecter leurs comptes !

---

**Statut** : ✅ **Système multi-tenant prêt - En attente de configuration plateforme**
