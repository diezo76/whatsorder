# Guide Rapide - Configuration Domaine whataybo sur Vercel

## 🚀 Étapes Rapides (5 minutes)

### 1. Accéder à Vercel
👉 https://vercel.com/dashboard

### 2. Sélectionner le Projet
- Cliquez sur votre projet **whatsorder-clone**

### 3. Aller dans Settings → Domains
- Onglet **"Settings"** (en haut)
- Menu gauche : **"Domains"**

### 4. Ajouter le Domaine
- Cliquez sur **"Add"** ou **"Add Domain"**
- Entrez : `whataybo` (ou le format complet selon votre achat)
- Cliquez sur **"Add"**

### 5. Attendre la Configuration
- ⏱️ **2-5 minutes** généralement
- Statut passe de **"Pending"** → **"Active"** ✅
- SSL généré automatiquement

### 6. Tester
- Ouvrez : `https://whataybo.com` (ou votre domaine complet)
- Vous devriez voir votre landing page ! 🎉

## ✅ Vérifications

Une fois "Active" :
- [ ] Statut "Active" avec ✅ dans Vercel
- [ ] HTTPS fonctionne (cadenas vert dans le navigateur)
- [ ] Landing page s'affiche correctement
- [ ] Navigation fonctionne

## 🐛 Si ça ne fonctionne pas

1. **Domaine reste "Pending"** :
   - Attendre jusqu'à 24h (propagation DNS)
   - Vérifier que le domaine est bien acheté via Vercel

2. **Erreur "Domain not found"** :
   - Vérifier l'orthographe
   - Vérifier que le domaine est bien ajouté au projet

3. **Le site ne s'affiche pas** :
   - Vérifier que le projet est déployé
   - Vérifier les logs de déploiement
   - Vider le cache du navigateur

## 📧 Note sur l'Email

Dans votre code, l'email `contact@whatsorder.com` est utilisé. Si vous voulez utiliser `contact@whataybo.com`, vous devrez :

1. Configurer l'email dans votre registrar Vercel
2. Mettre à jour les liens dans `apps/web/app/page.tsx` :
   - Ligne 621 : `mailto:contact@whatsorder.com` → `mailto:contact@whataybo.com`
   - Ligne 664 : `mailto:contact@whatsorder.com` → `mailto:contact@whataybo.com`

---

**Besoin d'aide ?** Consultez `GUIDE_CONFIGURATION_DOMAINE_VERCEL.md` pour plus de détails.
