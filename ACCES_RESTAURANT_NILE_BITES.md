# 🔐 Accès Restaurant Nile Bites

**Date de création :** 12 janvier 2026  
**Restaurant :** Nile Bites

---

## 📋 Informations du Restaurant

### Restaurant (Tables Majuscules - Prisma API)
- **ID :** `168cfa18-e4a5-419f-bab9-a72c6676c362`
- **Nom :** Nile Bites
- **Slug :** `nile-bites`
- **Email :** contact@nilebites.com
- **Téléphone :** +201276921081

### Restaurant (Tables Minuscules - Prisma Web)
- **ID :** `7c702fcc-81b5-4487-b7e7-d6bda35b432a`
- **Nom :** Taybooo
- **Slug :** `nile-bites`
- **Téléphone :** +20 123 456 7890

---

## 👤 Comptes Utilisateurs

### 1. Compte Administrateur (OWNER)

**Tables Majuscules (Restaurant ID: 168cfa18-e4a5-419f-bab9-a72c6676c362)**
- **Email :** `admin@whatsorder.com`
- **Nom :** Admin User
- **Rôle :** OWNER
- **Mot de passe :** `Admin123!`
- **User ID :** `549fa25e-2c5b-487d-a9b6-8468fc09b0d8`

**Tables Minuscules (Restaurant ID: 7c702fcc-81b5-4487-b7e7-d6bda35b432a)**
- **Email :** `admin@whatsorder.com`
- **Nom :** Admin
- **Rôle :** OWNER
- **Mot de passe :** `Admin123!`
- **User ID :** `997b7051-d649-406f-b1bb-92bbbe76b1b1`

---

### 2. Compte Staff (STAFF)

**Tables Majuscules (Restaurant ID: 168cfa18-e4a5-419f-bab9-a72c6676c362)**
- **Email :** `staff@whatsorder.com`
- **Nom :** Staff User
- **Rôle :** STAFF
- **Mot de passe :** `Staff123!`
- **User ID :** `5e23b754-f80b-4132-856a-27afe44cfd91`

---

## 🌐 URLs d'Accès

### Application Web
- **URL Production :** https://www.whataybo.com
- **URL Login :** https://www.whataybo.com/login
- **URL Dashboard :** https://www.whataybo.com/dashboard

### API Publique
- **Restaurant :** https://www.whataybo.com/api/public/restaurants/nile-bites
- **Menu :** https://www.whataybo.com/api/public/restaurants/nile-bites/menu

---

## 🔑 Connexion

### Pour se connecter au Dashboard :

1. **Aller sur :** https://www.whataybo.com/login

2. **Utiliser les identifiants :**
   ```
   Email : admin@whatsorder.com
   Mot de passe : Admin123!
   ```

3. **Ou pour le compte Staff :**
   ```
   Email : staff@whatsorder.com
   Mot de passe : Staff123!
   ```

---

## 📊 Rôles et Permissions

### OWNER (Admin)
- ✅ Accès complet à toutes les fonctionnalités
- ✅ Gestion des utilisateurs
- ✅ Configuration du restaurant
- ✅ Gestion du menu
- ✅ Gestion des commandes
- ✅ Analytics
- ✅ Paramètres

### STAFF
- ✅ Gestion des commandes
- ✅ Gestion des conversations
- ✅ Vue du menu
- ❌ Pas d'accès aux paramètres
- ❌ Pas de gestion des utilisateurs

---

## ⚠️ Notes Importantes

### Double Schéma de Base de Données

Il existe **deux ensembles de tables** dans Supabase :

1. **Tables Majuscules** (`Restaurant`, `User`, `Order`, etc.)
   - Utilisées par Prisma API (backend)
   - Restaurant ID : `168cfa18-e4a5-419f-bab9-a72c6676c362`

2. **Tables Minuscules** (`restaurants`, `users`, `orders`, etc.)
   - Utilisées par Prisma Web (frontend Next.js)
   - Restaurant ID : `7c702fcc-81b5-4487-b7e7-d6bda35b432a`

**Impact :** Les deux comptes `admin@whatsorder.com` existent dans les deux schémas mais sont associés à des restaurants différents.

**Recommandation :** Utiliser le compte dans les tables minuscules pour l'application web actuelle.

---

## 🧪 Test de Connexion

Pour tester la connexion :

```bash
curl -X POST https://www.whataybo.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@whatsorder.com",
    "password": "Admin123!"
  }'
```

**Résultat attendu :**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "admin@whatsorder.com",
    "name": "Admin",
    "role": "OWNER",
    "restaurantId": "7c702fcc-81b5-4487-b7e7-d6bda35b432a"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 📝 Résumé Rapide

| Compte | Email | Mot de passe | Rôle | Restaurant ID |
|--------|-------|--------------|------|---------------|
| **Admin** | admin@whatsorder.com | Admin123! | OWNER | 7c702fcc-81b5-4487-b7e7-d6bda35b432a |
| **Staff** | staff@whatsorder.com | Staff123! | STAFF | 168cfa18-e4a5-419f-bab9-a72c6676c362 |

---

**Fin du Document**
