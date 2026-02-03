# ✅ Vérification Sécurité Webhook WhatsApp

**Date** : 11 janvier 2026  
**Statut** : ⚠️ Variable d'environnement à vérifier

---

## 🔍 Résultat de la Vérification

❌ **Variable `WHATSAPP_APP_SECRET` ou `APP_SECRET` non trouvée dans `.env`**

---

## 📝 Instructions pour Ajouter la Variable

### Étape 1 : Ouvrir le fichier `.env`

```bash
cd apps/api
nano .env
# ou
code .env
```

### Étape 2 : Ajouter la variable

Ajoutez cette ligne dans le fichier `.env` :

```bash
WHATSAPP_APP_SECRET=votre_app_secret_ici
```

⚠️ **Important** :
- Pas d'espaces autour du `=`
- Pas de guillemets (sauf si la valeur contient des espaces)
- Remplacez `votre_app_secret_ici` par votre vrai App Secret

### Étape 3 : Obtenir votre App Secret

1. Allez sur [Meta for Developers](https://developers.facebook.com/)
2. Sélectionnez votre application WhatsApp
3. **Settings** > **Basic**
4. Cliquez sur **Show** à côté de **App Secret**
5. Copiez la valeur

### Étape 4 : Vérifier

Après avoir ajouté la variable, exécutez :

```bash
cd apps/api
pnpm tsx src/scripts/test-webhook-signature.ts
```

Vous devriez voir :

```
✅ APP_SECRET configuré
✅ Tous les tests sont passés!
```

---

## 🧪 Test Rapide

Une fois la variable ajoutée, testez avec :

```bash
# Vérification rapide
cd apps/api && \
  if grep -qE "WHATSAPP_APP_SECRET|APP_SECRET" .env; then \
    echo "✅ Variable trouvée"; \
    pnpm tsx src/scripts/test-webhook-signature.ts; \
  else \
    echo "❌ Variable non trouvée"; \
  fi
```

---

## 📚 Documentation Complète

Voir `GUIDE_TEST_SECURITE_WEBHOOK.md` pour plus de détails.

---

## ✅ Checklist

- [ ] Variable `WHATSAPP_APP_SECRET` ajoutée dans `apps/api/.env`
- [ ] Script de test s'exécute sans erreur
- [ ] Serveur démarre avec "✅ WhatsApp API configurée"

---

**Note** : En mode développement, même sans `APP_SECRET`, les webhooks fonctionneront avec des warnings. En production, la vérification est obligatoire.
