# Compte Rendu - Migration Doctor Grill vers Supabase Production

**Date** : 4 février 2026  
**Projet** : Taybo / Whataybo  
**Supabase** : `rvndgopsysdyycelmfuu`

---

## ✅ Problème Résolu

### Diagnostic Initial
Le MCP Supabase de Cursor était connecté au mauvais projet :
- ❌ Ancien projet : `yqpbgdowfycuhixpxygr`
- ✅ Bon projet : `rvndgopsysdyycelmfuu`

### Découverte
Après reconfiguration du MCP, nous avons découvert que :
1. Le restaurant "Doctor Grill" existait dans les tables **snake_case** (`restaurants`)
2. L'application utilise les tables **PascalCase** (`Restaurant`)
3. Il y avait une duplication de structure dans la base de données

---

## 🔄 Actions Effectuées

### 1. Reconfiguration MCP Supabase
- MCP maintenant connecté à `rvndgopsysdyycelmfuu`
- Vérification des tables et données

### 2. Migration Doctor Grill vers les tables PascalCase

| Table Source (snake_case) | Table Destination (PascalCase) | Statut |
|---------------------------|--------------------------------|--------|
| `restaurants` | `Restaurant` | ✅ Migré |
| `users` | `User` | ✅ Migré |
| `categories` | `Category` | ✅ Migré |
| `menu_items` | `MenuItem` | ✅ Migré |

### 3. Données Migrées

**Restaurant Doctor Grill** :
- ID : `a0b8a4c6-c8c9-4cb9-aa5d-0d254cc11216`
- Slug : `doctor-grill`
- WhatsApp : `+201105778949`
- Devise : EGP
- Langue : Français

**Utilisateur Admin** :
- ID : `b748b5a3-40bb-4ffa-aed1-16fb332b0a6e`
- Email : `chauffeuregypte@gmail.com`
- Nom : Mohamed
- Rôle : OWNER

**Catégories** (3) :
1. Entrées (المقبلات)
2. Plats principaux (الأطباق الرئيسية)
3. Boissons (المشروبات)

**Articles du Menu** (6) :
| Nom | Prix | Catégorie |
|-----|------|-----------|
| Hummus | 25 EGP | Entrées |
| Moutabal | 30 EGP | Entrées |
| Kebab | 80 EGP | Plats principaux |
| Shawarma | 60 EGP | Plats principaux |
| Jus d'orange | 15 EGP | Boissons |
| Thé | 10 EGP | Boissons |

---

## 🌐 Configuration Actuelle

### Vercel
- **Projet** : `whatsorder-web`
- **Domaines** : 
  - `whataybo.com`
  - `www.whataybo.com`
- **Déploiement** : ✅ READY

### Supabase
- **Projet ID** : `rvndgopsysdyycelmfuu`
- **URL** : `https://rvndgopsysdyycelmfuu.supabase.co`

### URLs d'Accès
- Menu Doctor Grill : https://www.whataybo.com/doctor-grill
- Dashboard : https://www.whataybo.com/dashboard

---

## 📱 Fonctionnement WhatsApp

1. **Client passe commande** sur `whataybo.com/doctor-grill`
2. **API crée la commande** dans Supabase
3. **Lien WhatsApp généré** avec message pré-formaté
4. **Client clique** → WhatsApp s'ouvre avec le message
5. **Client envoie** le message au restaurant

### Format du Message WhatsApp
```
🍽️ Nouvelle Commande - Doctor Grill

📝 Numéro de commande: ORD-YYYYMMDD-XXX

👤 Client: [Nom] ([Téléphone])
🚚 Type: Livraison/À emporter/Sur place
💳 Paiement: Espèces/Carte
💰 Total: XX.XX EGP

📦 Commande:
• 1× Hummus - 25.00 EGP
• 2× Kebab - 160.00 EGP
```

---

## ⚠️ Points d'Attention

### Tables Dupliquées
La base de données contient deux ensembles de tables :
- **PascalCase** (`Restaurant`, `User`, etc.) - utilisées par l'application
- **snake_case** (`restaurants`, `users`, etc.) - anciennes tables

**Recommandation** : À terme, supprimer les tables snake_case pour éviter la confusion.

### WhatsApp Business API
L'API WhatsApp Business n'est pas configurée. Le système utilise `wa.me` comme fallback, ce qui :
- ✅ Génère un lien cliquable
- ✅ Pré-remplit le message
- ❌ Ne peut pas envoyer automatiquement (l'utilisateur doit cliquer "Envoyer")

Pour activer l'envoi automatique, configurer :
- `whatsappApiToken`
- `whatsappBusinessId`

---

## 🧪 Test Recommandé

1. Aller sur https://www.whataybo.com/doctor-grill
2. Ajouter des articles au panier
3. Remplir les informations client
4. Confirmer la commande
5. Vérifier que le lien WhatsApp s'affiche
6. Cliquer et vérifier que WhatsApp s'ouvre avec le message

---

## 📋 Checklist pour le Prochain Agent

- [x] MCP Supabase configuré vers `rvndgopsysdyycelmfuu`
- [x] Restaurant Doctor Grill dans la table `Restaurant`
- [x] Menu complet avec catégories et articles
- [x] Utilisateur admin créé
- [x] Déploiement Vercel actif
- [ ] Tester création de commande en production
- [ ] Optionnel : Configurer WhatsApp Business API

---

## 🔧 Correction du Bouton WhatsApp (Mise à jour)

### Problème Identifié
Le bouton "Confirmer et envoyer sur WhatsApp" ne fonctionnait pas car :
- L'API Next.js (`/api/public/restaurants/[slug]/orders`) **ne retournait pas** le lien `wa.me` (`waMeUrl`)
- Le frontend attendait `result.whatsapp.waMeUrl` mais l'API ne renvoyait que `restaurant.whatsappNumber`

### Solution Appliquée
Modification de `/apps/web/app/api/public/restaurants/[slug]/orders/route.ts` pour :
1. Générer le lien `wa.me` avec le message formaté
2. Retourner l'objet `whatsapp` avec `waMeUrl` dans la réponse

### Code Modifié
```javascript
// Avant (manquant)
return NextResponse.json({
  order: {...},
  restaurant: {...},
});

// Après (corrigé)
return NextResponse.json({
  order: {...},
  restaurant: {...},
  whatsapp: {
    apiEnabled: false,
    messageSent: false,
    waMeUrl: `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
  },
});
```

### Déploiement
- **Commit** : `876e52f` - "fix: Ajouter waMeUrl dans la réponse API de création de commande"
- **Déploiement** : `dpl_6N7DUfFG7LaXsT7epgRsya3sXKJp`
- **Statut** : ✅ READY
- **Date** : 4 février 2026, 12:15 UTC

---

*Compte rendu mis à jour le 4 février 2026*
