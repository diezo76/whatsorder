# 🧪 Guide de Test - Sécurité Webhook WhatsApp

**Date** : 11 janvier 2026  
**Objectif** : Vérifier et tester la vérification de signature webhook

---

## ✅ Étape 1 : Vérifier la Configuration

### Vérifier que la variable est dans `.env`

Ouvrez le fichier `.env` dans `apps/api/.env` et vérifiez qu'il contient :

```bash
# Option 1 (recommandé)
WHATSAPP_APP_SECRET=votre_app_secret_ici

# OU Option 2 (alternative)
APP_SECRET=votre_app_secret_ici
```

⚠️ **Important** :
- Le nom de la variable doit être exactement `WHATSAPP_APP_SECRET` ou `APP_SECRET`
- Pas d'espaces autour du `=`
- Pas de guillemets autour de la valeur (sauf si nécessaire)

### Comment obtenir APP_SECRET

1. Allez sur [Meta for Developers](https://developers.facebook.com/)
2. Sélectionnez votre application WhatsApp
3. Allez dans **Settings** > **Basic**
4. Copiez le **App Secret** (cliquez sur "Show" pour le révéler)

---

## ✅ Étape 2 : Exécuter le Script de Test

```bash
cd apps/api
pnpm tsx src/scripts/test-webhook-signature.ts
```

### Résultat Attendu

Si tout est bien configuré, vous devriez voir :

```
🧪 Test de vérification de signature webhook WhatsApp

Test 1: Vérification de la configuration
✅ APP_SECRET configuré
   Longueur: XX caractères
   Préfixe: XXXX...

Test 2: Génération d'une signature valide
✅ Signature générée
   Format: sha256=XXXXXXXXXXXXXXXXXXXX...
   Header à utiliser: x-hub-signature-256: sha256=...

Test 3: Vérification de la signature
✅ Signature vérifiée avec succès

Test 4: Vérification avec signature invalide
✅ Signature invalide correctement rejetée

Test 5: Comportement selon NODE_ENV
   Mode développement: Plus permissif (warnings au lieu d'erreurs)
   Mode production: Strict (rejette les requêtes non signées)

✅ Tous les tests sont passés!
```

---

## ✅ Étape 3 : Tester avec le Serveur

### Démarrer le serveur

```bash
cd apps/api
pnpm dev
```

### Vérifier les logs au démarrage

Vous devriez voir :

```
✅ WhatsApp API configurée
```

Si `APP_SECRET` n'est pas configuré en production, vous verrez :

```
⚠️  WHATSAPP_APP_SECRET non configuré - les webhooks ne seront pas vérifiés en production
```

---

## ✅ Étape 4 : Tester avec une Requête Simulée

### Test avec Signature Valide (en développement)

En mode développement, même sans signature, la requête sera acceptée avec un warning :

```bash
curl -X POST http://localhost:4000/api/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"object":"whatsapp_business_account"}'
```

**Résultat attendu** : `OK` (avec warning en développement)

### Test avec Signature Valide (production)

Pour tester avec une vraie signature, utilisez le script de test qui génère une signature valide.

---

## 🔍 Dépannage

### Problème 1 : "APP_SECRET non configuré"

**Cause** : La variable n'est pas dans `.env` ou mal nommée

**Solution** :
1. Vérifiez le nom exact de la variable dans `.env`
2. Assurez-vous qu'il n'y a pas d'espaces : `WHATSAPP_APP_SECRET=valeur` (pas `WHATSAPP_APP_SECRET = valeur`)
3. Redémarrez le serveur après modification

### Problème 2 : "Variable non trouvée dans .env"

**Cause** : Le fichier `.env` n'est pas au bon endroit ou n'est pas chargé

**Solution** :
1. Vérifiez que `.env` est dans `apps/api/.env`
2. Vérifiez que `dotenv` charge bien le fichier (déjà configuré dans `index.ts`)

### Problème 3 : "Invalid webhook signature"

**Cause** : La signature ne correspond pas au body

**Solution** :
- En développement : Normal, les requêtes sans signature sont acceptées avec warning
- En production : Vérifiez que Meta envoie bien le header `x-hub-signature-256`

---

## 📝 Vérification Rapide

Exécutez cette commande pour vérifier rapidement :

```bash
cd apps/api && \
  if grep -q "WHATSAPP_APP_SECRET\|APP_SECRET" .env 2>/dev/null; then \
    echo "✅ Variable trouvée dans .env"; \
    pnpm tsx src/scripts/test-webhook-signature.ts; \
  else \
    echo "❌ Variable non trouvée dans .env"; \
    echo "Ajoutez WHATSAPP_APP_SECRET=votre_secret dans apps/api/.env"; \
  fi
```

---

## ✅ Checklist de Vérification

- [ ] Variable `WHATSAPP_APP_SECRET` ou `APP_SECRET` dans `.env`
- [ ] Script de test s'exécute sans erreur
- [ ] Serveur démarre avec "✅ WhatsApp API configurée"
- [ ] En développement : requêtes acceptées avec warnings
- [ ] En production : requêtes sans signature rejetées

---

**Dernière mise à jour** : 11 janvier 2026
