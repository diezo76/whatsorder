# Guide de Configuration Resend dans Vercel

## ✅ Étape 1 : Variables locales configurées

Les variables Resend ont été ajoutées dans `apps/api/.env` :

```env
RESEND_API_KEY=re_9dp3wJML_7ZszmsoRss6BG1EZ16HEgy6m
EMAIL_FROM=noreply@whataybo.com
FRONTEND_URL=https://www.whataybo.com
```

## 📋 Étape 2 : Configuration Vercel (Production)

### Méthode 1 : Via le Dashboard Vercel (Recommandé)

1. **Aller sur Vercel Dashboard**
   - Ouvrir https://vercel.com
   - Se connecter avec votre compte

2. **Sélectionner le projet Whataybo**
   - Cliquer sur le projet dans la liste

3. **Accéder aux variables d'environnement**
   - Aller dans **Settings** (Paramètres)
   - Cliquer sur **Environment Variables** dans le menu de gauche

4. **Ajouter les variables**
   
   Pour chaque variable, cliquer sur **Add New** et remplir :
   
   **Variable 1 :**
   - Key: `RESEND_API_KEY`
   - Value: `re_9dp3wJML_7ZszmsoRss6BG1EZ16HEgy6m`
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Cliquer sur **Save**
   
   **Variable 2 :**
   - Key: `EMAIL_FROM`
   - Value: `noreply@whataybo.com`
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Cliquer sur **Save**
   
   **Variable 3 :**
   - Key: `FRONTEND_URL`
   - Value: `https://www.whataybo.com`
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Cliquer sur **Save**

5. **Redéployer l'application**
   - Aller dans l'onglet **Deployments**
   - Cliquer sur les trois points (⋯) du dernier déploiement
   - Sélectionner **Redeploy**
   - Ou faire un nouveau commit pour déclencher un déploiement automatique

### Méthode 2 : Via Vercel CLI

Si vous avez Vercel CLI installé :

```bash
# Installer Vercel CLI (si pas déjà installé)
npm i -g vercel

# Se connecter
vercel login

# Ajouter les variables d'environnement
vercel env add RESEND_API_KEY production
# Entrer: re_9dp3wJML_7ZszmsoRss6BG1EZ16HEgy6m

vercel env add EMAIL_FROM production
# Entrer: noreply@whataybo.com

vercel env add FRONTEND_URL production
# Entrer: https://www.whataybo.com

# Répéter pour Preview et Development si nécessaire
vercel env add RESEND_API_KEY preview
vercel env add EMAIL_FROM preview
vercel env add FRONTEND_URL preview

vercel env add RESEND_API_KEY development
vercel env add EMAIL_FROM development
vercel env add FRONTEND_URL development

# Vérifier les variables
vercel env ls
```

## ✅ Étape 3 : Vérification

### Vérifier dans Vercel Dashboard

1. Aller dans **Settings** → **Environment Variables**
2. Vérifier que les 3 variables sont présentes :
   - ✅ `RESEND_API_KEY`
   - ✅ `EMAIL_FROM`
   - ✅ `FRONTEND_URL`

### Tester l'envoi d'email

1. **Créer un nouveau compte restaurant**
   - Aller sur https://www.whataybo.com/register
   - Créer un compte avec un email valide
   - Vérifier que l'email de confirmation est reçu

2. **Vérifier les logs Vercel**
   - Aller dans **Deployments** → Sélectionner le dernier déploiement
   - Cliquer sur **Functions** → Chercher les logs de l'API
   - Rechercher les messages "✅ Email sent successfully"

### Vérifier le domaine Resend

Pour que `noreply@whataybo.com` fonctionne :

1. Aller sur https://resend.com
2. Se connecter avec votre compte
3. Aller dans **Domains**
4. Ajouter le domaine `whataybo.com`
5. Ajouter les enregistrements DNS demandés dans votre registrar
6. Attendre la vérification (quelques minutes)

**Note** : En attendant la vérification du domaine, vous pouvez utiliser `onboarding@resend.dev` pour les tests.

## 🔍 Dépannage

### Les emails ne sont pas envoyés

1. **Vérifier les variables d'environnement**
   ```bash
   # Dans Vercel Dashboard → Settings → Environment Variables
   # Vérifier que RESEND_API_KEY est bien définie
   ```

2. **Vérifier les logs Vercel**
   - Chercher les erreurs dans les logs de fonction
   - Vérifier que la clé API est valide

3. **Tester avec le domaine de test**
   - Changer temporairement `EMAIL_FROM` à `onboarding@resend.dev`
   - Redéployer et tester

### Erreur "Invalid API key"

- Vérifier que la clé API est correcte dans Vercel
- Vérifier que vous avez copié la clé complète (commence par `re_`)
- Vérifier que la clé n'a pas expiré dans Resend Dashboard

### Erreur "Domain not verified"

- Le domaine `whataybo.com` doit être vérifié dans Resend
- Utiliser `onboarding@resend.dev` pour les tests en attendant

## 📝 Checklist de configuration

- [x] Variables ajoutées dans `apps/api/.env` (local)
- [ ] Variables ajoutées dans Vercel Dashboard
- [ ] Variables configurées pour Production, Preview, et Development
- [ ] Application redéployée sur Vercel
- [ ] Test d'envoi d'email effectué
- [ ] Domaine vérifié dans Resend (optionnel, pour production)

## 🚀 Prochaines étapes

Une fois les variables configurées dans Vercel :

1. Redéployer l'application
2. Tester la création d'un compte restaurant
3. Vérifier la réception de l'email de confirmation
4. Vérifier les logs Vercel pour confirmer l'envoi
