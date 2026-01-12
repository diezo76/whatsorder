# Guide - Configuration Domaine Personnalisé Vercel (whataybo)

**Date** : $(date)  
**Domaine** : whataybo  
**Projet** : WhatsOrder

## 📋 Étapes de Configuration

### ÉTAPE 1 : Accéder aux Paramètres du Domaine

1. **Connectez-vous à Vercel** :
   - Allez sur : https://vercel.com/dashboard
   - Connectez-vous avec votre compte

2. **Sélectionnez votre projet** :
   - Cliquez sur le projet **whatsorder-clone** (ou le nom de votre projet)

3. **Accédez aux paramètres** :
   - Cliquez sur l'onglet **"Settings"** (Paramètres)
   - Dans le menu de gauche, cliquez sur **"Domains"** (Domaines)

### ÉTAPE 2 : Ajouter le Domaine Acheté

1. **Ajouter le domaine** :
   - Cliquez sur le bouton **"Add"** ou **"Add Domain"**
   - Entrez votre domaine : `whataybo` (ou `whataybo.com` selon le format)

2. **Vérifier le domaine** :
   - Vercel détectera automatiquement que vous avez acheté le domaine via leur plateforme
   - Le domaine devrait apparaître comme **"Owned by Vercel"**

3. **Configuration automatique** :
   - Vercel configure automatiquement :
     - ✅ Les enregistrements DNS
     - ✅ Le certificat SSL (HTTPS)
     - ✅ La redirection www (si activée)

### ÉTAPE 3 : Configurer les Variantes du Domaine (Optionnel)

Vercel vous permet d'ajouter plusieurs variantes :

1. **Domaine principal** : `whataybo.com` (ou `whataybo` selon votre achat)
2. **Variante www** : `www.whataybo.com` (si vous avez acheté le domaine complet)
3. **Redirection** : Configurez la redirection www → domaine principal (ou inversement)

**Pour ajouter www** :
- Cliquez sur **"Add Domain"** à nouveau
- Entrez : `www.whataybo.com`
- Vercel proposera de rediriger vers le domaine principal

### ÉTAPE 4 : Attendre la Propagation DNS

1. **Temps d'attente** :
   - ⏱️ **2-5 minutes** généralement
   - Parfois jusqu'à **24 heures** pour une propagation complète

2. **Vérifier le statut** :
   - Dans l'onglet "Domains", vous verrez le statut :
     - 🟡 **"Pending"** (En attente) → Propagation en cours
     - 🟢 **"Active"** avec ✅ → Domaine configuré et actif
     - 🔴 **"Error"** → Problème de configuration (voir dépannage)

3. **Indicateurs de succès** :
   - ✅ Statut "Active"
   - ✅ Certificat SSL généré automatiquement
   - ✅ HTTPS activé

### ÉTAPE 5 : Vérifier la Configuration SSL

1. **Certificat SSL** :
   - Vercel génère automatiquement un certificat SSL via Let's Encrypt
   - Le certificat est renouvelé automatiquement
   - Pas d'action requise de votre part

2. **Vérifier HTTPS** :
   - Une fois le domaine actif, testez : `https://whataybo.com`
   - Le cadenas 🔒 devrait apparaître dans le navigateur

### ÉTAPE 6 : Tester le Domaine

1. **Ouvrir le domaine** :
   - Allez sur : `https://whataybo.com` (ou votre domaine complet)
   - Vous devriez voir votre **landing page WhatsOrder**

2. **Vérifier les fonctionnalités** :
   - ✅ Landing page s'affiche correctement
   - ✅ Navigation fonctionne (smooth scroll)
   - ✅ Menu burger mobile fonctionne
   - ✅ Toutes les sections sont visibles
   - ✅ HTTPS actif (cadenas vert)

3. **Tester les routes** :
   - `/login` → Page de connexion
   - `/register` → Page d'inscription
   - `/nile-bites` → Exemple de menu public
   - `/dashboard` → Dashboard (après connexion)

## 🔧 Configuration Avancée (Optionnel)

### Redirection www vers domaine principal

Si vous voulez que `www.whataybo.com` redirige vers `whataybo.com` :

1. Dans Vercel → Settings → Domains
2. Ajoutez `www.whataybo.com`
3. Sélectionnez "Redirect to" → `whataybo.com`

### Configuration dans le Code (Si Nécessaire)

Si vous avez besoin de référencer le domaine dans le code :

**Variables d'environnement** (`.env.local` ou Vercel Dashboard) :
```env
NEXT_PUBLIC_APP_URL=https://whataybo.com
```

**Dans `next.config.js`** (si nécessaire) :
```js
module.exports = {
  // ... autres configs
  async redirects() {
    return [
      {
        source: '/',
        has: [
          {
            type: 'host',
            value: 'www.whataybo.com',
          },
        ],
        destination: 'https://whataybo.com',
        permanent: true,
      },
    ];
  },
};
```

## 🐛 Dépannage

### Problème : Domaine reste en "Pending"

**Solutions** :
1. Attendre jusqu'à 24 heures (propagation DNS)
2. Vérifier que le domaine est bien acheté via Vercel
3. Vérifier les enregistrements DNS dans Vercel → Domains → DNS Records

### Problème : Certificat SSL ne se génère pas

**Solutions** :
1. Vérifier que le domaine est bien "Active"
2. Attendre quelques minutes supplémentaires
3. Vérifier que les enregistrements DNS sont corrects
4. Contacter le support Vercel si le problème persiste

### Problème : Le site ne s'affiche pas

**Solutions** :
1. Vérifier que le projet est bien déployé sur Vercel
2. Vérifier que le domaine est assigné au bon projet
3. Vérifier les logs de déploiement dans Vercel
4. Vider le cache du navigateur (Ctrl+Shift+R / Cmd+Shift+R)

### Problème : Erreur "Domain not found"

**Solutions** :
1. Vérifier l'orthographe du domaine
2. Vérifier que le domaine est bien ajouté dans Vercel
3. Vérifier que le domaine est assigné au bon projet

## 📝 Vérification Post-Configuration

Une fois le domaine configuré, vérifiez :

- [ ] Le domaine s'affiche avec le statut "Active" ✅
- [ ] HTTPS fonctionne (cadenas vert)
- [ ] La landing page s'affiche correctement
- [ ] Toutes les routes fonctionnent
- [ ] Le smooth scroll fonctionne
- [ ] Le menu mobile fonctionne
- [ ] Les images se chargent correctement
- [ ] Les liens internes fonctionnent

## 🔗 Liens Utiles

- **Dashboard Vercel** : https://vercel.com/dashboard
- **Documentation Vercel Domains** : https://vercel.com/docs/concepts/projects/domains
- **Support Vercel** : https://vercel.com/support

## 📊 Statut Actuel

- **Domaine** : whataybo
- **Projet Vercel** : whatsorder-clone (à vérifier)
- **Statut** : ⏳ En attente de configuration
- **SSL** : ⏳ En attente de génération

---

**Note** : Si vous avez acheté le domaine via Vercel, la configuration devrait être automatique. Suivez simplement les étapes 1-2 pour ajouter le domaine à votre projet.

**Prochaines étapes** : Une fois le domaine configuré, vous pouvez mettre à jour les liens dans votre application pour utiliser le nouveau domaine au lieu de `*.vercel.app`.
